# Auto Layout Rules (반응형)

> AI Auto Layout 에이전트가 준수해야 하는 규칙
>
> Last updated: 2026-01-19 | v3.0.0 (반응형 전환)

---

## 핵심 목표: 반응형 레이아웃

- 375px(모바일) → 600px → 1024px까지 자연스럽게 확장
- 컨테이너는 기본적으로 **Width=Fill**
- 카드/섹션은 가로 확장 시 2열로 전환 가능

---

## 절대 원칙

### 1. 375px 기준 디자인 유지
- 시작 해상도(375px)에서 현재 디자인이 깨지지 않아야 함
- 확장 시에만 반응형 동작

### 2. 요소 순서 유지
- 자식 요소의 시각적 순서(위→아래, 왼쪽→오른쪽) 유지
- 레이어 순서는 시각적 순서에 맞게 재정렬

### 3. Fill 적극 사용 (반응형 핵심)
- **컨테이너/섹션**: Width=Fill, Height=Hug
- **텍스트**: Width=Fill (Truncation 활용)
- **이미지**: 비율 유지

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

## Sizing 규칙

### 컨테이너 (Frame/Section/Card)

| 요소 타입 | Width | Height | 조건 |
|----------|-------|--------|------|
| 최상위 컨테이너 | FIXED | HUG | 루트 프레임 |
| Section/Container | FILL (STRETCH) | HUG | 부모 너비 따라감 |
| Card | FILL (STRETCH) | HUG | 1열→2열 대응 |
| Header/TabBar | FILL (STRETCH) | FIXED | 고정 높이 |

### layoutAlign (자식)

| 값 | 설명 | 사용 시점 |
|-----|------|----------|
| INHERIT | 부모 설정 따름 | 아이콘, 이미지, 고정 버튼 |
| STRETCH | 교차축 FILL | 컨테이너, 섹션, 전체 너비 요소 |

### layoutGrow (자식)

| 값 | 설명 | 사용 시점 |
|-----|------|----------|
| 0 | 고정 크기 | 대부분의 요소 |
| 1 | 주축 FILL | 남은 공간 채우기 |

### FILL 판단 기준 (확장됨)

다음 중 하나라도 해당하면 FILL(STRETCH) 사용:
1. 부모 너비의 **70% 이상** 차지
2. 이름에 Container, Section, Card, Content, Main, Body 포함
3. 여러 자식을 포함한 레이아웃 프레임
4. Input, Button/...Full, Divider 등 전체 너비 요소

### FILL 사용하지 않는 경우
- Icon, Avatar, Thumbnail: 항상 FIXED
- 고정 크기 버튼 (아이콘 버튼 등)
- 이미지 (비율 유지 필요)

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

## Gap 규칙

- Gap은 **고정값** 사용 (비례 확장 아님)
- 현재 간격을 그대로 유지
- 표준 간격: 4, 8, 12, 16, 20, 24, 32

---

## 텍스트 Truncation 규칙

Title/SubTitle로 판단되는 텍스트는 Truncation 적용:
- 이름에 Title, Heading, Name, Label 포함
- 단일 라인 텍스트
- 부모 너비에 가까운 텍스트

**적용 방법:**
```typescript
textNode.textTruncation = 'ENDING'; // "..." 표시
```

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
| **통일 기준** | **48x48px** | **48x48px** |

### 적용 컴포넌트

| 컴포넌트 | 터치 타겟 필수 |
|---------|--------------|
| Button | ✅ |
| Icon (터치 가능) | ✅ |
| TabItem | ✅ |
| ListItem | ✅ |
| Toggle | ✅ |
| Checkbox | ✅ |
| Input | ✅ |

---

## 후처리 안전 규칙 (v3.1)

AI 응답 후 자동 적용되는 안전 규칙:

### 1. 작은 요소 보호
**조건**: 부모의 15% 미만 크기
**동작**: STRETCH → INHERIT 강제 변환

```
Icon/Info (28x28) in 375x812 → INHERIT 유지
```

### 2. Vector/Icon 타입 보호
**조건**: VECTOR, BOOLEAN_OPERATION, STAR, ELLIPSE, LINE 타입 또는 이름에 "icon" 포함
**동작**: STRETCH → INHERIT 강제 변환

### 3. 고정 크기 패턴 보호
**조건**: 이름에 avatar, thumbnail, badge 포함
**동작**: STRETCH → INHERIT 강제 변환

### 4. 플로팅 요소 감지
**조건**:
- 이름에 tabbar, bottomnav, floating, bottom-nav, navigation-bar 포함
- 또는 y >= 부모높이 * 80% AND 너비 >= 부모너비 * 90%
**동작**: layoutPositioning = 'ABSOLUTE'

### 5. 오버레이 패턴 감지
**조건**: y <= 10 AND 너비 >= 부모너비 * 90% 인 요소가 2개 이상
**동작**: 첫 번째(Header)는 유지, 나머지는 ABSOLUTE

---

## 검증 체크리스트

- [ ] 375px에서 디자인 유지되는가?
- [ ] 방향이 시각적 배열과 일치하는가?
- [ ] 패딩이 정확한가?
- [ ] Gap이 일관적인가?
- [ ] 자식 순서가 올바른가?
- [ ] 컨테이너/섹션이 Fill로 설정되었는가?
- [ ] Title 텍스트에 Truncation이 적용되었는가?
- [ ] 터치 가능한 요소가 48x48px 이상인가?

---

## 변경 이력

| 날짜 | 버전 | 내용 |
|------|------|------|
| 2025-01-15 | 1.0.0 | 초기 작성 |
| 2025-01-15 | 1.1.0 | FILL 최소화 원칙 추가 |
| 2026-01-15 | 2.0.0 | 터치 타겟 규칙 추가 |
| 2026-01-19 | 3.0.0 | **반응형 전환** - Fill 적극 사용, Truncation 추가 |
| 2026-01-19 | 3.1.0 | **후처리 안전 규칙** - 작은요소/Vector/플로팅/오버레이 보호 |
