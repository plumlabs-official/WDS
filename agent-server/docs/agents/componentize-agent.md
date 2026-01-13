# Componentize Agent (컴포넌트화)

## 개요

| 항목 | 내용 |
|------|------|
| **타입** | 하이브리드 (룰 베이스 + LLM 추론) |
| **역할** | 반복되는 요소를 감지하고 컴포넌트로 변환 |
| **실행 순서** | 5번째 (네이밍 후, 선택적) |
| **소스 파일** | `src/modules/componentize.ts` |
| **API 엔드포인트** | 추후 구현 예정 |

## 목적

- 반복되는 UI 요소 자동 감지
- 컴포넌트 후보 제안
- Figma 컴포넌트로 변환
- 디자인 시스템 일관성 확보

## 하이브리드 구조

```
┌──────────────────────────────────────────────────────────┐
│                  Componentize Agent                       │
├────────────────────────┬─────────────────────────────────┤
│    룰 베이스 파트       │         LLM 추론 파트            │
├────────────────────────┼─────────────────────────────────┤
│ • 구조적 유사도 계산    │ • "이게 컴포넌트화할 가치가      │
│ • 시그니처 해시 생성    │    있는가?" 판단                │
│ • 반복 횟수 카운트      │ • 컴포넌트 이름 제안            │
│ • 크기/레이아웃 비교    │ • 변형(Variant) 그룹핑 제안     │
└────────────────────────┴─────────────────────────────────┘
```

## 입력/출력

### 입력
```typescript
interface ComponentizeInput {
  selection: SceneNode[];
  options: {
    minOccurrences: number;  // 최소 반복 횟수 (기본: 2)
    autoConvert: boolean;    // 자동 변환 여부
  };
}
```

### 출력
```typescript
interface ComponentizeOutput {
  success: boolean;
  message: string;
  details?: {
    candidatesFound: number;
    candidates: Array<{
      name: string;           // 제안된 컴포넌트 이름
      count: number;          // 반복 횟수
      frames: string[];       // 해당 프레임 ID들
      componentType: string;  // 컴포넌트 타입
    }>;
    componentsCreated?: number;
  };
}
```

## Part 1: 룰 베이스 (구조 분석)

### 구조 시그니처 생성

실제 구현에서는 문자열 기반 시그니처 사용:

```typescript
function generateStructureSignature(node: FrameNode): string {
  const parts: string[] = [];

  // 기본 속성 (정수로 반올림)
  parts.push(`w:${Math.round(node.width)}`);
  parts.push(`h:${Math.round(node.height)}`);
  parts.push(`layout:${node.layoutMode}`);

  // cornerRadius
  if (typeof node.cornerRadius === 'number') {
    parts.push(`radius:${node.cornerRadius}`);
  }

  // 자식 구조 (타입 정렬 후 조인)
  const childTypes = node.children.map(c => c.type).sort().join(',');
  parts.push(`children:${childTypes}`);

  // 자식 개수
  parts.push(`count:${node.children.length}`);

  // fills 타입 (visible한 것만)
  if (Array.isArray(node.fills)) {
    const fillTypes = node.fills
      .filter(f => f.visible !== false)
      .map(f => f.type)
      .join(',');
    parts.push(`fills:${fillTypes}`);
  }

  return parts.join('|');
}

// 시그니처 예시:
// "w:343|h:48|layout:HORIZONTAL|radius:28|children:TEXT|count:1|fills:SOLID"
```

### 유사도 비교

```typescript
function areFramesSimilar(a: FrameNode, b: FrameNode): boolean {
  const tolerance = 5; // px

  // 크기 비교
  if (Math.abs(a.width - b.width) > tolerance) return false;
  if (Math.abs(a.height - b.height) > tolerance) return false;

  // 레이아웃 비교
  if (a.layoutMode !== b.layoutMode) return false;

  // 자식 구조 비교
  if (a.children.length !== b.children.length) return false;

  const aChildTypes = a.children.map(c => c.type).join(',');
  const bChildTypes = b.children.map(c => c.type).join(',');
  if (aChildTypes !== bChildTypes) return false;

  return true;
}
```

