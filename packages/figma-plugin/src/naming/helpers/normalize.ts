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
 * - 충돌 후보가 있으면 이 단계에서는 이름을 변경하지 않음
 * - 실제 충돌 처리는 makeUniqueSiblingName에서 "기존 이름 유지"로 안전하게 스킵
 */
export function resolveSiblingDuplicates(
  changes: Array<{ node: SceneNode; oldName: string; newName: string }>
): Array<{ node: SceneNode; oldName: string; newName: string }> {
  // SSOT 규칙: 언더스코어/넘버링 자동 생성 금지
  // 중복 해소는 makeUniqueSiblingName에서 "기존 이름 유지"로 처리한다.
  return changes;
}

/**
 * 기존 형제와 충돌 시 고유한 이름 생성
 */
export function makeUniqueSiblingName(node: SceneNode, baseName: string): string {
  if (!hasExistingSiblingConflict(node, baseName)) {
    return baseName;
  }

  // SSOT 규칙: 숫자 접미사로 이름 생성하지 않는다.
  // 충돌 시 현재 이름을 유지해 안전하게 스킵한다.
  return node.name;
}

// Note: hasExistingSiblingConflict는 validate.ts에서 export됨
// 충돌 체크는 해당 함수를 직접 사용
