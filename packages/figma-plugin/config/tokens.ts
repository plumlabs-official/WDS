/**
 * Wellwe Design System Tokens
 *
 * 피그마 [All] 페이지 분석 기반으로 추출한 디자인 토큰
 * 생성일: 2026-01-12
 *
 * [범례]
 * ✅ 확인됨: 피그마에서 직접 확인된 값
 * ⚠️ 확인 필요: 추정값 또는 추가 확인 필요
 */

// ============================================
// 1. Colors (색상)
// ============================================

export const colors = {
  // ✅ Primary (주요 색상) - 확인됨
  primary: {
    main: '#00cc61',        // 메인 그린 - CTA 버튼, 강조 요소
    light: '#c5ffa8',       // 연한 그린 - 액센트, 보조 텍스트
    background: '#f3fff3',  // 배경 그린 - 페이지 배경
  },

  // ✅ Neutral (중립 색상) - 확인됨
  neutral: {
    white: '#ffffff',
    black: '#000000',
    text: {
      primary: '#161616',   // 주요 텍스트
      secondary: '#797979', // 보조 텍스트, 설명
      disabled: '#c3c3c3',  // 비활성화 텍스트, 버튼
    },
  },

  // ✅ Semantic (의미적 색상) - 확인됨
  semantic: {
    success: '#00cc61',     // primary와 동일
    error: '#F33939',
    warning: '#F33939',     // error와 동일
    info: '#797979',        // neutral.text.secondary와 동일
  },

  // ✅ Shadow/Border 색상 - 확인됨
  shadow: {
    light: 'rgba(225, 224, 219, 0.3)',
    border: 'rgba(198, 198, 198, 0.1)',
  },
} as const;


// ============================================
// 2. Spacing (간격)
// ============================================

// ✅ Figma Variables에서 확인됨
export const spacing = {
  0: 0,
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  24: 24,
  32: 32,
  64: 64,
} as const;


// ============================================
// 3. Typography (타이포그래피)
// ============================================

// ✅ 확인됨
export const fontFamily = {
  primary: 'Pretendard',
  fallback: 'sans-serif',
} as const;

// ✅ 확인됨
export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
} as const;

// ✅ 확인됨 - 실제 사용된 사이즈
export const fontSize = {
  12: 12,
  13: 13,
  14: 14,
  15: 15,
  17: 17,
  18: 18,
  20: 20,
  22: 22,
} as const;

// ✅ 확인됨
export const lineHeight = {
  17: 17,
  18: 18,
  22: 22,
  26: 26,
  28: 28,
  32: 32,
} as const;

// ✅ 타이포그래피 프리셋 (용도별 조합)
export const typography = {
  title: {
    '01': { size: 22, weight: 600, lineHeight: 32 },  // 페이지 타이틀
    '02': { size: 20, weight: 600, lineHeight: 28 },  // 섹션 타이틀
    '03': { size: 18, weight: 600, lineHeight: 26 },  // 서브 타이틀
    '04': { size: 17, weight: 600, lineHeight: 26 },  // 리스트/카드 타이틀
  },
  subtitle: {
    '01': { size: 17, weight: 500, lineHeight: 26 },  // 강조 서브타이틀
    '02': { size: 15, weight: 500, lineHeight: 22 },  // 일반 서브타이틀
  },
  body: {
    '01': { size: 17, weight: 400, lineHeight: 26 },  // 주요 본문
    '02': { size: 15, weight: 400, lineHeight: 22 },  // 리스트 본문
    '03': { size: 14, weight: 400, lineHeight: 22 },  // 보조 본문
  },
  caption: {
    lg: { size: 14, weight: 400, lineHeight: 22 },    // 대형 캡션
    md: { size: 13, weight: 400, lineHeight: 18 },    // 중형 캡션
    sm: { size: 12, weight: 400, lineHeight: 18 },    // 소형 캡션
  },
  button: {
    lg: { size: 20, weight: 600, lineHeight: 26 },    // 대형 버튼
    md: { size: 18, weight: 600, lineHeight: 26 },    // 중형 버튼
    sm: { size: 15, weight: 600, lineHeight: 22 },    // 소형 버튼
  },
} as const;


// ============================================
// 4. Border Radius (모서리 둥글기)
// ============================================

// ✅ 확인됨
export const borderRadius = {
  none: 0,
  xs: 4,       // 작은 요소 (가장 많이 사용)
  sm: 12,      // 카드, 입력 필드
  lg: 28,      // 둥근 버튼 (outline)
  full: 100,   // pill 버튼
} as const;


