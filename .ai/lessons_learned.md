# Lessons Learned

> 버그 패턴 및 실수 방지 기록 (WHAT)
>
> **결정사항(WHY)은 `MEMORY.md` 참조**

---

## Naming 버그 패턴

### 1. Layout 타입 사용
```typescript
// ❌ 잘못된 예
"Layout/Main"

// ✅ 올바른 예
"TopBar/Main" 또는 "Section/Main"
```

### 2. Purpose 누락
```typescript
// ❌ 잘못된 예
"Button/Primary"

// ✅ 올바른 예
"Button/CTA/Primary"
```

### 3. Container에 Size 적용
```typescript
// ❌ 잘못된 예
"Container/ButtonArea/LG"

// ✅ 올바른 예
"Container/ButtonArea"
```

---

## AutoLayout 버그 패턴

### 1. 레이어 순서 뒤바뀜
**문제**: Figma의 children(레이어 순서)과 시각적 순서가 다름

```typescript
// ❌ 잘못된 예
for (const child of frame.children) { ... }

// ✅ 올바른 예 - 시각적 순서로 정렬 후 처리
function sortByVisualOrder(children, direction) {
  return [...children].sort((a, b) => {
    if (direction === 'VERTICAL') {
      return a.y - b.y || a.x - b.x;
    } else {
      return a.x - b.x || a.y - b.y;
    }
  });
}

const sorted = sortByVisualOrder(frame.children, direction);
sorted.forEach((child, i) => frame.insertChild(i, child));
```

---

## Cleanup 버그 패턴

### 1. 좌표 계산 버그
**문제**: 래퍼 제거 시 자식 위치 잘못 계산

```typescript
// ❌ 잘못된 코드 - 상대 좌표 무시
child.x = wrapper.x;
child.y = wrapper.y;

// ✅ 올바른 코드 - 절대 좌표 = 래퍼 + 상대
var absoluteX = wrapper.x + child.x;
var absoluteY = wrapper.y + child.y;
child.x = absoluteX;
child.y = absoluteY;
```

### 2. 삭제된 노드 접근 에러
**문제**: 재귀 탐색 중 노드가 삭제되어 에러 발생

```typescript
// ✅ 방어 코드
function isNodeValid(n) {
  try {
    return n.parent !== null;
  } catch {
    return false;
  }
}

// children 배열 복사 후 순회
for (const child of [...n.children]) {
  if (isNodeValid(child)) traverse(child);
}
```

### 3. 자식 좌표 비정상으로 인한 언래핑 오류
**문제**: 자식 좌표가 부모 범위를 벗어나면 `unwrapNode`에서 잘못된 위치 계산

```typescript
// ✅ 해결 - 좌표 검증 추가
if (child.x < -50 || child.y < -50 ||
    child.x > wrapper.width + 50 || child.y > wrapper.height + 50) {
  console.log('[unwrapNode] 스킵: 자식 좌표 비정상');
  return null;
}
```

**증상**: 래퍼 제거 후 프레임 height가 비정상적으로 커짐 (예: 395→1284)

### 4. detachInstance 후 크기 변경
**문제**: `detachInstance()` 후 내부 constraints가 풀리면서 크기 변경

```typescript
// ✅ 해결 - 원래 크기 저장 및 복원
const originalWidth = node.width;
const originalHeight = node.height;
const detachedFrame = node.detachInstance();

if (Math.abs(detachedFrame.width - originalWidth) > 1) {
  detachedFrame.resize(originalWidth, originalHeight);
}
```

**증상**: 아이콘 인스턴스가 detach 후 5배로 확대됨 (예: 21.6→108)

### 5. 중첩된 보조 레이어로 인한 크기 확장
**문제**: 컴포넌트 내부에 Ratio, Shape 등 부모보다 큰 자식이 있으면 detach 후 프레임이 확장됨

**증상**: Icon/Normal/Search (21.6x20) → detach 후 108x20으로 확장

```typescript
// ✅ 해결 - 원본 크기 기준으로 모든 자식 스케일링
function cleanupAndScaleOversizedChildren(parent, targetWidth, targetHeight) {
  for (const child of parent.children) {
    const exceedsTarget = child.width > targetWidth || child.height > targetHeight;

    if (isAuxiliary(child) && exceedsTarget) {
      child.remove();  // 보조 레이어는 삭제
    } else if (exceedsTarget) {
      // 일반 레이어는 스케일 다운
      const scale = Math.min(targetWidth / child.width, targetHeight / child.height);
      scaleNodeRecursively(child, scale, scale);
    }
  }
}
```

---

## 공통 버그 패턴

### 1. ES6+ 문법 호환성
**문제**: Figma 플러그인 런타임에서 일부 ES6+ 미지원

```typescript
// ❌ 사용 불가
const { a, ...rest } = obj;
obj?.prop?.value;

// ✅ 대체
const a = obj.a;
(obj && obj.prop && obj.prop.value);
```

**해결**: esbuild 타겟 `es6` 사용

### 2. 빌드 위치 혼동
**문제**: Figma 플러그인 코드 수정 후 `agent-server/`에서 빌드 실행

