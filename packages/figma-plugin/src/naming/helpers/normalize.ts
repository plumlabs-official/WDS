/**
 * 정규화/중복 해결 함수 모음
 *
 * 규칙:
 * - constants.ts, classify.ts, validate.ts import 가능
 * - 이름 변환/정규화 로직
 * - 중복 해결 로직
 */

import { isCamelCase } from './classify';
import { hasExistingSiblingConflict } from './validate';

// ============================================
// 기본 정규화
// ============================================

/**
 * camelCase를 PascalCase로 변환
 * e.g., "redDot" → "RedDot"
 * e.g., "iPhone" → "iPhone" (예외 - 변환 안 함)
 */
export function convertCamelCaseToPascalCase(name: string): string {
  if (!isCamelCase(name)) return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * 최상위 스크린 이름에서 불필요한 prefix 제거
 * - Container/HomeScreen → HomeScreen
 * - Layout/Main → Main (최상위에서는 Layout/ 불필요)
 */
export function cleanScreenName(name: string): string {
  // Container/, Layout/ prefix 제거
  const prefixesToRemove = ['Container/', 'Layout/', 'Screen/'];
  let cleaned = name;

  for (const prefix of prefixesToRemove) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.slice(prefix.length);
    }
  }

  return cleaned;
}

/**
 * 이름에서 부모 도메인 키워드 제거
 * e.g., "Weekly Challenge Content" + parentDomains=["Weekly", "Challenge"]
 *       → "Content"
 */
export function stripParentDomainFromName(
  name: string,
  parentDomains: string[]
): string {
  let result = name;

  for (const domain of parentDomains) {
    // 대소문자 무시하고 단어 경계에서 제거
    const regex = new RegExp(`\\b${domain}\\b[\\s_-]*`, 'gi');
    result = result.replace(regex, '');
  }

  // 여러 공백을 하나로, 앞뒤 공백 제거
  return result.replace(/\s+/g, ' ').trim();
}

// ============================================
// 한글 변환
// ============================================

import { KOREAN_LABEL_MAP } from './constants';

/**
 * 한글 레이블을 영문으로 변환
 */
export function convertKoreanLabel(name: string): string {
  const trimmed = name.trim();
  return KOREAN_LABEL_MAP[trimmed] || KOREAN_LABEL_MAP[name] || name;
}

// ============================================
// 형제 중복 해결
// ============================================

/**
 * 변경 예정 목록에서 형제 중복 이름 감지 및 인덱싱
 *
 * @param changes 변경 예정 목록 [{node, oldName, newName}]
 * @returns 중복 해결된 변경 목록
 *
 * 예시:
 * - Content, Content → Content, Content_2
 * - Header, Header, Header → Header, Header_2, Header_3
 */
export function resolveSiblingDuplicates(
  changes: Array<{ node: SceneNode; oldName: string; newName: string }>
): Array<{ node: SceneNode; oldName: string; newName: string }> {
  // 부모별로 그룹화
  const byParent = new Map<string, Array<{ node: SceneNode; oldName: string; newName: string }>>();

  for (const change of changes) {
    const parentId = change.node.parent?.id || 'root';
    if (!byParent.has(parentId)) {
      byParent.set(parentId, []);
    }
    byParent.get(parentId)!.push(change);
  }

  const result: Array<{ node: SceneNode; oldName: string; newName: string }> = [];

  // 각 부모 그룹 내에서 중복 처리
  for (const [_parentId, siblings] of byParent) {
    // 새 이름별로 카운트
    const nameCount = new Map<string, number>();
    const nameIndices = new Map<string, number>();

    // 1차: 카운트 계산
    for (const change of siblings) {
      const count = nameCount.get(change.newName) || 0;
      nameCount.set(change.newName, count + 1);
    }

    // 2차: 인덱스 부여 (중복인 경우만)
    for (const change of siblings) {
      const count = nameCount.get(change.newName) || 0;

      if (count > 1) {
        // 중복 있음 - 인덱스 부여
        const currentIndex = (nameIndices.get(change.newName) || 0) + 1;
        nameIndices.set(change.newName, currentIndex);

        // 첫 번째는 그대로, 2번째부터 _2, _3...
        if (currentIndex > 1) {
          result.push({
            node: change.node,
            oldName: change.oldName,
            newName: `${change.newName}_${currentIndex}`,
          });
        } else {
          result.push(change);
        }
      } else {
        // 중복 없음 - 그대로
        result.push(change);
      }
    }
  }

  return result;
}

/**
 * 기존 형제와 충돌 시 고유한 이름 생성
 */
export function makeUniqueSiblingName(node: SceneNode, baseName: string): string {
  if (!hasExistingSiblingConflict(node, baseName)) {
    return baseName;
  }

  // 충돌 시 인덱스 추가
  let index = 2;
  let uniqueName = `${baseName}_${index}`;

  while (hasExistingSiblingConflict(node, uniqueName)) {
    index++;
    uniqueName = `${baseName}_${index}`;
  }

  return uniqueName;
}
