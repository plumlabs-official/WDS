# Wellwe Design System Automator - 진행 상황

## 프로젝트 개요

- **목표**: 피그마 디자인 시스템 자동화 플러그인 개발
- **용도**: 바이브 코딩(AI 코드 생성)을 위한 정돈된 피그마 구조 구축
- **기술 스택**: TypeScript, Figma Plugin API, esbuild

## 사용자 요청 메모 (항상 기억할 것)

> "내 생각보다 효율적인 방법이 있다면 앞으로도 비판적으로 사고하고 피드백해줘"

- 사용자의 제안에 무조건 동의하지 말고, 더 나은 방법이 있으면 적극적으로 제안할 것
- 디스크립션은 한글, 변수명은 영문

---

## 피그마 파일 정보

- **URL**: https://www.figma.com/design/s4GdImD87fQsWwnRYQVbWV/App?node-id=13563-1488
- **fileKey**: s4GdImD87fQsWwnRYQVbWV
- **nodeId**: 13563:1488
- **페이지명**: [All] (전체 플로우 모음)
- **레퍼런스**: https://www.figma.com/design/s4GdImD87fQsWwnRYQVbWV/App?node-id=14332-626135 (Reference_WDS)

### 섹션 구조 (17개)

| 섹션 | 주요 반복 컴포넌트 |
|------|-------------------|
| Onboarding_invite | Icon/Normal/Blank (219회) |
| Onboarding_link | Bullet (180회) |
| Personalyze | SearchBar (63회) |
| Tab_profile | Avatar (51회) |
| 업적 | Icon/ArrowBottom (40회) |
| Tab_feed | Description (35회) |
| 인증 게시물 작성 | ToggleSwitch (21회) |
| 피드 상세 | BottomSheet (12회) |
| Tab_challenge | - |
| Make_challenge | - |
| Shop_broccoli | - |
| Paywall | - |
| Tab_home | - |
| Settings | - |
| Challenge_states | - |
| Tab_mission | - |
| Challenge_states_daily-guide | - |

---

## 실행 계획

```
1단계: 시맨틱 구조 정의 ✅ 완료
   ↓
2단계: 오토레이아웃 적용 ✅ 완료
   ↓
3단계: 네이밍 + 컴포넌트화 ⏳ 진행 예정
   ↓
4단계: 더블체크 및 AI 코드 생성 테스트
   ↓
5단계: 디자인 시스템 페이지/파일 생성 (별도 논의)
```

---

## 1단계: 시맨틱 구조 정의 ✅ 완료

### 토큰 정의 (`config/tokens.ts`)

#### Colors

```typescript
export const colors = {
  primary: '#00cc61',        // 메인 그린
  background: '#f3fff3',     // 연한 그린 배경
  accent: '#c5ffa8',         // 강조 그린
  textPrimary: '#1a1a1a',    // 본문 텍스트
  textSecondary: '#797979',  // 보조 텍스트
  textTertiary: '#b3b3b3',   // 비활성 텍스트
  border: '#e6e6e6',         // 기본 테두리
  borderLight: '#f3f3f3',    // 연한 테두리
  white: '#ffffff',
  black: '#000000',
  error: '#F33939',          // 에러/경고 (warning = error)
  info: '#797979',           // 정보
  success: '#00cc61',        // 성공 (primary와 동일)
} as const;
```

#### Spacing

```typescript
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
```

#### Typography

```typescript
export const typography = {
  fontFamily: {
    primary: 'Pretendard',
  },
  fontSize: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 17,
    '2xl': 18,
    '3xl': 20,
    '4xl': 22,
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// 프리셋
export const typographyPresets = {
  title: {
    '01': { size: 22, weight: 600, lineHeight: 32 },
    '02': { size: 20, weight: 600, lineHeight: 28 },
    '03': { size: 18, weight: 600, lineHeight: 26 },
    '04': { size: 17, weight: 600, lineHeight: 26 },
  },
  subtitle: {
    '01': { size: 16, weight: 600, lineHeight: 24 },
    '02': { size: 14, weight: 600, lineHeight: 20 },
  },
  body: {
    '01': { size: 16, weight: 400, lineHeight: 24 },
    '02': { size: 14, weight: 400, lineHeight: 20 },
    '03': { size: 12, weight: 400, lineHeight: 18 },
  },
  caption: {
    '01': { size: 12, weight: 400, lineHeight: 16 },
    '02': { size: 11, weight: 400, lineHeight: 14 },
  },
  button: {
    lg: { size: 16, weight: 600, lineHeight: 24 },
    md: { size: 14, weight: 600, lineHeight: 20 },
    sm: { size: 12, weight: 600, lineHeight: 16 },
  },
} as const;
```

#### Border Radius

```typescript
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 12,
  lg: 28,
  full: 100,
} as const;
```

#### Shadows

```typescript
export const shadows = {
  sm: { x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.05)' },
  md: { x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.1)' },
  lg: { x: 0, y: 4, blur: 8, spread: 0, color: 'rgba(0,0,0,0.1)' },
} as const;
```

#### Component Sizes

```typescript
export const componentSize = {
  button: {
    height: { lg: 56, md: 48, sm: 32, iconOnly: 38 },
    width: { full: 343 },
  },
  input: {
    height: { lg: 48, md: 46, searchBar: 40 },
  },
  checkbox: { sm: 20, lg: 24 },
  toggle: { width: 40, height: 40 },
  tab: {
    subTab: 42,
    segmentControl: 34,
  },
  bottomSheet: { handleHeight: 42 },
  avatar: {
    xs: 27,
    sm: 38,
    md: 44,
    lg: 56,
    xl: 62,
    max: 130,
  },
  icon: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  },
} as const;
```

#### Grid System

```typescript
export const grid = {
  mobile: {
    columns: 4,
    gutter: 16,
    margin: 16,
    width: 375,
    contentWidth: 343,
  },
  tablet: {
    columns: 8,
    gutter: 24,
    margin: 32,
  },
  desktop: {
    columns: 12,
    gutter: 24,
    margin: 64,
  },
} as const;

export const breakpoints = {
  mobile: 375,
  tablet: 768,
  desktop: 1440,
} as const;
```

---

## 2단계: 오토레이아웃 적용 ✅ 완료

### 구현된 모듈

#### 1. `src/modules/autolayout.ts`

**핵심 함수:**

| 함수 | 역할 |
|------|------|
| `roundToNearestToken(value)` | 값을 가장 가까운 spacing 토큰으로 반올림 |
| `detectLayoutDirection(node)` | 자식 배치 분석하여 HORIZONTAL/VERTICAL 자동 판단 |
| `calculateAverageGap(children, direction)` | 자식 간 평균 간격 계산 |
| `calculatePadding(parent, children)` | 부모와 자식 간 패딩 계산 |
| `applyAutoLayout(node, options)` | 단일 프레임에 Auto Layout 적용 |
| `applyAutoLayoutRecursive(node, options)` | 재귀적으로 하위 프레임에도 적용 |
| `applyAutoLayoutToSelection(options)` | 선택된 노드들에 적용 |

**옵션:**
```typescript
interface AutoLayoutOptions {
  direction?: 'HORIZONTAL' | 'VERTICAL' | 'AUTO';
  standardizeSpacing?: boolean;  // 토큰 값으로 표준화
  recursive?: boolean;           // 자식까지 재귀 적용
  skipExisting?: boolean;        // 기존 Auto Layout 스킵
}
```

