# Naming Agent (네이밍 추론)

## 개요

| 항목 | 내용 |
|------|------|
| **타입** | LLM 추론 (컨텍스트 기반) |
| **역할** | 전체 스크린 기반으로 시맨틱 컴포넌트 이름 추론 |
| **실행 순서** | 4번째 (간격 표준화 후) |
| **소스 파일** | `agent-server/src/agents/naming.ts` |
| **API 엔드포인트** | `POST /agents/naming/context` |

## 목적

시각적 분석을 통해:
- 컴포넌트 타입 식별 (Button, Card, Section 등)
- **Purpose 식별 (CTA, Profile, Challenge 등)** ← 필수!
- Variant 식별 (Primary, Secondary - 특정 타입만)
- Size 식별 (XS, SM, MD, LG, XL - 특정 타입만)
- 시맨틱 이름 생성 (`Button/CTA/Primary/LG`)

## 네이밍 형식 (2025-01-15 업데이트)

```
ComponentType/Purpose/Variant/Size
```

**예시:**
- `Button/CTA/Primary/LG` - 주요 행동 유도 버튼
- `Card/Profile` - 프로필 카드
- `Section/Challenge` - 챌린지 섹션
- `Container/ButtonArea` - 버튼 그룹 컨테이너

> **중요:** Purpose는 모든 컴포넌트에 필수입니다. `Button/Primary` ❌ → `Button/CTA/Primary` ✅

## 금지 사항 🚫

| 금지 항목 | 대체 |
|----------|------|
| `Layout/...` | `TopBar/...`, `Section/...` |
| `Content` | `Container/[구체적역할]` |
| Purpose 생략 | 모든 컴포넌트에 Purpose 필수 |
| `HomeScreen/...` | `Screen/Home` |
| `Authenticated`, `Empty` 등 | 비즈니스 상태 금지 |

## Size 적용 규칙

**Size 적용 O:** Button, Input, Avatar, Card, Badge, Icon, Tag
**Size 적용 X:** Container, Section, TopBar, TabBar, ListItem, Image, Screen

> 상세 규칙: `docs/NAMING-RULES.md` 참조

## 왜 LLM인가?

### 룰 베이스의 한계

```
Case 1: 복합 컴포넌트
┌────────────────────────────┐
│  👤  김영재님              │  ← Avatar + Text?
│      팔로워 1.2K           │     ListItem?
└────────────────────────────┘     Card?

Case 2: 컨텍스트 의존성
┌────────────────────────────┐
│       다음       │  ← 높이 48px, 녹색 배경
└────────────────────────────┘   Button인가? Tab인가?
                                  (화면 맥락에 따라 다름)

Case 3: 비정형 디자인
┌────────────────────────────┐
│  🔥 오늘의 도전             │  ← Badge + Text인가?
└────────────────────────────┘     Custom Component인가?
```

### LLM의 장점

- 시각적 패턴 인식
- 디자인 컨벤션 이해
- 맥락 기반 판단
- 새로운 컴포넌트 유형 대응

## 입력/출력

### 입력
```typescript
interface NamingRequest {
  nodeId: string;
  screenshot: string;       // base64 PNG
  currentName: string;      // 현재 Figma 레이어명
  nodeType: string;         // FRAME, GROUP 등
  width: number;
  height: number;
  childrenCount: number;
}
```

### 출력
```typescript
interface NamingResult {
  suggestedName: string;    // "Button/Primary/MD"
  componentType: string;    // "Button"
  variant?: string;         // "Primary"
  size?: string;            // "MD"
  confidence: number;       // 0.0 ~ 1.0
  reasoning: string;        // 판단 근거
}
```

## 시스템 프롬프트

