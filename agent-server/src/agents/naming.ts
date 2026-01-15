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
 * Size 적용 불가 타입
 */
const NO_SIZE_TYPES = ['Container', 'Section', 'TopBar', 'TabBar', 'ListItem', 'Image', 'Screen', 'Header', 'Frame'];

/**
 * 유효한 Size 값
 */
const VALID_SIZES = ['XS', 'SM', 'MD', 'LG', 'XL'];

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 네이밍 결과 검증
 */
function validateNamingResult(suggestedName: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const slots = suggestedName.split('/');

  // 1. Purpose 필수 (최소 2슬롯)
  if (slots.length < 2) {
    errors.push(`Purpose 누락: "${suggestedName}" (최소 ComponentType/Purpose 필요)`);
  }

  // 2. 금지 패턴 검사
  const componentType = slots[0];
  if (BLACKLIST_PATTERNS.includes(componentType)) {
    errors.push(`금지된 타입: "${componentType}" in "${suggestedName}"`);
  }
  for (const pattern of BLACKLIST_PATTERNS) {
    if (suggestedName.startsWith(pattern + '/')) {
      errors.push(`금지된 패턴: "${suggestedName}"`);
      break;
    }
  }

  // 3. Size 규칙 검사
  if (NO_SIZE_TYPES.includes(componentType)) {
    const hasSize = slots.some(s => VALID_SIZES.includes(s));
    if (hasSize) {
      warnings.push(`Size 적용 불가 타입에 Size 포함: "${suggestedName}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
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

    return `${index + 1}. nodeId="${node.nodeId}"
   - 현재 이름: "${node.currentName}"
   - 타입: ${node.nodeType}
   - 깊이: ${depthLabel}
   - 위치: (${node.x}, ${node.y})
   - 크기: ${node.width} x ${node.height}${textsInfo}${iconsInfo}`;
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

    // Validator 실행
    validateResults(results);

    return {
      success: true,
      data: { results },
    };
  } catch (error) {
    console.error('[Context Naming] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