#### 2. `src/modules/spacing.ts`

**핵심 함수:**

| 함수 | 역할 |
|------|------|
| `isStandardSpacing(value)` | 값이 토큰에 정의된 값인지 확인 |
| `standardizeFrameSpacing(node)` | 단일 프레임의 gap/padding 표준화 |
| `standardizeSpacingRecursive(node)` | 재귀적으로 모든 하위 프레임 표준화 |
| `standardizeSelectionSpacing()` | 선택된 노드들 표준화 |
| `generateSpacingReport(node)` | 비표준 간격 사용 현황 리포트 |

#### 3. `src/modules/cleanup.ts` (전처리)

**핵심 함수:**

| 함수 | 역할 |
|------|------|
| `isMeaninglessWrapper(node)` | 의미 없는 래퍼 판단 |
| `unwrapNode(wrapper)` | 래퍼 제거 후 자식을 상위로 이동 |
| `cleanupWrappersRecursive(node)` | 재귀적 래퍼 제거 |
| `cleanupSelectionWrappers()` | 선택된 노드들의 래퍼 제거 |
| `previewMeaninglessWrappers(node)` | 제거 없이 미리보기 |

**의미 없는 래퍼 판단 기준:**
- 그룹 또는 프레임
- 자식이 정확히 1개
- 시각적 스타일 없음 (fill, stroke, effect)
- Auto Layout 없음
- 클리핑 비활성

### UI 구조

```
전처리
└ [의미 없는 래퍼 제거]
─────────────────────
Auto Layout
└ [선택 영역에 Auto Layout 적용]
└ [간격 표준화]
─────────────────────
네이밍 & 컴포넌트
└ [네이밍 자동화] (준비 중)
└ [컴포넌트화] (준비 중)
─────────────────────
└ [전체 실행]
```

### 메뉴 명령어

| 명령어 | 기능 |
|--------|------|
| `cleanup-wrappers` | 의미 없는 래퍼 제거 |
| `apply-autolayout` | Auto Layout 적용 |
| `standardize-spacing` | 간격 표준화 |
| `auto-naming` | 네이밍 자동화 (미구현) |
| `componentize` | 컴포넌트화 (미구현) |
| `run-all` | 전체 실행 |

---

## 3단계: 네이밍 + 컴포넌트화 ✅ 완료

### 구현된 모듈

#### 1. `src/modules/naming.ts`

**컴포넌트 타입 감지:**
- Button, Input, Avatar, Icon, Card, ListItem, Tab, Toggle, Checkbox, Badge, Container, Frame

**감지 로직:**
| 타입 | 판단 기준 |
|------|----------|
| Button | 텍스트 포함, 버튼 높이 범위, 배경색/둥근 모서리 |
| Input | 입력 필드 높이, 텍스트 포함, 테두리, 넓은 너비 |
| Avatar | 정사각형/원형, 아바타 사이즈 매칭, 이미지 포함 |
| Icon | 정사각형, 아이콘 사이즈, 벡터 포함 |
| Toggle | 토글 사이즈, 원형 자식 요소 (노브) |
| Checkbox | 정사각형, 체크박스 사이즈, 체크 아이콘 포함 |
| Card | 여러 자식, 배경/테두리/그림자, 둥근 모서리 |
| ListItem | 가로로 긴 형태, horizontal 레이아웃 |
| Tab | 탭 높이, 텍스트 포함 |

**Variant 감지 (배경색 기반):**
- Primary: #00cc61 계열
- Secondary: #f3f3f3, #e6e6e6 계열
- Outline: 테두리만 있는 경우
- Ghost: fill 없음
- Default: 기타

**Size 감지 (컴포넌트별 기준):**
- Button: LG(52+), MD(44+), SM
- Avatar: XL(100+), LG(56+), MD(44+), SM(38+), XS
- Icon: XL(28+), LG(24+), MD(20+), SM(16+), XS
- Input: LG(48+), MD

**핵심 함수:**

| 함수 | 역할 |
|------|------|
| `detectComponentType(node)` | 프레임의 컴포넌트 타입 감지 |
| `detectVariant(node)` | 배경색 기반 Variant 감지 |
| `detectSize(node, type)` | 크기 기반 Size 감지 |
| `generateSemanticName(node)` | 시맨틱 이름 생성 (Component/Variant/Size) |
| `renameSelectionFrames()` | 선택된 프레임들 이름 변경 |
| `previewRenames(node)` | 이름 변경 미리보기 |

#### 2. `src/modules/componentize.ts`

**유사도 판단 기준:**
- 크기 (width, height) - tolerance 5px
- layoutMode 동일
- 자식 개수 및 타입 동일
- cornerRadius 유사

**핵심 함수:**

| 함수 | 역할 |
|------|------|
| `generateStructureSignature(node)` | 프레임의 구조적 시그니처 생성 |
| `areFramesSimilar(a, b)` | 두 프레임의 유사도 비교 |
| `groupSimilarFrames(frames)` | 유사한 프레임 그룹화 |
| `detectComponentCandidates(node, min)` | 컴포넌트화 후보 탐지 |
| `convertToComponent(frame, name)` | 프레임을 컴포넌트로 변환 |
| `componentizeSelection(options)` | 선택 영역 컴포넌트화 |
| `generateComponentReport(node)` | 후보 리포트 생성 |

### 메뉴 명령어 (추가)

| 명령어 | 기능 |
|--------|------|
| `auto-naming` | 네이밍 자동화 |
| `componentize` | 컴포넌트 후보 탐지 (미리보기) |
| `componentize-convert` | 컴포넌트로 변환 (실제 실행) |

### UI 구조 (최종)

```
전처리
└ [의미 없는 래퍼 제거]
─────────────────────
Auto Layout
└ [선택 영역에 Auto Layout 적용]
└ [간격 표준화]
─────────────────────
네이밍 & 컴포넌트
└ [네이밍 자동화]
└ [컴포넌트 후보 탐지]
└ [컴포넌트로 변환]
─────────────────────
└ [전체 실행]
```

### 전체 실행 순서

1. 래퍼 제거 (전처리)
2. Auto Layout 적용
3. 간격 표준화
4. 네이밍 자동화

---

## 4단계: 더블체크 ⏳ 진행 중

### 검증 항목

- [ ] 모든 프레임에 오토레이아웃 적용 여부
- [ ] 네이밍 컨벤션 일관성
- [ ] 컴포넌트 누락 여부
- [ ] AI(Claude) 코드 생성 테스트

### 타입체크 진행 상황

**발견된 TypeScript 에러 (수정 진행 중):**

1. **tsconfig.json** ✅ 수정됨
   - `rootDir` 변경: `./src` → `.` (config 폴더 포함)

2. **naming.ts** - 수정 필요
   - Line 74: `node.cornerRadius` 타입 체크 필요 ✅ 수정됨
   - Line 95: `fills.some()` 타입 가드 필요 ✅ 수정됨
   - Line 138: `cornerRadius` 비교 타입 체크 ✅ 수정됨
   - Line 263: `colors.primary` → `colors.primary.main` ⏳ 대기

3. **spacing.ts** - 수정 필요
   - Line 19: `includes()` 타입 체크 필요

