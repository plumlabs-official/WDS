# Lessons Learned

> 도메인별 의사결정 + 실수 패턴 통합 문서
>
> **원칙**: "문제상황 → 원인 분석 → 해결 조치 → 재발 방지"

---

## Naming

### 결정사항

#### Layout 타입 금지 (2025-01-14)
- `Layout/Main` → `TopBar/Main` 또는 `Section/Main`
- **이유**: Layout은 너무 일반적, 구체적 타입 사용

#### Purpose 필수화 (2025-01-15)
- `Button/Primary` → `Button/CTA/Primary`
- **이유**: Purpose가 없으면 역할 불명확

#### Container 대신 Content
- `Container/...` → `Content/...`
- **이유**: Content가 더 의미 있고 일관됨

#### 최상위 스크린 프레임
- PAGE 바로 아래 프레임은 prefix 제거
- `Container/HomeScreen` → `HomeScreen`

#### 네이밍 우선순위
```
1. 구조적 네이밍 (부모 도메인 기반)
2. 아이콘 라이브러리 (carbon:xxx, solar:xxx)
3. 하이픈 아이콘 패턴 (user-circle-02)
4. 한글 레이블 (홈, 라운지)
5. 아이콘 상태 컨테이너 (on/off 자식)
6. camelCase → PascalCase
7. Section 추론 (자식 키워드 기반)
```

#### Section vs Card vs ListItem 구분
| 타입 | 역할 | 예시 |
|------|------|------|
| Section | 여러 아이템을 그룹화하는 컨테이너 | `Section/Challenge` |
| Card | 독립적인 정보 단위 (개별 아이템) | `Card/Challenge` |
| ListItem | 리스트 내 개별 행 항목 | `ListItem/Challenge` |

#### Blacklist 이름 도입 (2026-01-15)
- 금지 패턴: `Content`, `Layout`, `Inner`, `Wrapper`, `Box`, `Item`
- Direct Naming에서 이 이름 반환 금지 → `null` 반환 (AI에게 위임)
- **이유**: GPT 피드백 - 규칙 위반 폴백이 AI 분석 기회 박탈

#### AI 대상 노드 타입 확대 (2026-01-15)
- 기존: FRAME only
- 변경: FRAME, GROUP, COMPONENT, INSTANCE
- **이유**: GROUP 등도 의미 있는 컴포넌트일 수 있음

#### Validator 도입 (2026-01-15)
- AI 응답 검증: Purpose 필수, 금지 패턴, Size 규칙
- **위치**: `agent-server/src/agents/naming.ts`
- **이유**: AI가 규칙 위반해도 감지 가능

### 실수 패턴

#### 1. Layout 타입 사용
```typescript
// ❌ 잘못된 예
"Layout/Main"

// ✅ 올바른 예
"TopBar/Main" 또는 "Section/Main"
```

#### 2. Purpose 누락
```typescript
// ❌ 잘못된 예
"Button/Primary"

// ✅ 올바른 예
"Button/CTA/Primary"
```

#### 3. Container에 Size 적용
```typescript
// ❌ 잘못된 예
"Container/ButtonArea/LG"

// ✅ 올바른 예
"Container/ButtonArea"
```

---

## AutoLayout

### 결정사항

#### AI 기반만 사용
- Rule-based Auto Layout 삭제
- **이유**: 스크린샷 기반 AI 분석이 더 정확

#### FILL 최소화 원칙
- `layoutGrow: 1` (FILL)은 95% 이상 채우는 경우에만
- 기본값: `layoutAlign: INHERIT`, `layoutGrow: 0`

#### NONE 응답 처리
- AI가 `NONE` 반환 시 Auto Layout 미적용
- **이유**: 일부 레이아웃은 Auto Layout 부적합

#### 방향 추론 로직
```typescript
const horizontalDiff = Math.abs(first.x - second.x);
const verticalDiff = Math.abs(first.y - second.y);
direction = horizontalDiff > verticalDiff ? 'HORIZONTAL' : 'VERTICAL';
```

#### 크기 변화 검증
- 적용 전/후 비교, 5px 이상 변화 시 경고

### 실수 패턴

#### 1. 레이어 순서 뒤바뀜
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

