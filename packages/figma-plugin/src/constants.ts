/**
 * Figma Plugin 공통 상수
 *
 * cleanup.ts 등에서 중복 정의된 상수를 통합
 */

// Shape 노드 타입 (Vector 계열)
export const SHAPE_TYPES = [
  'RECTANGLE',
  'ELLIPSE',
  'POLYGON',
  'STAR',
  'LINE',
  'VECTOR',
  'BOOLEAN_OPERATION',
] as const;

// Shape 노드 타입 (기본 도형만)
export const BASIC_SHAPE_TYPES = [
  'RECTANGLE',
  'ELLIPSE',
  'POLYGON',
  'STAR',
] as const;

export type ShapeType = (typeof SHAPE_TYPES)[number];
export type BasicShapeType = (typeof BASIC_SHAPE_TYPES)[number];

// Shape 타입 체크 헬퍼
export function isShapeType(nodeType: string): nodeType is ShapeType {
  return (SHAPE_TYPES as readonly string[]).includes(nodeType);
}

export function isBasicShapeType(nodeType: string): nodeType is BasicShapeType {
  return (BASIC_SHAPE_TYPES as readonly string[]).includes(nodeType);
}