### 수정 코드 (백업)

```typescript
// naming.ts Line 74 수정
// Before:
return isInputHeight && hasText && isWide && (hasStroke || node.cornerRadius);
// After:
const hasCornerRadius = typeof node.cornerRadius === 'number' && node.cornerRadius > 0;
return isInputHeight && hasText && isWide && (hasStroke || hasCornerRadius);

// naming.ts Line 93-98 수정
// Before:
const hasImage = node.children.some(c =>
  c.type === 'RECTANGLE' && Array.isArray((c as RectangleNode).fills) &&
  (c as RectangleNode).fills.some((f: Paint) => f.type === 'IMAGE')
);
// After:
const hasImage = node.children.some(c => {
  if (c.type !== 'RECTANGLE') return false;
  const rectFills = (c as RectangleNode).fills;
  return Array.isArray(rectFills) && rectFills.some((f: Paint) => f.type === 'IMAGE');
});

// naming.ts Line 136-144 수정
// Before:
const hasCircleChild = node.children.some(c =>
  c.type === 'ELLIPSE' ||
  (c.type === 'FRAME' && typeof (c as FrameNode).cornerRadius === 'number' &&
   (c as FrameNode).cornerRadius >= (c as FrameNode).width / 2 - 1)
);
// After:
const hasCircleChild = node.children.some(c => {
  if (c.type === 'ELLIPSE') return true;
  if (c.type === 'FRAME') {
    const frameRadius = (c as FrameNode).cornerRadius;
    return typeof frameRadius === 'number' && frameRadius >= (c as FrameNode).width / 2 - 1;
  }
  return false;
});

// naming.ts Line 263 수정 (대기 중)
// Before:
if (isColorSimilar(fillColor, colors.primary)) {
// After:
if (isColorSimilar(fillColor, colors.primary.main)) {

// spacing.ts Line 19 수정 필요
// Before:
return ALLOWED_SPACING.includes(value);
// After:
return (ALLOWED_SPACING as readonly number[]).includes(value);
```

### 타입체크 결과: ✅ 통과

```bash
npm run typecheck  # 에러 없음
npm run build      # dist/code.js 38.2kb 생성
```

### 피그마 플러그인 런타임 수정사항

**Figma 플러그인 환경 제약:**
- ES6+ 문법 제한: 스프레드 연산자(`...`), optional chaining(`?.`) 사용 불가
- esbuild 타겟: `es2020` → `es6`로 변경

**수정된 코드 패턴:**
```typescript
// ❌ 사용 불가
const { a, ...rest } = obj;
obj?.prop?.value;
arr.push(...items);

// ✅ 대체 방법
const a = obj.a;
const rest = { b: obj.b, c: obj.c };
(obj && obj.prop && obj.prop.value);
for (var i = 0; i < items.length; i++) { arr.push(items[i]); }
```

### 래퍼 제거 기능 수정사항

**문제 1: 레이아웃 깨짐**
- 원인: 자식 위치 계산 시 래퍼 위치 + 자식 상대위치 = 잘못된 절대위치
- 해결: 자식이 래퍼와 같은 크기면 래퍼 위치를 그대로 사용

**문제 2: 흰색 배경 프레임 미제거**
- 원인: 피그마 기본 흰색 배경이 "시각적 스타일"로 감지됨
- 해결: 흰색(r,g,b > 0.95) 배경은 무시

**최종 래퍼 제거 조건:**
1. 그룹 또는 프레임
2. 자식이 정확히 1개
3. 자식이 래퍼와 거의 동일한 크기 (허용 오차 2px)
4. Auto Layout 없음
5. 의미 있는 fill 없음 (흰색/투명 제외)
6. stroke, effect 없음
7. 클리핑 비활성

### 플러그인 테스트 가이드

**Figma에서 플러그인 설치:**
1. Figma Desktop 앱 열기
2. Plugins > Development > Import plugin from manifest
3. `figma-design-system-automator/manifest.json` 선택

**테스트 순서:**
1. [All] 페이지에서 특정 섹션 선택 (예: Onboarding_invite)
2. `의미 없는 래퍼 제거` 실행 → 콘솔에서 결과 확인
3. `Auto Layout 적용` 실행 → 결과 확인
4. `간격 표준화` 실행 → 결과 확인
5. `네이밍 자동화` 실행 → 프레임 이름 변경 확인
6. `컴포넌트 후보 탐지` 실행 → 콘솔에서 후보 목록 확인

**AI 코드 생성 테스트:**
1. 플러그인으로 정리된 프레임 선택
2. Claude에게 프레임 URL 제공
3. React 코드 생성 요청
4. 생성된 코드가 네이밍 컨벤션을 반영하는지 확인

---

## 5단계: 멀티에이전트 시스템 ⏳ 진행 중

### 아키텍처 결정

기존 룰 베이스 접근법의 한계를 극복하기 위해 **하이브리드 멀티에이전트 시스템**으로 전환.

#### 하이브리드 접근법

| 모듈 | 방식 | 이유 |
|------|------|------|
| **cleanup** | 룰 베이스 ✓ | 조건이 명확, 예외 적음 |
| **autolayout** | **LLM 추론** | 시각적 맥락에서 방향/간격 판단 필요 |
| **spacing** | 룰 베이스 ✓ | 토큰 매칭은 단순 반올림 |
| **naming** | **LLM 추론** | 복잡한 시맨틱 판단 필요 |
| **componentize** | 하이브리드 | 구조 비교는 룰, 의미 판단은 LLM |

#### 시스템 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    Orchestrator Agent                        │
│              (실행 순서 조율, 결과 취합)                        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   Cleanup     │   │   AutoLayout    │   │    Naming       │
│  (룰 베이스)   │   │   (LLM 추론)    │   │   (LLM 추론)    │
│               │   │                 │   │                 │
│ • 자식 1개    │   │ • 스크린샷 분석  │   │ • 스크린샷 분석  │
│ • 같은 크기   │   │ • 방향 추론     │   │ • 컴포넌트 타입  │
│ • 스타일 없음 │   │ • 간격 추론     │   │ • Variant/Size  │
└───────────────┘   └─────────────────┘   └─────────────────┘
```

### Agent Server 구축 ✅ 완료

Figma 플러그인은 브라우저에서 실행되므로, LLM 에이전트는 외부 서버에서 동작.

```
┌─────────────────┐     REST API          ┌──────────────────┐
│  Figma Plugin   │ ◄──────────────────► │  Agent Server    │
│  (브라우저)      │     스크린샷 전송       │  (Node.js)       │
│                 │     결과 수신          │  - Claude API    │
└─────────────────┘                       └──────────────────┘
```

#### 서버 구조

```
agent-server/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts              # Express 서버 (port 3001)
    ├── types.ts              # 타입 정의
    ├── agents/
    │   ├── naming.ts         # Naming Agent (스크린샷 → 시맨틱 이름)
    │   └── autolayout.ts     # AutoLayout Agent (스크린샷 → 레이아웃 설정)
    └── utils/
        └── claude.ts         # Claude API 래퍼
