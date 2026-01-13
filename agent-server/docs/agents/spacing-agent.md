# Spacing Agent (간격 표준화)

## 개요

| 항목 | 내용 |
|------|------|
| **타입** | 룰 베이스 |
| **역할** | Auto Layout의 gap/padding을 디자인 토큰 값으로 표준화 |
| **실행 순서** | 3번째 (Auto Layout 적용 후) |
| **소스 파일** | `src/modules/spacing.ts` |

## 목적

- 일관된 간격 시스템 적용
- 비표준 값(예: 13px, 17px)을 토큰 값으로 정규화
- 디자인 시스템 준수 보장

## 입력/출력

### 입력
```typescript
interface SpacingInput {
  selection: SceneNode[];  // Auto Layout이 적용된 프레임들
}
```

### 출력
```typescript
interface SpacingOutput {
  success: boolean;
  message: string;
  details?: {
    changedFrames: number;
    allChanges: Array<{
      name: string;
      changes: string[];
    }>;
  };
}
```

## 디자인 토큰

### 허용된 Spacing 값
```typescript
const ALLOWED_SPACING = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const;
```

### 반올림 로직
```typescript
function roundToNearestToken(value: number): number {
  // 가장 가까운 토큰 값으로 반올림
  return ALLOWED_SPACING.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}
```

| 입력값 | 출력값 | 설명 |
|--------|--------|------|
| 0-2 | 0 | 0에 가까움 |
| 3-6 | 4 | 4에 가까움 |
| 7-10 | 8 | 8에 가까움 |
| 11-14 | 12 | 12에 가까움 |
| 15-18 | 16 | 16에 가까움 |
| 19-22 | 20 | 20에 가까움 |
| 23-28 | 24 | 24에 가까움 |
| 29-36 | 32 | 32에 가까움 |
| 37-44 | 40 | 40에 가까움 |
| 45-56 | 48 | 48에 가까움 |
| 57+ | 64 | 64에 가까움 |

## 판단 룰

### 표준화 대상

```
┌─────────────────────────────────────────────────────┐
│           standardizeFrameSpacing()                  │
├─────────────────────────────────────────────────────┤
│ 1. Auto Layout이 적용된 프레임만 대상                  │
│ 2. 다음 속성들을 토큰 값으로 변환:                      │
│    - itemSpacing (gap)                              │
│    - paddingTop                                     │
│    - paddingRight                                   │
│    - paddingBottom                                  │
│    - paddingLeft                                    │
└─────────────────────────────────────────────────────┘
```

### 처리 로직

```typescript
function standardizeFrameSpacing(node: FrameNode) {
  // Auto Layout이 아니면 스킵
  if (node.layoutMode === 'NONE') return;

  const changes: string[] = [];

  // Gap 표준화
  if (!isStandardSpacing(node.itemSpacing)) {
    const newGap = roundToNearestToken(node.itemSpacing);
    changes.push(`gap: ${node.itemSpacing} → ${newGap}`);
    node.itemSpacing = newGap;
  }

  // Padding 표준화
  ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].forEach(prop => {
    const value = node[prop];
    if (!isStandardSpacing(value)) {
      const newValue = roundToNearestToken(value);
      changes.push(`${prop}: ${value} → ${newValue}`);
      node[prop] = newValue;
    }
  });

  return changes;
}
```

## 예외 케이스

### 표준화하지 않는 경우

| 케이스 | 이유 |
|--------|------|
| Auto Layout 없음 | 적용 대상 아님 |
| 이미 토큰 값 | 변경 불필요 |
| 혼합 값 (Mixed) | 개별 처리 필요 |

## 사용 예시

### Figma 플러그인에서
```
1. Auto Layout이 적용된 프레임 선택
2. 플러그인 메뉴 > "간격 표준화" 실행
3. 변경된 값 확인
```

### 프로그래매틱
```typescript
import { standardizeSelectionSpacing } from './modules/spacing';

const result = standardizeSelectionSpacing();
// 결과: "5개 프레임의 간격이 표준화되었습니다."
```

## 리포트 생성

### 비표준 간격 현황
```typescript
import { generateSpacingReport } from './modules/spacing';

const report = generateSpacingReport(node);
// {
//   totalFrames: 50,
//   nonStandardFrames: 12,
//   issues: [
//     { name: "Card", property: "gap", value: 13, suggested: 12 },
//     { name: "Header", property: "paddingLeft", value: 15, suggested: 16 }
//   ]
// }
```

## Auto Layout Agent와 연계

```
┌─────────────────┐     ┌─────────────────┐
│ AutoLayout Agent│ ──► │  Spacing Agent  │
│ (LLM 추론)      │     │  (룰 베이스)     │
│                 │     │                 │
│ direction: V    │     │ gap: 15 → 16   │
│ gap: 15        │     │ padding: 정규화  │
└─────────────────┘     └─────────────────┘
```

AutoLayout Agent가 추론한 값을 Spacing Agent가 토큰 값으로 정규화합니다.

## 리포트 생성

비표준 간격 사용 현황을 분석하는 함수:

```typescript
function generateSpacingReport(node: SceneNode): {
  nonStandardValues: Map<number, { count: number; suggestion: number }>;
  totalAutoLayoutFrames: number;
}
```

### 사용 예시

```typescript
const report = generateSpacingReport(selectedNode);

// 결과 예시
// {
//   nonStandardValues: Map {
//     13 => { count: 5, suggestion: 12 },
//     17 => { count: 3, suggestion: 16 },
//     23 => { count: 2, suggestion: 24 }
//   },
//   totalAutoLayoutFrames: 42
// }
```

## 핵심 함수 목록

| 함수 | 역할 |
|------|------|
| `isStandardSpacing(value)` | 값이 토큰에 정의된 값인지 확인 |
| `standardizeFrameSpacing(node)` | 단일 프레임의 gap/padding 표준화 |
| `standardizeSpacingRecursive(node)` | 재귀적으로 모든 하위 프레임 표준화 |
| `standardizeSelectionSpacing()` | 선택된 노드들 표준화 (진입점) |
| `generateSpacingReport(node)` | 비표준 간격 사용 현황 리포트 |

## 개선 예정

- [ ] 커스텀 토큰 값 지원
- [ ] 반올림 전략 옵션 (올림/내림/반올림)
- [ ] 변경 전 미리보기 UI
