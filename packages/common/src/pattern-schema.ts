/**
 * 네이밍 패턴 스키마 (zod)
 *
 * 크로스-스크린 네이밍 일관성을 위한 패턴 저장/매칭
 */

import { z } from 'zod';

// ============================================
// 구조 특징 스키마
// ============================================

/**
 * 노드 타입 (Figma)
 */
export const FigmaNodeTypeSchema = z.enum([
  'FRAME', 'GROUP', 'COMPONENT', 'INSTANCE', 'TEXT',
  'RECTANGLE', 'ELLIPSE', 'LINE', 'VECTOR', 'BOOLEAN_OPERATION',
]);

/**
 * 레이아웃 모드
 */
export const LayoutModeSchema = z.enum([
  'HORIZONTAL', 'VERTICAL', 'NONE',
]);

/**
 * 위치 영역 (스크린 기준)
 */
export const PositionZoneSchema = z.enum([
  'top',      // y < screenHeight * 0.15
  'middle',   // 0.15 <= y < 0.85
  'bottom',   // y >= screenHeight * 0.85
]);

/**
 * 구조 특징 스키마
 * - 패턴 매칭의 핵심 데이터
 */
export const StructureFeaturesSchema = z.object({
  /** 직계 자식 수 */
  childCount: z.number().int().min(0),

  /** 자식 노드 타입 배열 (순서 유지) */
  childTypes: z.array(z.string()),

  /** 자식 노드 이름 배열 (AI 제안 이름, 순서 유지) */
  childNames: z.array(z.string()).optional(),

  /** 레이아웃 방향 */
  layoutMode: LayoutModeSchema,

  /** 노드 너비 */
  width: z.number().positive(),

  /** 노드 높이 */
  height: z.number().positive(),

  /** 가로/세로 비율 (width/height) */
  aspectRatio: z.number().positive(),

  /** 스크린 기준 위치 영역 */
  positionZone: PositionZoneSchema,

  /** 텍스트 힌트 (자식 TEXT 노드 내용) */
  textHints: z.array(z.string()).optional(),

  /** 아이콘 힌트 (자식 Icon/* 이름) */
  iconHints: z.array(z.string()).optional(),

  /** 부모 노드 이름 (context 기반 매칭용) */
  parentName: z.string().nullable().optional(),

  /** 벡터 경로 해시 (아이콘 구분용) */
  vectorPathHash: z.string().nullable().optional(),

  /** 텍스트 지문 (TEXT 노드 구분용) */
  textFingerprint: z.string().nullable().optional(),

  /** 채우기 색상 (버튼 상태 구분용, #RRGGBB 형식) */
  fillColor: z.string().nullable().optional(),

  /** 투명도 (0-1, 버튼 상태 구분용) */
  opacity: z.number().min(0).max(1).nullable().optional(),
});

export type StructureFeatures = z.infer<typeof StructureFeaturesSchema>;

// ============================================
// 패턴 스키마
// ============================================

/**
 * 저장된 패턴 스키마
 */
export const PatternSchema = z.object({
  /** 고유 ID (uuid) */
  id: z.string().uuid(),

  /** 패턴 이름 (AI 제안 이름) */
  name: z.string().min(1),

  /** 구조 특징 */
  structure: StructureFeaturesSchema,

  /** 생성 일시 */
  createdAt: z.string().datetime(),

  /** 마지막 사용 일시 */
  lastUsedAt: z.string().datetime(),

  /** 사용 횟수 */
  usageCount: z.number().int().min(0),

  /** 원본 노드 ID (참고용) */
  sourceNodeId: z.string().optional(),

  /** 원본 파일 키 (참고용) */
  sourceFileKey: z.string().optional(),
});

export type Pattern = z.infer<typeof PatternSchema>;

/**
 * 패턴 생성 요청 스키마
 */
export const CreatePatternRequestSchema = z.object({
  name: z.string().min(1),
  structure: StructureFeaturesSchema,
  sourceNodeId: z.string().optional(),
  sourceFileKey: z.string().optional(),
});

export type CreatePatternRequest = z.infer<typeof CreatePatternRequestSchema>;

/**
 * 패턴 매칭 요청 스키마
 */
export const MatchPatternRequestSchema = z.object({
  structure: StructureFeaturesSchema,
  /** 반환할 최대 후보 수 (기본 3) */
  limit: z.number().int().min(1).max(10).optional(),
  /** 최소 유사도 점수 (기본 0.5) */
  minScore: z.number().min(0).max(1).optional(),
});

export type MatchPatternRequest = z.infer<typeof MatchPatternRequestSchema>;

// ============================================
// 매칭 결과 스키마
// ============================================

/**
 * 매칭 근거 (왜 비슷한지)
 */
export const MatchReasonSchema = z.object({
  factor: z.string(),
  score: z.number().min(0).max(1),
  detail: z.string(),
});

export type MatchReason = z.infer<typeof MatchReasonSchema>;

/**
 * 매칭 후보 스키마
 */
export const MatchCandidateSchema = z.object({
  pattern: PatternSchema,
  /** 총 유사도 점수 (0-1) */
  score: z.number().min(0).max(1),
  /** 매칭 근거 */
  reasons: z.array(MatchReasonSchema),
});

export type MatchCandidate = z.infer<typeof MatchCandidateSchema>;

/**
 * 매칭 결과 스키마
 */
export const MatchResultSchema = z.object({
  /** 매칭 후보 목록 (점수 내림차순) */
  candidates: z.array(MatchCandidateSchema),
  /** 정확히 일치하는 패턴이 있는지 */
  hasExactMatch: z.boolean(),
});

export type MatchResult = z.infer<typeof MatchResultSchema>;

// ============================================
// 히스토리 스키마
// ============================================

/**
 * 패턴 변경 히스토리 스키마
 */
export const PatternHistorySchema = z.object({
  patternId: z.string().uuid(),
  fromName: z.string(),
  toName: z.string(),
  changedAt: z.string().datetime(),
});

export type PatternHistory = z.infer<typeof PatternHistorySchema>;

// ============================================
// 저장소 스키마
// ============================================

/**
 * 패턴 저장소 전체 스키마
 */
export const PatternStoreSchema = z.object({
  version: z.literal(1),
  patterns: z.array(PatternSchema),
  history: z.array(PatternHistorySchema),
});

export type PatternStore = z.infer<typeof PatternStoreSchema>;

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 위치 영역 계산
 */
export function calculatePositionZone(
  y: number,
  height: number,
  screenHeight: number
): 'top' | 'middle' | 'bottom' {
  const centerY = y + height / 2;
  const relativeY = centerY / screenHeight;

  if (relativeY < 0.15) return 'top';
  if (relativeY >= 0.85) return 'bottom';
  return 'middle';
}

/**
 * 구조 특징 추출
 */
export function extractStructureFeatures(params: {
  childCount: number;
  childTypes: string[];
  childNames?: string[];
  layoutMode: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  width: number;
  height: number;
  y: number;
  screenHeight: number;
  textHints?: string[];
  iconHints?: string[];
}): StructureFeatures {
  return {
    childCount: params.childCount,
    childTypes: params.childTypes,
    childNames: params.childNames,
    layoutMode: params.layoutMode,
    width: params.width,
    height: params.height,
    aspectRatio: params.width / params.height,
    positionZone: calculatePositionZone(params.y, params.height, params.screenHeight),
    textHints: params.textHints,
    iconHints: params.iconHints,
  };
}