```

#### API 엔드포인트

| 엔드포인트 | 메서드 | 기능 |
|-----------|--------|------|
| `/health` | GET | 서버 상태 확인 |
| `/agents/naming` | POST | 단일 노드 네이밍 분석 |
| `/agents/naming/batch` | POST | 복수 노드 일괄 분석 |
| `/agents/autolayout` | POST | 레이아웃 설정 분석 |

#### Naming Agent 프롬프트 구조

- **컴포넌트 타입**: Button, Input, Avatar, Icon, Card, ListItem, Tab, Toggle, Checkbox, Badge, Header, BottomSheet, Modal, Container, Frame
- **Variant**: Primary, Secondary, Outline, Ghost, Default
- **Size**: XS, SM, MD, LG, XL, Full
- **네이밍 컨벤션**: `ComponentType/Variant/Size`

### 에이전트 문서화 ✅ 완료

각 에이전트별 상세 문서 작성:

```
agent-server/docs/agents/
├── README.md              # 전체 시스템 개요
├── cleanup-agent.md       # 룰 베이스 - 래퍼 제거
├── spacing-agent.md       # 룰 베이스 - 간격 표준화
├── autolayout-agent.md    # LLM 추론 - 레이아웃 분석
├── naming-agent.md        # LLM 추론 - 컴포넌트 네이밍
└── componentize-agent.md  # 하이브리드 - 컴포넌트화
```

### 래퍼 제거 룰 보완 ✅ 완료

**새로 추가된 기능:**

| 함수 | 설명 |
|------|------|
| `isAutoGeneratedName(name)` | "Frame 123456" 패턴 감지 |
| `isAutoGeneratedWrapper(node)` | 공격적 모드 판단 |

**두 가지 모드 지원:**

| 모드 | 함수 | 설명 |
|------|------|------|
| 안전 모드 | `isMeaninglessWrapper()` | 모든 조건을 엄격하게 검사 |
| 공격적 모드 | `isAutoGeneratedWrapper()` | 자동 생성 이름 + 자식 1개면 제거 |

```typescript
// 안전 모드 (기본)
cleanupSelectionWrappers();

// 공격적 모드 - "Frame 1430107280" 같은 자동 생성 이름 제거
cleanupSelectionWrappers({ aggressive: true });
```

**자동 생성 이름 패턴:**
- `Frame 1430107280` ✓
- `Group 123` ✓
- `Rectangle 1` ✓
- `Button` ✗ (의도적 이름)
- `이름입력 7` ✗ (한글 포함)

### 연동 아키텍처 설계

플러그인과 Agent Server 연동 시 역할 분담:

```
┌─────────────────────────────────────────────────────┐
│                 Figma Plugin (로컬)                  │
│  ┌─────────┐  ┌─────────┐                           │
│  │ Cleanup │  │ Spacing │  ← 룰 베이스 (즉시 실행)   │
│  └─────────┘  └─────────┘                           │
└───────────────────────│─────────────────────────────┘
                        │ 스크린샷 전송
                        ▼
┌─────────────────────────────────────────────────────┐
│              Agent Server (Node.js)                  │
│  ┌─────────────┐  ┌─────────────┐                   │
│  │ AutoLayout  │  │   Naming    │  ← LLM 추론       │
│  │   Agent     │  │   Agent     │    (2-5초)        │
│  └─────────────┘  └─────────────┘                   │
└─────────────────────────────────────────────────────┘
```

### Plugin ↔ Agent Server 연결 ✅ 완료

**manifest.json 설정:**
```json
"networkAccess": {
  "allowedDomains": ["none"],
  "devAllowedDomains": ["localhost"]
}
```

**통신 구조:**
```
[Figma Plugin] --postMessage--> [UI Layer] --fetch--> [Agent Server :3001]
     │                               │                       │
     ├─ 스크린샷 캡처                  ├─ API 호출              ├─ Claude Vision
     ├─ 노드 정보 추출                 ├─ 진행률 표시            ├─ JSON 응답
     └─ 결과 적용                     └─ 결과 전달             └─ 추론 결과
```

**플로팅 UI:**
- 플러그인 실행 시 항상 UI 패널 표시
- closePlugin() 제거 → 명령 실행 후에도 UI 유지
- Agent Server 연결 상태 표시

### AutoLayout Agent 하이브리드 구현 ✅ 완료

**처리 순서:**
```
1. 룰 베이스 (정확한 측정)
   └─ 현재 위치/크기에서 direction, gap 계산

2. LLM (의도 추론)
   └─ 스크린샷 + 측정값 기반으로 sizing 모드 결정

3. 안전 검증
   └─ 적용 후 크기 변화 감지 → 5px 초과 시 경고
```

**LLM이 추론하는 항목:**

| 항목 | 값 | 설명 |
|------|-----|------|
| primaryAxisSizing | HUG / FIXED | 주축 사이징 |
| counterAxisSizing | HUG / FIXED | 교차축 사이징 |
| childrenSizing[].layoutAlign | INHERIT / STRETCH | 자식 교차축 (STRETCH = FILL) |
| childrenSizing[].layoutGrow | 0 / 1 | 자식 주축 채우기 (1 = FILL) |

**Sizing 판단 가이드 (프롬프트에 포함):**

| UI 요소 | Width | Height |
|---------|-------|--------|
| 버튼 (일반) | HUG | HUG |
| 버튼 (전체너비) | FILL | HUG |
| 아이콘/아바타 | FIXED | FIXED |
| 입력 필드 | FILL | FIXED |
| 리스트 아이템 | FILL (STRETCH) | HUG |
| 컨테이너/섹션 | FILL | HUG |

**핵심 원칙 (프롬프트 명시):**
> 기존 디자인 보존: 적용 후에도 현재와 동일한 모습이어야 함

### 다음 단계

1. ~~Figma 플러그인 ↔ Agent Server 연동~~ ✅
2. ~~AutoLayout Agent 프롬프트 최적화~~ ✅ (테스트 중)
3. Naming Agent 프롬프트 최적화
4. 실제 Figma에서 통합 테스트

---

## 파일 구조

```
figma-design-system-automator/
├── manifest.json           # 플러그인 메타데이터
├── package.json            # npm 설정
├── tsconfig.json           # TypeScript 설정
├── config/
│   └── tokens.ts           # 디자인 토큰 정의
├── src/
│   ├── code.ts             # 메인 엔트리 (명령어 핸들러)
│   └── modules/
│       ├── autolayout.ts   # Auto Layout 적용
│       ├── spacing.ts      # 간격 표준화
│       ├── cleanup.ts      # 래퍼 제거 (전처리)
│       ├── naming.ts       # 네이밍 자동화
│       └── componentize.ts # 컴포넌트화
├── agent-server/           # 멀티에이전트 서버 (신규)
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts        # Express 서버
│   │   ├── types.ts        # 타입 정의
│   │   ├── agents/
│   │   │   ├── naming.ts   # Naming Agent
│   │   │   └── autolayout.ts
│   │   └── utils/
│   │       └── claude.ts   # Claude API 래퍼
│   └── docs/agents/        # 에이전트 문서
│       ├── README.md       # 시스템 개요
│       ├── cleanup-agent.md
│       ├── spacing-agent.md
│       ├── autolayout-agent.md
│       ├── naming-agent.md
│       └── componentize-agent.md
├── dist/
│   ├── code.js             # 빌드된 플러그인 코드
│   └── ui.html             # 플러그인 UI
└── docs/
    └── PROGRESS.md         # 이 파일
