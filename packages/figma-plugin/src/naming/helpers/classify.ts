/**
 * 노드 분류/판별 함수 모음
 *
 * 규칙:
 * - constants.ts만 import 가능
 * - "이게 X인가?" 질문에 답하는 함수들
 * - 추론/변환 로직 금지 (infer.ts로)
 */

import {
  EXCLUDED_STATE_NAMES,
  ALWAYS_EXCLUDED_NODE_TYPES,
  PLACEHOLDER_TEXT_NAMES,
  ICON_LIBRARY_PREFIXES,
  KOREAN_LABEL_MAP,
  HYPHEN_ICON_PATTERNS,
  CAMEL_CASE_EXCEPTIONS,
  BLACKLIST_PATTERNS,
  GENERIC_NAMES,
  LAYOUT_KEYWORD_MAP,
} from './constants';

// ============================================
// 제외 조건 판별
// ============================================

/**
 * TEXT 노드가 네이밍 대상인지 확인
 * - 자동생성 이름 (Text 1, Text) → 대상
 * - placeholder 이름 (Video Title, Users Count) → 대상
 * - 의미 있는 이름 ("확인", "33/50") → 제외
 */
function shouldIncludeTextNode(node: SceneNode): boolean {
  if (node.type !== 'TEXT') return false;

  const nameLower = node.name.toLowerCase().trim();

  // 자동생성 패턴 (Text, Text 1, Text 123)
  if (/^text\s*\d*$/i.test(node.name)) {
    return true;
  }

  // placeholder 이름
  if (PLACEHOLDER_TEXT_NAMES.includes(nameLower)) {
    return true;
  }

  // 공백 포함된 일반적 placeholder (Video Title 등)
  for (const placeholder of PLACEHOLDER_TEXT_NAMES) {
    if (nameLower.includes(placeholder) && nameLower.split(' ').length <= 3) {
      return true;
    }
  }

  return false;
}

/**
 * RECTANGLE 노드가 네이밍 대상인지 확인
 * - 이미지 fill이 있는 경우 → 대상
 * - 50px 이상 크기 → 대상
 * - 작은 장식 요소 → 제외
 */
function shouldIncludeRectangleNode(node: SceneNode): boolean {
  if (node.type !== 'RECTANGLE') return false;

  const rect = node as RectangleNode;

  // 이미지 fill 확인
  const fills = rect.fills;
  if (Array.isArray(fills)) {
    const hasImageFill = fills.some(f => f.type === 'IMAGE' && f.visible !== false);
    if (hasImageFill) {
      return true;
    }
  }

  // 50px 이상 크기 (가로 또는 세로)
  if (rect.width >= 50 || rect.height >= 50) {
    return true;
  }

  return false;
}

/**
 * 노드가 네이밍 제외 대상인지 확인
 * - 제외 조건 1: 벡터 레이어 (항상)
 * - 제외 조건 2: 상태값 이름 (on, off 등)
 * - 조건부 포함: TEXT (자동생성/placeholder), RECTANGLE (이미지/50px+)
 */
export function shouldSkipNaming(node: SceneNode): boolean {
  // 1: 항상 제외 (벡터, 기본 도형)
  if (ALWAYS_EXCLUDED_NODE_TYPES.includes(node.type)) {
    return true;
  }

  // 2: 상태값 이름 제외
  const nameLower = node.name.toLowerCase().trim();
  if (EXCLUDED_STATE_NAMES.includes(nameLower)) {
    return true;
  }

  // 3: TEXT - 조건부 포함
  if (node.type === 'TEXT') {
    return !shouldIncludeTextNode(node);
  }

  // 4: RECTANGLE - 조건부 포함
  if (node.type === 'RECTANGLE') {
    return !shouldIncludeRectangleNode(node);
  }

  return false;
}

// ============================================
// 최상위/스크린 판별
// ============================================

/**
 * 최상위 스크린 프레임인지 확인 (PAGE 바로 아래)
 */
export function isTopLevelScreenFrame(node: SceneNode): boolean {
  const parent = node.parent;
  return parent !== null && parent.type === 'PAGE';
}

// ============================================
// 아이콘 관련 판별
// ============================================

/**
 * 아이콘 라이브러리 형식인지 확인
 */
export function isIconLibraryName(name: string): boolean {
  return ICON_LIBRARY_PREFIXES.some(prefix => name.startsWith(prefix));
}

/**
 * 한글 레이블인지 확인
 */
export function isKoreanLabel(name: string): boolean {
  const trimmed = name.trim();
  return KOREAN_LABEL_MAP.hasOwnProperty(trimmed) || KOREAN_LABEL_MAP.hasOwnProperty(name);
}

/**
 * 하이픈 패턴 아이콘 이름인지 확인
 * e.g., "user-circle-02", "award-04"
 */
export function isHyphenIconPattern(name: string): boolean {
  // 숫자 접미사 제거 후 확인
  const withoutNumbers = name.replace(/-\d+$/, '');
  return HYPHEN_ICON_PATTERNS.hasOwnProperty(withoutNumbers) ||
         Object.keys(HYPHEN_ICON_PATTERNS).some(pattern => withoutNumbers.startsWith(pattern));
}

/**
 * 노드가 아이콘 상태 컨테이너인지 확인
 * - 자식에 on/off 프레임이 있으면 true
 */
export function isIconStateContainer(node: SceneNode): boolean {
  if (!('children' in node)) return false;

  const children = (node as ChildrenMixin).children;
  const hasOnOff = children.some(child => {
    const nameLower = child.name.toLowerCase().trim();
    return nameLower === 'on' || nameLower === 'off';
  });

  return hasOnOff;
}