## Cleanup

### 결정사항

#### 의미 없는 래퍼 조건 (2026-01-15 업데이트)
1. 그룹 또는 프레임
2. 자식이 정확히 1개
3. 시각적 스타일 없음 (fill, stroke, effect)
4. Auto Layout 없음

> **변경**: 크기 조건 제거됨. 크기가 달라도 단일 자식이면 병합 대상.

#### 동일 이름 중첩 무조건 병합 (2026-01-15)
- `Icon/User > Icon/User` → 크기/스타일 무관하게 병합
- **이유**: 동일 이름 = 불필요한 중첩, 무조건 제거해야 함
- **구현**: `findSingleChildChain()`에서 동일 이름이면 `isSimilarSize` 체크 스킵

#### Auto Layout 복원 방식 (2026-01-15)
- 병합 전 Auto Layout 설정 저장 (mode, gap, padding 등)
- 병합 후 저장된 설정으로 복원
- **이유**: 추론보다 원본 값 복원이 정확

#### 레이아웃 보존 전략
- 오프셋을 padding으로 변환
- 시각적 결과 동일 보장
- 레이아웃 깨짐 감지 시 `beforeSnapshot` 기준 위치 보정

#### 스타일 전이
- 체인 내 모든 노드의 스타일을 topNode에 병합
- fills, strokes, effects, cornerRadius 보존

| 속성 | 병합 방식 |
|------|----------|
| `fills` | 하위→상위 순서로 레이어 병합 |
| `strokes` | 모든 노드의 stroke 병합 |
| `effects` | 모든 노드의 shadow/blur 병합 |
| `cornerRadius` | 가장 큰 값 사용 |
| `clipsContent` | 하나라도 true면 true |

### 실수 패턴

#### 1. 좌표 계산 버그
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

#### 2. 의도치 않은 조건 제한
**문제**: "단일 자식이면 크기와 관계없이 병합" 요청인데 크기 체크로 제한됨

```typescript
// ❌ 문제 코드 - 방어적 조건이 기능 제한
const sameWidth = Math.abs(node.width - child.width) <= 2;
if (!sameWidth) return false;

// ✅ 해결 - 크기 체크 제거
// 단일 자식 + 스타일 없음 조건만 검사
```

#### 3. 삭제된 노드 접근 에러
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

#### 4. 자식 좌표 비정상으로 인한 언래핑 오류 (2026-01-15)
**문제**: 자식 좌표가 부모 범위를 벗어나면 `unwrapNode`에서 잘못된 위치 계산

```typescript
// ❌ 문제 코드 - 좌표 검증 없음
var absoluteY = wrapper.y + child.y;  // child.y가 비정상이면 오류

// ✅ 해결 - 좌표 검증 추가
if (child.x < -50 || child.y < -50 ||
    child.x > wrapper.width + 50 || child.y > wrapper.height + 50) {
  console.log('[unwrapNode] 스킵: 자식 좌표 비정상');
  return null;
}
```

**증상**: 래퍼 제거 후 프레임 height가 비정상적으로 커짐 (예: 395→1284)
**원인**: 컴포넌트 인스턴스 내부의 비정상 좌표가 detach 후에도 유지됨

#### 5. detachInstance 후 크기 변경 (2026-01-15)
**문제**: `detachInstance()` 후 내부 constraints가 풀리면서 크기 변경

```typescript
// ❌ 문제 코드 - 크기 변경 무시
const detachedFrame = node.detachInstance();

// ✅ 해결 - 원래 크기 저장 및 복원
const originalWidth = node.width;
const originalHeight = node.height;
const detachedFrame = node.detachInstance();

if (Math.abs(detachedFrame.width - originalWidth) > 1) {
  detachedFrame.resize(originalWidth, originalHeight);
}
```

**증상**: 아이콘 인스턴스가 detach 후 5배로 확대됨 (예: 21.6→108)

#### 6. 중첩된 보조 레이어로 인한 크기 확장 (2026-01-15)
**문제**: 컴포넌트 내부에 Ratio, Shape 등 부모보다 큰 자식이 있으면 detach 후 프레임이 확장됨