```

---

## 빌드 명령어

```bash
npm install          # 의존성 설치
npm run build        # 빌드
npm run watch        # 개발 모드 (자동 빌드)
npm run typecheck    # 타입 체크
```

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2025-01-12 | 1단계 완료: 토큰 정의 |
| 2025-01-12 | 2단계 완료: autolayout, spacing, cleanup 모듈 |
| 2025-01-12 | 3단계 완료: naming, componentize 모듈 |
| 2025-01-12 | 4단계 완료: 타입체크 통과, 빌드 성공 |
| 2025-01-12 | 피그마 실제 테스트 대기 중 |
| 2025-01-13 | 5단계 시작: 멀티에이전트 아키텍처 결정 |
| 2025-01-13 | Agent Server 인프라 구축 완료 (Express + Claude API) |
| 2025-01-13 | 하이브리드 접근법 채택: 룰 베이스(cleanup, spacing) + LLM 추론(naming, autolayout) |
| 2025-01-13 | 에이전트별 문서 작성 완료 (5개 에이전트 + 시스템 개요) |
| 2025-01-13 | 래퍼 제거 룰 보완: 공격적 모드 추가 (자동 생성 이름 패턴 감지) |
| 2025-01-13 | 연동 아키텍처 설계 완료 (플러그인 ↔ Agent Server 역할 분담) |
| 2025-01-13 | **Plugin ↔ Agent Server 연결 구현 완료** |
| 2025-01-13 | - manifest.json: devAllowedDomains 설정 |
| 2025-01-13 | - UI Layer: fetch API로 서버 통신 |
| 2025-01-13 | - 플로팅 UI: closePlugin 제거, 상시 패널 |
| 2025-01-13 | **Cleanup Agent 개선** |
| 2025-01-13 | - 삭제된 노드 접근 에러 핸들링 |
| 2025-01-13 | - isNodeValid() 검증 추가 |
| 2025-01-13 | - 중첩 래퍼 안전 처리 |
| 2025-01-13 | **AutoLayout Agent 하이브리드 구현** |
| 2025-01-13 | - 룰 베이스: direction, gap 계산 |
| 2025-01-13 | - LLM: sizing 추론 (HUG/FILL/FIXED) |
| 2025-01-13 | - 자식별 layoutAlign, layoutGrow 설정 |
| 2025-01-13 | - 안전 검증: 5px 이상 크기 변화 경고 |
| 2025-01-14 | **프로젝트 환경 설정** |
| 2025-01-14 | - GitHub 레포지토리 클론 (plumlabs-official/WDS) |
| 2025-01-14 | - Node.js 설치 (Homebrew) |
| 2025-01-14 | - 프로젝트 의존성 설치 완료 |
| 2025-01-14 | - 프로젝트 구조 파악 완료 |
| 2025-01-14 | **다음 예정: AI Auto Layout 테스트** |
| 2025-01-14 | - Agent Server 실행 → Figma에서 통합 테스트 진행 예정 |
| 2025-01-14 | **Git 저장소 연결** |
| 2025-01-14 | - GitHub 연결: `git@github.com:plumlabs-official/WDS.git` |
| 2025-01-14 | - .gitignore 설정 완료 |
| 2025-01-14 | **UI 패널 개선** |
| 2025-01-14 | - Agent Server 재연결 버튼 추가 |
| 2025-01-14 | - 메뉴 제거 → 플러그인 클릭 시 바로 패널 표시 |
| 2025-01-14 | - CORS 이슈 해결 |
| 2025-01-14 | **전처리 기능 추가** |
| 2025-01-14 | - 컴포넌트 브레이크: 중첩 인스턴스 재귀 처리 |
| 2025-01-14 | - 꺼진 레이어 삭제: 체크박스 선택 + Figma 동기화 |
| 2025-01-14 | **AutoLayout Agent 개선** |
| 2025-01-14 | - base64 이미지 prefix 제거 (`data:image/png;base64,`) |
| 2025-01-14 | - 시각적 순서로 레이어 재정렬 (y/x 좌표 기준) |
| 2025-01-14 | - FILL 사용 기준 명확화 (95% 이상) |
| 2025-01-14 | **문서화** |
| 2025-01-14 | - docs/INDEX.md: 기능별 참조 맵 |
| 2025-01-14 | - docs/DEVELOPMENT-GUIDE.md: 개발 패턴 가이드 |
| 2025-01-14 | - 전처리 기능별 문서 작성 |

---

## 핵심 인사이트

### 빠른 구현의 조건

**1. 명확한 요청**
```
좋음: "체크박스로 선택해서 원하는 레이어만 삭제하도록 변경해줘"
나쁨: "더 좋게 만들어줘"
```

**2. 기존 패턴 활용**
- UI ↔ code.ts 통신 패턴 재사용
- 기존 모달 스타일 확장
- 데이터 구조 확장 (새로 만들지 않기)

**3. 단계별 구현**
```
1. UI 변경 (HTML/CSS)
2. JS 함수 수정/추가
3. code.ts 메시지 핸들러 추가
4. 빌드 → 테스트
```

**4. 피드백 루프**
```
요청 → 구현 → 테스트 → 추가 요청 → 구현
```
- 한 번에 완벽하려 하지 않음
- 테스트 후 추가 요청으로 보완

### 트러블슈팅 경험

| 문제 | 원인 | 해결 |
|-----|------|------|
| base64 이미지 에러 | `data:image/png;base64,` prefix | claude.ts에서 prefix 제거 |
| 중첩 인스턴스 미처리 | detachInstance 후 children 미처리 | 반환된 frame의 children 재귀 처리 |
| 레이어 순서 뒤바뀜 | 레이어 순서 ≠ 시각적 순서 | 좌표 기준 정렬 후 insertChild |
| manifest networkAccess | 포맷 오류 | scheme 포함 + reasoning 필드 |

### 설계 원칙

**Auto Layout Agent**
- 기존 디자인 100% 보존
- FILL은 95% 이상 채울 때만
- 기본값: `layoutAlign: INHERIT`, `layoutGrow: 0`

**전처리**
- 파괴적 작업 → 확인 필수
- 전체 실행에서 제외
- Undo 가능

---

## 2025-01-14 주요 변경사항

### AI 네이밍 직접 변환 로직 통합

Rule-based 네이밍 삭제 후 AI 네이밍에 직접 변환 로직 통합:

**직접 변환 (AI 호출 없이):**
| 패턴 | 변환 예시 |
|-----|----------|
| 아이콘 라이브러리 | `carbon:ibm-watson-discovery` → `Icon/Discovery` |
| 한글 레이블 | `홈`, `라운지` → `TabItem/Home`, `TabItem/Lounge` |
| 하이픈 패턴 | `user-circle-02` → `Icon/User` |

**제외 조건:**
- 벡터/도형 레이어 (`VECTOR`, `ELLIPSE`, `RECTANGLE` 등)
- 상태값 이름 (`on`, `off`, `active`, `disabled` 등)

**탭바 컨텍스트 감지:**
- 부모에 `tabbar`, `navigation` 등이 있으면 `TabItem/` prefix 적용

### Rule-based 코드 삭제

| 삭제된 파일/함수 | 대체 |
|----------------|------|
| `src/modules/autolayout.ts` | AI Auto Layout만 사용 |
| `handleApplyAutoLayout()` | `handleAutoLayoutAgent()` |
| `handleAutoNaming()` | `handleNamingAgent()` |
| `renameSelectionFrames()` | AI 네이밍 + 직접 변환 |
| `detectComponentType()` 등 | 삭제 |

**파일 크기 감소:** 66kb → 48.3kb

### 유지되는 Rule-based 기능

| 모듈 | 용도 |
|-----|------|
| `src/modules/cleanup.ts` | 래퍼 정리 |
| `src/modules/spacing.ts` | 간격 표준화 |
| `src/modules/naming.ts` | 직접 변환 유틸 함수 |

---

## 현재 Phase 1 진행 상황

### 완료됨

| 에이전트 | 타입 | 상태 | 비고 |
|---------|------|------|------|
| Cleanup Agent | Rule-based | ✅ 완료 | 래퍼 정리, 엣지케이스 모니터링 |
| 컴포넌트 브레이크 | Rule-based | ✅ 완료 | 중첩 인스턴스 재귀 처리 |
| 꺼진 레이어 삭제 | Rule-based | ✅ 완료 | 체크박스 선택 + Figma 동기화 |
| Naming Agent | AI + 직접변환 | ✅ 완료 | 아이콘/한글/하이픈 직접 변환 |

### 진행 중

| 에이전트 | 타입 | 상태 | 다음 단계 |
|---------|------|------|----------|
| Naming Agent | AI | 🔄 테스트 중 | Figma 실제 테스트 필요 |

### 대기 중

| 에이전트 | 타입 | 상태 |
|---------|------|------|
| Spacing Agent | Rule-based | ⏳ 대기 |
| AutoLayout Agent | LLM | ⏳ 대기 |
| Componentize Agent | Hybrid | ⏳ 대기 |

---

## 다음 단계

### 즉시
1. AI 네이밍 Figma 테스트
2. 직접 변환 로직 검증 (Section 추론 포함)

### Phase 1 완료 후
3. Spacing Agent 토큰 매핑 검증
4. AutoLayout Agent 테스트
5. Componentize Agent 탐지 로직 구현

### Phase 2
6. 오케스트레이션 에이전트 설계
7. 파이프라인 구축 (의존성 관리)
8. 에러 핸들링 및 폴백
9. 통합 테스트

---

## 변경 이력 (2025-01-14 추가)

| 시간 | 내용 |
|-----|------|
| 14:00 | AI 네이밍에 직접 변환 로직 통합 |
| 14:15 | 아이콘 라이브러리 → WDS 변환 테이블 추가 |
| 14:20 | 한글 레이블 → 영문 변환 테이블 추가 |
| 14:25 | 하이픈 패턴 아이콘 변환 추가 |
| 14:30 | 탭바 컨텍스트 감지 로직 추가 |
| 14:40 | Rule-based 네이밍 코드 삭제 |
| 14:50 | Rule-based Auto Layout 코드 삭제 |
| 15:00 | `src/modules/autolayout.ts` 삭제 |
| 15:05 | `roundToNearestToken()` → spacing.ts로 이동 |
| 15:10 | docs/INDEX.md 업데이트 |
| 15:15 | 빌드 완료 (48.3kb) |
| 16:00 | **자식 아이콘 기반 TabItem 이름 유추** |
| 16:00 | - `inferTabItemNameFromIcon()` 함수 추가 |
| 16:00 | - 2차 패스로 동작 (직접 변환 후 실행) |
| 16:10 | **camelCase 방어 로직 추가** |
| 16:10 | - `isCamelCase()`, `convertCamelCaseToPascalCase()` |
| 16:10 | - `redDot` → `RedDot` 변환 |
| 16:30 | **자식 키워드 기반 Section 추론 로직** |
| 16:30 | - `isGenericName()`: 일반 이름 감지 (details, container 등) |
| 16:30 | - `inferSectionNameFromChildren()`: 자식에서 도메인 키워드 추출 |
| 16:30 | - 컨텍스트 키워드 추출 (Active, Join, Completed 등) |
| 16:30 | - `details` → `Section/ActiveChallenge` 변환 |
| 16:45 | naming-agent.md 문서화 완료 |
| 16:50 | 빌드 완료 (54.1kb) |

---

## 핵심 설계 결정 기록

### 1. Rule-based 네이밍/AutoLayout 삭제

**배경**: Rule-based와 AI 방식이 분리되어 혼란, 유지보수 부담

**결정**: Rule-based 코드 전면 삭제, AI에 직접 변환 로직 통합

**이유**:
- 단일 진입점으로 사용성 향상
- 명확한 패턴은 직접 변환으로 비용/시간 절감
- 복잡한 판단만 AI에 위임

### 2. 자식 아이콘 기반 TabItem 유추

**배경**: 원본 탭이 모두 "라운지"로 동일해도 자식 아이콘은 다름

**결정**: 직접 변환 후 2차 패스로 TabItem 이름 유추

**로직**:
```
TabItem/Lounge (자식: Icon/Friends) → TabItem/Friends
```

**이유**:
- 자식 Icon/* 이 먼저 변환되어야 부모 이름 유추 가능
- 순서 의존성 해결

### 3. 자식 키워드 기반 Section 추론

**배경**: `details`, `container` 같은 일반 이름이 의미 없음

**문제 사례**:
```
details (자식: Challenge Header, Challenge List)
  → 실제 역할: "참여 중인 챌린지 카드 영역"
  → 기대 이름: Section/ActiveChallenge