```markdown
당신은 UI 컴포넌트 분석 전문가입니다.
주어진 Figma 프레임 스크린샷을 분석하여 적절한 시맨틱 이름을 제안해주세요.

## 컴포넌트 타입 분류

| 타입 | 설명 | 시각적 특징 |
|------|------|------------|
| Button | 클릭 가능한 버튼 | 텍스트, 배경색, 둥근 모서리 |
| Input | 텍스트 입력 필드 | 테두리, placeholder |
| Avatar | 프로필 이미지 | 원형/정사각형, 이미지 |
| Icon | 아이콘 | 작은 정사각형, 벡터 |
| Card | 정보 카드 | 배경, 그림자, 여러 자식 |
| ListItem | 리스트 항목 | 가로로 긴 형태 |
| Tab | 탭 항목 | 텍스트, 특정 높이 |
| Toggle | ON/OFF 스위치 | 원형 노브, 트랙 |
| Checkbox | 체크박스 | 정사각형, 체크 아이콘 |
| Badge | 상태 배지 | 작은 크기, 색상 |
| Header | 상단 헤더 | 전체 너비, 상단 위치 |
| BottomSheet | 하단 시트 | 하단 고정, 핸들 |
| Modal | 모달 | 중앙 배치, 오버레이 |
| Container | 컨테이너 | 여러 자식, 큰 크기 |
| Frame | 기본 프레임 | 분류 불가 시 |

## Variant 분류 (색상/스타일 기반)

| Variant | 색상 | 용도 |
|---------|------|------|
| Primary | #00cc61 (그린) | 주요 액션 |
| Secondary | #f3f3f3 (회색) | 보조 액션 |
| Outline | 테두리만 | 덜 강조 |
| Ghost | 배경 없음 | 최소 강조 |
| Default | 흰색/무색 | 기본 |

## Size 분류

| Size | Button 높이 | Avatar 크기 | Icon 크기 |
|------|------------|------------|----------|
| XS | - | 27px | 14px |
| SM | 32px | 38px | 16px |
| MD | 48px | 44px | 20px |
| LG | 56px | 56px | 24px |
| XL | - | 62px+ | 28px |

## 네이밍 컨벤션

- 형식: `ComponentType/Variant/Size`
- Variant가 Default면 생략: `ComponentType/Size`
- 예시:
  - `Button/Primary/MD`
  - `Avatar/LG`
  - `Icon/SM`
  - `Card/Default/LG`

## 응답 형식 (JSON)
```json
{
  "suggestedName": "Button/Primary/MD",
  "componentType": "Button",
  "variant": "Primary",
  "size": "MD",
  "confidence": 0.95,
  "reasoning": "녹색 배경(#00cc61)의 둥근 버튼, 높이 48px, '다음' 텍스트 포함"
}
```
```

## 판단 기준

### 컴포넌트 타입 우선순위

작은 것 → 큰 것 순서로 판단:

```
1. Icon (가장 작음)
   ↓
2. Avatar, Checkbox, Toggle (작은 독립 요소)
   ↓
3. Button, Input, Tab, Badge (중간 크기)
   ↓
4. ListItem, Card (복합 요소)
   ↓
5. Header, BottomSheet, Modal (레이아웃 요소)
   ↓
6. Container, Frame (폴백)
```

### Variant 판단

```typescript
// 배경색 기반
if (backgroundColor === '#00cc61') return 'Primary';
if (backgroundColor === '#f3f3f3') return 'Secondary';
if (hasStrokeOnly) return 'Outline';
if (noBackground) return 'Ghost';
return 'Default';
```

### Size 판단

컴포넌트 타입별 크기 매핑:

```
Button:
  height >= 52 → LG
  height >= 44 → MD
  height < 44  → SM

Avatar:
  width >= 100 → XL
  width >= 56  → LG
  width >= 44  → MD
  width >= 38  → SM
  width < 38   → XS
```

## API 사용 예시

### Single Request
```bash
curl -X POST http://localhost:3001/agents/naming \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "123:456",
    "screenshot": "base64...",
    "currentName": "Frame 1430107280",
    "nodeType": "FRAME",
    "width": 343,
    "height": 48,
    "childrenCount": 1
  }'
```

### Response
```json
{
  "success": true,
  "data": {
    "suggestedName": "Button/Primary/MD",
    "componentType": "Button",
    "variant": "Primary",
    "size": "MD",
    "confidence": 0.92,
    "reasoning": "녹색 배경(#00cc61), 높이 48px, 둥근 모서리, '다음' 텍스트 - Primary 버튼으로 판단"
  }
}
```

### Batch Request
```bash
curl -X POST http://localhost:3001/agents/naming/batch \
  -H "Content-Type: application/json" \
  -d '{
    "nodes": [
      { "nodeId": "1", "screenshot": "...", ... },
      { "nodeId": "2", "screenshot": "...", ... }
    ]
  }'
```