// ============================================
// 5. Shadows / Elevation (그림자)
// ============================================

// ✅ 확인됨 - Elevation/1
export const shadows = {
  none: 'none',

  // 카드, 선택 버튼에 사용
  elevation1: '0px 0px 0px 1px rgba(198, 198, 198, 0.1), 0px 8px 8px 0px rgba(225, 224, 219, 0.3)',

  // 이미지 위 텍스트
  textShadow: '0px 0px 3px rgba(0, 0, 0, 0.15), 0px 0px 2px rgba(0, 0, 0, 0.3)',
} as const;


// ============================================
// 6. Layout (레이아웃)
// ============================================

// ✅ 확인됨
export const layout = {
  // 시스템 UI 높이
  statusBarHeight: 50,
  topBarHeight: 60,
  homeIndicatorHeight: 34,
  bottomButtonHeight: 72,
} as const;


// ============================================
// 6-1. Grid System (그리드 시스템)
// ============================================

export const grid = {
  // 모바일 (iOS 기준)
  mobile: {
    breakpoint: 0,        // 0px 이상
    screenWidth: 375,
    columns: 4,
    margin: 16,           // 좌우 여백
    gutter: 8,            // 컬럼 사이 간격
    contentWidth: 343,    // 375 - (16 * 2)
    columnWidth: 79.75,   // (343 - (8 * 3)) / 4
  },

  // 태블릿
  tablet: {
    breakpoint: 768,      // 768px 이상
    columns: 8,
    margin: 24,
    gutter: 16,
  },

  // 데스크톱
  desktop: {
    breakpoint: 1024,     // 1024px 이상
    columns: 12,
    margin: 32,
    gutter: 24,
    maxContentWidth: 1200,
  },
} as const;

// 브레이크포인트 단축 참조
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;


// ============================================
// 7. Component Sizes (컴포넌트 사이즈)
// ============================================

export const componentSize = {
  // ✅ 버튼 - 확인됨
  button: {
    height: {
      lg: 56,       // 메인 CTA 버튼
      md: 48,       // 다이얼로그/보조 버튼
      sm: 32,       // 미니 버튼, 텍스트 버튼
      iconOnly: 38, // 아이콘 전용 버튼
    },
    width: {
      full: 343,
    },
  },

  // ✅ 인풋 - 확인됨
  input: {
    height: {
      lg: 48,       // 기본 인풋 (textfield+dsc)
      md: 46,       // 작은 인풋 (textfield)
      searchBar: 40, // 서치바
    },
  },

  // ✅ 체크박스/라디오 - 확인됨
  checkbox: {
    sm: 20,         // 기본 체크박스
    lg: 24,         // 대형 체크박스
  },

  // ✅ 토글 - 확인됨
  toggle: {
    width: 40,
    height: 40,
  },

  // ✅ 탭/세그먼트 - 확인됨
  tab: {
    subTab: 42,           // 서브탭 높이
    segmentControl: 34,   // 세그먼트 컨트롤 높이
  },

  // ✅ 바텀시트 - 확인됨
  bottomSheet: {
    handleHeight: 42,     // 상단 핸들바 높이
  },

  // ✅ 아바타 - 확인됨
  avatar: {
    xs: 27,   // 홈스크린 챌린지 카드 인증자 리스트, 피드 게시물 작성자
    sm: 38,   // 피드 모음 UI 프로필
    md: 44,   // 초대장 참여자 리스트, 챌린지 상세 만든사람 프로필
    lg: 56,   // 리더보드, 친구 선택 리스트 프로필
    xl: 62,   // 챌린지 진행현황 인증 카드 프로필
    max: 130, // 내 프로필, 타인 프로필 메인 이미지
  },

  // ✅ 아이콘 - 확인됨
  icon: {
    xs: 14,   // 매우 작은 아이콘 (채팅 등)
    sm: 16,   // 작은 아이콘 (피드, 드롭다운)
    md: 20,   // 기본 아이콘 (Icon/Normal/Blank)
    lg: 24,   // 중간 아이콘 (체크, 액션)
    xl: 28,   // 탭바/내비게이션 아이콘
  },
} as const;


// ============================================
// 전체 토큰 내보내기
// ============================================

export const tokens = {
  colors,
  spacing,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  typography,
  borderRadius,
  shadows,
  layout,
  grid,
  breakpoints,
  componentSize,
} as const;

export default tokens;
