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

### 6. 오프셋 래퍼 제거로 인한 레이아웃 붕괴 (2026-01-16)
**문제**: 자식이 원점(0,0)에서 떨어진 래퍼를 제거하면 좌표 오프셋 손실

**증상**: 래퍼 제거 후 프레임 height가 3배 이상 확장 (예: 814→2742)

```
전: Group 84 (y=124) → Group 85 (y=124, 상대)
    실제 위치: y=248

후: Group 85 (y=124) ← 오프셋 손실!
```

```typescript
// ❌ 문제 - 위치 오프셋 역할 래퍼도 제거됨
if (node.children.length === 1) return true;  // 너무 공격적

// ✅ 해결 - 자식이 원점 근처에 없으면 래퍼로 판단 안 함
if (frameChild.x > 5 || frameChild.y > 5) {
  console.log(`[isMeaninglessWrapper] 스킵: 자식이 원점에서 떨어져 있음`);
  return false;
}
```

**핵심**: 래퍼가 "위치 오프셋" 역할을 할 수 있음 → 자식이 (0,0)에 없으면 보존

### 7. Auto Layout 내부 빈 요소 제거로 레이아웃 깨짐 (2026-01-16)
**문제**: Auto Layout 프레임 내부의 빈 프레임 제거 시 형제 요소들이 재배치됨

**원인**: Auto Layout은 자식 변경 시 자동으로 재배치
1. `txt+count` (Auto Layout 프레임) 안에 `text`와 빈 `Frame 1430106950` 존재
2. `isEmptyFrame`이 빈 프레임 제거
3. Auto Layout 재배치로 text.x가 0 → 20.5로 변경

**증상**:
- 텍스트 정렬이 어긋남
- 패딩이 비정상적으로 변경된 것처럼 보임

```typescript
// ❌ 문제 - Auto Layout 부모 미고려
if (node.children.length === 0) return true;  // 빈 프레임으로 판단, 제거

// ✅ 해결 - Auto Layout 내부는 보존
var parent = node.parent;
if (parent && parent.type === 'FRAME' && parent.layoutMode !== 'NONE') {
  return false;  // 보존
}
```

**핵심**: Auto Layout 내부 요소 삭제는 레이아웃 재배치를 유발함

### 8. GROUP 자식 래퍼 제거로 좌표 틀어짐 (2026-01-16)
**문제**: GROUP 내부의 래퍼 프레임 제거 시 자식 좌표가 완전히 틀어짐

**원인**: GROUP은 자식 기준 bounding box로 좌표 계산
1. `unwrapNode`에서 child를 GROUP에 삽입
2. GROUP의 x, y가 재계산됨 (bounding box 변경)
3. 이후 설정한 absoluteX, absoluteY가 새 좌표 시스템 기준이 되어 위치 틀어짐

**증상**:
- 이미지 원래 절대 좌표: (30, 357)
- unwrap 후 좌표: (24.47, 308) ← 완전히 다름
- Group height: 413 → 672 (재계산됨)

```typescript
// ❌ 문제 - GROUP 부모일 때 좌표 재계산 미고려
parent.insertChild(index, child);  // GROUP bounding box 변경!
child.x = absoluteX;  // 새 좌표 시스템 기준으로 설정됨

// ✅ 해결 - GROUP 자식 래퍼는 제거하지 않음
var parent = node.parent;
if (parent && parent.type === 'GROUP') {
  return false;  // 보존
}
```

**핵심**: GROUP은 FRAME과 좌표 시스템이 다름 → GROUP 내부 래퍼는 제거 금지

### 9. 의도적 프레임 이름("Hidden" 등) 제거 오류 (2026-01-16)
**문제**: 사용자가 의도적으로 만든 프레임이 래퍼로 오판되어 제거됨

**원인**: 래퍼 판단 시 이름이 자동생성인지만 체크하지 않음
1. "Hidden" 프레임: 특정 상태에서 숨겨지는 요소 그룹
2. 구조적으로 wrapper처럼 보이지만 의미있는 이름

**증상**:
- "Hidden" 프레임 제거 후 내부 Rectangle이 상위로 이동
- Auto Layout 재배치로 형제 요소들 위치 변경

```typescript
// ❌ 문제 - 구조만 보고 래퍼로 판단
if (node.children.length === 1 && isFrameNode(child)) {
  return true;  // "Hidden"도 래퍼로 판단됨
}

// ✅ 해결 - 자동생성 이름 체크 추가
if (!isAutoGeneratedName(node.name)) {
  return false;  // "Hidden", "Mask", "Overlay" 등 보존
}

// 자동생성 이름 패턴
function isAutoGeneratedName(name) {
  return /^(Frame|Group|Rectangle|Ellipse|Line|Vector)\s*\d*$/.test(name);
}
```

**핵심**: 의미있는 이름 = 의도적으로 만든 프레임 → 제거 금지

### 10. 원인 추측 후 검증 없이 코드 수정 (2026-01-16)
**문제**: 빈 프레임이 삭제되지 않는 원인을 "fill이 있어서"라고 추측 후 바로 코드 수정

