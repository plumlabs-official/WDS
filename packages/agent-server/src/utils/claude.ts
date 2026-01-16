import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

const client = new Anthropic();

// 토큰 사용량 저장 경로 (__dirname 기준으로 agent-server 루트)
const USAGE_FILE = path.join(__dirname, '../../api-usage.json');

// 모델 ID 매핑
export const MODEL_MAP = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-20250514',
  opus: 'claude-opus-4-20250514',
} as const;

// 모델별 max_tokens 제한
const MAX_TOKENS = {
  haiku: 32768,
  sonnet: 32768,
  opus: 32000,  // Opus는 32000 제한
} as const;

export type ModelType = keyof typeof MODEL_MAP;

// 모델별 가격 (per 1M tokens)
const PRICING: Record<string, { input: number; output: number; cacheRead: number }> = {
  'claude-sonnet-4-20250514': { input: 3, output: 15, cacheRead: 0.3 },
  'claude-haiku-4-5-20251001': { input: 1, output: 5, cacheRead: 0.1 },
  'claude-opus-4-20250514': { input: 15, output: 75, cacheRead: 1.5 },
};

export interface UsageRecord {
  timestamp: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  cost: number;
}

export interface SessionUsage {
  sessionStart: string;
  records: UsageRecord[];
  totalCost: number;
}

/**
 * 사용량 기록 저장
 */
function saveUsage(record: UsageRecord): void {
  let session: SessionUsage;

  try {
    if (fs.existsSync(USAGE_FILE)) {
      session = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf-8'));
    } else {
      session = { sessionStart: new Date().toISOString(), records: [], totalCost: 0 };
    }
  } catch {
    session = { sessionStart: new Date().toISOString(), records: [], totalCost: 0 };
  }

  session.records.push(record);
  session.totalCost = session.records.reduce((sum, r) => sum + r.cost, 0);

  fs.writeFileSync(USAGE_FILE, JSON.stringify(session, null, 2));
  console.log(`[API Usage] $${record.cost.toFixed(4)} (Total: $${session.totalCost.toFixed(4)})`);
}

/**
 * 비용 계산
 */
function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens: number = 0,
  cacheCreationTokens: number = 0
): number {
  const pricing = PRICING[model as keyof typeof PRICING] || PRICING['claude-sonnet-4-20250514'];

  // 캐시 읽기는 90% 할인, 캐시 생성은 25% 추가
  const inputCost = ((inputTokens - cacheReadTokens) * pricing.input + cacheReadTokens * pricing.cacheRead) / 1_000_000;
  const outputCost = (outputTokens * pricing.output) / 1_000_000;
  const cacheCreationCost = (cacheCreationTokens * pricing.input * 1.25) / 1_000_000;

  return inputCost + outputCost + cacheCreationCost;
}

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
 * Claude API 호출 (이미지 포함) - 스트리밍 사용
 * 100+ 노드 처리 시 10분 이상 걸릴 수 있어 스트리밍 필수
 */
export async function askClaudeWithImage(
  prompt: string,
  imageBase64: string,
  modelType: ModelType = 'sonnet',
  mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' = 'image/png'
): Promise<string> {
  // data:image/xxx;base64, prefix 제거
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  // 모델 ID 및 max_tokens 변환
  const modelId = MODEL_MAP[modelType];
  const maxTokens = MAX_TOKENS[modelType];
  console.log(`[Claude] Using model: ${modelType} (${modelId}, max_tokens: ${maxTokens})`);

  // 스트리밍으로 응답 수집
  let fullText = '';

  const stream = client.messages.stream({
    model: modelId,
    max_tokens: maxTokens,
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
            cache_control: { type: 'ephemeral' },  // 프롬프트 캐싱 (90% 비용 절감)
          } as Anthropic.Messages.TextBlockParam & { cache_control: { type: string } },
        ],
      },
    ],
  });

  // 스트림에서 텍스트 수집
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullText += event.delta.text;
    }
  }

  // 최종 메시지에서 usage 정보 수집
  const finalMessage = await stream.finalMessage();
  const usage = finalMessage.usage;

  if (usage) {
    const usageAny = usage as unknown as Record<string, number>;
    const cacheReadTokens = usageAny.cache_read_input_tokens || 0;
    const cacheCreationTokens = usageAny.cache_creation_input_tokens || 0;

    const cost = calculateCost(modelId, usage.input_tokens, usage.output_tokens, cacheReadTokens, cacheCreationTokens);

    saveUsage({
      timestamp: new Date().toISOString(),
      model: modelId,
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      cacheReadTokens,
      cacheCreationTokens,
      cost,
    });
  }

  return fullText;
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
