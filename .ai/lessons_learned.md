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

#### 레이아웃 보존 전략
- 오프셋을 padding으로 변환
- 시각적 결과 동일 보장

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

#### 2. base64 이미지 prefix
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
