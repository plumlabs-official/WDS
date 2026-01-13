/**
 * Auto Layout 적용 모듈
 *
 * 역할:
 * - 선택된 프레임에 Auto Layout 자동 적용
 * - 자식 요소 배치 분석 → horizontal/vertical 자동 판단
 * - tokens.ts의 spacing 값으로 gap 표준화
 * - 반응형 설정 (hug/fill 자동 판단)
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
 * 자식 요소들의 배치를 분석하여 방향 판단
 * - 수평 배치: HORIZONTAL
 * - 수직 배치: VERTICAL
 */
export function detectLayoutDirection(node: FrameNode): 'HORIZONTAL' | 'VERTICAL' {
  const children = node.children;

  if (children.length < 2) {
    // 자식이 1개 이하면 기본값 VERTICAL
    return 'VERTICAL';
  }

  // 첫 두 자식 요소의 위치 비교
  const first = children[0];
  const second = children[1];

  const horizontalDiff = Math.abs(first.x - second.x);
  const verticalDiff = Math.abs(first.y - second.y);

  // 수평 차이가 더 크면 HORIZONTAL
  if (horizontalDiff > verticalDiff) {
    return 'HORIZONTAL';
  }

  return 'VERTICAL';
}

/**
 * 자식 요소들 간의 평균 간격 계산
 */
export function calculateAverageGap(node: FrameNode, direction: 'HORIZONTAL' | 'VERTICAL'): number {
  const children = node.children;

  if (children.length < 2) {
    return 8; // 기본값
  }

  let totalGap = 0;
  let gapCount = 0;

  for (let i = 0; i < children.length - 1; i++) {
    const current = children[i];
    const next = children[i + 1];

    let gap: number;
    if (direction === 'HORIZONTAL') {
      // 현재 요소의 오른쪽 끝과 다음 요소의 왼쪽 시작 사이 간격
      gap = next.x - (current.x + current.width);
    } else {
      // 현재 요소의 아래쪽 끝과 다음 요소의 위쪽 시작 사이 간격
      gap = next.y - (current.y + current.height);
    }

    if (gap > 0) {
      totalGap += gap;
      gapCount++;
    }
  }

  if (gapCount === 0) return 8;

  return Math.round(totalGap / gapCount);
}

/**
 * 패딩 값 계산 (첫 자식과 프레임 경계 사이)
 */
export function calculatePadding(node: FrameNode): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const children = node.children;

  if (children.length === 0) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  // 모든 자식의 경계 계산
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const child of children) {
    minX = Math.min(minX, child.x);
    minY = Math.min(minY, child.y);
    maxX = Math.max(maxX, child.x + child.width);
    maxY = Math.max(maxY, child.y + child.height);
  }

  return {
    top: Math.max(0, minY),
    right: Math.max(0, node.width - maxX),
    bottom: Math.max(0, node.height - maxY),
    left: Math.max(0, minX),
  };
}

/**
 * 단일 프레임에 Auto Layout 적용
 */
export function applyAutoLayout(node: FrameNode, options?: {
  direction?: 'HORIZONTAL' | 'VERTICAL' | 'AUTO';
  standardizeSpacing?: boolean;
}): void {
  const { direction = 'AUTO', standardizeSpacing = true } = options || {};

  // 방향 결정
  const layoutDirection = direction === 'AUTO'
    ? detectLayoutDirection(node)
    : direction;

  // 간격 계산
  const rawGap = calculateAverageGap(node, layoutDirection);
  const gap = standardizeSpacing ? roundToNearestToken(rawGap) : rawGap;

  // 패딩 계산
  const rawPadding = calculatePadding(node);
  const padding = standardizeSpacing ? {
    top: roundToNearestToken(rawPadding.top),
    right: roundToNearestToken(rawPadding.right),
    bottom: roundToNearestToken(rawPadding.bottom),
    left: roundToNearestToken(rawPadding.left),
  } : rawPadding;

  // Auto Layout 적용
  node.layoutMode = layoutDirection;
  node.itemSpacing = gap;
  node.paddingTop = padding.top;
  node.paddingRight = padding.right;
  node.paddingBottom = padding.bottom;
  node.paddingLeft = padding.left;

  // 기본 정렬 설정
  node.primaryAxisAlignItems = 'MIN';
  node.counterAxisAlignItems = 'MIN';

  // 사이징 설정 (기본: HUG)
  node.primaryAxisSizingMode = 'AUTO';
  node.counterAxisSizingMode = 'AUTO';
}

/**
 * 재귀적으로 모든 하위 프레임에 Auto Layout 적용
 */
export function applyAutoLayoutRecursive(
  node: SceneNode,
  options?: {
    direction?: 'HORIZONTAL' | 'VERTICAL' | 'AUTO';
    standardizeSpacing?: boolean;
    skipExisting?: boolean;
  }
): number {
  const opts = options || {};
  const skipExisting = opts.skipExisting !== undefined ? opts.skipExisting : true;
  const applyOptions = {
    direction: opts.direction,
    standardizeSpacing: opts.standardizeSpacing,
  };

  let appliedCount = 0;

  if (node.type === 'FRAME') {
    // 이미 Auto Layout이 적용된 경우 스킵 (옵션에 따라)
    if (skipExisting && node.layoutMode !== 'NONE') {
      // 하위 요소만 처리
    } else {
      applyAutoLayout(node, applyOptions);
      appliedCount++;
    }

    // 자식 요소 재귀 처리
    for (const child of node.children) {
      appliedCount += applyAutoLayoutRecursive(child, options);
    }
  } else if ('children' in node) {
    // GROUP, COMPONENT 등 자식이 있는 노드
    for (const child of (node as ChildrenMixin).children) {
      appliedCount += applyAutoLayoutRecursive(child, options);
    }
  }

  return appliedCount;
}

/**
 * 선택된 노드들에 Auto Layout 적용
 */
export function applyAutoLayoutToSelection(options?: {
  direction?: 'HORIZONTAL' | 'VERTICAL' | 'AUTO';
  standardizeSpacing?: boolean;
  recursive?: boolean;
  skipExisting?: boolean;
}): { success: boolean; count: number; message: string } {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    return {
      success: false,
      count: 0,
      message: '선택된 요소가 없습니다. 프레임을 선택해주세요.',
    };
  }

  const opts = options || {};
  const recursive = opts.recursive !== undefined ? opts.recursive : false;
  const otherOptions = {
    direction: opts.direction,
    standardizeSpacing: opts.standardizeSpacing,
    skipExisting: opts.skipExisting,
  };

  let totalApplied = 0;

  for (const node of selection) {
    if (recursive) {
      totalApplied += applyAutoLayoutRecursive(node, otherOptions);
    } else if (node.type === 'FRAME') {
      applyAutoLayout(node, otherOptions);
      totalApplied++;
    }
  }

  if (totalApplied === 0) {
    return {
      success: false,
      count: 0,
      message: '적용할 프레임이 없습니다. 프레임을 선택해주세요.',
    };
  }

  return {
    success: true,
    count: totalApplied,
    message: `${totalApplied}개 프레임에 Auto Layout이 적용되었습니다.`,
  };
}