/**
 * 부모가 탭바/네비게이션인지 확인
 */
export function isInTabbarContext(node: SceneNode): boolean {
  let parent = node.parent;
  while (parent) {
    if ('name' in parent) {
      const nameLower = (parent as SceneNode).name.toLowerCase();
      if (nameLower.includes('tabbar') ||
          nameLower.includes('tab bar') ||
          nameLower.includes('navigation') ||
          nameLower.includes('navbar') ||
          nameLower.includes('bottomnav') ||
          nameLower.includes('bottom nav')) {
        return true;
      }
    }
    parent = parent.parent;
  }
  return false;
}

// ============================================
// camelCase 판별
// ============================================

/**
 * camelCase 문자열인지 확인
 * e.g., "redDot", "myPage" → true
 * e.g., "RedDot", "MyPage", "red-dot", "iPhone" → false
 */
export function isCamelCase(name: string): boolean {
  // 예외 목록에 있으면 false
  if (CAMEL_CASE_EXCEPTIONS.includes(name)) return false;

  // 예외 목록의 일부로 시작하는지 체크 (e.g., "iPhoneButton")
  for (const exception of CAMEL_CASE_EXCEPTIONS) {
    if (name.startsWith(exception)) return false;
  }

  // 첫 글자가 소문자이고, 대문자가 포함된 경우
  if (name.length < 2) return false;
  const firstChar = name[0];
  const hasUpperCase = /[A-Z]/.test(name.slice(1));
  const startsWithLower = firstChar === firstChar.toLowerCase() && /[a-z]/.test(firstChar);

  return startsWithLower && hasUpperCase;
}

// ============================================
// 이름 패턴 판별
// ============================================

/**
 * 금지된 이름인지 확인
 * - Content, Layout/*, Inner, Wrapper, Box, Item 등
 */
export function isBlacklistedName(name: string): boolean {
  // 정확히 일치하는 경우
  if (BLACKLIST_PATTERNS.includes(name)) {
    return true;
  }

  // prefix로 시작하는 경우 (Layout/Main, Content/Header 등)
  for (const pattern of BLACKLIST_PATTERNS) {
    if (name.startsWith(pattern + '/')) {
      return true;
    }
  }

  return false;
}

/**
 * 일반적인 (의미 없는) 이름인지 확인
 */
export function isGenericName(name: string): boolean {
  const nameLower = name.toLowerCase().trim();
  return GENERIC_NAMES.includes(nameLower);
}

/**
 * 자동 생성된 이름인지 확인
 * - "Frame 123456" 패턴
 * - "Group 123" 패턴
 * - "Rectangle 1" 패턴
 */
export function isAutoGeneratedName(name: string): boolean {
  return /^(Frame|Group|Rectangle|Ellipse|Line|Vector|Instance|Component)\s*\d*$/i.test(name);
}

// ============================================
// 레이아웃 프레임 판별
// ============================================

/**
 * 화면 최상위 레이아웃 프레임인지 확인
 */
export function isLayoutFrame(node: SceneNode): boolean {
  const nameLower = node.name.toLowerCase().trim();

  // 1. 이미 Layout/ prefix가 있으면 스킵
  if (node.name.startsWith('Layout/')) return false;

  // 2. Layout 키워드 매칭
  if (LAYOUT_KEYWORD_MAP[nameLower]) return true;

  // 3. 부분 매칭 (header, bottom, main 등 포함)
  const layoutKeywords = ['header', 'bottom', 'tabbar', 'navbar', 'footer'];
  for (const keyword of layoutKeywords) {
    if (nameLower.includes(keyword)) return true;
  }

  // 4. 언더스코어 패턴 (container_top, bar_status 등)
  if (nameLower.includes('_top') || nameLower.includes('_bottom') ||
      nameLower.includes('_status') || nameLower.includes('bar_')) {
    return true;
  }

  return false;
}

// ============================================
// 버튼/컴포넌트 판별
// ============================================

/**
 * 노드가 버튼처럼 보이는지 휴리스틱 판단
 */
export function looksLikeButton(node: SceneNode): boolean {
  // 크기 체크 (버튼은 보통 작음)
  if (node.width > 300 || node.height > 80) {
    return false;
  }

  // 이름 패턴 체크
  const nameLower = node.name.toLowerCase();
  const buttonKeywords = ['btn', 'button', 'cta', 'action', 'submit', 'confirm', 'cancel'];
  if (buttonKeywords.some(kw => nameLower.includes(kw))) {
    return true;
  }

  // 자식 구조 체크 (텍스트 + 작은 아이콘)
  if ('children' in node) {
    const children = (node as ChildrenMixin).children;
    const hasText = children.some(c => c.type === 'TEXT');
    const isSmall = children.length <= 3;

    if (hasText && isSmall) {
      return true;
    }
  }

  return false;
}

// ============================================
// 부모-자식 관계 판별
// ============================================

/**
 * 부모와 동일한 이름인지 확인
 * 단, 최상위 프레임(페이지 바로 아래)은 스킵
 */
export function hasSameNameAsParent(node: SceneNode): boolean {
  const parent = node.parent;
  if (!parent || !('name' in parent)) return false;

  // 최상위 프레임(페이지 바로 아래)은 스킵
  if (parent.type === 'PAGE') return false;

  return node.name === (parent as SceneNode).name;
}
