# Figma MCP Rules

> 피그마 레이어 → 코드 매핑 규칙
>
> Last updated: 2026-01-16 | v2.0.0

---

## 레이어 타입 매핑

| Figma 타입 | 코드 컴포넌트 |
|------------|--------------|
| FRAME | `<div>` / Container |
| GROUP | `<div>` (Auto Layout 없음) |
| TEXT | `<span>` / `<p>` |
| RECTANGLE | `<div>` (background) |
| ELLIPSE | `<div>` (border-radius: 50%) |
| VECTOR | `<svg>` |
| INSTANCE | Component 참조 |

---

## Auto Layout → Flexbox

| Figma | CSS |
|-------|-----|
| `layoutMode: VERTICAL` | `flex-direction: column` |
| `layoutMode: HORIZONTAL` | `flex-direction: row` |
| `itemSpacing` | `gap` |
| `paddingTop/Right/Bottom/Left` | `padding` |
| `primaryAxisSizingMode: AUTO` | 해당 축 `auto` |
| `counterAxisSizingMode: AUTO` | 해당 축 `auto` |

### 자식 Sizing

| Figma | CSS |
|-------|-----|
| `layoutAlign: STRETCH` | `align-self: stretch` |
| `layoutGrow: 1` | `flex-grow: 1` |
| `layoutGrow: 0` | `flex-grow: 0` (기본값) |

---

## 네이밍 → 컴포넌트

| 네이밍 패턴 | 컴포넌트 |
|------------|---------|
| `Button/CTA/Primary/LG` | `<Button variant="primary" size="lg">` |
| `Card/Profile` | `<ProfileCard>` |
| `Icon/Close` | `<CloseIcon>` |
| `Avatar/User/MD` | `<Avatar size="md">` |
| `Input/Search` | `<SearchInput>` |

---

## 스타일 매핑

### Colors
| Figma | CSS |
|-------|-----|
| `fills[0].color` | `background-color` |
| `strokes[0].color` | `border-color` |

### Typography
| Figma | CSS |
|-------|-----|
| `fontSize` | `font-size` |
| `fontWeight` | `font-weight` |
| `lineHeight` | `line-height` |
| `letterSpacing` | `letter-spacing` |

### Effects
| Figma | CSS |
|-------|-----|
| `effects[type=DROP_SHADOW]` | `box-shadow` |
| `effects[type=BLUR]` | `filter: blur()` |

---

## 특수 처리

### clipsContent
```css
overflow: hidden;
```

### cornerRadius
```css
/* 단일 값 */
border-radius: 8px;

/* 개별 값 */
border-radius: 8px 8px 0 0;
```

### constraints
| Figma | CSS |
|-------|-----|
| `MIN` | `left: 0` |
| `MAX` | `right: 0` |
| `CENTER` | `margin: 0 auto` |
| `STRETCH` | `width: 100%` |

---

## 주의사항

### 지원하지 않는 기능
- Blend modes (일부)
- Complex gradients
- Vector networks

### 변환 시 검증
- [ ] Auto Layout이 Flexbox로 올바르게 변환되었는가?
- [ ] 색상 값이 정확한가?
- [ ] 폰트가 올바르게 매핑되었는가?
- [ ] 그림자/효과가 적용되었는가?

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2025-01-15 | 초기 작성 |
