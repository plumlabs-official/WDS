# Memory Bank

> 장기 의사결정 기록 (DECISIONS 통합)

---

## Architecture Decisions

### 1. Rule-based vs AI 기반
- **결정**: 하이브리드 방식 - Rule-based 우선, AI는 보조
- **이유**: Rule-based가 빠르고 예측 가능, AI는 복잡한 판단에만 사용

### 2. Agent Server 분리
- **결정**: localhost:3001로 별도 서버 운영
- **이유**: Figma 플러그인 외부 API 호출 제한, UI에서 fetch로 통신

### 3. 전처리 순서
```
1. 래퍼 제거 → 2. 중첩 병합 → 3. 컴포넌트 브레이크
4. 꺼진 레이어 삭제 → 5. AI 네이밍 → 6. AI Auto Layout → 7. 간격 표준화
```

---

## Naming Decisions

### Layout 타입 금지 (2025-01-14)
- `Layout/Main` ❌ → `TopBar/Main` 또는 `Section/Main` ✅
- **이유**: Layout은 너무 일반적, 구체적 타입 사용

### Purpose 필수화 (2025-01-15)
- `Button/Primary` ❌ → `Button/CTA/Primary` ✅
- **이유**: Purpose가 없으면 역할 불명확

### Container 대신 Content
- `Container/...` → `Content/...`
- **이유**: Content가 더 의미 있고 일관됨

### 최상위 스크린 프레임
- PAGE 바로 아래 프레임은 prefix 제거
- `Container/HomeScreen` → `HomeScreen`

---

## AutoLayout Decisions

### AI 기반만 사용
- Rule-based Auto Layout 삭제
- **이유**: 스크린샷 기반 AI 분석이 더 정확

### FILL 최소화 원칙
- `layoutGrow: 1` (FILL)은 95% 이상 채우는 경우에만
- 기본값: `layoutAlign: INHERIT`, `layoutGrow: 0`

### NONE 응답 처리
- AI가 `NONE` 반환 시 Auto Layout 미적용
- **이유**: 일부 레이아웃은 Auto Layout 부적합

---

## Cleanup Decisions

### 의미 없는 래퍼 조건 (2025-01-15 업데이트)
1. 그룹 또는 프레임
2. 자식이 정확히 1개
3. 시각적 스타일 없음
4. Auto Layout 없음

> **변경**: 크기 조건 제거됨. 크기가 달라도 단일 자식이면 병합 대상.

### 레이아웃 보존 전략
- 오프셋을 padding으로 변환
- 시각적 결과 동일 보장

### 스타일 전이
- 체인 내 모든 노드의 스타일을 topNode에 병합
- fills, strokes, effects, cornerRadius 보존

---

## 변경 이력

| 날짜 | 항목 | 내용 |
|------|------|------|
| 2025-01-14 | Naming | Layout 타입 금지 결정 |
| 2025-01-15 | Naming | Purpose 필수화 |
| 2025-01-15 | Cleanup | 크기 조건 제거 |
| 2025-01-15 | Naming | Image Purpose 추가 |
| 2025-01-15 | Naming | Section vs Card 구분 명확화 |
