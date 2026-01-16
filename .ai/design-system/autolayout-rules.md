# Auto Layout Rules

> AI Auto Layout 에이전트가 준수해야 하는 규칙
>
> Last updated: 2026-01-16 | v2.0.0

---

## 핵심 원칙

### 1. 기존 디자인 100% 보존
- 적용 후 시각적 변화 없어야 함
- 5px 이상 변화 시 경고

### 2. FILL 최소화
- `layoutGrow: 1` (FILL)은 95% 이상 채우는 경우에만
- 기본값: `layoutAlign: INHERIT`, `layoutGrow: 0`

### 3. 요소 순서 유지
- 레이어 순서 → 시각적 순서로 정렬 후 적용

---

## 방향 결정 규칙

### Vertical (세로 배열)
- 자식들이 위에서 아래로 배열
- y 좌표 차이 > x 좌표 차이

### Horizontal (가로 배열)
- 자식들이 왼쪽에서 오른쪽으로 배열
- x 좌표 차이 > y 좌표 차이

### NONE (적용 불가)
- 자식들이 겹쳐있거나 불규칙한 배열
- 강제 적용 시 레이아웃 깨짐

---

## Sizing 옵션

### primaryAxisSizingMode
| 값 | 설명 |
|-----|------|
| AUTO (HUG) | 자식에 맞춰 줄어듦 |
| FIXED | 고정 크기 유지 |

### counterAxisSizingMode
| 값 | 설명 |
|-----|------|
| AUTO (HUG) | 자식에 맞춰 줄어듦 |
| FIXED | 고정 크기 유지 |

### layoutAlign (자식)
| 값 | 설명 |
|-----|------|
| INHERIT | 부모 설정 따름 |
| STRETCH | 교차축 FILL |

### layoutGrow (자식)
| 값 | 설명 |
|-----|------|
| 0 | 고정 크기 |
| 1 | 주축 FILL (남은 공간 채움) |

---

## 패딩 계산

```typescript
{
  paddingTop: 상단 여백,
  paddingRight: 우측 여백,
  paddingBottom: 하단 여백,
  paddingLeft: 좌측 여백
}
```

- 비대칭 패딩 지원
- 스크린샷 분석으로 정확한 여백 추론

---

## Gap 계산

- 자식들 사이 간격
- 일정하면 해당 값 사용
- 불규칙하면 평균값 또는 최빈값

---

## 자식 순서 정렬

```typescript
// 방향에 따라 정렬
if (direction === 'VERTICAL') {
  children.sort((a, b) => a.y - b.y);
} else {
  children.sort((a, b) => a.x - b.x);
}

// 레이어 순서 재정렬
children.forEach((child, i) => frame.insertChild(i, child));
```

---

## 터치 타겟 규칙

> 출처: Apple HIG, Material Design 3

### 최소 터치 타겟 크기

| 플랫폼 | 최소 크기 | 권장 크기 |
|--------|----------|----------|
| iOS (Apple HIG) | 44x44px | 44x44px |
| Android (Material) | 48x48px | 48x48px |
| **웰위 통일 기준** | **48x48px** | **48x48px** |

### 적용 컴포넌트

| 컴포넌트 | 터치 타겟 필수 | 비고 |
|---------|--------------|------|
| Button | ✅ | 모든 버튼 |
| Icon (터치 가능) | ✅ | 클릭 가능한 아이콘 |
| TabItem | ✅ | 탭바 아이템 |
| ListItem | ✅ | 리스트 행 |
| Toggle | ✅ | 토글 스위치 |
| Checkbox | ✅ | 체크박스 |
| Input | ✅ | 입력 필드 |
| Card (터치 가능) | ✅ | 클릭 가능한 카드 |

### 터치 타겟 검증 규칙

```typescript
// 최소 크기 검증
const MIN_TOUCH_TARGET = 48;

function validateTouchTarget(node: SceneNode): boolean {
  if (!isTouchable(node)) return true;
  return node.width >= MIN_TOUCH_TARGET && node.height >= MIN_TOUCH_TARGET;
}
```

### 패딩으로 터치 영역 확보

시각적으로 작은 요소도 터치 영역은 48px 이상 확보:

```
시각적 크기: 24x24px (아이콘)
터치 영역: 48x48px (패딩 12px 추가)
```

**Auto Layout 적용 시:**
```typescript
{
  paddingTop: 12,
  paddingRight: 12,
  paddingBottom: 12,
  paddingLeft: 12
}
```

---

## 검증 체크리스트

- [ ] 방향이 시각적 배열과 일치하는가?
- [ ] 패딩이 정확한가?
- [ ] Gap이 일관적인가?
- [ ] 자식 순서가 올바른가?
- [ ] 적용 후 크기 변화가 5px 이내인가?
- [ ] 터치 가능한 요소가 48x48px 이상인가?

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2025-01-15 | 초기 작성 |
| 2025-01-15 | FILL 최소화 원칙 추가 |
| 2026-01-15 | 터치 타겟 규칙 추가 (48x48px 최소) |
