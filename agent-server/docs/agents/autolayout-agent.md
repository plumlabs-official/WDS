# AutoLayout Agent (레이아웃 추론)

## 개요

| 항목 | 내용 |
|------|------|
| **타입** | LLM 추론 |
| **역할** | 스크린샷 분석하여 최적의 Auto Layout 설정 추론 |
| **실행 순서** | 2번째 (래퍼 제거 후) |
| **소스 파일** | `agent-server/src/agents/autolayout.ts` |
| **API 엔드포인트** | `POST /agents/autolayout` |

## 목적

시각적 맥락을 분석하여:
- 레이아웃 방향 (HORIZONTAL / VERTICAL) 추론
- 자식 요소 간 gap 추론
- 컨테이너 padding 추론

## 왜 LLM인가?

### 룰 베이스의 한계

```
Case 1: 좌표 기반 판단 실패
┌────────────────────────────┐
│  [A]      [B]      [C]     │  ← 가로 배열처럼 보이지만
│                            │     실제로는 자유 배치
│           [D]              │
└────────────────────────────┘

Case 2: 시각적 그룹핑
┌────────────────────────────┐
│  ┌──────┐    ┌──────────┐  │
│  │ Icon │    │  Title   │  │  ← 시각적으로는 가로 배열
│  └──────┘    │  Subtitle│  │     하지만 우측은 세로 그룹
│              └──────────┘  │
└────────────────────────────┘
```

### LLM의 장점

- 시각적 맥락 이해
- 디자인 패턴 인식
- 의도 파악 (단순 좌표가 아닌 "의미")

## 입력/출력

### 입력
```typescript
interface AutoLayoutRequest {
  nodeId: string;
  screenshot: string;  // base64 PNG
  children: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}
```

### 출력
```typescript
interface AutoLayoutResult {
  direction: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  gap: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  reasoning: string;
}
```

## 시스템 프롬프트

```markdown
당신은 UI 레이아웃 분석 전문가입니다.
주어진 Figma 프레임 스크린샷과 자식 요소 위치 정보를 분석하여
최적의 Auto Layout 설정을 제안해주세요.

## 분석 기준

### Direction (방향)
- HORIZONTAL: 자식들이 가로로 나열됨
- VERTICAL: 자식들이 세로로 나열됨
- NONE: Auto Layout이 적합하지 않음 (겹치는 요소, 자유 배치 등)

### Gap (간격)
- 자식 요소 간 일관된 간격 추론
- 디자인 토큰 기준: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48

### Padding
- 컨테이너와 자식 사이 여백
- 디자인 토큰 기준: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48

## 자식 요소 위치 정보
{{childrenInfo}}

## 응답 형식 (JSON)
```json
{
  "direction": "VERTICAL",
  "gap": 16,
  "paddingTop": 24,
  "paddingRight": 16,
  "paddingBottom": 24,
  "paddingLeft": 16,
  "reasoning": "자식 요소들이 세로로 일정한 간격(약 16px)으로 배치되어 있음"
}
```
```

## 판단 기준

### Direction 결정

| 패턴 | 결과 | 설명 |
|------|------|------|
| 자식들이 수평 정렬 | HORIZONTAL | 좌→우 배열 |
| 자식들이 수직 정렬 | VERTICAL | 상→하 배열 |
| 자식들이 겹침 | NONE | 자유 배치 |
| 단일 자식 | VERTICAL | 기본값 |

### Gap 추론

```
스크린샷에서 관찰:
┌─────────────────────────────┐
│  [Child 1]                  │
│           ↕ ~16px           │
│  [Child 2]                  │
│           ↕ ~16px           │
│  [Child 3]                  │
└─────────────────────────────┘

→ gap: 16
```

### Padding 추론

```
┌─────────────────────────────┐
│ ← 24px →                    │
│    ┌───────────────────┐ ↑  │
│    │                   │ 32 │
│    │     Content       │ px │
│    │                   │ ↓  │
│    └───────────────────┘    │
│                    ← 24px → │
└─────────────────────────────┘

→ paddingLeft: 24, paddingRight: 24
→ paddingTop: 32, paddingBottom: 32
```

## Auto Layout 적용 불가 케이스

### NONE 반환 조건

1. **겹치는 요소**
   - 자식 요소들이 서로 겹침
   - 예: 오버레이, 뱃지 위치

2. **복잡한 그리드**
   - 단순 1차원 배열이 아닌 경우
   - 예: 2x2 그리드 (별도 처리 필요)

