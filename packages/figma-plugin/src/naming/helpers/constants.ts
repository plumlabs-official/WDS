/**
 * 네이밍 헬퍼 상수 모음
 *
 * 규칙:
 * - 이 파일은 모든 helpers 파일에서 import 가능 (의존성 최하위)
 * - 로직 없음, 상수/매핑 테이블만
 */

// ============================================
// 제외 조건 상수
// ============================================

/**
 * 제외할 상태값 이름 (대소문자 무시)
 */
export const EXCLUDED_STATE_NAMES = [
  'on', 'off',
  'active', 'inactive',
  'disabled', 'enabled',
  'selected', 'unselected',
  'hover', 'pressed', 'focus',
  'default', 'normal',
  'checked', 'unchecked',
];

/**
 * 항상 제외할 노드 타입 (벡터, 기본 도형)
 */
export const ALWAYS_EXCLUDED_NODE_TYPES: string[] = [
  'VECTOR',
  'ELLIPSE',
  'LINE',
  'BOOLEAN_OPERATION',
  'STAR',
  'POLYGON',
];

/**
 * 조건부 포함 노드 타입
 * - TEXT: 자동생성/placeholder 이름이면 포함
 * - RECTANGLE: 이미지 fill 있거나 50px+ 이면 포함
 */
export const CONDITIONAL_NODE_TYPES: string[] = [
  'TEXT',
  'RECTANGLE',
];

/**
 * placeholder/의미없는 텍스트 이름 패턴
 */
export const PLACEHOLDER_TEXT_NAMES = [
  'text',
  'video title',
  'users count',
  'label',
  'title',
  'subtitle',
  'description',
  'placeholder',
  'caption',
  'heading',
];

// ============================================
// 아이콘 라이브러리 상수
// ============================================

/**
 * 아이콘 라이브러리 prefix 패턴
 */
export const ICON_LIBRARY_PREFIXES = [
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
export const ICON_STYLE_SUFFIXES = [
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
 * 아이콘 이름에서 무시할 단어 (브랜드명, 필러, 접미사)
 */
export const ICON_FILLER_WORDS = [
  'ibm', 'watson', 'carbon', 'solar', 'ant', 'design',
  'icon', 'icons', 'glyph', 'symbol',
  'alt', 'new', 'old', 'v2', 'v3',
  'left', 'right', 'up', 'down',
  'small', 'medium', 'large', 'xl', 'xs', 'sm', 'md', 'lg',
  'a', 'b', 'c', 'the', 'and', 'or',
];

/**
 * 한글 레이블 → 영문 변환 테이블
 */
export const KOREAN_LABEL_MAP: Record<string, string> = {
  // 탭바/네비게이션
  '홈': 'Home',
  '홈 ': 'Home',
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
 */
export const HYPHEN_ICON_PATTERNS: Record<string, string> = {
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
 */
export const WDS_ICON_MAP: Record<string, string> = {
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

// ============================================
// camelCase 예외 목록
// ============================================

/**
 * camelCase 변환 예외 (브랜드명, 특수 케이스)
 */
export const CAMEL_CASE_EXCEPTIONS = [
  // Apple
  'iPhone', 'iPad', 'iPod', 'iMac', 'iCloud', 'iOS', 'iPadOS', 'macOS', 'watchOS', 'tvOS',
  // Tech brands
  'eBay', 'eBook', 'eCommerce', 'eMail',
  'webKit', 'webView', 'webSocket', 'webGL', 'webRTC',
  'YouTube', 'LinkedIn', 'GitHub', 'GitLab', 'BitBucket',
  'JavaScript', 'TypeScript', 'CoffeeScript',
  // Common patterns
  'jQuery', 'npm', 'pnpm',
];

// ============================================
// 금지/일반 이름 패턴
// ============================================

/**
 * 금지된 네이밍 패턴
 */
export const BLACKLIST_PATTERNS = [
  'Content',
  'Layout',
  'Inner',
  'Wrapper',
  'Box',
  'Item',
];

/**
 * 일반적인 (의미 없는) 이름
 */
export const GENERIC_NAMES = [
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

// ============================================
// 구조적 레이어 이름 매핑
// ============================================

/**
 * 구조적 레이어 이름 매핑 (소문자 → PascalCase)
 */
export const STRUCTURAL_LAYER_NAMES: Record<string, string> = {
  // 레이아웃 구조
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

// ============================================
// 도메인/컨텍스트 키워드
// ============================================

/**
 * 도메인 키워드 (자식에서 추출할 핵심 단어)
 */
export const DOMAIN_KEYWORDS = [
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
export const CONTEXT_KEYWORDS: Record<string, string[]> = {
  'Active': ['active', 'current', 'ongoing', 'participating', '참여', '진행'],
  'Join': ['join', 'available', 'new', '가입', '신규'],
  'Completed': ['completed', 'done', 'finished', '완료'],
  'Featured': ['featured', 'recommended', 'hot', 'popular', '추천', '인기'],
  'My': ['my', 'mine', '나의', '내'],
  'Weekly': ['weekly', 'week', '주간'],
  'Daily': ['daily', 'day', '일간', '오늘'],
};

// ============================================
// 레이아웃 프레임 상수
// ============================================

/**
 * 구조 프레임 키워드 매핑 (원본 이름 → 구체적 타입)
 */
export const LAYOUT_KEYWORD_MAP: Record<string, string> = {
  // Header 관련
  'header': 'Header/Main',
  'status bar': 'Header/Main',
  'statusbar': 'Header/Main',
  'bar_status': 'Header/Main',
  'status': 'Header/Main',

  // TopBar 관련
  'top': 'TopBar/Main',
  'topbar': 'TopBar/Main',
  'top bar': 'TopBar/Main',
  'container_top': 'TopBar/Main',
  'profile container': 'TopBar/Profile',
  'notification container': 'TopBar/Notification',

  // Main 관련
  'main': 'Section/Main',
  'main content': 'Section/Main',
  'main container': 'Section/Main',
  'main body': 'Section/Main',

  // BottomBar 관련
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

// ============================================
// 컴포넌트 prefix 목록
// ============================================

/**
 * 컴포넌트로 인식되는 prefix 목록
 */
export const COMPONENT_PREFIXES = [
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