### 후보 그룹핑

```typescript
function groupSimilarFrames(frames: FrameNode[]) {
  const groups = new Map<string, FrameNode[]>();

  for (const frame of frames) {
    const signature = generateStructureSignature(frame);

    if (groups.has(signature)) {
      groups.get(signature)!.push(frame);
    } else {
      groups.set(signature, [frame]);
    }
  }

  return groups;
}
```

## Part 2: LLM 추론 (의미 분석)

### 컴포넌트화 가치 판단

```markdown
## 프롬프트

다음 반복 요소가 컴포넌트화할 가치가 있는지 판단해주세요.

### 판단 기준
1. 재사용성: 다른 화면에서도 사용될 가능성
2. 일관성: 동일한 디자인 패턴인지
3. 복잡도: 단순 래퍼가 아닌 의미 있는 구조인지

### 반복 요소 정보
- 반복 횟수: {{count}}회
- 컴포넌트 타입: {{type}}
- 크기: {{width}} x {{height}}
- 스크린샷: [이미지]

### 응답 형식
```json
{
  "shouldComponentize": true,
  "reason": "버튼으로 여러 화면에서 재사용 가능",
  "suggestedName": "Button/Primary/MD",
  "variants": ["enabled", "disabled", "loading"]
}
```
```

### Variant 그룹핑 제안

```markdown
## 프롬프트

다음 유사 요소들이 같은 컴포넌트의 Variant인지 판단해주세요.

### 요소들
1. [스크린샷 1] - 이름: Button/Primary/MD
2. [스크린샷 2] - 이름: Button/Secondary/MD
3. [스크린샷 3] - 이름: Button/Outline/MD

### 응답 형식
```json
{
  "isSameComponent": true,
  "componentName": "Button",
  "variants": [
    { "name": "Primary", "description": "주요 액션" },
    { "name": "Secondary", "description": "보조 액션" },
    { "name": "Outline", "description": "테두리만" }
  ]
}
```
```

## 컴포넌트 변환 로직

### 프레임 → 컴포넌트

```typescript
function convertToComponent(frame: FrameNode, name: string): ComponentNode {
  // 1. 새 컴포넌트 생성
  const component = figma.createComponent();
  component.name = name;

  // 2. 크기 복사
  component.resize(frame.width, frame.height);

  // 3. 스타일 복사
  component.fills = clone(frame.fills);
  component.strokes = clone(frame.strokes);
  component.effects = clone(frame.effects);
  component.cornerRadius = frame.cornerRadius;

  // 4. 레이아웃 복사
  component.layoutMode = frame.layoutMode;
  component.itemSpacing = frame.itemSpacing;
  component.paddingTop = frame.paddingTop;
  // ... 나머지 패딩

  // 5. 자식 이동
  for (const child of frame.children.slice()) {
    component.appendChild(child);
  }

  // 6. 위치 설정 및 원본 교체
  component.x = frame.x;
  component.y = frame.y;

  // 7. 원본을 인스턴스로 교체
  const instance = component.createInstance();
  frame.parent?.insertChild(
    frame.parent.children.indexOf(frame),
    instance
  );
  frame.remove();

  return component;
}
```

## 실행 모드

### 미리보기 모드 (autoConvert: false)

```
1. 반복 요소 탐지
2. 후보 목록 생성
3. 콘솔에 출력 (변환 없음)
```

### 변환 모드 (autoConvert: true)

```
1. 반복 요소 탐지
2. 후보 목록 생성
3. 각 후보를 컴포넌트로 변환
4. 원본을 인스턴스로 교체
```

## 사용 예시

### Figma 플러그인에서

