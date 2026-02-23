/**
 * Naming Agent
 *
 * 스크린샷을 분석하여 컴포넌트 타입과 시맨틱 이름을 추론
 * - 개별 분석: analyzeNaming (기존)
 * - 컨텍스트 기반 분석: analyzeNamingWithContext (신규)
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { askClaudeWithImage, parseJsonResponse, ModelType } from '../utils/claude';
import { validateNamingResponse, validateSuggestedName } from '@wellwe/common';
import type {
  NamingRequest,
  NamingResult,
  BaseResponse,
  ContextAwareNamingRequest,
  ContextAwareNamingResult
} from '../types';

// 프롬프트 외부 파일 로드
const PROMPTS_DIR = join(__dirname, '../../prompts');

function loadPrompt(filename: string): string {
  const filepath = join(PROMPTS_DIR, filename);
  try {
    const content = readFileSync(filepath, 'utf-8');
    console.log(`[Naming Agent] Loaded prompt: ${filename}`);
    return content;
  } catch (error) {
    console.error(`[Naming Agent] Failed to load ${filename}:`, error);
    throw new Error(`Prompt file not found: ${filename}`);
  }
}

const NAMING_PROMPT = loadPrompt('naming-single.md');
const CONTEXT_AWARE_NAMING_PROMPT = loadPrompt('naming-context.md');

/**
 * 색상 → Intent 감지
 * @param hexColor #RRGGBB 형식
 * @returns Intent 이름 또는 null
 */
function detectIntentFromColor(hexColor: string | null | undefined): { intent: string; confidence: 'high' | 'medium' | 'low' } | null {
  if (!hexColor) return null;

  const color = hexColor.toUpperCase().replace('#', '');
  if (color.length !== 6) return null;

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // 회색 판단 (R ≈ G ≈ B, 차이 < 30)
  const isGray = Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30;

  // 밝기 계산 (0-255)
  const brightness = (r + g + b) / 3;

  // 채도 계산 (0-1)
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;

  // 1. Danger (빨간색 계열): R이 높고, G와 B가 낮음
  if (r >= 180 && g <= 100 && b <= 100) {
    return { intent: 'Danger', confidence: 'high' };
  }
  if (r >= 200 && g <= 150 && b <= 150 && r - g >= 50 && r - b >= 50) {
    return { intent: 'Danger', confidence: 'medium' };
  }

  // 2. Warning (노란/주황 계열): R과 G가 높고, B가 낮음
  if (r >= 200 && g >= 150 && b <= 100) {
    return { intent: 'Warning', confidence: 'high' };
  }
  if (r >= 180 && g >= 120 && b <= 80 && r + g > b * 3) {
    return { intent: 'Warning', confidence: 'medium' };
  }

  // 3. Info (파란색 계열 - 정보 목적): B가 높고, R이 낮음
  if (b >= 180 && r <= 100 && g <= 180) {
    return { intent: 'Info', confidence: 'high' };
  }
  if (b >= 150 && b > r && b >= g) {
    return { intent: 'Info', confidence: 'medium' };
  }

  // 4. Normal (회색/무채색)
  if (isGray) {
    if (brightness >= 200) {
      // 밝은 회색은 Disabled 가능성
      return { intent: 'Normal', confidence: 'medium' };
    }
    return { intent: 'Normal', confidence: 'high' };
  }

  // 5. Primary vs Secondary 판단 (채도와 밝기 기반)
  if (saturation >= 0.5 && brightness >= 80 && brightness <= 200) {
    // 채도 높고 적당한 밝기 → Primary
    return { intent: 'Primary', confidence: 'medium' };
  }

  if (saturation >= 0.2 && saturation < 0.5) {
    // 채도 중간 → Secondary
    return { intent: 'Secondary', confidence: 'low' };
  }

  // 기본값
  return { intent: 'Secondary', confidence: 'low' };
}