```

**결정**: 자식에서 도메인 키워드, 조상에서 컨텍스트 키워드 추출

**로직**:
```
1. 자식 이름에서 Challenge, Feed, Profile 등 도메인 키워드 빈도 카운트
2. 조상 이름에서 Active, Join, My 등 컨텍스트 힌트 검색
3. 형제 중 첫 번째면 Active로 추정
4. Section/{Context}{Domain} 생성
```

**이유**:
- 같은 챌린지 카드라도 Active/Join 등 전체 범위에서 구분 가능
- AI 호출 없이 룰 베이스로 처리 가능
- 일관된 네이밍으로 개발 생산성 향상

### 4. camelCase 방어

**배경**: `redDot` 같은 camelCase는 네이밍 컨벤션 위반

**결정**: camelCase 감지 시 PascalCase로 자동 변환

**이유**:
- 일관된 네이밍 컨벤션 유지 (PascalCase)
- 개발자 실수 방어

---

## Naming Agent 직접 변환 우선순위

```
1. 아이콘 라이브러리 (carbon:xxx → Icon/Xxx)
2. 하이픈 패턴 아이콘 (user-circle-02 → Icon/User)
3. 한글 레이블 (홈 → TabItem/Home)
4. 아이콘 상태 컨테이너 (on/off 자식 포함)
5. camelCase 방어 (redDot → RedDot)
6. 자식 키워드 기반 Section 추론 (details → Section/ActiveChallenge)
7. [2차 패스] TabItem 자식 아이콘 기반 유추
8. AI 분석 (위 조건 모두 해당 안 되는 FRAME)
```

---

## 2025-01-15 주요 변경사항

### 컨텍스트 기반 AI 네이밍 구현 ✅ 완료

**문제점:**
- 개별 노드 스크린샷으로 분석 시 맥락 부재
- Button이 Container로, Container가 Button으로 잘못 분류
- `HomeScreen/Unauthenticated` 같은 잘못된 타입/상태 생성

**해결책: 전체 스크린 기반 분석**

```
기존: 노드별 개별 스크린샷 N장 → AI 분석 N회
개선: 전체 스크린 1장 + 노드 위치/깊이 정보 → AI 분석 1회
```

#### 구현 내용

**1. 전체 스크린 캡처 (`src/code.ts`)**
```typescript
findScreenFrame(node)       // 최상위 스크린 프레임 찾기
captureScreenContext(frame) // 전체 스크린 캡처 (1x)
getRelativePosition(node)   // 스크린 기준 상대 좌표 + depth
getDepthFromScreen(node)    // 계층 깊이 계산
```

**2. 계층별 네이밍 규칙 (프롬프트)**

| 깊이 | 타입 | 예시 |
|------|------|------|
| 1단계 | Screen | `Screen/Home`, `Screen/Challenge` |
| 2단계 | Layout | `Layout/TopBar`, `Layout/Main`, `Layout/BottomBar` |
| 3단계+ | Component | `Section/Challenge`, `Card/LG`, `TabItem/Home` |

**3. 금지 사항 명시**
- ❌ 비즈니스 상태 추론: `Authenticated`, `Empty`, `Active` 등
- ❌ 잘못된 타입 생성: `HomeScreen`, `LoginScreen`, `UserCard` 등
- ❌ 3단계 이하 Layout 사용

**4. 유효한 시맨틱 타입 검증**
```typescript
const VALID_SEMANTIC_TYPES = [
  'Screen', 'Layout', 'TopBar', 'TabBar', 'Section', 'Content', 'Container',
  'Card', 'Button', 'Input', 'Avatar', 'Icon', 'ListItem', 'TabItem',
  'Badge', 'Tag', 'Header', 'Toggle', 'Checkbox', 'ProgressBar',
  'Timer', 'HomeIndicator', 'Frame',
];