## 신뢰도 (Confidence)

| 범위 | 의미 | 처리 |
|------|------|------|
| 0.9+ | 확실함 | 자동 적용 |
| 0.7-0.9 | 높음 | 자동 적용 (로그) |
| 0.5-0.7 | 보통 | 사용자 확인 권장 |
| 0.5 미만 | 낮음 | 수동 검토 필요 |

## 폴백 로직 (룰 베이스)

LLM 추론 실패 시 플러그인의 룰 베이스 로직 사용:

### 컴포넌트 타입 판단 함수들

```typescript
// 버튼 판단
function isButton(node: FrameNode): boolean {
  const hasText = node.children.some(c => c.type === 'TEXT');
  const buttonHeights = [32, 48, 56];  // SM, MD, LG
  const isButtonHeight = buttonHeights.some(h => Math.abs(node.height - h) <= 4);
  const hasFill = Array.isArray(node.fills) && node.fills.length > 0;
  const hasRoundedCorners = typeof node.cornerRadius === 'number' && node.cornerRadius > 0;

  return hasText && isButtonHeight && (hasFill || hasRoundedCorners);
}

// 아바타 판단
function isAvatar(node: FrameNode): boolean {
  const isSquare = Math.abs(node.width - node.height) <= 2;
  const avatarSizes = [27, 38, 44, 56, 62, 130];  // XS ~ Max
  const matchesSize = avatarSizes.some(s => Math.abs(node.width - s) <= 2);
  const isCircle = typeof node.cornerRadius === 'number' &&
                   node.cornerRadius >= node.width / 2 - 1;
  const hasImage = node.children.some(c =>
    c.type === 'RECTANGLE' && hasImageFill(c)
  );

  return isSquare && (matchesSize || isCircle) && (hasImage || isCircle);
}

// 아이콘 판단
function isIcon(node: FrameNode): boolean {
  const isSquare = Math.abs(node.width - node.height) <= 2;
  const iconSizes = [14, 16, 20, 24, 28];  // XS ~ XL
  const matchesSize = iconSizes.some(s => Math.abs(node.width - s) <= 2);
  const hasVector = node.children.some(c =>
    c.type === 'VECTOR' || c.type === 'BOOLEAN_OPERATION' || c.type === 'LINE'
  );
  const nameHasIcon = node.name.toLowerCase().includes('icon');

  return isSquare && matchesSize && (hasVector || nameHasIcon);
}

// 입력 필드 판단
function isInput(node: FrameNode): boolean {
  const inputHeights = [46, 48, 40];  // MD, LG, SearchBar
  const isInputHeight = inputHeights.some(h => Math.abs(node.height - h) <= 4);
  const hasText = node.children.some(c => c.type === 'TEXT');
  const hasStroke = node.strokes.length > 0;
  const isWide = node.width > 100;
  const hasCornerRadius = typeof node.cornerRadius === 'number' && node.cornerRadius > 0;

  return isInputHeight && hasText && isWide && (hasStroke || hasCornerRadius);
}

// 토글 판단
function isToggle(node: FrameNode): boolean {
  const matchesToggle = Math.abs(node.width - 40) <= 4 || Math.abs(node.height - 40) <= 4;
  const hasCircleChild = node.children.some(c =>
    c.type === 'ELLIPSE' ||
    (c.type === 'FRAME' && isCircularFrame(c))
  );

  return matchesToggle && hasCircleChild;
}

// 체크박스 판단
function isCheckbox(node: FrameNode): boolean {
  const isSquare = Math.abs(node.width - node.height) <= 2;
  const checkboxSizes = [20, 24];  // SM, LG
  const matchesSize = checkboxSizes.some(s => Math.abs(node.width - s) <= 2);
  const hasCheckmark = node.children.some(c =>
    c.name.toLowerCase().includes('check') ||
    c.type === 'VECTOR' || c.type === 'BOOLEAN_OPERATION'
  );

  return isSquare && matchesSize && hasCheckmark;
}
```

### 판단 우선순위

