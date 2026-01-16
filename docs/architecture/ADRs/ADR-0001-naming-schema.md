# ADR-0001: 네이밍 스키마 구조

## 상태

승인됨 (2026-01-15)

## 컨텍스트

버튼 및 UI 컴포넌트의 네이밍 규칙이 필요했습니다. 기존에는 `Purpose/Variant` 구조를 사용했으나, 의미 중복과 확장성 문제가 있었습니다.

### 기존 구조의 문제

```
Button/CTA/Primary/LG
       ↑    ↑
    Purpose Variant
    (의미 중복)
```

- `CTA`와 `Primary`가 모두 "주요 액션"을 의미
- DS 컴포넌트 속성과 1:1 매핑이 어려움

## 결정

**Intent/Shape/Size 구조**를 채택합니다.

```
Type/Intent/Shape/Size[/State][/Icon]
```

### 예시

| 기존 | 변경 |
|------|------|
| `Button/CTA/Primary/LG` | `Button/Primary/Filled/48` |
| `Button/Secondary/Outline/MD` | `Button/Secondary/Outlined/40` |

### 세그먼트 정의

| 세그먼트 | 설명 | 값 |
|----------|------|-----|
| Type | 컴포넌트 유형 | Button, Icon, Card... |
| Intent | 시각적 강조 | Primary, Secondary, Tertiary |
| Shape | 배경 스타일 | Filled, Outlined, Ghost, Elevated |
| Size | 높이 (px) | 48, 40, 32, 24 |
| State | (선택) 상태 | Disabled, Loading |
| Icon | (선택) 아이콘 | Leading, Trailing, Only |

## 결과

### 장점

- DS 컴포넌트 속성과 용어 1:1 일치
- 의미 중복 제거
- 확장성 향상

### 단점

- 기존 네이밍과 마이그레이션 필요
- 학습 곡선

## 참고

- 디자이너 피드백 반영 (유연성, 확장성)
- 상세 규칙: [docs/specs/naming-schema.md](../../specs/naming-schema.md)
