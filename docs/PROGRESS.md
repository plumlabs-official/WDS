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