```typescript
function detectComponentType(node: FrameNode): ComponentType {
  // 작은 것 → 큰 것 순서로 체크
  if (isIcon(node)) return 'Icon';
  if (isAvatar(node)) return 'Avatar';
  if (isCheckbox(node)) return 'Checkbox';
  if (isToggle(node)) return 'Toggle';
  if (isButton(node)) return 'Button';
  if (isInput(node)) return 'Input';
  if (isTab(node)) return 'Tab';
  if (isListItem(node)) return 'ListItem';
  if (isCard(node)) return 'Card';

  // 큰 프레임은 Container
  if (node.children.length > 3 && node.width > 200 && node.height > 200) {
    return 'Container';
  }

  return 'Frame';  // 기본값
}
```

### Variant 판단

```typescript
function detectVariant(node: FrameNode): VariantType {
  const fills = node.fills;

  if (!Array.isArray(fills) || fills.length === 0) {
    return 'Ghost';
  }

  const solidFill = fills.find(f => f.type === 'SOLID' && f.visible !== false);
  if (!solidFill) {
    return node.strokes.length > 0 ? 'Outline' : 'Ghost';
  }

  const fillColor = rgbToHex(solidFill.color);

  if (isColorSimilar(fillColor, '#00cc61')) return 'Primary';
  if (isColorSimilar(fillColor, '#f3f3f3')) return 'Secondary';
  if (isColorSimilar(fillColor, '#ffffff')) return 'Default';

  return 'Default';
}
```

## 핵심 함수 목록 (플러그인)

| 함수 | 역할 | 위치 |
|------|------|------|
| `isButton(node)` | 버튼 여부 판단 | naming.ts |
| `isInput(node)` | 입력 필드 여부 판단 | naming.ts |
| `isAvatar(node)` | 아바타 여부 판단 | naming.ts |
| `isIcon(node)` | 아이콘 여부 판단 | naming.ts |
| `isToggle(node)` | 토글 여부 판단 | naming.ts |
| `isCheckbox(node)` | 체크박스 여부 판단 | naming.ts |
| `isCard(node)` | 카드 여부 판단 | naming.ts |
| `isListItem(node)` | 리스트 아이템 여부 판단 | naming.ts |
| `isTab(node)` | 탭 여부 판단 | naming.ts |
| `detectComponentType(node)` | 컴포넌트 타입 판단 (통합) | naming.ts |
| `detectVariant(node)` | Variant 판단 | naming.ts |
| `detectSize(node, type)` | Size 판단 | naming.ts |
| `generateSemanticName(node)` | 시맨틱 이름 생성 | naming.ts |
| `renameSelectionFrames()` | 선택 프레임 이름 변경 (진입점) | naming.ts |
| `previewRenames(node)` | 이름 변경 미리보기 | naming.ts |

## 직접 변환 로직 (AI 호출 없이)

> **핵심 원칙**: 명확한 패턴은 AI 호출 없이 직접 변환하여 비용과 시간을 절약

### 변환 우선순위

```
1. 아이콘 라이브러리 (carbon:xxx → Icon/Xxx)
2. 하이픈 패턴 아이콘 (user-circle-02 → Icon/User)
3. 한글 레이블 (홈 → TabItem/Home)
4. 아이콘 상태 컨테이너 (on/off 자식 포함)
5. camelCase 방어 (redDot → RedDot)
6. 자식 키워드 기반 Section 추론 (details → Section/ActiveChallenge)
7. AI 분석 (위 조건 모두 해당 안 되는 FRAME)
```

### 1. 아이콘 라이브러리 변환

**패턴**: `prefix:icon-name`

```typescript
// 지원 prefix
const ICON_LIBRARY_PREFIXES = [
  'carbon:', 'la:', 'solar:', 'icon-park-solid:', 'mdi:',
  'lucide:', 'tabler:', 'heroicons:', 'phosphor:', 'feather:',
  // ...
];

// 변환 예시
'carbon:ibm-watson-discovery' → 'Icon/Discovery'
'solar:star-bold' → 'Icon/Star'
'la:user-friends' → 'Icon/Friends'
```

**WDS 아이콘 매핑 테이블**:
| 원본 패턴 | WDS 이름 |
|----------|---------|
| ibm-watson-discovery | Discovery |
| user-friends | Friends |
| people-circle | People |
| user-circle | UserCircle |
| play, pause, stop | Play, Pause, Stop |
| chat, message, comment | Chat, Message, Comment |
| check, close, add | Check, Close, Add |
| star, heart, like | Star, Heart, Like |
| settings, gear, cog | Settings |