**실제 원인**: 이전 수정(AL 부모 체크 제거)이 빌드/리로드 안 됐던 것

**잘못된 진단 과정**:
1. User: "Frame 1430106950이 삭제 안 됨"
2. 나: `isEmptyFrame`에서 fills 체크하는 코드 봄
3. 나: "fill이 있어서 삭제 안 된 거겠지" **추측**
4. 나: fills 무시 로직 추가 (불필요한 수정)
5. User: 스크린샷으로 "Fill 없는데?" 증명

**올바른 진단 과정**:
```
1. 문제 발생: "삭제 안 됨"
2. 원인 후보 나열:
   - 빌드 미적용?
   - 플러그인 리로드 안 됨?
   - 조건문 미통과? (어떤 조건?)
3. 유저에게 확인 요청:
   - "플러그인 리로드 했나요?"
   - "해당 프레임에 fill/stroke/effects 있나요?"
4. 확인된 정보로 수정
```

**교훈**:
- **추측 → 수정** (❌)
- **추측 → 검증 요청 → 확인 후 수정** (✅)

### 11. AL 언래핑 시도 후 롤백 (2026-01-16)
**문제**: Auto Layout 내부 무의미 프레임 언래핑 시 레이아웃 깨짐

**시도한 접근**:
1. padding < 4px이고 시각적 스타일 없는 중간 프레임 제거
2. 자식들을 부모 AL로 이동
3. 빈 프레임 자동 삭제

**발생한 문제**:
- Alignment 속성 손실 (예: counterAxisAlignItems)
- 부모와 자식의 레이아웃 방향/정렬 불일치
- 수동 테스트에서는 OK, 자동화 시 edge case 발생

**교훈**:
```
수동 테스트 성공 ≠ 자동화 안전
```

- 수동: 사람이 맥락 파악하며 선택적 적용
- 자동: 모든 케이스에 일괄 적용 → edge case 폭발

**결정**: 보수적 상태 유지 (AL 언래핑 비활성화)

### 12. BOOLEAN_OPERATION 자식 탐색으로 콘텐츠 오판 (2026-01-16)
**문제**: 빈 avatar 프레임을 콘텐츠 있음으로 판정

**원인**: `BOOLEAN_OPERATION`(Subtract)이 자식 shape들을 포함하고 있어서 콘텐츠로 오인

```typescript
// ❌ 잘못된 로직 - BOOLEAN_OPERATION 자식도 탐색
if ('children' in node) {
  for (const child of node.children) {
    if (hasVisualContentDeep(child)) return true;  // Subtract의 자식 shape 발견!
  }
}

// ✅ 올바른 로직 - BOOLEAN_OPERATION은 즉시 false 반환
if (node.type === 'BOOLEAN_OPERATION') {
  return false;  // 마스킹 구조이므로 자식도 무시
}
```

**증상**:
- 같은 이름 형제 중 빈 avatar가 제거되지 않음
- `hasVisualContentDeep`가 두 avatar 모두 `true` 반환

**교훈**:
1. **데이터 구조 파악 먼저**: Figma API에서 `BOOLEAN_OPERATION`이 자식을 가진다는 사실 확인 필요
2. **증상 수정보다 원인 분석**: "왜 둘 다 콘텐츠로 인식되는가?" 질문 먼저
3. **디버그 로그 추가**: 함수 반환값 로깅으로 빠른 원인 파악

**회고 - 문제 해결이 늦어진 원인**:
- 가정 검증 없이 코드 수정 (BOOLEAN_OPERATION은 자식이 없을 것)
- 점진적 수정 3회 반복 (자식 탐색 → 제외 → 제외+자식무시)
- 초기 디버그 로그 부재

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

## 디버깅 프로세스 (KPT 기반)

> 2026-01-16 세션 회고에서 도출

### ✅ Keep - 유지할 행동

| 행동 | 이유 |
|------|------|
| 플랜 모드로 설계 후 구현 | 복잡한 기능(빈 중복 형제 제거)에서 엣지 케이스 미리 고려 |
| 안전 장치 우선 설계 | feed 카드, placeholder 케이스 등 의도치 않은 삭제 방지 |
| 스크린샷 기반 디버깅 | 실제 UI 상태 확인으로 문제 빠르게 파악 |
| 문제 해결 후 문서화 | lessons_learned.md에 패턴 기록 → 재발 방지 |

### ❌ Problem - 피해야 할 패턴

| 패턴 | 결과 | 대안 |
|------|------|------|
| 데이터 구조 가정 | BOOLEAN_OPERATION 자식 존재 몰라서 3회 반복 | console.log로 구조 먼저 출력 |
| 증상 기반 수정 | "안 되니까 이것도 빼보자" 식 점진적 수정 | 원인 분석 → 가설 → 검증 순서 |
| 디버그 로그 늦게 추가 | 3번째 시도에서야 로그 추가 | **첫 시도부터** 반환값 로깅 |
| 코드 조건문 미확인 | 중첩 GROUP 왜 안 되는지 코드 안 봄 | 예상대로 안 되면 조건문부터 확인 |
| **원인 추측 후 검증 없이 수정** | 불필요한 코드 변경, 실제 원인 놓침 | 유저에게 **실제 값 확인 요청** 후 수정 |
| **빌드 적용 확인 누락** | 첫 수정이 효과 있었는지 모름 | 빌드 후 플러그인 리로드 여부 확인 |

