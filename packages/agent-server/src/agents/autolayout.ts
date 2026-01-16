/**
 * AutoLayout Agent
 *
 * 스크린샷과 자식 요소 위치를 분석하여 최적의 Auto Layout 설정 추론
 * - Direction, Gap, Padding (룰 베이스 값 검증)
 * - Sizing 모드 추론 (HUG/FILL/FIXED) - 반응형 핵심
 *
 * 핵심 원칙: 기존 디자인이 절대 깨지지 않아야 함
 * - 요소 순서 유지
 * - 요소 크기 유지 (기본값)
 * - FILL은 명확한 경우에만 사용
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { askClaudeWithImage, parseJsonResponse, ModelType } from '../utils/claude';
import type { AutoLayoutRequest, AutoLayoutResult, BaseResponse } from '../types';

// 프롬프트 외부 파일 로드
const PROMPTS_DIR = join(__dirname, '../../prompts');

function loadPrompt(filename: string): string {
  const filepath = join(PROMPTS_DIR, filename);
  try {
    const content = readFileSync(filepath, 'utf-8');
    console.log(`[AutoLayout Agent] Loaded prompt: ${filename}`);
    return content;
  } catch (error) {
    console.error(`[AutoLayout Agent] Failed to load ${filename}:`, error);
    throw new Error(`Prompt file not found: ${filename}`);
  }
}

const AUTOLAYOUT_PROMPT = loadPrompt('autolayout.md');

export async function analyzeAutoLayout(
  request: AutoLayoutRequest
): Promise<BaseResponse<AutoLayoutResult>> {
  try {
    if (!request.screenshot) {
      return {
        success: false,
        error: 'Screenshot is required',
      };
    }

    // 자식 정보 포맷팅 (이름, 크기, 부모 대비 비율 포함)
    const containerWidth = request.width || 0;
    const childrenInfo = request.children
      .map((c, i) => {
        const widthRatio = containerWidth > 0 ? Math.round((c.width / containerWidth) * 100) : 0;
        return `- [${i}] "${c.name || 'unnamed'}": x=${c.x}, y=${c.y}, size=${c.width}x${c.height} (부모 대비 ${widthRatio}%)`;
      })
      .join('\n');

    // 프롬프트 변수 치환
    const prompt = AUTOLAYOUT_PROMPT
      .replace('{{childrenInfo}}', childrenInfo || '(자식 없음)')
      .replace('{{containerWidth}}', String(request.width || 0))
      .replace('{{containerHeight}}', String(request.height || 0))
      .replace('{{calculatedDirection}}', request.calculatedDirection || 'AUTO')
      .replace('{{calculatedGap}}', String(request.calculatedGap || 0));

    const modelType = (request.model || 'sonnet') as ModelType;
    console.log(`[AutoLayout Agent] Using model: ${modelType}`);

    const response = await askClaudeWithImage(prompt, request.screenshot, modelType);
    const result = parseJsonResponse<AutoLayoutResult>(response);

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