### 2. 한글 레이블 변환

**탭바/네비게이션 컨텍스트 감지**:
```typescript
// 부모에 아래 키워드가 있으면 TabItem/ prefix 적용
const TABBAR_KEYWORDS = ['tabbar', 'tab bar', 'navigation', 'navbar', 'bottomnav'];

// 변환 예시
'홈' (in tabbar) → 'TabItem/Home'
'라운지' (in tabbar) → 'TabItem/Lounge'
'마이페이지' (standalone) → 'MyPage'
```

**한글 → 영문 매핑**:
| 한글 | 영문 |
|-----|-----|
| 홈 | Home |
| 라운지 | Lounge |
| 마이페이지 | MyPage |
| 챌린지 | Challenge |
| 피드 | Feed |
| 검색 | Search |
| 알림 | Notification |
| 설정 | Settings |
| 프로필 | Profile |
| 친구 | Friends |
| 확인/취소/다음 | Confirm/Cancel/Next |

### 3. 자식 아이콘 기반 탭 이름 유추

> **문제**: 원본 탭이 모두 "라운지"로 동일해도 자식 아이콘은 다를 수 있음

**로직**:
```typescript
// TabItem/Lounge 안에 Icon/Friends가 있으면
TabItem/Lounge (자식: Icon/Friends) → TabItem/Friends

// 2차 패스로 실행 (직접 변환 후)
// 자식 Icon/* 이름이 먼저 적용된 후에 부모 TabItem 이름 유추
```

**적용 시점**: 직접 변환 적용 후 2차 패스

### 4. camelCase 방어 로직

> **문제**: `redDot`, `myPage` 같은 camelCase는 네이밍 컨벤션 위반

**변환**:
```typescript
'redDot' → 'RedDot'
'myPageButton' → 'MyPageButton'
'iconContainer' → 'IconContainer'
```

**감지 조건**:
- 첫 글자가 소문자
- 나머지에 대문자 포함

### 5. 자식 키워드 기반 Section 이름 추론

> **핵심 결정**: 일반 이름(details, container)을 자식 키워드로 의미 있는 이름으로 변환

**문제 사례**:
```
details (자식: Challenge Header, Challenge List)
  → 실제 역할: "참여 중인 챌린지 카드 영역"
  → 적절한 이름: Section/ActiveChallenge
```

**일반 이름 목록** (변환 대상):
```typescript
const GENERIC_NAMES = [
  'details', 'container', 'content', 'wrapper', 'box',
  'frame', 'group', 'section', 'area', 'block', 'item',
  'element', 'view', 'panel', 'row', 'column', 'cell',
  'inner', 'outer', 'main', 'sub', 'left', 'right',
  'top', 'bottom', 'header', 'body', 'footer',
];
```

**도메인 키워드** (자식에서 추출):
```typescript
const DOMAIN_KEYWORDS = [
  'Challenge', 'Feed', 'Profile', 'Notification', 'Message',
  'Chat', 'User', 'Friend', 'Mission', 'Achievement', 'Ranking',
  'Shop', 'Settings', 'Home', 'Search', 'Video', 'Photo',
  'Comment', 'Like', 'Share', 'Progress', 'Weekly', 'Daily',
];
```

**컨텍스트 키워드** (조상/위치에서 추출):
| 컨텍스트 | 힌트 키워드 |
|---------|-----------|
| Active | active, current, ongoing, 참여, 진행 |
| Join | join, available, new, 가입, 신규 |
| Completed | completed, done, finished, 완료 |
| Featured | featured, recommended, hot, 추천, 인기 |
| My | my, mine, 나의, 내 |
| Weekly | weekly, week, 주간 |
| Daily | daily, day, 일간, 오늘 |

**추론 로직**:
```
1. 자식에서 도메인 키워드 빈도 카운트 (2단계 깊이)
2. 조상에서 컨텍스트 힌트 검색
3. 형제 중 첫 번째면 Active로 추정
4. Section/{Context}{Domain} 생성
```

