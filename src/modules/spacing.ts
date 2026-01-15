/**
 * 간격 표준화 모듈
 *
 * 역할:
 * - 기존 Auto Layout 프레임의 gap/padding을 토큰 값으로 표준화
 * - 비표준 간격 값을 가장 가까운 토큰 값으로 변환
 */

import { spacing } from '../../config/tokens';

// 허용된 spacing 값 배열
const ALLOWED_SPACING = Object.values(spacing);

/**
 * 가장 가까운 토큰 값으로 반올림
 */
export function roundToNearestToken(value: number): number {
  if (value <= 0) return 0;

  let closest = ALLOWED_SPACING[0];
  let minDiff = Math.abs(value - closest);

  for (const tokenValue of ALLOWED_SPACING) {
    const diff = Math.abs(value - tokenValue);
    if (diff < minDiff) {
      minDiff = diff;
      closest = tokenValue;
    }
  }

  return closest;
}

/**
 * 값이 토큰에 정의된 값인지 확인
 */
export function isStandardSpacing(value: number): boolean {
  return (ALLOWED_SPACING as readonly number[]).includes(value);
}

/**
 * 단일 프레임의 간격 표준화
 */
export function standardizeFrameSpacing(node: FrameNode): {
  changed: boolean;
  changes: string[];
} {
  const changes: string[] = [];

  // Auto Layout이 아닌 경우 스킵
  if (node.layoutMode === 'NONE') {
    return { changed: false, changes: [] };
  }

  // itemSpacing (gap) 표준화
  if (!isStandardSpacing(node.itemSpacing)) {
    const oldValue = node.itemSpacing;
    const newValue = roundToNearestToken(oldValue);
    node.itemSpacing = newValue;
    changes.push(`gap: ${oldValue}px → ${newValue}px`);
  }

  // padding 표준화
  const paddingProps = [
    { prop: 'paddingTop', label: 'padding-top' },
    { prop: 'paddingRight', label: 'padding-right' },
    { prop: 'paddingBottom', label: 'padding-bottom' },
    { prop: 'paddingLeft', label: 'padding-left' },
  ] as const;

  for (const { prop, label } of paddingProps) {
    const oldValue = node[prop];
    if (!isStandardSpacing(oldValue)) {
      const newValue = roundToNearestToken(oldValue);
      (node as any)[prop] = newValue;
      changes.push(`${label}: ${oldValue}px → ${newValue}px`);
    }
  }

  return {
    changed: changes.length > 0,
    changes,
  };
}

/**
 * 재귀적으로 모든 하위 프레임의 간격 표준화
 */
export function standardizeSpacingRecursive(node: SceneNode): {
  totalFrames: number;
  changedFrames: number;
  allChanges: { name: string; changes: string[] }[];
} {
  let totalFrames = 0;
  let changedFrames = 0;
  const allChanges: { name: string; changes: string[] }[] = [];

  function traverse(n: SceneNode) {
    if (n.type === 'FRAME') {
      totalFrames++;
      const result = standardizeFrameSpacing(n);
      if (result.changed) {
        changedFrames++;
        allChanges.push({
          name: n.name,
          changes: result.changes,
        });
      }

      // 자식 처리
      for (const child of n.children) {
        traverse(child);
      }
    } else if ('children' in n) {
      for (const child of (n as ChildrenMixin).children) {
        traverse(child);
      }
    }
  }

  traverse(node);

  return { totalFrames, changedFrames, allChanges };
}

/**
 * 선택된 노드들의 간격 표준화
 */
export function standardizeSelectionSpacing(): {
  success: boolean;
  message: string;
  details?: {
    totalFrames: number;
    changedFrames: number;
    allChanges: { name: string; changes: string[] }[];
  };
} {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    return {
      success: false,
      message: '선택된 요소가 없습니다.',
    };
  }

  let totalFrames = 0;
  let changedFrames = 0;
  const allChanges: { name: string; changes: string[] }[] = [];

  for (const node of selection) {
    const result = standardizeSpacingRecursive(node);
    totalFrames += result.totalFrames;
    changedFrames += result.changedFrames;
    for (const change of result.allChanges) {
      allChanges.push(change);
    }
  }

  if (totalFrames === 0) {
    return {
      success: false,
      message: '프레임이 없습니다.',
    };
  }

  if (changedFrames === 0) {
    return {
      success: true,
      message: `${totalFrames}개 프레임 검사 완료. 모든 간격이 이미 표준화되어 있습니다.`,
      details: { totalFrames, changedFrames, allChanges },
    };
  }

  return {
    success: true,
    message: `${totalFrames}개 프레임 중 ${changedFrames}개 프레임의 간격이 표준화되었습니다.`,
    details: { totalFrames, changedFrames, allChanges },
  };
}

/**
 * 비표준 간격 사용 현황 리포트 생성
 */
export function generateSpacingReport(node: SceneNode): {
  nonStandardValues: Map<number, { count: number; suggestion: number }>;
  totalAutoLayoutFrames: number;
} {
  const nonStandardValues = new Map<number, { count: number; suggestion: number }>();
  let totalAutoLayoutFrames = 0;

  function recordNonStandard(value: number) {
    if (!isStandardSpacing(value) && value > 0) {
      const existing = nonStandardValues.get(value);
      if (existing) {
        existing.count++;
      } else {
        nonStandardValues.set(value, {
          count: 1,
          suggestion: roundToNearestToken(value),
        });
      }
    }
  }

  function traverse(n: SceneNode) {
    if (n.type === 'FRAME' && n.layoutMode !== 'NONE') {
      totalAutoLayoutFrames++;

      recordNonStandard(n.itemSpacing);
      recordNonStandard(n.paddingTop);
      recordNonStandard(n.paddingRight);
      recordNonStandard(n.paddingBottom);
      recordNonStandard(n.paddingLeft);

      for (const child of n.children) {
        traverse(child);
      }
    } else if ('children' in n) {
      for (const child of (n as ChildrenMixin).children) {
        traverse(child);
      }
    }
  }

  traverse(node);

  return { nonStandardValues, totalAutoLayoutFrames };
}
