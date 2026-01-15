/**
 * Cleanup Validator Agent
 *
 * 병합 전후 스크린샷을 비교하여 시각적 차이를 분석하고 복원 방법을 제안
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { askClaudeWithImages, parseJsonResponse } from '../utils/claude';
import type {
  CleanupValidationRequest,
  CleanupValidationResult,
  BaseResponse,
} from '../types';

// 프롬프트 외부 파일 로드
const PROMPTS_DIR = join(__dirname, '../../prompts');

function loadPrompt(filename: string): string {
  const filepath = join(PROMPTS_DIR, filename);
  try {
    const content = readFileSync(filepath, 'utf-8');
    console.log(`[Cleanup Validator] Loaded prompt: ${filename}`);
    return content;
  } catch (error) {
    console.error(`[Cleanup Validator] Failed to load ${filename}:`, error);
    throw new Error(`Prompt file not found: ${filename}`);
  }
}

const CLEANUP_VALIDATOR_PROMPT = loadPrompt('cleanup-validator.md');

export async function validateCleanup(
  request: CleanupValidationRequest
): Promise<BaseResponse<CleanupValidationResult>> {
  try {
    if (!request.beforeScreenshot || !request.afterScreenshot) {
      return {
        success: false,
        error: 'Both before and after screenshots are required',
      };
    }

    const prompt = CLEANUP_VALIDATOR_PROMPT
      .replace('{{nodeId}}', request.nodeId)
      .replace('{{nodeName}}', request.nodeName)
      .replace('{{operationType}}', request.operationType);

    console.log(`[Cleanup Validator] Comparing screenshots for: ${request.nodeName}`);

    // 두 이미지를 함께 전송
    const response = await askClaudeWithImages(
      prompt,
      [request.beforeScreenshot, request.afterScreenshot]
    );

    console.log(`[Cleanup Validator] Response preview:`, response.substring(0, 200));

    const result = parseJsonResponse<CleanupValidationResult>(response);

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
    console.error('[Cleanup Validator] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