3. **앵커 기반 배치**
   - 특정 위치에 고정된 요소
   - 예: 우측 하단 FAB 버튼

## API 사용 예시

### Request
```bash
curl -X POST http://localhost:3001/agents/autolayout \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "123:456",
    "screenshot": "base64...",
    "children": [
      {"id": "1", "x": 16, "y": 24, "width": 343, "height": 48},
      {"id": "2", "x": 16, "y": 88, "width": 343, "height": 48}
    ]
  }'
```

### Response
```json
{
  "success": true,
  "data": {
    "direction": "VERTICAL",
    "gap": 16,
    "paddingTop": 24,
    "paddingRight": 16,
    "paddingBottom": 24,
    "paddingLeft": 16,
    "reasoning": "두 자식 요소가 세로로 16px 간격으로 배치됨. 좌우 여백 16px, 상단 24px."
  }
}
```

## Spacing Agent와 연계

AutoLayout Agent 출력 → Spacing Agent 입력

```typescript
// AutoLayout Agent 결과
{ gap: 15, paddingTop: 23, ... }

// Spacing Agent가 토큰 값으로 정규화
{ gap: 16, paddingTop: 24, ... }
```

## 폴백 로직 (룰 베이스)

LLM 추론 실패 시 플러그인의 룰 베이스 로직 사용:

### detectLayoutDirection (방향 판단)

```typescript
function detectLayoutDirection(node: FrameNode): 'HORIZONTAL' | 'VERTICAL' {
  const children = node.children;

  if (children.length < 2) {
    return 'VERTICAL';  // 자식 1개 이하면 기본값
  }

  // 첫 두 자식의 위치 비교
  const first = children[0];
  const second = children[1];

  const horizontalDiff = Math.abs(first.x - second.x);
  const verticalDiff = Math.abs(first.y - second.y);

  // 수평 차이가 더 크면 HORIZONTAL
  return horizontalDiff > verticalDiff ? 'HORIZONTAL' : 'VERTICAL';
}
```

### calculateAverageGap (간격 계산)

```typescript
function calculateAverageGap(node: FrameNode, direction): number {
  const children = node.children;
  if (children.length < 2) return 8;  // 기본값

  let totalGap = 0;
  let gapCount = 0;

  for (let i = 0; i < children.length - 1; i++) {
    const current = children[i];
    const next = children[i + 1];

    const gap = direction === 'HORIZONTAL'
      ? next.x - (current.x + current.width)   // 가로 간격
      : next.y - (current.y + current.height); // 세로 간격

    if (gap > 0) {
      totalGap += gap;
      gapCount++;
    }
  }

  return gapCount === 0 ? 8 : Math.round(totalGap / gapCount);
}
```

### calculatePadding (패딩 계산)

```typescript
function calculatePadding(node: FrameNode): {
  top: number; right: number; bottom: number; left: number;
} {
  // 모든 자식의 바운딩 박스 계산
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const child of node.children) {
    minX = Math.min(minX, child.x);
    minY = Math.min(minY, child.y);
    maxX = Math.max(maxX, child.x + child.width);
    maxY = Math.max(maxY, child.y + child.height);
  }

  return {
    top: Math.max(0, minY),
    right: Math.max(0, node.width - maxX),
    bottom: Math.max(0, node.height - maxY),
    left: Math.max(0, minX),
  };
}
```

## 핵심 함수 목록 (플러그인)

| 함수 | 역할 | 위치 |
|------|------|------|
| `detectLayoutDirection(node)` | 자식 배치로 방향 판단 | autolayout.ts |
| `calculateAverageGap(node, direction)` | 자식 간 평균 간격 계산 | autolayout.ts |
| `calculatePadding(node)` | 부모-자식 간 패딩 계산 | autolayout.ts |
| `roundToNearestToken(value)` | 토큰 값으로 반올림 | autolayout.ts |
| `applyAutoLayout(node, options)` | 단일 프레임에 적용 | autolayout.ts |
| `applyAutoLayoutRecursive(node, options)` | 재귀 적용 | autolayout.ts |
| `applyAutoLayoutToSelection(options)` | 선택 영역 적용 (진입점) | autolayout.ts |

## 개선 예정

- [ ] 복잡한 레이아웃 지원 (그리드, 다중 축)
- [ ] alignment 추론 (start, center, end, space-between)
- [ ] wrap 여부 추론
- [ ] 캐싱으로 중복 API 호출 방지
