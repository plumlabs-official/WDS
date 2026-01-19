# Auto Layout 반응형 변환 프롬프트

> Created: 2026-01-19
> Version: 1.0

## 목표

- 최상위 프레임을 **반응형 웹페이지**로 변환
- 시작 해상도: **375px** → 테스트 범위: **1024px**까지

---

## 구조 재편 규칙

### 1. 레이어 구조
- 웹 코딩 관점으로 상위→하위→최하위 노드 구조 재편
- 불필요한 래퍼 제거 (Cleanup 선행 권장)

### 2. Sizing 기본값

| 요소 | Width | Height |
|------|-------|--------|
| 컨테이너 | Fill | Hug |
| 텍스트 | Fill (Truncation 허용) | Hug |
| 이미지 | Fill 또는 Fixed | Aspect Ratio Lock |

### 3. Constraints 활용
- **Left 요소**: Left constraint
- **Right 요소**: Right constraint
- **Center 요소**: Center constraint
- 좌우 너비 변화에 따라 노드들이 자연스럽게 따라붙도록 설정

---

## 고정 vs 반응형 영역

| 영역 | Width | 내부 요소 | Constraints |
|------|-------|----------|-------------|
| Header/StatusBar | Fill | Left-Right 분리 | Left, Right |
| TabBar/BottomNav | Fill | 균등 배분 | Left, Center, Right |
| Content 영역 | Fill | Hug-Fill 혼합 | Scale |

---

## 카드 그리드 규칙

| 해상도 | 열 수 | 카드 Width |
|--------|-------|-----------|
| 375px ~ 599px | 1열 | Fill |
| 600px 이상 | 2열 | Fill (Wrap 활용) |

- **Gap**: 화면 비례 (기본 16px @ 375px → 비례 확장)
- **카드 컨테이너**: Min Width 설정으로 Wrap 동작 보장

---

## 텍스트 규칙

| 텍스트 타입 | Truncation | 줄 제한 |
|------------|------------|--------|
| Title | **Enabled** | 1줄 |
| Sub Title | **Enabled** | 2줄 |
| Body | Disabled | 줄바꿈 허용 |

---

## 검증 프로세스

### 단계별 테스트 해상도
```
375px → 500px → 600px → 744px → 1024px
```

### 각 단계에서 확인
1. 레이아웃 깨짐 없는지 확인
2. 텍스트 오버플로우 확인
3. 이미지 비율 유지 확인
4. Constraints 동작 확인

### 깨졌을 때 대응
1. **즉시 롤백** (Cmd+Z)
2. 문제 노드 식별
3. 다른 방법 시도 (Hug↔Fill 변경, Constraints 조정)
4. 재테스트

---

## 금지 사항

- 원본 375px 디자인 깨뜨리기
- 이미지 비율 왜곡
- 텍스트 완전 숨김 (최소 "..." 표시 필수)
- 과도한 래퍼 추가

---

## 체크리스트

### 작업 전
- [ ] Cleanup 완료 (불필요한 래퍼 제거)
- [ ] 원본 375px 스크린샷 저장

### 작업 중
- [ ] 375px 디자인 유지 확인
- [ ] 600px 카드 2열 전환 확인
- [ ] 1024px 최대 너비 테스트

### 작업 후
- [ ] 전체 해상도 범위 스크린샷 비교
- [ ] Constraints 동작 검증
- [ ] 텍스트 Truncation 동작 검증