**결과 예시**:
```
details (in Main Content, 첫 번째 자식)
  → 자식에서 "Challenge" 키워드 5회 발견
  → 형제 중 첫 번째 → Active 컨텍스트
  → 결과: Section/ActiveChallenge

content (in Join Tab)
  → 자식에서 "Challenge" 키워드 3회 발견
  → 부모에 "join" 키워드 발견 → Join 컨텍스트
  → 결과: Section/JoinChallenge
```

### 6. 제외 조건

**네이밍하지 않는 노드**:

```typescript
// 노드 타입
const EXCLUDED_NODE_TYPES = [
  'VECTOR', 'ELLIPSE', 'LINE', 'RECTANGLE',
  'BOOLEAN_OPERATION', 'STAR', 'POLYGON',
];

// 상태값 이름 (대소문자 무시)
const EXCLUDED_STATE_NAMES = [
  'on', 'off', 'active', 'inactive', 'disabled', 'enabled',
  'selected', 'unselected', 'hover', 'pressed', 'focus',
  'default', 'normal', 'checked', 'unchecked',
];
```

**이유**:
- 벡터/도형: 구조적 요소, 네이밍 불필요
- 상태값: 컴포넌트 variant 표현, 변경하면 안 됨

---

## 처리 흐름 요약

```
┌─────────────────────────────────────────────────────────────┐
│                    handleNamingAgent()                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. 모든 노드 수집 (재귀, depth 무제한)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. 제외 조건 필터링 (벡터, 상태값)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. 직접 변환 시도 (tryDirectNaming)                          │
│     ├─ 아이콘 라이브러리 → Icon/Xxx                           │
│     ├─ 하이픈 패턴 → Icon/Xxx                                │
│     ├─ 한글 레이블 → TabItem/Xxx 또는 Xxx                     │
│     ├─ camelCase → PascalCase                               │
│     └─ 일반 이름 + 자식 키워드 → Section/Xxx                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. 2차 패스: TabItem 자식 아이콘 기반 이름 유추               │
│     └─ TabItem/Lounge (자식: Icon/Friends) → TabItem/Friends │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. AI 분석 (직접 변환 불가 + 시맨틱 이름 없는 FRAME만)        │
│     └─ Agent Server → Claude Vision → 컴포넌트 타입 추론     │
└─────────────────────────────────────────────────────────────┘
```

---

## 핵심 설계 결정 기록

### 결정 1: Rule-based 네이밍 삭제

**배경**: Rule-based와 AI 네이밍이 분리되어 있어 혼란

**결정**: Rule-based 삭제, AI 네이밍에 직접 변환 로직 통합

**이유**:
- 단일 진입점으로 사용성 향상
- 명확한 패턴은 직접 변환으로 비용 절감
- 복잡한 판단만 AI에 위임

### 결정 2: 자식 기반 Section 추론

**배경**: `details`, `container` 같은 일반 이름이 의미 없음

**결정**: 자식 키워드로 도메인 추출, 조상에서 컨텍스트 추출

**이유**:
- 같은 챌린지 카드라도 Active/Join 등 구분 가능
- 전체 범위에서 일관된 네이밍 가능
- AI 호출 없이 룰 베이스로 처리 가능

### 결정 3: 2차 패스 TabItem 유추

**배경**: 원본 탭이 모두 "라운지"로 동일해도 자식 아이콘은 다름

**결정**: 직접 변환 후 2차 패스로 TabItem 이름 유추

**이유**:
- 자식 Icon/* 이 먼저 변환되어야 부모 이름 유추 가능
- 순서 의존성 해결

### 결정 4: camelCase 방어

**배경**: `redDot` 같은 camelCase는 네이밍 컨벤션 위반

**결정**: camelCase 감지 시 PascalCase로 자동 변환

**이유**:
- 일관된 네이밍 컨벤션 유지
- 개발자 실수 방어

---

## 개선 예정

- [ ] 컴포넌트 라이브러리 학습 (프로젝트별 커스텀)
- [ ] 배치 처리 최적화 (단일 스크린샷에 여러 노드)
- [ ] 캐싱으로 동일 스크린샷 재처리 방지
- [ ] 사용자 피드백 기반 학습
- [ ] Section 컨텍스트 추론 정확도 향상
- [ ] 도메인 키워드 확장 (프로젝트별)
