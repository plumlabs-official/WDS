/**
 * 네이밍 자동화 모듈 (AI 네이밍 전용)
 *
 * 역할:
 * - 제외 조건 판단 (벡터, 도형, 상태값)
 * - 아이콘 라이브러리 → WDS 네이밍 변환
 * - 한글 레이블 → 영문 변환
 * - 탭바 컨텍스트 감지
 * - 깊이/부모 컨텍스트 기반 오탐 방지
 * - 중첩 컴포넌트 통합 처리
 *
 * Note: Rule-based 네이밍은 삭제됨. AI 네이밍만 사용.
 */

// ============================================
// 네이밍 제외 조건
// ============================================

/**
 * 제외할 상태값 이름 (대소문자 무시)
 */
const EXCLUDED_STATE_NAMES = [
  'on', 'off',
  'active', 'inactive',
  'disabled', 'enabled',
  'selected', 'unselected',
  'hover', 'pressed', 'focus',
  'default', 'normal',
  'checked', 'unchecked',
];

/**
 * 제외할 노드 타입 (벡터, 도형)
 */
const EXCLUDED_NODE_TYPES: string[] = [
  'VECTOR',
  'ELLIPSE',
  'LINE',
  'RECTANGLE',
  'BOOLEAN_OPERATION',
  'STAR',
  'POLYGON',
];

/**
 * 노드가 네이밍 제외 대상인지 확인
 * - 제외 조건 1: 벡터 레이어
 * - 제외 조건 2: 상태값 이름 (on, off 등)
 * - 제외 조건 5: 도형 레이어
 */
export function shouldSkipNaming(node: SceneNode): boolean {
  // 1 & 5: 벡터/도형 레이어 제외
  if (EXCLUDED_NODE_TYPES.includes(node.type)) {
    return true;
  }

  // 2: 상태값 이름 제외
  const nameLower = node.name.toLowerCase().trim();
  if (EXCLUDED_STATE_NAMES.includes(nameLower)) {
    return true;
  }

  return false;
}

/**
 * 최상위 스크린 프레임인지 확인 (PAGE 바로 아래)
 */
