# Token Structure - 디자인 토큰 계층 구조

> 출처: Gemini 리서치, Carbon Design System, Material Design 3

---

## 토큰 계층 (3단계)

```
Global (Base) → Semantic (Alias) → Component
```

| 계층 | 역할 | 예시 |
|------|------|------|
| Global | 원시 값 | `global.color.green.500` |
| Semantic | 역할/의미 | `color.primary.background` |
| Component | 컴포넌트 속성 | `button.primary.background` |

---

## Global 토큰

### 색상
```
global.color.green.{50-900}   # 500 = #00cc61 (브랜드)
global.color.gray.{50-900}
global.color.white / black
```

### 간격
```
global.spacing.{0,1,2,3,4,5,6,8,10,12,16}
# 1=4px, 2=8px, 4=16px, 6=24px, 8=32px
```

### 타이포그래피
```
global.font.size.{xs,sm,md,lg,xl,2xl,3xl}
# xs=12, sm=14, md=16, lg=18, xl=20
global.font.weight.{regular,medium,semibold,bold}
```

### 반경
```
global.radius.{none,sm,md,lg,xl,2xl,full}
# sm=4, md=8, lg=12, full=9999
```

---

## Semantic 토큰

### 색상 역할
```
color.primary.{default,hover,pressed,disabled}
color.secondary.{default,hover}
color.surface.{default,secondary,elevated}
color.text.{primary,secondary,disabled,inverse,link}
color.feedback.{success,error,warning,info}
color.border.{default,strong,focus}
```

### 간격 역할
```
spacing.component.padding.{xs,sm,md,lg}  # 4,8,16,24
spacing.component.gap.{xs,sm,md,lg}
spacing.layout.{section,page}            # 32,64
```

---

## Component 토큰

### Button
```
button.primary.background.{default,hover,pressed,disabled}
button.primary.text → color.text.inverse
button.padding.{sm,md,lg}
button.radius → global.radius.md
button.min.height → 48px
```

### Card
```
card.background → color.surface.default
card.border → color.border.default
card.radius → global.radius.lg
card.padding → spacing.component.padding.md
```

### Input
```
input.background.{default,disabled}
input.border.{default,focus,error}
input.min.height → 48px
```

---

## 다크 모드

### 설계 원칙

| 항목 | Light | Dark |
|------|-------|------|
| 배경 | #FFFFFF | #121212 (순수 검정 X) |
| 대비 | 높음 | 적절 (눈 피로 감소) |
| 채도 | 선명 | 뮤트/파스텔 |
| 고도 | 그림자 | 표면 밝기 |

### 다크 모드 표면 (Elevation)

| dp | Light Shadow | Dark Surface |
|----|--------------|--------------|
| 0 | none | #121212 |
| 1 | 0 1px 2px | #1E1E1E |
| 2 | 0 2px 4px | #232323 |
| 4 | 0 4px 8px | #272727 |
| 8 | 0 8px 16px | #2D2D2D |
| 16 | 0 16px 32px | #353535 |

### Semantic 토큰 (모드별)

```
color.surface.default
  light: #FFFFFF
  dark:  #121212

color.text.primary
  light: gray.900
  dark:  gray.100

color.primary.default
  light: green.500
  dark:  #4ADE80 (밝기↑, 채도↓)

color.feedback.success
  light: #22C55E
  dark:  #4ADE80
```

### React Native 구현

```typescript
const tokens = {
  color: {
    surface: {
      default: { light: '#FFFFFF', dark: '#121212' }
    }
  }
};

function getToken(path: string, mode: 'light' | 'dark') {
  return get(tokens, path)[mode];
}
```

---

## Figma 변수 매핑

| 토큰 계층 | Figma 기능 |
|----------|-----------|
| Global | Color Styles, Variable Collections |
| Semantic | Variable Aliases |
| Component | Component Properties |

### Figma 모드 설정
```
Collection: "Color Tokens"
├── Mode: "Light" → surface/default: #FFFFFF
└── Mode: "Dark"  → surface/default: #121212
```

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-01-15 | 초기 작성 |
| 2026-01-15 | 다크 모드 토큰 추가 |
| 2026-01-15 | 간소화 리팩토링 |