### 🔧 Try - 다음에 시도할 것

1. **구조 먼저 출력**
   ```typescript
   console.log('[DEBUG] node:', JSON.stringify({
     type: node.type,
     name: node.name,
     childCount: 'children' in node ? node.children.length : 0
   }));
   ```

2. **가설 검증 흐름**
   ```
   문제 발생 → "왜?" 질문 → 가설 수립 → 로그로 검증 → 수정
   ```

3. **"왜?" 3번 묻기**
   - 1차: 왜 빈 avatar가 제거 안 되지? → 콘텐츠 있음으로 판정
   - 2차: 왜 콘텐츠 있음으로 판정? → BOOLEAN_OPERATION 자식 탐색
   - 3차: 왜 자식 탐색? → 마스킹 구조 특성 미파악

4. **Figma 노드 타입 체크리스트**
   - [ ] 해당 타입이 children을 가지는가?
   - [ ] children의 의미는? (실제 콘텐츠 vs 구조용)
   - [ ] 좌표 시스템은? (절대 vs 상대)

---

## 체크리스트

### 네이밍 작업 전
- [ ] Layout 타입 사용하지 않았는가?
- [ ] 모든 컴포넌트에 Purpose가 있는가?
- [ ] Size가 적용 가능한 컴포넌트에만 적용했는가?

### 코드 수정 전
- [ ] 해당 파일을 먼저 읽었는가?
- [ ] ES6+ 전용 문법 사용하지 않았는가?

### 빌드 후 테스트 전
- [ ] **Figma 플러그인 빌드**: `npm run build` (루트)
- [ ] **Agent Server 빌드**: `cd agent-server && npm run build`
- [ ] **통합 빌드**: `npm run build:all` (둘 다)
- [ ] **서버 재시작**: 포트 3001 프로세스 종료 후 재시작

> ⚠️ UI 변경 후 Figma 플러그인 빌드 누락 주의!

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

### 5. 대량 테스트 전 작은 샘플로 검증
**문제**: 150개 노드 테스트 반복으로 API 크레딧 빠르게 소진

**교훈**: 테스트는 작은 프레임(30~50노드)으로 먼저 검증

### 6. 스킵 조건 분산으로 디버깅 어려움 (2026-01-16)
**문제**: 노드가 AI 분석 대상에서 제외되는 이유 추적이 어려움

**원인**: 스킵 조건이 3곳에 분산
```typescript
// 1. shouldSkipNaming() - 타입/상태값 기반
// 2. shouldSkipForParentComponent() - 부모 컴포넌트 기반
// 3. tryDirectNaming() → hasValidSemanticName() - 직접 변환 시도
```

**해결**:
- 디버그 로그 추가: `[Naming] 언더스코어 감지: "X" → AI로 위임`
- 서버에 입력 노드 로그: `[Context Naming] Found X nodes with underscores`
- 특수 케이스(언더스코어)는 최우선으로 AI 위임

### 7. 빌드 누락 반복 (2026-01-16)
**문제**: Agent Server만 빌드하고 Figma 플러그인 빌드 누락

**해결**:
```bash
# 통합 빌드 스크립트 추가
npm run build:all  # 플러그인 + 서버
```

**체크리스트**:
- [ ] UI 변경 시 → `npm run build:all`
- [ ] 서버 로직 변경 시 → 서버 재시작 필요

### 8. 후처리 위치 혼란 (2026-01-16)
**문제**: 서버 후처리가 작동하지 않는 것처럼 보임

**원인**: 스킵된 노드는 AI 분석 대상이 아니므로 서버 후처리도 미적용

**교훈**:
- 후처리는 AI 응답에만 적용됨
- 특수 케이스는 AI 분석 대상 선정 단계에서 처리해야 함
- 프롬프트 규칙 강화 + 플러그인에서 강제 AI 위임

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
| 2026-01-16 | AI Agent | 스킵 조건 분산 디버깅 패턴 추가 |
| 2026-01-16 | 공통 | 빌드 누락 방지 (build:all) |
| 2026-01-16 | AI Agent | 후처리 위치 혼란 패턴 추가 |
| 2026-01-16 | Cleanup | 오프셋 래퍼 보존 로직 추가 |
| 2026-01-16 | 프로세스 | KPT 기반 디버깅 프로세스 추가 |
| 2026-01-16 | Cleanup | GROUP 자식 래퍼 보존 로직 추가 |
| 2026-01-16 | Cleanup | Auto Layout 내부 빈 요소 보존 로직 추가 |
| 2026-01-16 | Cleanup | 의도적 프레임 이름 보존 로직 추가 (Hidden, Mask 등) |
| 2026-01-16 | 프로세스 | 원인 추측 없이 검증 먼저 패턴 추가 |
| 2026-01-16 | Cleanup | AL 언래핑 시도 후 비활성화 (Alignment 손실 문제) |