function hasValidSemanticName(name: string): boolean {
  if (!name.includes('/')) return false;
  const firstPart = name.split('/')[0];
  return VALID_SEMANTIC_TYPES.includes(firstPart);
}
```

**효과:**
- `HomeScreen/Unauthenticated` → 재분석 대상 → `Screen/Home`
- `Button/Primary/MD` → 스킵 (유효)
- `UserCard/Profile` → 재분석 대상

#### 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/code.ts` | `VALID_SEMANTIC_TYPES`, `hasValidSemanticName()`, depth 계산 함수 |
| `agent-server/src/agents/naming.ts` | 계층별 프롬프트, 금지사항, depth 표시 |
| `agent-server/src/types.ts` | `depth` 필드 추가 |
| `agent-server/src/utils/claude.ts` | `max_tokens: 8192` (큰 응답 지원) |
| `agent-server/src/index.ts` | `/agents/naming/context` 엔드포인트 |
| `src/ui.html` | `handleNamingContext()` 핸들러 |

#### API 엔드포인트

| 엔드포인트 | 용도 |
|-----------|------|
| `POST /agents/naming/context` | 전체 스크린 기반 컨텍스트 네이밍 |

#### 테스트 결과

```
[Context Naming] Analyzing 28 nodes with screen context (375x1330)
[Context Naming] Response preview: Screen/Challenge (confidence: 0.95)
[Context Naming] Got 28 results
[Context Naming] Success: 28 names suggested
```

---

## 변경 이력 (2025-01-15 추가)

| 시간 | 내용 |
|-----|------|
| 23:00 | 컨텍스트 기반 AI 네이밍 설계 시작 |
| 23:15 | `findScreenFrame()`, `captureScreenContext()` 구현 |
| 23:20 | `getRelativePosition()`, `getDepthFromScreen()` 구현 |
| 23:30 | `ContextAwareNamingRequest` 타입 정의 |
| 23:35 | `CONTEXT_AWARE_NAMING_PROMPT` 작성 |
| 23:40 | `analyzeNamingWithContext()` 함수 구현 |
| 23:45 | `/agents/naming/context` 엔드포인트 추가 |
| 23:50 | UI 핸들러 `handleNamingContext()` 추가 |
| 23:55 | 계층별 네이밍 규칙 프롬프트 개선 |
| 00:00 | 금지사항 명시 (비즈니스 상태, 잘못된 타입) |
| 00:05 | `VALID_SEMANTIC_TYPES` 상수 추가 |
| 00:10 | `hasValidSemanticName()` 검증 함수 추가 |
| 00:15 | `max_tokens: 8192` 증가 (큰 응답 지원) |
| 00:20 | 디버그 로그 추가 |
| 00:25 | **테스트 성공: 28개 노드 분석 완료** |

---

## 2025-01-15 네이밍 컨벤션 개선 (추가)

### Purpose 슬롯 추가 ✅ 완료

**기존 형식:**
```
ComponentType/Variant/Size
예: Button/Primary/LG
```

**새 형식:**
```
ComponentType/Purpose/Variant/Size
예: Button/CTA/Primary/LG
```

**Purpose 추론 규칙:**

| 컴포넌트 | Purpose 예시 |
|---------|-------------|
| Button | CTA, Submit, Cancel, Close, Back, Next, Share, Like, More |
| Card | Profile, Product, Feed, Challenge, Stats, Banner |
| Container | ButtonArea, IconGroup, ActionBar, InfoSection, ImageArea |
| Section | Challenge, Feed, Stats, Profile, Carousel, Banner |
| ListItem | Challenge, Feed, Product, User, Setting, Rank |
| Icon | Close, Back, Share, Like, More, Search, Settings |
| Image | Avatar, Banner, Product, Thumbnail, Background, Logo |

### Section vs Card vs ListItem 구분 규칙

| 타입 | 역할 | 예시 |
|------|------|------|
| **Section** | 여러 아이템을 **그룹화하는 컨테이너** | `Section/Challenge` (목록 전체) |
| **Card** | **독립적인 정보 단위** (개별 아이템) | `Card/Challenge` (개별 카드) |
| **ListItem** | **리스트 내 개별 행** 항목 | `ListItem/Challenge` (리스트 항목) |

**계층 구조 예시:**
```
Section/Challenge (컨테이너)
├── Card/Challenge (개별 카드 1)
├── Card/Challenge (개별 카드 2)
└── Card/Challenge (개별 카드 3)
```

### Size 적용 컴포넌트 제한 ✅ 완료

디자인 시스템 베스트 프랙티스에 따라 Size를 특정 컴포넌트에만 적용:

**Size 적용 O:**
- Button, Input, Avatar, Card, Badge, Icon, Tag
- 예: `Button/CTA/Primary/LG`, `Card/Profile/LG`, `Avatar/User/MD`

**Size 적용 X:**
- Container, Section, TopBar, TabBar, ListItem, Image, Screen, Header, Frame
- 예: `Container/ButtonArea`, `Section/Challenge`, `ListItem/Feed`

**참고:** Morningstar Design System 등 주요 디자인 시스템에서 Layout Grid, Container, Navigation 등은 "Default Size Only"로 분류

### Image 컴포넌트 타입 추가 ✅ 완료

**컴포넌트 타입 목록에 Image 추가:**
```
UI 컴포넌트: Card, Button, Input, Avatar, Icon, Image, ListItem, TabItem, Badge, Tag, Header
```

