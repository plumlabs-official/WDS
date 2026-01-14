---
name: autolayout-agent
description: Figma Auto Layout 설정을 추론하는 LLM 에이전트. 스크린샷과 자식 요소 정보를 분석하여 direction, gap, padding, sizing을 결정합니다.
---

# AutoLayout Agent

## 개요

| 항목 | 내용 |
|------|------|
| **타입** | Hybrid (Rule-based + LLM) |
| **역할** | 스크린샷 분석하여 최적의 Auto Layout 설정 추론 |
| **실행 순서** | 3번째 (네이밍 후) |
| **문서** | `agent-server/docs/agents/autolayout-agent.md` |
| **구현** | `agent-server/src/agents/autolayout.ts` |
| **적용** | `src/code.ts` → `handleAutoLayoutResult()` |

---

## 절대 원칙 (반드시 준수)

### 1. 기존 디자인 100% 보존
- Auto Layout 적용 후 **현재 스크린샷과 완전히 동일한 모습**이어야 함
- 요소 위치, 크기, 순서가 바뀌면 안 됨
- 의심스러우면 FIXED/HUG 사용 (FILL 사용 자제)

### 2. 요소 순서 절대 유지
- 적용 전 **시각적 순서(y/x 좌표)로 레이어 재정렬**
- Figma children은 레이어 순서(z-index)이므로 시각적 순서와 다를 수 있음

### 3. 크기 유지 우선
- 기본값: `layoutAlign: INHERIT`, `layoutGrow: 0`
- STRETCH/layoutGrow:1은 정말 필요한 경우에만 사용

---

## FILL 사용 기준

### 사용하는 경우 (95% 이상 채울 때만)
- 입력 필드(Input): 너비가 부모 컨테이너에 거의 꽉 참
- 전체 너비 버튼: 너비가 부모와 거의 동일
- 구분선(Divider): 너비가 부모와 동일

### 사용하지 않는 경우
- 카드, 섹션: 고정 크기 유지 (여백이 있으면 FILL 아님)
- 아이콘, 아바타, 썸네일: 항상 FIXED
- 일반 버튼: 텍스트에 맞춤 (HUG)
- 개별 컴포넌트들: 대부분 고정 크기

---

## 입출력

### 요청 (Request)
```typescript
interface AutoLayoutRequest {
  nodeId: string;
  screenshot: string;          // base64 (prefix 자동 제거)
  width: number;
  height: number;
  calculatedDirection: string; // 룰 베이스 계산값
  calculatedGap: number;
  children: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}
```

### 응답 (Response)
```typescript
interface AutoLayoutResult {
  direction: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  gap: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  primaryAxisSizing: 'HUG' | 'FIXED';
  counterAxisSizing: 'HUG' | 'FIXED';
  childrenSizing: Array<{
    index: number;
    layoutAlign: 'INHERIT' | 'STRETCH';
    layoutGrow: 0 | 1;
    reasoning: string;
  }>;
  reasoning: string;
}
```

---

## 적용 로직 (code.ts)

```typescript
// 0. 자식을 시각적 순서로 재정렬 (핵심!)
const childrenWithPos = node.children.map(child => ({
  node: child,
  x: child.x,
  y: child.y,
}));

if (direction === 'VERTICAL') {
  childrenWithPos.sort((a, b) => a.y - b.y);
} else {
  childrenWithPos.sort((a, b) => a.x - b.x);
}

for (let i = 0; i < childrenWithPos.length; i++) {
  node.insertChild(i, childrenWithPos[i].node);
}

// 1. Auto Layout 적용
node.layoutMode = direction;
node.itemSpacing = gap;

// 2. 컨테이너 Sizing
node.primaryAxisSizingMode = primaryAxisSizing === 'HUG' ? 'AUTO' : 'FIXED';
node.counterAxisSizingMode = counterAxisSizing === 'HUG' ? 'AUTO' : 'FIXED';

// 3. 자식 Sizing 적용
for (const sizing of childrenSizing) {
  const child = node.children[sizing.index];
  child.layoutAlign = sizing.layoutAlign;
  child.layoutGrow = sizing.layoutGrow;
}
```

---

## 디자인 토큰

- **Gap/Padding**: 0, 4, 8, 12, 16, 24, 32, 64

---

## 트러블슈팅

### 요소 순서가 뒤바뀜
- **원인**: 레이어 순서 ≠ 시각적 순서
- **해결**: 적용 전 시각적 순서(y/x)로 레이어 재정렬

### 섹션이 FILL되어 크기 변경됨
- **원인**: LLM이 STRETCH/layoutGrow:1 잘못 적용
- **해결**: 프롬프트에 FILL 사용 조건 명확화 (95% 이상)

### 크기 변화 감지
- 적용 전후 크기 비교 (5px threshold)
- 변화 시 경고 알림

### base64 이미지 에러
- **원인**: `data:image/png;base64,` prefix 포함
- **해결**: `claude.ts`에서 prefix 자동 제거

---

## API 사용 예시

### Request
```bash
curl -X POST http://localhost:3001/agents/autolayout \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "123:456",
    "screenshot": "base64...",
    "width": 375,
    "height": 812,
    "calculatedDirection": "VERTICAL",
    "calculatedGap": 16,
    "children": [
      {"id": "1", "name": "Header", "x": 0, "y": 0, "width": 375, "height": 44},
      {"id": "2", "name": "Content", "x": 16, "y": 60, "width": 343, "height": 200}
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
    "paddingTop": 0,
    "paddingRight": 16,
    "paddingBottom": 0,
    "paddingLeft": 16,
    "primaryAxisSizing": "HUG",
    "counterAxisSizing": "FIXED",
    "childrenSizing": [
      {"index": 0, "layoutAlign": "STRETCH", "layoutGrow": 0, "reasoning": "Header는 전체 너비 사용"},
      {"index": 1, "layoutAlign": "INHERIT", "layoutGrow": 0, "reasoning": "Content는 현재 크기 유지"}
    ],
    "reasoning": "세로 방향 레이아웃, Header만 전체 너비"
  }
}
```
