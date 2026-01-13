# Naming Agent (네이밍 추론)

## 개요

| 항목 | 내용 |
|------|------|
| **타입** | LLM 추론 |
| **역할** | 스크린샷 분석하여 시맨틱 컴포넌트 이름 추론 |
| **실행 순서** | 4번째 (간격 표준화 후) |
| **소스 파일** | `agent-server/src/agents/naming.ts` |
| **API 엔드포인트** | `POST /agents/naming` |

## 목적

시각적 분석을 통해:
- 컴포넌트 타입 식별 (Button, Input, Avatar 등)
- Variant 식별 (Primary, Secondary, Outline 등)
- Size 식별 (XS, SM, MD, LG, XL)
- 시맨틱 이름 생성 (`Button/Primary/MD`)

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

## 개선 예정

- [ ] 컴포넌트 라이브러리 학습 (프로젝트별 커스텀)
- [ ] 배치 처리 최적화 (단일 스크린샷에 여러 노드)
- [ ] 캐싱으로 동일 스크린샷 재처리 방지
- [ ] 사용자 피드백 기반 학습