```
[미리보기]
1. 분석할 영역 선택
2. "컴포넌트 후보 탐지" 실행
3. 콘솔에서 후보 확인

[변환]
1. 분석할 영역 선택
2. "컴포넌트로 변환" 실행
3. 생성된 컴포넌트 확인
```

### 프로그래매틱

```typescript
import { componentizeSelection } from './modules/componentize';

// 미리보기
const preview = componentizeSelection({
  minOccurrences: 2,
  autoConvert: false,
});
console.log(preview.details.candidates);

// 변환
const result = componentizeSelection({
  minOccurrences: 2,
  autoConvert: true,
});
console.log(`${result.details.componentsCreated}개 컴포넌트 생성됨`);
```

## 판단 기준

### 컴포넌트화 권장

| 조건 | 설명 |
|------|------|
| 반복 3회 이상 | 재사용성 높음 |
| 복잡한 구조 | 자식 2개 이상 |
| 인터랙티브 요소 | Button, Input 등 |
| 일관된 스타일 | 동일한 색상/크기 |

### 컴포넌트화 비권장

| 조건 | 설명 |
|------|------|
| 반복 1회 | 재사용성 없음 |
| 단순 래퍼 | 자식 1개, 스타일 없음 |
| 컨테이너 | Container, Frame 타입 |
| 크기 불일치 | 같은 구조지만 크기 다름 |

## 리포트 생성

컴포넌트 후보 리포트를 텍스트로 출력:

```typescript
function generateComponentReport(node: SceneNode): string {
  const result = detectComponentCandidates(node);

  if (result.candidates.length === 0) {
    return '반복되는 요소가 없습니다.';
  }

  const lines: string[] = [
    '=== 컴포넌트 후보 리포트 ===',
    `총 프레임 수: ${result.totalFrames}`,
    `후보 그룹 수: ${result.candidates.length}`,
    '',
  ];

  for (const candidate of result.candidates) {
    lines.push(`[${candidate.suggestedName}] - ${candidate.count}회 반복`);
    lines.push(`  타입: ${candidate.componentType}`);
    lines.push(`  대표 크기: ${candidate.frames[0].width} x ${candidate.frames[0].height}`);
    lines.push('');
  }

  return lines.join('\n');
}
```

### 출력 예시

```
=== 컴포넌트 후보 리포트 ===
총 프레임 수: 156
후보 그룹 수: 8

[Button/Primary/MD] - 12회 반복
  타입: Button
  대표 크기: 343 x 48

[Avatar/LG] - 8회 반복
  타입: Avatar
  대표 크기: 56 x 56

[Icon/SM] - 45회 반복
  타입: Icon
  대표 크기: 16 x 16
```

## 핵심 함수 목록

| 함수 | 역할 | 위치 |
|------|------|------|
| `generateStructureSignature(node)` | 프레임의 구조적 시그니처 생성 | componentize.ts |
| `areFramesSimilar(a, b, tolerance)` | 두 프레임의 유사도 비교 | componentize.ts |
| `groupSimilarFrames(frames)` | 유사한 프레임 그룹화 | componentize.ts |
| `collectAllFrames(node)` | 모든 프레임 재귀 수집 | componentize.ts |
| `detectComponentCandidates(node, min)` | 컴포넌트 후보 탐지 | componentize.ts |
| `convertToComponent(frame, name)` | 프레임 → 컴포넌트 변환 | componentize.ts |
| `componentizeSelection(options)` | 선택 영역 컴포넌트화 (진입점) | componentize.ts |
| `generateComponentReport(node)` | 후보 리포트 텍스트 생성 | componentize.ts |

## 개선 예정

- [ ] LLM 기반 Variant 자동 그룹핑
- [ ] 컴포넌트 세트 생성 (Variant 포함)
- [ ] 기존 컴포넌트와 매칭 (중복 방지)
- [ ] 컴포넌트 문서 자동 생성
