# 버튼 네이밍 구조 논의 기록

> 2026-01-15 디자이너 피드백 기반 네이밍 규칙 개편 논의

---

## 배경

### 기존 구조
```
Button/CTA/Primary/LG
       ↑     ↑     ↑
   Purpose Variant Size
```

### 디자이너 피드백 (2026-01-15)
- Purpose가 너무 폐쇄적, 제품 디벨롭 시 자유도 낮음
- Cancel Purpose의 버튼이 Primary가 될 일이 없는데도 연결 가능한 케이스 발생
- Purpose, State, Variant 속성이 유사성이 커서 혼란

### 디자이너 제안 구조
```
Intent: Primary1, Primary2, Normal, Cancel, Submit, Warning, Danger
Shape: Filled, Outlined, Contained
Size: 32h, 44h, 48h, 56h
Width: Fixed, Fill, Hug
+ Disabled, Loading
```

---

## 논의 과정

### 1. 업계 리서치

**Material Design 3:**
- Type: Elevated, Filled, Filled Tonal, Outlined, Text
- Shape이 Intent를 암시 (Filled = Primary action)
- 별도 Purpose 속성 없음

**업계 컨센서스:**
- "Stop naming things based on how they look, name them based on what they do"
- Component naming: Category / Component / Variant / State
- Intent와 Shape 분리가 표준

**참고:**
- [Material Design 3 Buttons](https://m3.material.io/components/buttons/guidelines)
- [Carbon Design System](https://carbondesignsystem.com/components/button/usage/)
- [UXPin Design System Naming](https://www.uxpin.com/studio/blog/design-system-naming-conventions/)

### 2. 핵심 문제 분석

**용어 충돌:**
```
기존: Button/CTA/Primary/LG
      - CTA = "Call to Action" (의미적 목적)
      - Primary = 시각적 강조? 의미적 중요도?
      → "Primary"가 두 가지 의미로 혼용
```

**조합 문제:**
```
Button/Cancel/Primary → 의미 없는 조합
Cancel인데 Primary 스타일?
→ Purpose와 Variant가 독립적이지 않음
```

### 3. 전처리 vs DS 구조 분리 논의

**초기 고려:**
- 전처리 네이밍과 DS 컴포넌트 구조를 별개로 가져갈 수 있음
- 하지만 용어가 다르면 매핑 복잡도 증가

**결론:**
- 전처리 네이밍 = DS 속성의 임시 저장소
- 용어를 일치시키면 매핑 단순화
- DS 생성 에이전트가 이름에서 속성 직접 추출 가능

### 4. 상세 네이밍 유지 결정

**고려한 대안:**
```
A. 단순화: Button/Primary (Context만)
B. 상세화: Button/Primary/Filled/48 (모든 속성)
```

**선택: B (상세화)**
- 이유: DS 생성 시 정보가 풍부할수록 정확한 컴포넌트 생성 가능
- 레이어 이름은 어차피 컴포넌트화 시 대체됨 (임시)
- AI가 시각 분석 없이 속성 추출 가능

### 5. Width 제외 결정

**논의:**
```
Width (Fixed, Fill, Hug)를 이름에 포함할지?
```

**결론: 제외**
- Width는 버튼 "정체성"이 아닌 "사용 방식"
- 같은 버튼이 다른 컨텍스트에서 다른 Width로 사용됨
- DS 컴포넌트에서 인스턴스 속성으로 처리

### 6. State/Icon 처리

**결론:**
- State (Disabled, Loading, Focus): 기본값 아닐 때만 표기
- Icon (IconLeft, IconRight, IconOnly): 있을 때만 표기
- Default 상태, 아이콘 없음은 생략

---

## 최종 결정

### 구조
```
Type/Intent/Shape/Size[/State][/Icon]
```

### 속성 값
| 속성 | 값 | 역할 |
|------|-----|------|
| Intent | Primary, Secondary, Danger, Warning, Success, Info, Normal | 의미적 목적 (색상/중요도) |
| Shape | Filled, Outlined, Ghost | 시각적 스타일 |
| Size | 32, 44, 48, 56 | 높이 (px) |
| State | Disabled, Loading, Focus | 상태 (선택) |
| Icon | IconLeft, IconRight, IconOnly | 아이콘 (선택) |

### 예시
```
Button/Primary/Filled/48
Button/Danger/Outlined/44
Button/Primary/Filled/48/Disabled
Button/Secondary/Ghost/36/IconLeft
Button/Danger/Filled/48/Loading
```

### 기존 대비 변경점
| 항목 | Before | After |
|------|--------|-------|
| Purpose | CTA, Cancel, Submit... | (제거 - Intent로 통합) |
| Variant | Primary, Secondary | (제거 - Shape으로 분리) |
| Intent | (없음) | Primary, Danger, Warning... |
| Shape | (없음) | Filled, Outlined, Ghost |

---

## 향후 고려사항

### 다른 시도가 필요할 수 있는 경우

1. **Intent 세분화 필요 시**
   - 현재: Primary = 주요 행동 통합
   - 대안: Importance(Primary/Secondary) + Action(Submit/Cancel) 분리

2. **액션 타입 표현 필요 시**
   - 현재: 버튼 텍스트가 액션 담당
   - 대안: 별도 Action 속성 추가

3. **네이밍 AI 정확도 낮을 시**
   - 현재: 상세 네이밍 (AI가 모든 속성 판단)
   - 대안: 단순 네이밍 (Type/Context) + 시각 분석으로 속성 도출

---

## 참고 자료

- Figma 디자이너 제안: `figma.com/design/1cIUDQFF3YbjjolyMuY3An/...`
- Material Design 3: `m3.material.io/components/buttons`
- Carbon Design System: `carbondesignsystem.com/components/button`