```bash
# ❌ 잘못된 빌드
cd agent-server && npm run build  # Agent Server만 빌드됨

# ✅ 올바른 빌드
cd /project-root && npm run build  # Figma 플러그인 빌드
```

### 3. base64 이미지 prefix
**문제**: Claude API는 순수 base64만 받음

```typescript
// ✅ prefix 제거
function cleanBase64(data) {
  if (data.startsWith('data:image')) {
    return data.split(',')[1];
  }
  return data;
}
```

### 4. 중첩 인스턴스 미처리
**문제**: `detachInstance()` 후 children 재귀 처리 누락

```typescript
// ✅ 올바른 코드
const frame = instance.detachInstance();
for (const child of frame.children) {
  if (child.type === 'INSTANCE') {
    processInstance(child);  // 재귀 처리
  }
}
```

### 5. manifest networkAccess 포맷
**문제**: Figma 플러그인 manifest 설정 오류

```json
// ❌ 잘못된 포맷
"networkAccess": ["localhost"]

// ✅ 올바른 포맷
"networkAccess": {
  "allowedDomains": ["none"],
  "devAllowedDomains": ["localhost"],
  "reasoning": "Agent Server 통신"
}
```

---

## 체크리스트

### 네이밍 작업 전
- [ ] Layout 타입 사용하지 않았는가?
- [ ] 모든 컴포넌트에 Purpose가 있는가?
- [ ] Size가 적용 가능한 컴포넌트에만 적용했는가?

### 코드 수정 전
- [ ] 해당 파일을 먼저 읽었는가?
- [ ] ES6+ 전용 문법 사용하지 않았는가?

### Cleanup 작업 전
- [ ] 좌표 계산에서 절대/상대 구분했는가?
- [ ] children 배열 복사 후 순회하는가?

---

## AI Agent 버그 패턴

### 1. max_tokens 부족으로 JSON 파싱 실패
**문제**: 100+ 노드 처리 시 응답이 잘려서 `Failed to parse response as array`

```typescript
// ❌ 기본값 부족
max_tokens: 8192

// ✅ 대량 노드용
max_tokens: 32768
```

**증상**: JSON 응답이 중간에 잘림 (`"nodeId": "14436:7119` 로 끝남)

### 2. 대량 토큰 요청 시 SDK 타임아웃
**문제**: max_tokens가 크면 SDK가 10분 이상 걸릴 것으로 예측하고 에러

```typescript
// ❌ 일반 요청
const response = await client.messages.create({ max_tokens: 32768, ... });

// ✅ 스트리밍 사용
const stream = client.messages.stream({ max_tokens: 32768, ... });
let fullText = '';
for await (const event of stream) {
  if (event.type === 'content_block_delta') {
    fullText += event.delta.text;
  }
}
```

**에러 메시지**: `Streaming is strongly recommended for operations that may token longer than 10 minutes`

### 3. 후처리에서 "원래 이름" vs "AI 제안 이름" 혼동
**문제**: 부모-자식 동일 이름 검사 시 원래 부모 이름과 비교하면 작동 안 함

```typescript
// ❌ 잘못된 로직 - 원래 부모 이름과 비교
const parentName = node.parentName;  // "header" (원래 이름)
if (suggestedName === parentName) { ... }  // "Header/Main" !== "header"

// ✅ 올바른 로직 - 부모의 AI 제안 이름과 비교
const parentSuggestedName = suggestedNameMap.get(parentNodeId);  // "Header/Main"
if (suggestedName === parentSuggestedName) { ... }  // "Header/Main" === "Header/Main" ✓
```

**핵심**: 후처리 로직은 항상 **변환 후** 데이터 기준으로 설계

### 4. API 비용 예측
| 노드 수 | 입력 토큰 | 출력 토큰 | 예상 비용 |
|---------|-----------|-----------|-----------|
| 50개 | ~7K | ~5K | ~$0.10 |
| 100개 | ~12K | ~10K | ~$0.18 |
| 150개 | ~15K | ~15K | ~$0.27 |

**교훈**: 테스트는 작은 프레임(30~50노드)으로 먼저 검증

---

## 변경 이력

| 날짜 | 도메인 | 내용 |
|------|--------|------|
| 2025-01-14 | Naming | Layout 타입 금지 |
| 2025-01-15 | Naming | Purpose 필수화 |
| 2025-01-15 | Cleanup | 크기 조건 제거 |
| 2026-01-15 | 공통 | 빌드 위치 혼동 패턴 추가 |
| 2026-01-15 | Cleanup | 자식 좌표 검증 추가 |
| 2026-01-15 | Component Break | 크기 복원 로직 추가 |
| 2026-01-15 | Component Break | 중첩 보조 레이어 스케일링 추가 |
| 2026-01-15 | 문서 | 가이드 기준 역할 분리 (결정→MEMORY, 버그→여기) |
| 2026-01-16 | AI Agent | max_tokens 부족 패턴 추가 |
| 2026-01-16 | AI Agent | 스트리밍 필수 패턴 추가 |
| 2026-01-16 | AI Agent | 후처리 원래/제안 이름 혼동 패턴 추가 |
| 2026-01-16 | AI Agent | API 비용 예측 가이드 추가 |
