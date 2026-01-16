# GPT 디자인 시스템 리서치 요약

> 2026-01-15 세션에서 검토
> 상태: 참고용 보관 (현재 적용 보류)

---

## 주요 제안 사항

### 1. Patterns 레이어 추가
```
Pattern/EmptyState
Pattern/LoadingSkeleton
Pattern/ErrorState
```

**검토 결과:** 현재 시스템에서 Purpose 슬롯으로 대체 가능
- `Container/EmptyState`
- `Section/Loading`

### 2. StateLayer 토큰
```
stateLayer.hover.opacity: 8%
stateLayer.focus.opacity: 12%
stateLayer.pressed.opacity: 12%
```

**검토 결과:** 현재 시스템은 직접 색상 정의 방식 사용
- `color.primary.hover → green.600`
- Material Design 3 방식과 다른 패러다임

### 3. State 관리 명확화

**제안:** State는 Figma Component Properties에서만 관리

**현재 시스템:** State 슬롯은 선택적, Properties 우선 권장

---

## 적용 보류 이유

1. **복잡도 대비 이점 미미**
   - 현재 시스템으로 충분히 표현 가능

2. **패러다임 충돌**
   - StateLayer는 오버레이 기반
   - 현재 시스템은 직접 색상 정의

3. **실무 검증 필요**
   - Figma 실제 테스트 후 필요성 재평가

---

## 추후 적용 조건

- Figma 테스트에서 "패턴 재사용 어려움" 피드백 발생 시
- 대규모 앱에서 상태 관리 복잡도 증가 시

---

## 출처

- GPT-4 디자인 시스템 리서치 (2026-01)
- Material Design 3 참조
