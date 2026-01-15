import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export interface AgentRequest {
  screenshot?: string; // base64 encoded image
  context?: Record<string, unknown>;
  prompt: string;
}

export interface AgentResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  reasoning?: string;
}

/**
 * Claude API 호출 (텍스트 전용)
 */
export async function askClaude(prompt: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : '';
}

/**
 * Claude API 호출 (이미지 포함)
 */
export async function askClaudeWithImage(
  prompt: string,
  imageBase64: string,
  mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' = 'image/png'
): Promise<string> {
  // data:image/xxx;base64, prefix 제거
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,  // 큰 응답을 위해 증가
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Data,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : '';
}

/**
 * Claude API 호출 (다중 이미지 포함)
 * - Cleanup Validator 등에서 before/after 스크린샷 비교에 사용
 */
export async function askClaudeWithImages(
  prompt: string,
  imagesBase64: string[],
  mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' = 'image/png'
): Promise<string> {
  const content: Anthropic.Messages.ContentBlockParam[] = [];

  // 이미지들 추가
  for (const imageBase64 of imagesBase64) {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: mediaType,
        data: base64Data,
      },
    });
  }

  // 프롬프트 추가
  content.push({
    type: 'text',
    text: prompt,
  });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : '';
}

/**
 * JSON 응답 파싱
 */
export function parseJsonResponse<T>(response: string): T | null {
  // JSON 블록 추출 시도
  const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]) as T;
    } catch {
      // JSON 파싱 실패
    }
  }

  // 직접 파싱 시도
  try {
    return JSON.parse(response) as T;
  } catch {
    return null;
  }
}