export async function analyzeNaming(
  request: NamingRequest
): Promise<BaseResponse<NamingResult>> {
  try {
    if (!request.screenshot) {
      return {
        success: false,
        error: 'Screenshot is required',
      };
    }

    const prompt = NAMING_PROMPT
      .replace('{{currentName}}', request.currentName)
      .replace('{{nodeType}}', request.nodeType)
      .replace('{{width}}', String(request.width))
      .replace('{{height}}', String(request.height))
      .replace('{{childrenCount}}', String(request.childrenCount));

    const response = await askClaudeWithImage(prompt, request.screenshot);
    const result = parseJsonResponse<NamingResult>(response);

    if (!result) {
      return {
        success: false,
        error: 'Failed to parse response',
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// 네이밍 규칙 Validator
// ============================================

/**
 * 금지된 네이밍 패턴
 */
const BLACKLIST_PATTERNS = ['Content', 'Layout', 'Inner', 'Wrapper', 'Box', 'Item'];

/**
 * 버튼 Intent 값
 */
const VALID_INTENTS = ['Primary', 'Secondary', 'Danger', 'Warning', 'Info', 'Normal'];

/**
 * 버튼 Shape 값
 */
const VALID_SHAPES = ['Filled', 'Outlined', 'Ghost'];

/**
 * 버튼 Size - 실측치 사용 (숫자만 허용)
 * 표준값 검증 제거: 나중에 DS 생성 시 빈도수 기반으로 통합
 */

/**
 * 버튼 State 값
 */
const VALID_STATES = ['Disabled', 'Loading', 'Focus', 'Pressed', 'Hover'];

/**
 * 버튼 Icon 값
 */
const VALID_ICONS = ['IconLeft', 'IconRight', 'IconOnly'];

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 버튼 네이밍 검증 (Intent/Shape/Size 구조)
 */
function validateButtonNaming(suggestedName: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const slots = suggestedName.split('/');

  // Button/Intent/Shape/Size[/State][/Icon]
  if (slots.length < 4) {
    errors.push(`버튼 형식 오류: "${suggestedName}" (Button/Intent/Shape/Size 필요)`);
    return { valid: false, errors, warnings };
  }

  const [type, intent, shape, size, ...rest] = slots;

  // Intent 검증
  if (!VALID_INTENTS.includes(intent)) {
    errors.push(`잘못된 Intent: "${intent}" in "${suggestedName}"`);
  }

  // Shape 검증
  if (!VALID_SHAPES.includes(shape)) {
    errors.push(`잘못된 Shape: "${shape}" in "${suggestedName}"`);
  }

  // Size 검증 (숫자인지만 확인, 실측치 허용)
  if (!/^\d+$/.test(size)) {
    errors.push(`Size는 숫자여야 함: "${size}" in "${suggestedName}"`);
  }

  // 추가 슬롯 검증 (State, Icon)
  for (const slot of rest) {
    if (!VALID_STATES.includes(slot) && !VALID_ICONS.includes(slot)) {
      warnings.push(`알 수 없는 슬롯: "${slot}" in "${suggestedName}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 일반 컴포넌트 네이밍 검증
 */
function validateGeneralNaming(suggestedName: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const slots = suggestedName.split('/');

  // 최소 2슬롯 (Type/Context)
  if (slots.length < 2) {
    errors.push(`Context 누락: "${suggestedName}" (최소 Type/Context 필요)`);
  }

  // 금지 패턴 검사
  const componentType = slots[0];
  if (BLACKLIST_PATTERNS.includes(componentType)) {
    errors.push(`금지된 타입: "${componentType}" in "${suggestedName}"`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 네이밍 결과 검증 (타입에 따라 분기)
 */
function validateNamingResult(suggestedName: string): ValidationResult {
  const slots = suggestedName.split('/');
  const componentType = slots[0];

  // 금지 패턴 먼저 검사
  if (BLACKLIST_PATTERNS.includes(componentType)) {
    return {
      valid: false,
      errors: [`금지된 타입: "${componentType}" in "${suggestedName}"`],
      warnings: [],
    };
  }

  // 버튼은 별도 검증
  if (componentType === 'Button') {
    return validateButtonNaming(suggestedName);
  }

  // 일반 컴포넌트 검증
  return validateGeneralNaming(suggestedName);
}

/**
 * 배열 결과 전체 검증
 */
function validateResults(results: Array<{ suggestedName: string; nodeId: string }>): void {
  let errorCount = 0;
  let warningCount = 0;

  for (const result of results) {
    const validation = validateNamingResult(result.suggestedName);

    for (const error of validation.errors) {
      console.error(`[Validator] ERROR (${result.nodeId}): ${error}`);
      errorCount++;
    }

    for (const warning of validation.warnings) {
      console.warn(`[Validator] WARN (${result.nodeId}): ${warning}`);
      warningCount++;
    }
  }

  if (errorCount > 0 || warningCount > 0) {
    console.log(`[Validator] Summary: ${errorCount} errors, ${warningCount} warnings`);
  }
}

// ============================================
// 후처리 (Post-processing)
// ============================================

/**
 * 언더스코어를 슬래시로 변환
 * Card_Header → Card/Header
 */
function convertUnderscoreToSlash(name: string): string {
  // 이미 슬래시가 있으면 언더스코어 부분만 변환
  // 예: Card/Header_Left → Card/Header/Left
  return name.replace(/_/g, '/');
}

/**
 * 부모-자식 동일 이름 수정
 * 부모가 "Section/Main"이고 자식도 "Section/Main"이면 → "Container/Inner" 등으로 변경
 */
function fixParentChildSameName(
  suggestedName: string,
  parentName: string | null | undefined
): string {
  if (!parentName) return suggestedName;

  // 동일 이름인지 확인
  if (suggestedName === parentName) {
    // 타입 추출 (첫 번째 슬래시 전)
    const parts = suggestedName.split('/');
    const type = parts[0];

    // 대체 이름 생성 (SSOT: Content 슬롯 금지)
    // Section → Container/SectionBody
    // Header → Container/HeaderBody
    // Card → Container/CardBody
    const typeToReplacement: Record<string, string> = {
      'Section': 'Container/SectionBody',
      'Header': 'Container/HeaderBody',
      'Card': 'Container/CardBody',
      'TabBar': 'Container/TabGroup',
      'TopBar': 'Container/TopBarBody',
    };

    const replacement = typeToReplacement[type] || `Container/${type}Body`;
    console.log(`[PostProcess] 부모-자식 동일 이름 수정: "${suggestedName}" → "${replacement}"`);
    return replacement;
  }

  return suggestedName;
}

/**
 * 결과 후처리
 * - 언더스코어→슬래시 변환
 * - 부모-자식 동일 이름 수정
 */
function postProcessResults(
  results: ContextAwareNamingResult['results'],
  nodes: ContextAwareNamingRequest['nodes']
): ContextAwareNamingResult['results'] {
  console.log(`[PostProcess] Starting post-processing for ${results.length} results`);

  // nodeId → parentNodeId 맵 생성
  const parentNodeIdMap = new Map<string, string | null | undefined>();
  for (const node of nodes) {
    parentNodeIdMap.set(node.nodeId, node.parentNodeId);
  }

  // nodeId → suggestedName 맵 생성 (부모의 AI 제안 이름 찾기용)
  const suggestedNameMap = new Map<string, string>();
  for (const result of results) {
    suggestedNameMap.set(result.nodeId, result.suggestedName);
  }

  // 언더스코어 포함 결과 미리 체크
  const underscoreResults = results.filter(r => r.suggestedName.includes('_'));
  if (underscoreResults.length > 0) {
    console.log(`[PostProcess] Found ${underscoreResults.length} results with underscores:`);
    underscoreResults.forEach(r => console.log(`  - ${r.nodeId}: "${r.suggestedName}"`));
  }

  return results.map(result => {
    let name = result.suggestedName;

    // 1. 언더스코어 → 슬래시 변환
    const beforeUnderscore = name;
    name = convertUnderscoreToSlash(name);
    if (name !== beforeUnderscore) {
      console.log(`[PostProcess] 언더스코어 변환: "${beforeUnderscore}" → "${name}"`);
    }

    // 2. 부모-자식 동일 이름 수정 (부모의 AI 제안 이름과 비교)
    const parentNodeId = parentNodeIdMap.get(result.nodeId);
    if (parentNodeId) {
      const parentSuggestedName = suggestedNameMap.get(parentNodeId);
      name = fixParentChildSameName(name, parentSuggestedName);
    }

    // 결과 맵 업데이트 (다른 노드의 부모가 될 수 있으므로)
    suggestedNameMap.set(result.nodeId, name);

    return {
      ...result,
      suggestedName: name,
    };
  });
}

// ============================================
// 의심 케이스 필터링 (2단계 파이프라인용)
// ============================================

interface SuspiciousResult {
  result: ContextAwareNamingResult['results'][0];
  node: ContextAwareNamingRequest['nodes'][0];
  reasons: string[];
}

/**
 * 의심 케이스 필터링
 * - confidence < 0.8
 * - 검증 실패 (에러)
 * - Container로 변환됨 (부모-자식 동일 이름)
 * - 언더스코어 포함 (네이밍 규칙 위반)
 * - 부모와 동일한 이름 (중복)
 */
function filterSuspiciousResults(
  results: ContextAwareNamingResult['results'],
  nodes: ContextAwareNamingRequest['nodes']
): SuspiciousResult[] {
  const nodeMap = new Map(nodes.map(n => [n.nodeId, n]));
  // nodeId → suggestedName 맵 (부모 이름 비교용)
  const suggestedNameMap = new Map(results.map(r => [r.nodeId, r.suggestedName]));
  const suspicious: SuspiciousResult[] = [];

  for (const result of results) {
    const reasons: string[] = [];
    const node = nodeMap.get(result.nodeId);
    if (!node) continue;

    // 1. confidence 낮음
    if (result.confidence < 0.8) {
      reasons.push(`낮은 confidence: ${result.confidence}`);
    }

    // 2. 검증 실패
    const validation = validateNamingResult(result.suggestedName);
    if (!validation.valid) {
      reasons.push(`검증 실패: ${validation.errors.join(', ')}`);
    }

    // 3. Container로 변환됨 (부모-자식 동일 이름 후처리 결과)
    if (result.suggestedName.startsWith('Container/') &&
        result.componentType !== 'Container') {
      reasons.push('부모-자식 동일 이름으로 Container 변환됨');
    }

    // 4. 언더스코어 포함 (네이밍 규칙 위반)
    if (result.suggestedName.includes('_')) {
      reasons.push(`언더스코어 포함: "${result.suggestedName}"`);
    }

    // 5. 부모와 동일한 이름 (중복 방지)
    if (node.parentNodeId) {
      const parentSuggestedName = suggestedNameMap.get(node.parentNodeId);
      if (parentSuggestedName && parentSuggestedName === result.suggestedName) {
        reasons.push(`부모와 동일한 이름: "${result.suggestedName}"`);
      }
    }

    if (reasons.length > 0) {
      suspicious.push({ result, node, reasons });
    }
  }

  return suspicious;
}

/**
 * 2단계 파이프라인: Haiku(주니어) → 필터 → Sonnet(시니어)
 */
async function runTwoStagePipeline(
  request: ContextAwareNamingRequest
): Promise<BaseResponse<ContextAwareNamingResult>> {
  console.log(`[Two-Stage] Starting pipeline for ${request.nodes.length} nodes`);

  // === Stage 1: Haiku로 전체 분석 ===
  console.log('[Two-Stage] Stage 1: Haiku analysis');
  const stage1Request: ContextAwareNamingRequest = { ...request, model: 'haiku' };
  const stage1Response = await runSingleModelAnalysis(stage1Request);

  if (!stage1Response.success || !stage1Response.data) {
    console.error('[Two-Stage] Stage 1 failed');
    return stage1Response;
  }

  const stage1Results = stage1Response.data.results;
  console.log(`[Two-Stage] Stage 1 complete: ${stage1Results.length} results`);

  // === 의심 케이스 필터링 ===
  const suspicious = filterSuspiciousResults(stage1Results, request.nodes);
  console.log(`[Two-Stage] Found ${suspicious.length} suspicious results`);

  if (suspicious.length === 0) {
    console.log('[Two-Stage] No suspicious results, using Haiku results as-is');
    return stage1Response;
  }

  // 의심 케이스 로그
  for (const s of suspicious) {
    console.log(`[Two-Stage] Suspicious: ${s.result.nodeId} "${s.result.suggestedName}" - ${s.reasons.join(', ')}`);
  }

  // === Stage 2: Sonnet으로 의심 케이스만 재분석 ===
  console.log(`[Two-Stage] Stage 2: Sonnet review of ${suspicious.length} nodes`);
  const suspiciousNodes = suspicious.map(s => s.node);
  const stage2Request: ContextAwareNamingRequest = {
    ...request,
    nodes: suspiciousNodes,
    model: 'sonnet',
  };

  const stage2Response = await runSingleModelAnalysis(stage2Request);

  if (!stage2Response.success || !stage2Response.data) {
    console.warn('[Two-Stage] Stage 2 failed, using Stage 1 results');
    return stage1Response;
  }

  const stage2Results = stage2Response.data.results;
  console.log(`[Two-Stage] Stage 2 complete: ${stage2Results.length} reviewed`);

  // === 결과 병합 ===
  const stage2Map = new Map(stage2Results.map(r => [r.nodeId, r]));
  const mergedResults = stage1Results.map(r => {
    const reviewed = stage2Map.get(r.nodeId);
    if (reviewed) {
      console.log(`[Two-Stage] Merged: ${r.nodeId} "${r.suggestedName}" → "${reviewed.suggestedName}"`);
      return reviewed;
    }
    return r;
  });

  console.log(`[Two-Stage] Pipeline complete. Haiku: ${stage1Results.length}, Sonnet reviewed: ${stage2Results.length}`);

  return {
    success: true,
    data: { results: mergedResults },
  };
}

// ============================================
// 컨텍스트 기반 네이밍 (전체 스크린 활용)
// ============================================

/**
 * 노드 리스트를 프롬프트용 문자열로 변환
 */
function formatNodeList(nodes: ContextAwareNamingRequest['nodes']): string {
  return nodes.map((node, index) => {
    const depthLabel = node.depth === 1 ? '1단계(Screen)' :
                       node.depth === 2 ? '2단계(Layout)' :
                       `${node.depth}단계(Component)`;

    // 텍스트/아이콘 힌트 (있으면 표시)
    const textsInfo = node.texts && node.texts.length > 0
      ? `\n   - 텍스트: ${node.texts.slice(0, 3).map(t => `"${t}"`).join(', ')}${node.texts.length > 3 ? '...' : ''}`
      : '';
    const iconsInfo = node.iconHints && node.iconHints.length > 0
      ? `\n   - 아이콘 힌트: ${node.iconHints.join(', ')}`
      : '';
    // 부모 이름 (있으면 표시 - 동일 이름 방지용)
    const parentInfo = node.parentName
      ? `\n   - 부모 이름: "${node.parentName}" ⚠️ 이 이름과 동일하면 안됨`
      : '';
    // 버튼 속성 감지용 정보 (structure에서 추출)
    const opacity = node.structure?.opacity;
    const fillColorInfo = node.structure?.fillColor
      ? `\n   - 채우기 색상: ${node.structure.fillColor}${opacity !== null && opacity !== undefined && opacity < 1 ? ` (투명도: ${(opacity * 100).toFixed(0)}%)` : ''}`
      : '';
    // Stroke 정보 (Outlined 버튼 감지)
    const strokeInfo = node.structure?.hasStroke
      ? `\n   - 테두리: 있음${node.structure.strokeColor ? ` (${node.structure.strokeColor})` : ''}`
      : '';
    // 아이콘 위치 정보
    const iconPositionInfo = node.structure?.iconPosition
      ? `\n   - 아이콘 위치: ${node.structure.iconPosition === 'left' ? '왼쪽' : node.structure.iconPosition === 'right' ? '오른쪽' : '아이콘만'}`
      : '';
    // Shape 힌트 (AI 판단 보조)
    let shapeHint = '';
    const fillColor = node.structure?.fillColor?.toUpperCase() || null;
    const strokeColor = node.structure?.strokeColor?.toUpperCase() || null;
    const hasStroke = !!node.structure?.hasStroke;

    // 흰색/투명 판단 (Outlined 버튼은 배경이 흰색이거나 비어있음)
    const isWhiteOrTransparent = !fillColor ||
      fillColor === '#FFFFFF' ||
      fillColor === '#FAFAFA' ||
      fillColor === '#F5F5F5' ||
      fillColor === '#FEFEFE' ||
      /^#F[0-9A-F]{5}$/.test(fillColor); // #Fxxxxx 패턴 (밝은 흰색 계열)

    // fill과 stroke 색상 동일 여부 (Filled 버튼에서 fill+stroke 동시 존재 시)
    const isFillStrokeSameColor = fillColor && strokeColor && fillColor === strokeColor;

    if (hasStroke && isWhiteOrTransparent && !isFillStrokeSameColor) {
      // Outlined: stroke 있고, fill이 흰색이거나 비어있음
      shapeHint = '\n   - Shape 힌트: Outlined (테두리 있음, 배경 흰색/투명)';
    } else if (fillColor && !isWhiteOrTransparent) {
      // Filled: 색상 있는 배경 (stroke 유무 무관, 색상 동일하면 Filled)
      if (hasStroke && isFillStrokeSameColor) {
        shapeHint = '\n   - Shape 힌트: Filled (배경+테두리 동일 색상)';
      } else if (hasStroke) {
        shapeHint = '\n   - Shape 힌트: Filled (색상 배경+테두리)';
      } else {
        shapeHint = '\n   - Shape 힌트: Filled (색상 배경)';
      }
    } else if (!hasStroke && isWhiteOrTransparent) {
      // Ghost: 배경도 테두리도 없음 (텍스트만)
      shapeHint = '\n   - Shape 힌트: Ghost (배경/테두리 없음, 텍스트만)';
    }

    // State 힌트 (Disabled 감지)
    let stateHint = '';
    if (node.structure?.fillColor) {
      const fill = node.structure.fillColor.toUpperCase();
      // 회색 계열 감지 (#808080 ~ #E0E0E0)
      const isGrayish = /^#([89A-Ea-e][0-9A-Fa-f]){3}$/.test(fill) ||
                        /^#([C-Ec-e][0-9A-Fa-f]){3}$/.test(fill) ||
                        fill === '#CCCCCC' || fill === '#D0D0D0' || fill === '#DDDDDD' ||
                        fill === '#B0B0B0' || fill === '#A0A0A0' || fill === '#909090';
      if (isGrayish) {
        stateHint = `\n   - ⚠️ State 힌트: Disabled 가능성 높음 (회색 계열 ${fill})`;
      }
    }
    if (opacity !== null && opacity !== undefined && opacity < 0.5) {
      stateHint = `\n   - ⚠️ State 힌트: Disabled 가능성 높음 (투명도 ${(opacity * 100).toFixed(0)}%)`;
    }

    // Intent 힌트 (버튼 색상 기반)
    let intentHint = '';
    if (fillColor && !isWhiteOrTransparent) {
      const intentResult = detectIntentFromColor(fillColor);
      if (intentResult) {
        const confidenceLabel = intentResult.confidence === 'high' ? '확실' :
                               intentResult.confidence === 'medium' ? '추정' : '약함';
        intentHint = `\n   - Intent 힌트: ${intentResult.intent} (${confidenceLabel}, ${fillColor})`;
      }
    } else if (hasStroke && strokeColor) {
      // Outlined 버튼의 경우 stroke 색상으로 Intent 판단
      const intentResult = detectIntentFromColor(strokeColor);
      if (intentResult) {
        const confidenceLabel = intentResult.confidence === 'high' ? '확실' :
                               intentResult.confidence === 'medium' ? '추정' : '약함';
        intentHint = `\n   - Intent 힌트: ${intentResult.intent} (${confidenceLabel}, 테두리 ${strokeColor})`;
      }
    }

    // === 컴포넌트별 확장 힌트 ===

    // Avatar Shape 힌트 (cornerRadius 기반)
    let avatarShapeHint = '';
    const cornerRadius = node.structure?.cornerRadius;
    const nodeWidth = node.width;
    if (cornerRadius !== null && cornerRadius !== undefined && nodeWidth) {
      // 정사각형에 가까운지 확인 (aspectRatio 0.8 ~ 1.2)
      const aspectRatio = node.width / node.height;
      if (aspectRatio >= 0.8 && aspectRatio <= 1.2) {
        // Circle: cornerRadius >= width/2 * 0.9 (약간의 여유)
        if (cornerRadius >= nodeWidth / 2 * 0.9) {
          avatarShapeHint = `\n   - Avatar 힌트: Circle (cornerRadius=${cornerRadius}, width=${nodeWidth})`;
        } else if (cornerRadius < 4) {
          avatarShapeHint = `\n   - Avatar 힌트: Square (cornerRadius=${cornerRadius})`;
        } else {
          avatarShapeHint = `\n   - Avatar 힌트: Rounded (cornerRadius=${cornerRadius})`;
        }
      }
    }

    // Card Elevation 힌트 (effects 기반)
    let cardElevationHint = '';
    const hasShadow = node.structure?.hasShadow;
    if (hasShadow) {
      cardElevationHint = '\n   - Card 힌트: Raised (그림자 있음)';
    }

    // Input State 힌트 (strokeColor 기반 - Focus/Error)
    let inputStateHint = '';
    if (strokeColor && !fillColor) {
      // stroke만 있고 fill이 없으면 Input 가능성
      const strokeIntent = detectIntentFromColor(strokeColor);
      if (strokeIntent?.intent === 'Danger') {
        inputStateHint = `\n   - Input 힌트: Error (빨간 테두리 ${strokeColor})`;
      } else if (strokeIntent?.intent === 'Primary' || strokeIntent?.intent === 'Info') {
        inputStateHint = `\n   - Input 힌트: Focus (강조 테두리 ${strokeColor})`;
      }
    }

    // Toggle/Checkbox State 힌트 (fillColor 기반 - On/Off)
    let toggleStateHint = '';
    if (fillColor && !isWhiteOrTransparent) {
      const toggleIntent = detectIntentFromColor(fillColor);
      if (toggleIntent?.intent === 'Primary') {
        toggleStateHint = `\n   - Toggle/Checkbox 힌트: On (활성 색상 ${fillColor})`;
      }
    }

    // strokeWidth 정보
    let strokeWidthInfo = '';
    const strokeWidth = node.structure?.strokeWidth;
    if (strokeWidth && strokeWidth > 0) {
      strokeWidthInfo = `\n   - 테두리 두께: ${strokeWidth}px`;
    }

    // Color Variant 힌트 (부모 배경색 기반)
    let colorVariantHint = '';
    if (node.structure?.parentBgColor) {
      const bg = node.structure.parentBgColor.toUpperCase().replace('#', '');
      if (bg.length === 6) {
        const bgR = parseInt(bg.substring(0, 2), 16);
        const bgG = parseInt(bg.substring(2, 4), 16);
        const bgB = parseInt(bg.substring(4, 6), 16);
        const bgBrightness = (bgR + bgG + bgB) / 3;
        if (bgBrightness < 180) {
          colorVariantHint = `\n   - Color 힌트: White (부모 배경 ${node.structure.parentBgColor}, 어두운/컬러 배경)`;
        }
      }
    }

    return `${index + 1}. nodeId="${node.nodeId}"
   - 현재 이름: "${node.currentName}"
   - 타입: ${node.nodeType}
   - 깊이: ${depthLabel}
   - 위치: (${node.x}, ${node.y})
   - 크기: ${node.width} x ${node.height}${parentInfo}${textsInfo}${iconsInfo}${fillColorInfo}${strokeInfo}${strokeWidthInfo}${iconPositionInfo}${shapeHint}${stateHint}${intentHint}${colorVariantHint}${avatarShapeHint}${cardElevationHint}${inputStateHint}${toggleStateHint}`;
  }).join('\n\n');
}

/**
 * 단일 모델로 네이밍 분석 (내부 함수)
 */
async function runSingleModelAnalysis(
  request: ContextAwareNamingRequest
): Promise<BaseResponse<ContextAwareNamingResult>> {
  const nodeList = formatNodeList(request.nodes);
  const prompt = CONTEXT_AWARE_NAMING_PROMPT
    .replace('{{screenWidth}}', String(request.screenWidth))
    .replace('{{screenHeight}}', String(request.screenHeight))
    .replace('{{nodeList}}', nodeList);

  const modelType = (request.model || 'sonnet') as ModelType;
  console.log(`[Context Naming] Analyzing ${request.nodes.length} nodes with screen context (${request.screenWidth}x${request.screenHeight})`);
  console.log(`[Context Naming] Analyzing ${request.nodes.length} nodes with screen context (model: ${modelType})`);

  // 디버그: 언더스코어 포함 노드 확인
  const underscoreNodes = request.nodes.filter(n => n.currentName.includes('_'));
  if (underscoreNodes.length > 0) {
    console.log(`[Context Naming] Found ${underscoreNodes.length} nodes with underscores in input:`);
    underscoreNodes.forEach(n => console.log(`  - ${n.nodeId}: "${n.currentName}"`));
  } else {
    console.log(`[Context Naming] No underscore nodes in input (checked ${request.nodes.length} nodes)`);
  }

  const response = await askClaudeWithImage(prompt, request.screenScreenshot, modelType);

  // 디버그: 응답 미리보기 (처음 500자)
  console.log(`[Context Naming] Response preview: ${response.substring(0, 500)}...`);

  const rawResults = parseJsonResponse<unknown>(response);

  if (!rawResults || !Array.isArray(rawResults)) {
    console.error(`[Context Naming] Parse failed. Full response:\n${response}`);
    return {
      success: false,
      error: 'Failed to parse response as array',
    };
  }

  // zod 스키마 검증
  const validation = validateNamingResponse(rawResults);

  if (!validation.success) {
    const errorCount = validation.error.errors.length;
    console.warn(`[Context Naming] Schema validation: ${errorCount} errors`);

    // 에러 상세 로그 (처음 5개만)
    validation.error.errors.slice(0, 5).forEach((err, i) => {
      console.warn(`  [${i + 1}] ${err.path.join('.')}: ${err.message}`);
    });

    // 부분 데이터 사용 가능한 경우
    if (validation.partialData && validation.partialData.length > 0) {
      console.log(`[Context Naming] Using ${validation.partialData.length}/${rawResults.length} valid results`);
      // 타입 캐스팅 (zod 검증 통과한 데이터)
      const results = validation.partialData as ContextAwareNamingResult['results'];
      const processedResults = postProcessResults(results, request.nodes);
      validateResults(processedResults);
      return {
        success: true,
        data: { results: processedResults },
      };
    }

    return {
      success: false,
      error: `Schema validation failed: ${errorCount} errors`,
    };
  }

  // 타입 캐스팅 (zod 검증 통과)
  const results = validation.data as ContextAwareNamingResult['results'];
  console.log(`[Context Naming] Got ${results.length} results (schema valid)`);

  // 후처리 실행 (언더스코어 변환, 부모-자식 동일 이름 수정)
  const processedResults = postProcessResults(results, request.nodes);

  // Validator 실행
  validateResults(processedResults);

  return {
    success: true,
    data: { results: processedResults },
  };
}

/**
 * 컨텍스트 기반 네이밍 분석
 * - 전체 스크린 스크린샷 1장으로 여러 노드를 한번에 분석
 * - 위치 정보를 활용하여 역할 추론
 * - model: 'two-stage' 시 Haiku→Sonnet 2단계 파이프라인 실행
 */
export async function analyzeNamingWithContext(
  request: ContextAwareNamingRequest
): Promise<BaseResponse<ContextAwareNamingResult>> {
  try {
    if (!request.screenScreenshot) {
      return {
        success: false,
        error: 'Screen screenshot is required',
      };
    }

    if (!request.nodes || request.nodes.length === 0) {
      return {
        success: false,
        error: 'At least one node is required',
      };
    }

    // two-stage 모드: Haiku → 필터 → Sonnet
    if (request.model === 'two-stage') {
      return await runTwoStagePipeline(request);
    }

    // 단일 모델 모드
    return await runSingleModelAnalysis(request);
  } catch (error) {
    console.error('[Context Naming] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
