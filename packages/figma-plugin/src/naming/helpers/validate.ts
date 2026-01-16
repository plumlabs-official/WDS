/**
 * 검증/컨텍스트 체크 함수 모음
 *
 * 규칙:
 * - constants.ts만 import 가능
 * - 트리/깊이/조상 관련 유틸리티
 * - 변환 조건 검증
 */

import {
  COMPONENT_PREFIXES,
} from './constants';
import { isGenericName } from './classify';

// ============================================
// 깊이/트리 유틸리티
// ============================================

/**
 * 노드의 깊이(depth) 계산
 * - 최상위 페이지에서부터의 거리
 * @returns 깊이 (0 = 페이지 직속)
 */
export function getNodeDepth(node: SceneNode): number {
  let depth = 0;
  let current = node.parent;

  while (current && current.type !== 'PAGE') {
    depth++;
    current = current.parent;
  }

  return depth;
}

/**
 * 스크린/프레임 기준 상대 깊이 계산
 * - 가장 가까운 상위 FRAME (Screen 역할) 기준
 * @returns 상대 깊이 (0 = Screen 직속)
 */
export function getRelativeDepth(node: SceneNode): number {
  let depth = 0;
  let current = node.parent;

  while (current && current.type !== 'PAGE') {
    // 상위 FRAME 중 Screen으로 추정되는 것 찾기
    // (큰 프레임, 디바이스 사이즈에 가까운 것)
    if (current.type === 'FRAME') {
      const frame = current as FrameNode;
      // Screen으로 추정: 375x812 이상 크기
      if (frame.width >= 320 && frame.height >= 568) {
        return depth;
      }
    }
    depth++;
    current = current.parent;
  }

  return depth;
}

// ============================================
// 조상 컴포넌트 탐색
// ============================================

/**
 * 상위 노드 중 컴포넌트 타입 찾기
 * @returns 컴포넌트 타입 (Button, Card 등) 또는 null
 */
export function getAncestorComponentType(node: SceneNode): string | null {
  let parent = node.parent;

  while (parent && 'name' in parent) {
    const parentName = (parent as SceneNode).name;

    for (const prefix of COMPONENT_PREFIXES) {
      if (parentName.startsWith(prefix)) {
        return prefix.replace('/', '');
      }
    }

    parent = parent.parent;
  }

  return null;
}

/**
 * 상위 컴포넌트의 전체 이름 가져오기
 * @returns 컴포넌트 이름 (Button/Primary/LG 등) 또는 null
 */
export function getAncestorComponentName(node: SceneNode): string | null {
  let parent = node.parent;

  while (parent && 'name' in parent) {
    const parentName = (parent as SceneNode).name;

    for (const prefix of COMPONENT_PREFIXES) {
      if (parentName.startsWith(prefix)) {
        return parentName;
      }
    }

    parent = parent.parent;
  }

  return null;
}

// ============================================
// 변환 조건 검증
// ============================================

/**
 * Layout으로 변환해도 되는지 검증
 * - 깊이, 부모 컨텍스트, 크기 체크
 */
export function shouldConvertToLayout(node: SceneNode): boolean {
  // 1. 이미 컴포넌트 내부에 있으면 Layout 변환 금지
  const ancestorComponent = getAncestorComponentType(node);
  if (ancestorComponent) {
    return false;
  }

  // 2. 상대 깊이가 너무 깊으면 Layout 변환 금지 (Screen 기준 2단계까지만)
  const relativeDepth = getRelativeDepth(node);
  if (relativeDepth > 2) {
    return false;
  }

  // 3. 너무 작으면 Layout이 아님 (최소 너비 200px)
  if (node.width < 200) {
    return false;
  }

  return true;
}

/**
 * 이 노드가 상위 컴포넌트에 통합되어야 하는지 확인
 * - 부모가 Button/Primary/LG인데 자식도 버튼처럼 보이면 스킵
 * @returns { shouldSkip: boolean, reason: string, parentComponent: string | null }
 */
export function shouldSkipForParentComponent(node: SceneNode): {
  shouldSkip: boolean;
  reason: string;
  parentComponent: string | null;
} {
  const ancestorComponent = getAncestorComponentType(node);
  const ancestorName = getAncestorComponentName(node);

  if (!ancestorComponent) {
    return { shouldSkip: false, reason: '', parentComponent: null };
  }

  // 언더스코어가 포함된 이름은 AI가 수정해야 하므로 스킵하지 않음
  if (node.name.includes('_')) {
    return { shouldSkip: false, reason: '', parentComponent: ancestorName };
  }

  // 부모 컴포넌트 타입에 따라 스킵 여부 결정
  // Button 내부의 모든 자식은 네이밍 스킵
  if (ancestorComponent === 'Button') {
    return {
      shouldSkip: true,
      reason: `상위 ${ancestorName}에 포함됨`,
      parentComponent: ancestorName,
    };
  }

  // Card 내부에서 container, content 같은 일반 이름은 스킵
  if (ancestorComponent === 'Card' && isGenericName(node.name)) {
    return {
      shouldSkip: true,
      reason: `상위 ${ancestorName} 내부 구조`,
      parentComponent: ancestorName,
    };
  }

  // Input 내부는 스킵
  if (ancestorComponent === 'Input') {
    return {
      shouldSkip: true,
      reason: `상위 ${ancestorName}에 포함됨`,
      parentComponent: ancestorName,
    };
  }

  // Icon 내부는 완전 스킵 (벡터, 상태 등)
  if (ancestorComponent === 'Icon') {
    return {
      shouldSkip: true,
      reason: `Icon 내부 요소`,
      parentComponent: ancestorName,
    };
  }

  // 기타 컴포넌트: 일반 이름만 스킵
  if (isGenericName(node.name)) {
    return {
      shouldSkip: true,
      reason: `상위 ${ancestorName} 내부 구조`,
      parentComponent: ancestorName,
    };
  }

  return { shouldSkip: false, reason: '', parentComponent: ancestorName };
}

// ============================================
// 형제 충돌 검증
// ============================================

/**
 * 기존 형제 노드 이름과 충돌 여부 확인
 * 변경 후 이름이 기존 형제와 겹치는지 검사
 */
export function hasExistingSiblingConflict(node: SceneNode, newName: string): boolean {
  const parent = node.parent;
  if (!parent || !('children' in parent)) return false;

  const siblings = (parent as ChildrenMixin).children;

  for (const sibling of siblings) {
    // 자기 자신은 제외
    if (sibling.id === node.id) continue;

    // 기존 형제와 이름 충돌
    if (sibling.name === newName) {
      return true;
    }
  }

  return false;
}
