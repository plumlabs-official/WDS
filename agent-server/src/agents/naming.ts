/**
 * Naming Agent
 *
 * 스크린샷을 분석하여 컴포넌트 타입과 시맨틱 이름을 추론
 * - 개별 분석: analyzeNaming (기존)
 * - 컨텍스트 기반 분석: analyzeNamingWithContext (신규)
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { askClaudeWithImage, parseJsonResponse } from '../utils/claude';
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
const VALID_INTENTS = ['Primary', 'Secondary', 'Danger', 'Warning', 'Success', 'Info', 'Normal'];

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

    // 대체 이름 생성
    // Section → Container/Content
    // Header → Container/HeaderContent
    // Card → Container/CardContent
    const typeToReplacement: Record<string, string> = {
      'Section': 'Container/Content',
      'Header': 'Container/HeaderContent',
      'Card': 'Container/CardContent',
      'TabBar': 'Container/TabItems',
      'TopBar': 'Container/TopContent',
    };

    const replacement = typeToReplacement[type] || `Container/${type}Content`;
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

    return `${index + 1}. nodeId="${node.nodeId}"
   - 현재 이름: "${node.currentName}"
   - 타입: ${node.nodeType}
   - 깊이: ${depthLabel}
   - 위치: (${node.x}, ${node.y})
   - 크기: ${node.width} x ${node.height}${parentInfo}${textsInfo}${iconsInfo}`;
  }).join('\n\n');
}

/**
 * 컨텍스트 기반 네이밍 분석
 * - 전체 스크린 스크린샷 1장으로 여러 노드를 한번에 분석
 * - 위치 정보를 활용하여 역할 추론
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

    const nodeList = formatNodeList(request.nodes);
    const prompt = CONTEXT_AWARE_NAMING_PROMPT
      .replace('{{screenWidth}}', String(request.screenWidth))
      .replace('{{screenHeight}}', String(request.screenHeight))
      .replace('{{nodeList}}', nodeList);

    console.log(`[Context Naming] Analyzing ${request.nodes.length} nodes with screen context`);

    const response = await askClaudeWithImage(prompt, request.screenScreenshot);

    // 디버그: 응답 미리보기 (처음 500자)
    console.log(`[Context Naming] Response preview: ${response.substring(0, 500)}...`);

    const results = parseJsonResponse<ContextAwareNamingResult['results']>(response);

    if (!results || !Array.isArray(results)) {
      console.error(`[Context Naming] Parse failed. Full response:\n${response}`);
      return {
        success: false,
        error: 'Failed to parse response as array',
      };
    }

    console.log(`[Context Naming] Got ${results.length} results`);

    // 후처리 실행 (언더스코어 변환, 부모-자식 동일 이름 수정)
    const processedResults = postProcessResults(results, request.nodes);

    // Validator 실행
    validateResults(processedResults);

    return {
      success: true,
      data: { results: processedResults },
    };
  } catch (error) {
    console.error('[Context Naming] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
