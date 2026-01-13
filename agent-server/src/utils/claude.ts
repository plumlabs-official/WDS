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
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageBase64,
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