**증상**:
- Icon/Normal/Search 인스턴스 (21.6x20)
- 내부에 Ratio (108x20), Shape (108x20) 존재
- detach 후 Ratio만 삭제하면 Shape가 남아 프레임이 108x20으로 확장

**원인**:
1. 인스턴스는 clipsContent로 큰 자식을 숨김
2. detach 후 Ratio(보조 레이어)만 삭제
3. Shape(일반 레이어)는 남아있어 프레임이 HUG로 확장

```typescript
// ❌ 문제 코드 - 보조 레이어만 삭제, 나머지는 그대로
function cleanupOversizedChildren(parent) {
  for (const child of parent.children) {
    if (isAuxiliary(child) && exceedsParent(child)) {
      child.remove();  // Ratio만 삭제됨
    }
  }
}

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

**핵심 포인트**:
1. 원본 인스턴스 크기(`originalWidth`, `originalHeight`)를 기준으로 비교
2. 보조 레이어(Ratio, Constraints, Spacer)는 삭제
3. 일반 레이어(Shape 등)는 **비율 유지하며 스케일 다운**
4. cleanup 전 Auto Layout 해제로 HUG 방지

**적용 범위**: 모든 컴포넌트 인스턴스 detach 시 동일 로직 적용

---

## 공통

### 실수 패턴

#### 1. ES6+ 문법 호환성
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

#### 2. 빌드 위치 혼동
**문제**: Figma 플러그인 코드 수정 후 `agent-server/`에서 빌드 실행

```bash
# ❌ 잘못된 빌드
cd agent-server && npm run build  # Agent Server만 빌드됨

# ✅ 올바른 빌드
cd /project-root && npm run build  # Figma 플러그인 빌드
```

**재발 방지**:
- Figma 플러그인 (`src/`) 수정 → **루트**에서 빌드
- Agent Server (`agent-server/src/`) 수정 → `agent-server/`에서 빌드
- 빌드 후 `dist/code.js` 타임스탬프 확인

#### 3. base64 이미지 prefix
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

## 변경 이력

| 날짜 | 도메인 | 내용 |
|------|--------|------|
| 2025-01-14 | Naming | Layout 타입 금지 |
| 2025-01-15 | Naming | Purpose 필수화 |
| 2025-01-15 | Naming | Image Purpose 추가 |
| 2025-01-15 | Cleanup | 크기 조건 제거 |
| 2026-01-15 | 전체 | 문서 통합 (DECISIONS + COMMON_BUGS) |
| 2026-01-15 | 공통 | 빌드 위치 혼동 실수 패턴 추가 |
| 2026-01-15 | Naming | Blacklist 이름 도입 (Content, Layout 등 금지) |
| 2026-01-15 | Naming | AI 대상 노드 타입 확대 |
| 2026-01-15 | Naming | Validator 도입 |
| 2026-01-15 | Cleanup | 동일 이름 중첩 무조건 병합 |
| 2026-01-15 | Cleanup | Auto Layout 복원 방식 (설정 저장/복원) |
| 2026-01-15 | Cleanup | AI 기반 스크린샷 검증/복원 구현 |
| 2026-01-15 | 전체 | PROGRESS.md → lessons_learned.md 통합 |
| 2026-01-15 | Component Break | detachInstance 후 크기 복원 로직 추가 |
| 2026-01-15 | Cleanup | isMeaninglessWrapper 자식 좌표 검증 추가 |
| 2026-01-15 | Component Break | 중첩 보조 레이어(Ratio, Shape) 스케일링 로직 추가 |

---

## 워크플로우 인사이트

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
- 한 번에 완벽하려 하지 않음
- 테스트 후 추가 요청으로 보완

### 추가 트러블슈팅

#### 중첩 인스턴스 미처리
**문제**: `detachInstance()` 후 children 재귀 처리 누락

```typescript
// ❌ 잘못된 코드
const frame = instance.detachInstance();
// frame의 children 처리 안 함

// ✅ 올바른 코드
const frame = instance.detachInstance();
for (const child of frame.children) {
  if (child.type === 'INSTANCE') {
    processInstance(child);  // 재귀 처리
  }
}
```

#### manifest networkAccess 포맷
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
