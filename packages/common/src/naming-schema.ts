/**
 * 네이밍 응답 스키마 (zod)
 *
 * LLM 응답을 런타임에 검증하기 위한 스키마 정의
 */

import { z } from 'zod';

// ============================================
// 컴포넌트 타입 스키마
// ============================================

/**
 * 허용된 컴포넌트 타입
 * - 프롬프트의 "타입" 섹션과 동기화 필요
 */
export const ComponentTypeSchema = z.enum([
  // 최상위
  'Screen',
  // 구조
  'TopBar', 'TabBar', 'Section', 'Container',
  // UI
  'Card', 'Input', 'Avatar', 'Icon', 'Image', 'ListItem', 'TabItem',
  'Badge', 'Tag', 'Header', 'Footer',
  // 버튼
  'Button',
  // 피드백
  'Toast', 'Modal', 'Snackbar', 'Overlay',
  // 로딩
  'Skeleton', 'Spinner',
  // 기타
  'Toggle', 'Checkbox', 'ProgressBar', 'Timer', 'HomeIndicator', 'Frame',
  'Text', 'Background', 'Divider',
]);

export type ComponentType = z.infer<typeof ComponentTypeSchema>;

// ============================================
// 버튼 전용 필드 스키마
// ============================================

/**
 * 버튼 Intent
 */
export const ButtonIntentSchema = z.enum([
  'Primary', 'Secondary', 'Danger', 'Warning', 'Success', 'Info', 'Normal',
]);

/**
 * 버튼 Shape
 */
export const ButtonShapeSchema = z.enum([
  'Filled', 'Outlined', 'Ghost',
]);

/**
 * 버튼 State
 */
export const ButtonStateSchema = z.enum([
  'Disabled', 'Loading', 'Focus', 'Pressed', 'Hover',
]);

/**
 * 버튼 Icon 위치
 */
export const ButtonIconSchema = z.enum([
  'IconLeft', 'IconRight', 'IconOnly',
]);

// ============================================
// 네이밍 결과 스키마
// ============================================

/**
 * 개별 네이밍 결과 스키마
 *
 * 버튼과 일반 컴포넌트 모두 포용하는 유연한 스키마
 */
export const NamingResultItemSchema = z.object({
  // 필수 필드
  nodeId: z.string().min(1, 'nodeId는 필수입니다'),
  suggestedName: z.string().min(1, 'suggestedName은 필수입니다'),
  componentType: z.string().min(1, 'componentType은 필수입니다'),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),

  // 버튼 전용 필드 (선택)
  intent: z.string().nullable().optional(),
  shape: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),

  // 일반 컴포넌트 전용 필드 (선택)
  context: z.string().nullable().optional(),
  purpose: z.string().nullable().optional(),
  variant: z.string().nullable().optional(),
});

export type NamingResultItem = z.infer<typeof NamingResultItemSchema>;

/**
 * 네이밍 응답 스키마 (배열)
 */
export const NamingResponseSchema = z.array(NamingResultItemSchema);

export type NamingResponse = z.infer<typeof NamingResponseSchema>;

// ============================================
// 검증 함수
// ============================================

export interface ValidationSuccess {
  success: true;
  data: NamingResponse;
}

export interface ValidationFailure {
  success: false;
  error: z.ZodError;
  /** 부분적으로 파싱된 결과 (유효한 항목만) */
  partialData?: NamingResultItem[];
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * 네이밍 응답 검증
 *
 * @param data - LLM에서 반환된 JSON 파싱 결과
 * @returns 검증 결과
 */
export function validateNamingResponse(data: unknown): ValidationResult {
  const result = NamingResponseSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // 실패 시 부분 데이터 추출 시도
  let partialData: NamingResultItem[] | undefined;

  if (Array.isArray(data)) {
    partialData = data
      .map(item => NamingResultItemSchema.safeParse(item))
      .filter((r): r is z.SafeParseSuccess<NamingResultItem> => r.success)
      .map(r => r.data);
  }

  return {
    success: false,
    error: result.error,
    partialData: partialData && partialData.length > 0 ? partialData : undefined,
  };
}

/**
 * 버튼 네이밍 형식 검증
 *
 * Button/Intent/Shape/Size[/State][/Icon] 형식인지 확인
 */
export function validateButtonNaming(suggestedName: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const slots = suggestedName.split('/');

  // Button/Intent/Shape/Size 최소 4슬롯
  if (slots.length < 4) {
    errors.push(`버튼 형식 오류: "${suggestedName}" (Button/Intent/Shape/Size 필요)`);
    return { valid: false, errors };
  }

  const [_type, intent, shape, size] = slots;

  // Intent 검증 (유연하게 - 새 값 추가될 수 있음)
  const validIntents = ['Primary', 'Secondary', 'Danger', 'Warning', 'Success', 'Info', 'Normal'];
  if (!validIntents.includes(intent)) {
    errors.push(`알 수 없는 Intent: "${intent}"`);
  }

  // Shape 검증
  const validShapes = ['Filled', 'Outlined', 'Ghost'];
  if (!validShapes.includes(shape)) {
    errors.push(`알 수 없는 Shape: "${shape}"`);
  }

  // Size 검증 (숫자인지만 확인)
  if (!/^\d+$/.test(size)) {
    errors.push(`Size는 숫자여야 함: "${size}"`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * suggestedName 기본 규칙 검증
 *
 * - 슬래시(/) 구분자 사용
 * - 언더스코어(_) 미포함
 * - 금지 타입 미사용
 */
export function validateSuggestedName(suggestedName: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 슬래시 구분자 확인
  if (!suggestedName.includes('/')) {
    errors.push(`슬래시 구분자 필요: "${suggestedName}"`);
  }

  // 언더스코어 포함 여부
  if (suggestedName.includes('_')) {
    errors.push(`언더스코어 금지: "${suggestedName}"`);
  }

  // 금지 타입 확인
  const firstSlot = suggestedName.split('/')[0];
  const blacklist = ['Content', 'Layout', 'Inner', 'Wrapper', 'Box', 'Item'];
  if (blacklist.includes(firstSlot)) {
    errors.push(`금지된 타입: "${firstSlot}"`);
  }

  // 버튼인 경우 추가 검증
  if (firstSlot === 'Button') {
    const buttonValidation = validateButtonNaming(suggestedName);
    errors.push(...buttonValidation.errors);
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ============================================
// 레거시 호환 (기존 코드와의 호환성)
// ============================================

/** @deprecated NamingResultItemSchema 사용 */
export const NamingItemSchema = NamingResultItemSchema;

/** @deprecated NamingResultItem 사용 */
export type NamingItem = NamingResultItem;

/** @deprecated ComponentTypeSchema 사용 */
export const NamingTypeSchema = ComponentTypeSchema;

/** @deprecated ComponentType 사용 */
export type NamingType = ComponentType;