export function isTopLevelScreenFrame(node: SceneNode): boolean {
  const parent = node.parent;
  return parent !== null && parent.type === 'PAGE';
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

// ============================================
// 아이콘 라이브러리 → WDS 네이밍 변환
// ============================================

/**
 * 아이콘 라이브러리 prefix 패턴
 */
const ICON_LIBRARY_PREFIXES = [
  'carbon:',
  'la:',
  'solar:',
  'icon-park-solid:',
  'icon-park-outline:',
  'lets-icons:',
  'bi:',
  'rivet-icons:',
  'mdi:',
  'lucide:',
  'tabler:',
  'heroicons:',
  'phosphor:',
  'feather:',
  'ionicons:',
  'material-symbols:',
  'ant-design:',
  'fa:',
  'fa6-solid:',
  'fa6-regular:',
];

/**
 * 스타일 접미사 (제거 대상)
 */
const ICON_STYLE_SUFFIXES = [
  '-fill',
  '-filled',
  '-outline',
  '-outlined',
  '-bold',
  '-linear',
  '-solid',
  '-regular',
  '-light',
  '-thin',
  '-duotone',
];

/**
 * 한글 레이블 → 영문 변환 테이블
 * - 탭바, 버튼 등의 한글 레이블을 영문으로 변환
 */
const KOREAN_LABEL_MAP: Record<string, string> = {
  // 탭바/네비게이션
  '홈': 'Home',
  '홈 ': 'Home', // 공백 포함 버전
  '라운지': 'Lounge',
  '마이페이지': 'MyPage',
  '마이': 'My',
  '챌린지': 'Challenge',
  '피드': 'Feed',
  '검색': 'Search',
  '알림': 'Notification',
  '설정': 'Settings',
  '프로필': 'Profile',
  '친구': 'Friends',
  '미션': 'Mission',
  '상점': 'Shop',
  '랭킹': 'Ranking',
  '업적': 'Achievement',
  '더보기': 'More',

  // 액션
  '확인': 'Confirm',
  '취소': 'Cancel',
  '다음': 'Next',
  '이전': 'Prev',
  '완료': 'Done',
  '저장': 'Save',
  '삭제': 'Delete',
  '수정': 'Edit',
  '닫기': 'Close',
  '시작': 'Start',
};

/**
 * 하이픈 패턴 아이콘 이름 (라이브러리 prefix 없이)
 * e.g., "user-circle-02", "award-04"
 */
const HYPHEN_ICON_PATTERNS: Record<string, string> = {
  'user-circle': 'User',
  'user': 'User',
  'award': 'Award',
  'medal': 'Medal',
  'star': 'Star',
  'check': 'Check',
  'close': 'Close',
  'arrow': 'Arrow',
  'chevron': 'Chevron',
  'home': 'Home',
  'search': 'Search',
  'settings': 'Settings',
  'bell': 'Bell',
  'chat': 'Chat',
  'heart': 'Heart',
  'play': 'Play',
  'pause': 'Pause',
};

/**
 * WDS 아이콘 명명 규칙 테이블
 * - 원본 패턴 → WDS 이름 매핑
 * - 자주 사용되는 아이콘은 직접 매핑
 */
const WDS_ICON_MAP: Record<string, string> = {
  // 탐색/발견
  'ibm-watson-discovery': 'Discovery',
  'discovery': 'Discovery',
  'search': 'Search',
  'explore': 'Explore',

  // 사용자/소셜
  'user-friends': 'Friends',
  'user': 'User',
  'users': 'Users',
  'people': 'People',
  'people-circle': 'People',
  'user-circle': 'UserCircle',
  'group': 'Group',
  'team': 'Team',

  // 미디어
  'play': 'Play',
  'pause': 'Pause',
  'stop': 'Stop',
  'video': 'Video',
  'camera': 'Camera',
  'image': 'Image',
  'photo': 'Photo',

  // 커뮤니케이션
  'chat': 'Chat',
  'message': 'Message',
  'comment': 'Comment',
  'mail': 'Mail',
  'notification': 'Notification',
  'bell': 'Bell',

  // 액션
  'check': 'Check',
  'close': 'Close',
  'add': 'Add',
  'plus': 'Plus',
  'minus': 'Minus',
  'edit': 'Edit',
  'delete': 'Delete',
  'trash': 'Trash',
  'share': 'Share',
  'download': 'Download',
  'upload': 'Upload',

  // 네비게이션
  'home': 'Home',
  'menu': 'Menu',
  'arrow': 'Arrow',
  'chevron': 'Chevron',
  'back': 'Back',
  'forward': 'Forward',

  // 상태/표시
  'star': 'Star',
  'heart': 'Heart',
  'like': 'Like',
  'bookmark': 'Bookmark',
  'flag': 'Flag',
  'medal': 'Medal',
  'trophy': 'Trophy',
  'award': 'Award',

  // 설정
  'settings': 'Settings',
  'gear': 'Settings',
  'cog': 'Settings',
  'config': 'Config',

  // 기타
  'calendar': 'Calendar',
  'clock': 'Clock',
  'time': 'Time',
  'location': 'Location',
  'map': 'Map',
  'link': 'Link',
  'lock': 'Lock',
  'unlock': 'Unlock',
};

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
 * 한글 레이블을 영문으로 변환
 */
export function convertKoreanLabel(name: string): string {
  const trimmed = name.trim();
  return KOREAN_LABEL_MAP[trimmed] || KOREAN_LABEL_MAP[name] || name;
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
 * 하이픈 패턴 아이콘 이름을 WDS 네이밍으로 변환
 */
export function convertHyphenIconToWDS(name: string): string {
  // 숫자 접미사 제거
  const withoutNumbers = name.replace(/-\d+$/, '');

  // 직접 매칭
  if (HYPHEN_ICON_PATTERNS[withoutNumbers]) {
    return `Icon/${HYPHEN_ICON_PATTERNS[withoutNumbers]}`;
  }

  // 부분 매칭
  for (const [pattern, wdsName] of Object.entries(HYPHEN_ICON_PATTERNS)) {
    if (withoutNumbers.startsWith(pattern)) {
      return `Icon/${wdsName}`;
    }
  }

  // 폴백: 첫 단어를 PascalCase로
  const parts = withoutNumbers.split('-');
  const firstPart = parts[0];
  const pascalCase = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
  return `Icon/${pascalCase}`;
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
// camelCase 방어 로직
// ============================================

/**
 * camelCase 변환 예외 (브랜드명, 특수 케이스)
 * - 이 목록에 있으면 camelCase 변환하지 않음
 */
const CAMEL_CASE_EXCEPTIONS = [
  // Apple
  'iPhone', 'iPad', 'iPod', 'iMac', 'iCloud', 'iOS', 'iPadOS', 'macOS', 'watchOS', 'tvOS',
  // Tech brands
  'eBay', 'eBook', 'eCommerce', 'eMail',
  'webKit', 'webView', 'webSocket', 'webGL', 'webRTC',
  'YouTube', 'LinkedIn', 'GitHub', 'GitLab', 'BitBucket',
  'JavaScript', 'TypeScript', 'CoffeeScript',
  // Common patterns that should stay as-is
  'jQuery', 'npm', 'pnpm',
];

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

/**
 * camelCase를 PascalCase로 변환
 * e.g., "redDot" → "RedDot"
 * e.g., "myPageButton" → "MyPageButton"
 * e.g., "iPhone" → "iPhone" (예외 - 변환 안 함)
 */
export function convertCamelCaseToPascalCase(name: string): string {
  if (!isCamelCase(name)) return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// ============================================
// 자식 아이콘으로 부모 탭 이름 유추
// ============================================

/**
 * 자식 노드에서 아이콘 이름 추출
 * e.g., "Icon/Friends" → "Friends"
 */
function extractIconNameFromChildren(node: SceneNode): string | null {
  if (!('children' in node)) return null;

  const children = (node as ChildrenMixin).children;

  for (const child of children) {
    // 직접 Icon/ 패턴 확인
    if (child.name.startsWith('Icon/')) {
      return child.name.replace('Icon/', '');
    }

    // 재귀적으로 자식 탐색 (1단계만)
    if ('children' in child) {
      const grandChildren = (child as ChildrenMixin).children;
      for (const grandChild of grandChildren) {
        if (grandChild.name.startsWith('Icon/')) {
          return grandChild.name.replace('Icon/', '');
        }
      }
    }
  }

  return null;
}

/**
 * 탭바 아이템에서 자식 아이콘을 기반으로 이름 유추
 * - 부모가 TabItem/*이고 자식에 Icon/*이 있으면 매칭
 */
export function inferTabItemNameFromIcon(node: SceneNode): string | null {
  // TabItem/ 형식인 경우에만 처리
  if (!node.name.startsWith('TabItem/')) return null;

  const iconName = extractIconNameFromChildren(node);
  if (!iconName) return null;

  // 현재 이름과 아이콘 이름이 다르면 아이콘 기반으로 변경
  const currentTabName = node.name.replace('TabItem/', '');
  if (currentTabName !== iconName) {
    return `TabItem/${iconName}`;
  }

  return null;
}

/**
 * 아이콘 이름에서 무시할 단어 (브랜드명, 필러, 접미사)
 */
const ICON_FILLER_WORDS = [
  'ibm', 'watson', 'carbon', 'solar', 'ant', 'design',
  'icon', 'icons', 'glyph', 'symbol',
  'alt', 'new', 'old', 'v2', 'v3',
  'left', 'right', 'up', 'down',
  'small', 'medium', 'large', 'xl', 'xs', 'sm', 'md', 'lg',
  'a', 'b', 'c', 'the', 'and', 'or',
];

/**
 * 아이콘 라이브러리 이름을 WDS 네이밍으로 변환
 * e.g., "carbon:ibm-watson-discovery" → "Icon/Discovery"
 * e.g., "solar:star-bold" → "Icon/Star"
 * e.g., "carbon:user-avatar-filled" → "Icon/UserAvatar"
 */
export function convertIconLibraryToWDS(name: string): string {
  const colonIndex = name.indexOf(':');
  if (colonIndex === -1) return name;

  // 콜론 뒤의 아이콘 이름 추출
  let iconPart = name.slice(colonIndex + 1); // e.g., "ibm-watson-discovery"

  // 스타일 접미사 제거
  for (const suffix of ICON_STYLE_SUFFIXES) {
    if (iconPart.endsWith(suffix)) {
      iconPart = iconPart.slice(0, -suffix.length);
      break;
    }
  }

  // 1. WDS 매핑 테이블에서 직접 찾기
  const directMatch = WDS_ICON_MAP[iconPart];
  if (directMatch) {
    return `Icon/${directMatch}`;
  }

  // 2. 하이픈으로 분리
  const parts = iconPart.split('-');

  // 3. 각 파트에서 매핑 찾기 (뒤에서부터)
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    const partMatch = WDS_ICON_MAP[part];
    if (partMatch) {
      return `Icon/${partMatch}`;
    }
  }

  // 4. 의미 있는 파트들을 조합 (필러 단어와 숫자 제외)
  const meaningfulParts = parts.filter(part => {
    // 숫자만 있는 파트 제외
    if (/^\d+$/.test(part)) return false;
    // 필러 단어 제외
    if (ICON_FILLER_WORDS.includes(part.toLowerCase())) return false;
    // 너무 짧은 파트 제외 (1-2글자)
    if (part.length < 3) return false;
    return true;
  });

  if (meaningfulParts.length > 0) {
    // 의미 있는 파트들을 PascalCase로 조합
    // 최대 2개 파트까지만 사용 (너무 길어지는 것 방지)
    const partsToUse = meaningfulParts.slice(0, 2);
    const pascalCase = partsToUse
      .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join('');
    return `Icon/${pascalCase}`;
  }

  // 5. 폴백: 마지막 단어를 PascalCase로 변환
  const lastPart = parts[parts.length - 1];
  const pascalCase = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);

  return `Icon/${pascalCase}`;
}

// ============================================
// 금지된 이름 패턴 (Blacklist)
// ============================================

/**
 * 금지된 네이밍 패턴
 * - 이 이름들은 Direct Naming에서 반환하면 안 됨
 * - AI 분석 대상으로 포함되어야 함
 */
const BLACKLIST_PATTERNS = [
  'Content',
  'Layout',
  'Inner',
  'Wrapper',
  'Box',
  'Item',
];

/**
 * 금지된 이름인지 확인
 * - Content, Layout/*, Inner, Wrapper, Box, Item 등
 * - 이 이름들이 있으면 AI 분석 대상으로 전환
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

// ============================================
// 일반 이름 감지 및 Section 추론
// ============================================

/**
 * 일반적인 (의미 없는) 이름인지 확인
 * AI 분석 대상으로 포함되어야 할 이름들
 */
const GENERIC_NAMES = [
  'details',
  'container',
  'content',
  'wrapper',
  'box',
  'frame',
  'group',
  'section',
  'area',
  'block',
  'item',
  'element',
  'view',
  'panel',
  'row',
  'column',
  'cell',
  'inner',
  'outer',
  'main',
  'sub',
  'left',
  'right',
  'top',
  'bottom',
  'header',
  'body',
  'footer',
];

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

/**
 * 자동 생성 이름에서 의미 있는 이름 추론
 * - 자식 이름에서 힌트 추출
 * - 부모 컨텍스트 활용
 *
 * @returns 추론된 이름 또는 null (AI 분석 필요)
 */
export function inferNameForAutoGenerated(node: SceneNode): string | null {
  if (!isAutoGeneratedName(node.name)) return null;

  // 1. 자식에서 도메인 키워드 추출 시도 (Section 추론과 유사)
  if ('children' in node) {
    const children = (node as ChildrenMixin).children;

    // 자식이 1개면 AI에게 위임 (Content 폴백 금지)
    if (children.length === 1) {
      return null;
    }

    // 자식이 여러 개면 Section 추론 시도
    if (children.length > 1) {
      // 자식 이름에서 공통 키워드 찾기
      const childNames = children.map(c => c.name.toLowerCase());
      const keywords = ['card', 'item', 'list', 'button', 'icon', 'text', 'image'];

      for (const keyword of keywords) {
        const matchCount = childNames.filter(n => n.includes(keyword)).length;
        if (matchCount >= 2) {
          // 여러 개의 같은 타입 자식 → Section/[키워드] 형태로 추론
          const pascalKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          return `Section/${pascalKeyword}`;
        }
      }
    }
  }

  // Content 폴백 금지 - AI에게 위임
  return null;
}

/**
 * 구조적 레이어 이름 매핑 (소문자 → PascalCase)
 * 부모 도메인 제거 후 남은 이름을 표준화
 */
const STRUCTURAL_LAYER_NAMES: Record<string, string> = {
  // 레이아웃 구조 (Content, Wrapper 등 금지 패턴 제거됨)
  'header': 'Header',
  'hdr': 'Header',
  'body': 'Body',
  'footer': 'Footer',
  'ftr': 'Footer',
  'list': 'List',
  'nav': 'Navigation',
  'navigation': 'Navigation',
  'sidebar': 'Sidebar',

  // 미디어
  'image': 'Image',
  'img': 'Image',
  'pic': 'Image',
  'photo': 'Image',
  'icon': 'Icon',
  'ico': 'Icon',
  'video': 'Video',
  'vid': 'Video',

  // 텍스트
  'text': 'Text',
  'txt': 'Text',
  'title': 'Title',
  'subtitle': 'Subtitle',
  'description': 'Description',
  'desc': 'Description',
  'label': 'Label',
  'lbl': 'Label',
  'caption': 'Caption',
  'heading': 'Heading',
  'paragraph': 'Paragraph',

  // 상태/정보
  'info': 'Info',
  'status': 'Status',
  'message': 'Message',
  'msg': 'Message',
  'error': 'Error',
  'err': 'Error',
  'warning': 'Warning',
  'warn': 'Warning',
  'success': 'Success',
  'notification': 'Notification',
  'notif': 'Notification',
  'alert': 'Alert',

  // 배경/스타일
  'background': 'Background',
  'bg': 'Background',
  'overlay': 'Overlay',
  'divider': 'Divider',
  'separator': 'Separator',
  'border': 'Border',

  // 아이템/리스트
  'item': 'Item',
  'items': 'Items',
  'card': 'Card',
  'cards': 'Cards',
  'cell': 'Cell',
  'row': 'Row',
  'column': 'Column',
  'col': 'Column',

  // 인터랙티브
  'button': 'Button',
  'btn': 'Button',
  'input': 'Input',
  'field': 'Field',
  'checkbox': 'Checkbox',
  'radio': 'Radio',
  'toggle': 'Toggle',
  'switch': 'Switch',
  'slider': 'Slider',
  'dropdown': 'Dropdown',
  'select': 'Select',
  'link': 'Link',

  // 사용자/프로필
  'avatar': 'Avatar',
  'user': 'User',
  'profile': 'Profile',
  'name': 'Name',
  'author': 'Author',

  // 미리보기/썸네일
  'thumbnail': 'Thumbnail',
  'thumb': 'Thumbnail',
  'preview': 'Preview',

  // 상세/요약
  'detail': 'Detail',
  'details': 'Details',
  'summary': 'Summary',
  'meta': 'Meta',

  // 액션
  'action': 'Action',
  'actions': 'Actions',
  'cta': 'CTA',

  // 진행/단계
  'progress': 'Progress',
  'step': 'Step',
  'steps': 'Steps',
  'indicator': 'Indicator',
  'loader': 'Loader',
  'spinner': 'Spinner',

  // 기타
  'badge': 'Badge',
  'tag': 'Tag',
  'chip': 'Chip',
  'count': 'Count',
  'number': 'Number',
  'num': 'Number',
  'time': 'Time',
  'date': 'Date',
  'price': 'Price',
  'amount': 'Amount',
  'rating': 'Rating',
  'score': 'Score',
  'empty': 'Empty',
  'placeholder': 'Placeholder',
};

/**
 * 도메인 키워드 (자식에서 추출할 핵심 단어)
 */
const DOMAIN_KEYWORDS = [
  'Challenge',
  'Feed',
  'Profile',
  'Notification',
  'Message',
  'Chat',
  'User',
  'Friend',
  'Mission',
  'Achievement',
  'Ranking',
  'Shop',
  'Settings',
  'Home',
  'Search',
  'Video',
  'Photo',
  'Image',
  'Comment',
  'Like',
  'Share',
  'Bookmark',
  'Calendar',
  'Event',
  'Badge',
  'Progress',
  'Weekly',
  'Daily',
];

/**
 * 컨텍스트 키워드 (상태/위치를 나타내는 단어)
 */
const CONTEXT_KEYWORDS: Record<string, string[]> = {
  'Active': ['active', 'current', 'ongoing', 'participating', '참여', '진행'],
  'Join': ['join', 'available', 'new', '가입', '신규'],
  'Completed': ['completed', 'done', 'finished', '완료'],
  'Featured': ['featured', 'recommended', 'hot', 'popular', '추천', '인기'],
  'My': ['my', 'mine', '나의', '내'],
  'Weekly': ['weekly', 'week', '주간'],
  'Daily': ['daily', 'day', '일간', '오늘'],
};

// ============================================
// 부모 도메인 기반 구조적 네이밍
// ============================================

/**
 * 부모 노드에서 도메인 키워드 추출
 * e.g., "Section/WeeklyChallenge" → ["Weekly", "Challenge"]
 * e.g., "Weekly Challenge Container" → ["Weekly", "Challenge"]
 * e.g., "Feed Container" → ["Feed"]
 */
export function extractParentDomainKeywords(node: SceneNode): string[] {
  const keywords: string[] = [];
  let parent = node.parent;

  while (parent && 'name' in parent) {
    const parentName = (parent as SceneNode).name;

    // Section/WeeklyChallenge 형식에서 추출
    if (parentName.includes('/')) {
      const afterSlash = parentName.split('/').pop() || '';
      // PascalCase 분리: WeeklyChallenge → Weekly, Challenge
      const parts = afterSlash.split(/(?=[A-Z])/).filter(p => p.length > 0);
      for (const part of parts) {
        if (DOMAIN_KEYWORDS.includes(part) && !keywords.includes(part)) {
          keywords.push(part);
        }
      }
    }

    // 일반 이름에서 도메인 키워드 추출
    for (const keyword of DOMAIN_KEYWORDS) {
      if (parentName.toLowerCase().includes(keyword.toLowerCase()) && !keywords.includes(keyword)) {
        keywords.push(keyword);
      }
    }

    parent = parent.parent;
  }

  return keywords;
}

/**
 * 이름에서 부모 도메인 키워드 제거
 * e.g., "Weekly Challenge Content" + parentDomains=["Weekly", "Challenge"]
 *       → "Content"
 * e.g., "Feed Header" + parentDomains=["Feed"]
 *       → "Header"
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

/**
 * 부모와 동일한 이름인지 확인
 * Layout/BottomBar > Layout/BottomBar 같은 중복 방지
 * 단, 최상위 프레임(페이지 바로 아래)은 스킵
 */
export function hasSameNameAsParent(node: SceneNode): boolean {
  const parent = node.parent;
  if (!parent || !('name' in parent)) return false;

  // 최상위 프레임(페이지 바로 아래)은 스킵
  if (parent.type === 'PAGE') return false;

  return node.name === (parent as SceneNode).name;
}

/**
 * 부모와 동일한 이름일 때 대체 이름 생성
 * - Content, Inner 등 금지된 폴백 대신 null 반환 (AI에게 위임)
 */
export function generateAlternativeName(node: SceneNode): string | null {
  // Content, Inner 등 금지 - AI에게 위임
  return null;
}

/**
 * 구조적 레이어 이름으로 변환 시도
 * - 부모와 동일한 이름이면 대체 이름 생성
 * - 부모 도메인 제거 후 남은 이름이 구조적 이름이면 변환
 * e.g., "Weekly Challenge Content" → "Content"
 * e.g., "Feed Header" → "Header"
 * e.g., "Progress Step" → "Step" (부모에 Progress가 있으면)
 */
export function tryStructuralNaming(node: SceneNode): string | null {
  // 1. 부모와 완전히 동일한 이름이면 대체 이름 생성
  if (hasSameNameAsParent(node)) {
    return generateAlternativeName(node);
  }

  const parentDomains = extractParentDomainKeywords(node);

  // 부모에 도메인 키워드가 없으면 구조적 네이밍 스킵
  if (parentDomains.length === 0) return null;

  // 부모 도메인 제거
  const strippedName = stripParentDomainFromName(node.name, parentDomains);

  // 남은 이름이 비어있으면 스킵
  if (!strippedName) return null;

  const nameLower = strippedName.toLowerCase().trim();

  // 구조적 이름 매핑에서 찾기
  if (STRUCTURAL_LAYER_NAMES[nameLower]) {
    return STRUCTURAL_LAYER_NAMES[nameLower];
  }

  // 복합 구조적 이름 처리 (e.g., "Info Container" → "Info")
  const words = strippedName.split(/[\s_-]+/);
  if (words.length >= 1) {
    const firstWord = words[0].toLowerCase();
    if (STRUCTURAL_LAYER_NAMES[firstWord]) {
      // 첫 단어가 구조적 이름이면 반환
      return STRUCTURAL_LAYER_NAMES[firstWord];
    }

    // 마지막 단어 체크 (e.g., "Status Container" → "Container"보다는 "Status"가 더 의미있음)
    const lastWord = words[words.length - 1].toLowerCase();
    if (lastWord === 'container' || lastWord === 'wrapper' || lastWord === 'content') {
      // Container/Wrapper/Content로 끝나면 앞 단어 사용
      if (words.length > 1) {
        const meaningfulWord = words[0].toLowerCase();
        if (STRUCTURAL_LAYER_NAMES[meaningfulWord]) {
          return STRUCTURAL_LAYER_NAMES[meaningfulWord];
        }
      }
    }
  }

  // 공백 제거 후 PascalCase로 변환 시도
  // e.g., "Progress Step" → "ProgressStep" (도메인 제거 후 남은 것)
  if (words.length <= 2 && strippedName !== node.name) {
    const pascalCase = words
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('');
    return pascalCase;
  }

  return null;
}

/**
 * 자식 노드들에서 공통 키워드 추출
 */
function extractDomainKeywordFromChildren(node: SceneNode): string | null {
  if (!('children' in node)) return null;

  const children = (node as ChildrenMixin).children;
  if (children.length === 0) return null;

  // 자식 이름들 수집 (재귀적으로 2단계까지)
  const childNames: string[] = [];

  function collectNames(n: SceneNode, depth: number) {
    childNames.push(n.name);
    if (depth < 2 && 'children' in n) {
      for (const child of (n as ChildrenMixin).children) {
        collectNames(child, depth + 1);
      }
    }
  }

  for (const child of children) {
    collectNames(child, 0);
  }

  // 키워드 빈도 카운트
  const keywordCounts = new Map<string, number>();

  for (const childName of childNames) {
    for (const keyword of DOMAIN_KEYWORDS) {
      if (childName.toLowerCase().includes(keyword.toLowerCase())) {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      }
    }
  }

  // 가장 빈도가 높은 키워드 반환
  let maxCount = 0;
  let dominantKeyword: string | null = null;

  for (const [keyword, count] of keywordCounts) {
    if (count > maxCount) {
      maxCount = count;
      dominantKeyword = keyword;
    }
  }

  return dominantKeyword;
}

/**
 * 조상 노드에서 컨텍스트 추출
 * - 부모 이름, 형제 위치 등에서 Active/Join 등 힌트 찾기
 */
function extractContextFromAncestors(node: SceneNode): string | null {
  // 1. 부모/조상 이름에서 컨텍스트 찾기
  let parent = node.parent;
  while (parent) {
    if ('name' in parent) {
      const parentName = (parent as SceneNode).name.toLowerCase();

      for (const [context, keywords] of Object.entries(CONTEXT_KEYWORDS)) {
        for (const kw of keywords) {
          if (parentName.includes(kw.toLowerCase())) {
            return context;
          }
        }
      }
    }
    parent = parent.parent;
  }

  // 2. 형제 노드들의 위치로 추론 (첫 번째 = Active/Current)
  const nodeParent = node.parent;
  if (nodeParent && 'children' in nodeParent) {
    const siblings = (nodeParent as ChildrenMixin).children;
    const index = siblings.indexOf(node as SceneNode);

    // 첫 번째 자식이면 Active로 추정
    if (index === 0) {
      return 'Active';
    }
  }

  return null;
}

/**
 * 자식 키워드 기반으로 Section 이름 추론
 * e.g., details (자식에 Challenge 키워드) → Section/ActiveChallenge
 */
export function inferSectionNameFromChildren(node: SceneNode): string | null {
  // 일반 이름이 아니면 처리하지 않음
  if (!isGenericName(node.name)) return null;

  // 부모가 이미 Section/이면 Section 추론 스킵
  // (구조적 네이밍으로 처리되도록)
  let parent = node.parent;
  while (parent && 'name' in parent) {
    const parentName = (parent as SceneNode).name;
    if (parentName.startsWith('Section/')) {
      return null;
    }
    parent = parent.parent;
  }

  // 자식이 없으면 처리하지 않음
  if (!('children' in node)) return null;
  const children = (node as ChildrenMixin).children;
  if (children.length === 0) return null;

  // 1. 자식에서 도메인 키워드 추출
  const domainKeyword = extractDomainKeywordFromChildren(node);
  if (!domainKeyword) return null;

  // 2. 조상에서 컨텍스트 추출
  const context = extractContextFromAncestors(node);

  // 3. Section 이름 생성
  if (context) {
    return `Section/${context}${domainKeyword}`;
  }

  return `Section/${domainKeyword}`;
}

// ============================================
// Layout 프레임 감지 및 변환
// ============================================

/**
 * 구조 프레임 키워드 매핑 (원본 이름 → 구체적 타입)
 * Layout/* 금지 - 구체적인 컴포넌트 타입 사용
 */
const LAYOUT_KEYWORD_MAP: Record<string, string> = {
  // Header 관련 → Header/Main
  'header': 'Header/Main',
  'status bar': 'Header/Main',
  'statusbar': 'Header/Main',
  'bar_status': 'Header/Main',
  'status': 'Header/Main',

  // TopBar 관련 → TopBar/Main
  'top': 'TopBar/Main',
  'topbar': 'TopBar/Main',
  'top bar': 'TopBar/Main',
  'container_top': 'TopBar/Main',
  'profile container': 'TopBar/Profile',
  'notification container': 'TopBar/Notification',

  // Main 관련 → Section/Main
  'main': 'Section/Main',
  'main content': 'Section/Main',
  'main container': 'Section/Main',
  'main body': 'Section/Main',

  // BottomBar 관련 → TabBar/Main
  'bottom': 'TabBar/Main',
  'bottombar': 'TabBar/Main',
  'bottom bar': 'TabBar/Main',
  'footer': 'TabBar/Main',
  'tabbar': 'TabBar/Main',
  'tab bar': 'TabBar/Main',
  'navigation': 'TabBar/Main',
  'navbar': 'TabBar/Main',
  'home indicator': 'HomeIndicator',
};

/**
 * 화면 최상위 레이아웃 프레임인지 확인
 * - 부모가 Screen/Container 레벨인 경우
 * - 이름이 layout 키워드에 해당하는 경우
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

/**
 * 구조 프레임 이름 추론 (Layout/* 금지)
 * e.g., "header" → "Header/Main"
 * e.g., "Container_Top" → "TopBar/Main"
 * e.g., "Main Content" → "Section/Main"
 */
export function inferLayoutName(node: SceneNode): string | null {
  if (!isLayoutFrame(node)) return null;

  // 깊이/컨텍스트 체크
  if (!shouldConvertToLayout(node)) return null;

  const nameLower = node.name.toLowerCase().trim();

  // 1. 직접 매핑 (이미 구체적인 타입 포함)
  if (LAYOUT_KEYWORD_MAP[nameLower]) {
    return LAYOUT_KEYWORD_MAP[nameLower];
  }

  // 2. 부분 매칭으로 역할 추론
  if (nameLower.includes('header') || nameLower.includes('status')) {
    return 'Header/Main';
  }

  if (nameLower.includes('_top') || nameLower.includes('top')) {
    if (!nameLower.includes('tab')) {
      return 'TopBar/Main';
    }
  }

  if (nameLower.includes('main')) {
    return 'Section/Main';
  }

  if (nameLower.includes('bottom') || nameLower.includes('footer') ||
      nameLower.includes('tabbar') || nameLower.includes('tab bar') ||
      nameLower.includes('navbar') || nameLower.includes('navigation')) {
    return 'TabBar/Main';
  }

  if (nameLower.includes('home indicator')) {
    return 'HomeIndicator';
  }

  return null;
}

// ============================================
// 깊이/부모 컨텍스트 기반 오탐 방지
// ============================================

/**
 * 컴포넌트로 인식되는 prefix 목록
 */
const COMPONENT_PREFIXES = [
  'Button/',
  'Input/',
  'Card/',
  'Avatar/',
  'TabItem/',
  'Icon/',
  'Badge/',
  'Chip/',
  'Tag/',
  'Toggle/',
  'Switch/',
  'Checkbox/',
  'Radio/',
  'Slider/',
  'Modal/',
  'Dialog/',
  'Toast/',
  'Tooltip/',
  'Dropdown/',
  'Select/',
  'Menu/',
  'List/',
  'ListItem/',
  'Cell/',
  'Header/',
  'Footer/',
  'Nav/',
  'Fab/',
  'Snackbar/',
];

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

/**
 * 노드가 버튼처럼 보이는지 휴리스틱 판단
 * - 작은 크기, 텍스트 자식, 특정 이름 패턴
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
// 형제 중복 이름 감지 및 인덱싱
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