**Image Purpose:**
- Avatar: 프로필/사용자 이미지
- Banner: 배너/프로모션 이미지
- Product: 상품 이미지
- Thumbnail: 썸네일 이미지
- Background: 배경 이미지
- Logo: 로고 이미지

### Layout 타입 완전 금지 ✅ 완료

**기존:** 2단계에서 Layout 허용 (`Layout/TopBar`, `Layout/Main`)
**변경:** 모든 깊이에서 Layout 금지 → 구체적 컴포넌트 타입 사용

**대체 예시:**
- `Layout/Main` ❌ → `TopBar/Main` ✓ 또는 `Section/Main` ✓
- `Layout/BottomBar` ❌ → `TabBar/Main` ✓

### 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `agent-server/src/agents/naming.ts` | Purpose 규칙, Size 제한, Image 타입, Section/Card/ListItem 구분 |
| `agent-server/src/types.ts` | `purpose` 필드 추가 |

---

## 변경 이력 (2025-01-15 추가 - 컨벤션 개선)

| 시간 | 내용 |
|-----|------|
| 오전 | Purpose 슬롯 추가 (`ComponentType/Purpose/Variant/Size`) |
| 오전 | Purpose 추론 가이드라인 추가 (Button, Card, Container, Section, ListItem, Icon) |
| 오전 | Layout 타입 완전 금지 (모든 깊이에서) |
| 오전 | Content 사용 완전 금지 |
| 오전 | Section vs Card vs ListItem 구분 규칙 추가 |
| 오전 | Image 컴포넌트 타입 및 Purpose 추가 |
| 오전 | Size 적용 컴포넌트 제한 (디자인 시스템 베스트 프랙티스 기반) |
| 오전 | - Size 적용: Button, Input, Avatar, Card, Badge, Icon, Tag |
| 오전 | - Size 미적용: Container, Section, TopBar, TabBar, ListItem, Image 등 |

---

## 참조 문서

- `docs/INDEX.md` - 기능별 참조 맵
- `agent-server/docs/agents/naming-agent.md` - Naming Agent 상세 가이드
- `docs/DEVELOPMENT-GUIDE.md` - 개발 패턴 가이드
- `docs/NAMING-RULES.md` - 네이밍 규칙 가이드 (신규)

---

## 2026-01-15 Cleanup 모듈 개선

### 단일 자식 래퍼 병합 기능 수정 ✅ 완료

**문제점:**
- `isMeaninglessWrapper` 함수에서 크기 체크 (2px 허용 오차)로 인해 크기가 다른 단일 자식 래퍼가 병합되지 않음
- `findSingleChildChain` 함수에서 크기 체크 (5px 허용 오차)로 인해 체인 탐지 실패
- 예: `Section/Challenge (375px) > Item (343px)` 구조 (32px 차이) → 병합 대상에서 제외됨

**해결:**
- `isMeaninglessWrapper`: 크기 체크 완전 제거, 스타일만 검사
- `findSingleChildChain`: 크기 체크 완전 제거
- 단일 자식 프레임이면 크기와 관계없이 병합 대상으로 인식

**수정 파일:**
- `src/modules/cleanup.ts`
  - Line 59-101: `isMeaninglessWrapper` 함수 - 크기 체크 제거
  - Line 487-530: `findSingleChildChain` 함수 - 크기 체크 제거
  - Line 505, 528: while 루프 내 크기 체크 제거

**변경 전:**
```typescript
// isMeaninglessWrapper 내
const sameWidth = Math.abs(node.width - child.width) <= sizeTolerance;
const sameHeight = Math.abs(node.height - child.height) <= sizeTolerance;
if (!sameWidth || !sameHeight) return false;

// findSingleChildChain 내
if (!isSimilarSize(node, child as FrameNode)) return null;
```

**변경 후:**
```typescript
// 크기 체크 완전 제거
// 단일 자식 + 스타일 없음 조건만 검사
```

### 아이콘 위치 계산 버그 수정 ✅ 완료

**문제점:**
- `unwrapNode` 함수에서 자식 위치를 잘못 계산
- `child.x = wrapperX`로 설정하여 래퍼 내 상대 좌표를 무시
- 결과: 아이콘이 원래 위치에서 이탈

**해결:**
- 절대 위치 = 래퍼 위치 + 자식의 래퍼 내 상대 위치
- `child.x = wrapper.x + child.x`
- `child.y = wrapper.y + child.y`

**수정 파일:**
- `src/modules/cleanup.ts` Line 133-144

**변경 전:**
```typescript
child.x = wrapperX;  // 상대 좌표 무시
child.y = wrapperY;
```

**변경 후:**
```typescript
var absoluteX = wrapper.x + child.x;
var absoluteY = wrapper.y + child.y;
// ...
child.x = absoluteX;
child.y = absoluteY;
```

### 테스트 결과

| 테스트 케이스 | 결과 |
|-------------|------|
| 동일 이름 + 동일 크기 | ✅ 병합됨 |
| 동일 이름 + 다른 크기 | ✅ 병합됨 (신규) |
| 다른 이름 + 동일 크기 | ✅ 병합됨 |
| 다른 이름 + 다른 크기 | ✅ 병합됨 (신규) |
| 아이콘 위치 보존 | ✅ 정상 |
| 부모 크기 유지 | ✅ 정상 |

---

## 변경 이력 (2026-01-15 추가)

| 시간 | 내용 |
|-----|------|
| 오후 | `isMeaninglessWrapper` 크기 체크 제거 |
| 오후 | `findSingleChildChain` 크기 체크 제거 |
| 오후 | `unwrapNode` 절대 위치 계산 수정 |
| 오후 | 단일 자식 래퍼 병합 테스트 완료 |
| 오후 | PROGRESS.md 업데이트 |
| 오후 | 실수 방지 가이드 작성 예정 |

---

## 핵심 교훈 (2026-01-15)

### 크기 체크가 의도치 않은 제한을 만든 사례

**원인:**
- 래퍼 판단 시 "크기가 비슷해야 의미 없는 래퍼"라는 가정
- 이 가정이 실제 사용 사례와 맞지 않음

**교훈:**
- 사용자 요구사항: "단일 자식이면 크기와 관계없이 병합"
- 구현 시 명시적으로 확인하지 않은 조건이 숨어 있었음
- 크기 체크 같은 "방어적 조건"이 오히려 기능을 제한함

**방어 전략:**
1. 새 기능 구현 시 모든 조건 명시적으로 나열
2. 조건 변경 시 영향받는 함수 전체 검토
3. 테스트 케이스에 경계 조건 포함

### 위치 계산 버그 패턴

**원인:**
- 래퍼 위치만 저장하고 자식의 상대 좌표 무시
- `child.x = wrapperX` 대신 `child.x = wrapperX + childRelativeX` 필요

**교훈:**
- Figma 노드 좌표는 부모 기준 상대 좌표
- 언래핑 시 반드시 절대 위치 = 부모 위치 + 상대 위치

**방어 전략:**
1. 좌표 계산 시 항상 "절대 vs 상대" 명확히 구분
2. 언래핑 로직에서 `wrapper.x + child.x` 패턴 사용
3. 테스트 시 위치 이동 검증 포함
