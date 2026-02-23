# Naming Rules - 네이밍 규칙 가이드

> 이 문서는 AI 네이밍 에이전트와 개발자가 **반드시 준수해야 하는** 네이밍 규칙을 정의합니다.
>
> Last updated: 2026-01-16 | v2.0.0
>
> **2026-01-15 개편**: Intent/Shape 분리 구조로 변경

---

## 네이밍 형식

### 일반 컴포넌트
```
Type/Context[/State][/Icon]
```

### 버튼 (상세 구조)
```
Button/Intent/Shape/[Color]/Size[/State][/Icon]
```

---

## 버튼 네이밍 상세

### 속성 정의

| 속성 | 필수 | 값 | 설명 |
|------|------|-----|------|
| Intent | ✅ | Primary, Secondary, Danger, Warning, Success, Info, Normal | 의미/중요도 |
| Shape | ✅ | Filled, Outlined, Ghost | 시각적 스타일 |
| Color | ❌ | White | 컬러/어두운 배경 위 흰색 버튼. Default면 생략 |
| Size | ✅ | 32, 44, 48, 56 | 높이 (px) |
| State | ❌ | Disabled, Loading, Focus | 기본(Default)이면 생략 |
| Icon | ❌ | IconLeft, IconRight, IconOnly | 아이콘 있을 때만 |

### 예시
```
Button/Primary/Filled/48              # 기본 (밝은 배경)
Button/Primary/Filled/White/56        # 컬러 배경 위 흰색 Filled
Button/Primary/Outlined/White/56      # 컬러 배경 위 흰색 Outlined
Button/Secondary/Ghost/White/26       # 컬러 배경 위 보조 텍스트 링크
Button/Danger/Outlined/44             # 위험 행동, 아웃라인
Button/Primary/Filled/48/Disabled     # 비활성
Button/Secondary/Ghost/36/IconLeft    # 고스트, 왼쪽 아이콘
Button/Danger/Filled/48/Loading       # 로딩 중
Button/Primary/Filled/56/IconOnly     # 아이콘만
```

### Intent 판단 기준

| Intent | 의미 | 시각적 특징 | 사용 예 |
|--------|------|------------|--------|
| Primary | 핵심 전환 행동 | 메인 컬러, 강조 | 확인, 저장, 시작하기, 가입 |
| Secondary | 보조/안내 행동 | 보조 컬러, 덜 강조 | 취소, 뒤로가기, 기존 회원 안내, 로그인 링크 |
| Danger | 위험/삭제 | 빨간색 계열 | 삭제, 탈퇴 |
| Warning | 경고 | 노란색/주황색 계열 | 주의 필요 행동 |
| Success | 성공/완료 | 초록색 계열 | 완료, 승인 |
| Info | 정보 | 파란색 계열 | 정보 보기, 도움말 |
| Normal | 일반 | 회색/무채색 | 일반 행동 |

### Shape 판단 기준

| Shape | 시각적 특징 | 강조 수준 |
|-------|------------|----------|
| Filled | 배경색 채워짐 | 높음 (주요 행동) |
| Outlined | 테두리만 | 중간 (보조 행동) |
| Ghost | 배경/테두리 없음 | 낮음 (텍스트 버튼) |

### Color 판단 기준

| Color | 조건 | 설명 |
|-------|------|------|
| White | 부모 배경이 컬러/어두운 색 (brightness < 180) | 텍스트·테두리가 흰색인 버튼 |
| (생략) | 부모 배경이 밝은 색/흰색 | 기본 색상 버튼 |

- Shape와 Size 사이에 위치
- 밝은 배경에서는 생략 (Default)
- 향후 필요 시 Default → Brand 등으로 확장 가능

### Size 판단 기준

| Size | 높이 | 사용 |
|------|------|------|
| 32 | 32px | 작은 버튼, 인라인 |
| 44 | 44px | 일반 버튼 |
| 48 | 48px | 중요 버튼 |
| 56 | 56px | 큰 CTA 버튼 |

---

## 일반 컴포넌트 네이밍

### 허용된 컴포넌트 타입

| 카테고리 | 타입 |
|---------|------|
| 최상위 | Screen |
| 구조 | TopBar, TabBar, Section, Container |
| UI | Card, Input, Avatar, Icon, Image, ListItem, TabItem, Badge, Tag, Header |
| 피드백 | Toast, Modal, Snackbar, Overlay |
| 로딩 | Skeleton, Spinner |
| 기타 | Toggle, Checkbox, ProgressBar, Timer, HomeIndicator, Frame |

### Context 예시

| 타입 | Context 예시 |
|------|-------------|
| Card/Section | Profile, Product, Feed, Challenge, Stats, Banner |
| Container | ButtonArea, IconGroup, ActionBar, InfoSection |
| Image | Avatar, Banner, Product, Thumbnail, Background, Logo |
| Icon | Close, Back, Share, Like, More, Search, Settings |
| ListItem | Challenge, Feed, Product, User, Setting, Rank |

### 예시
```
Card/Profile
Section/Challenge
Container/ButtonArea
Icon/Search
ListItem/Feed
Image/Avatar
Screen/Home
TopBar/Main
TabBar/Main
```

---

## State (상태) 규칙

### 허용된 UI 상태
| State | 설명 | 적용 컴포넌트 |
|-------|------|--------------|
| Disabled | 비활성 | Button, Input, Toggle |
| Loading | 로딩 중 | Button, Card, Section |
| Focus | 포커스 | Input, Button |
| Pressed | 눌린 상태 | Button, TabItem |
| Hover | 마우스 오버 | Button, Card |

### 금지된 비즈니스 상태
```
Authenticated ❌
Unauthenticated ❌
Empty ❌
Active ❌
Success ❌ (Intent로 사용)
```

---

## 절대 금지 사항 🚫

### 1. Layout 타입 금지
```
Layout/Main ❌ → TopBar/Main 또는 Section/Main ✅
Layout/BottomBar ❌ → TabBar/Main ✅
```

### 2. Content 사용 금지
```
Content ❌ → Container/[역할] ✅
Content/Main ❌ → Section/Main ✅
```

### 3. 모호한 이름 금지
```
Inner ❌
Item ❌
Wrapper ❌
Box ❌
```

### 4. 넘버링 금지
```
Content_1 ❌
Frame_123 ❌
Item_3 ❌
```

### 5. (폐기) ~~Purpose 필수~~
- 기존: `Button/CTA/Primary` 형식의 Purpose 필수
- 변경: Button은 Intent/Shape/Size 구조 사용
- 일반 컴포넌트는 Type/Context 형식

---

## Section vs Card vs ListItem

| 타입 | 역할 | 사용 시점 |
|------|------|----------|
| **Section** | 여러 아이템 **그룹화** | 목록 전체를 감싸는 영역 |
| **Card** | **독립적인 정보 단위** | 개별 카드 아이템 |
| **ListItem** | **리스트 내 개별 행** | 리스트형 항목 |

```
Section/Challenge (컨테이너)
├── Card/Challenge (개별 1)
├── Card/Challenge (개별 2)
└── Card/Challenge (개별 3)
```

---

## 검증 체크리스트

### 버튼
- [ ] Intent가 유효한 값인가? (Primary, Secondary, Danger, Warning, Success, Info, Normal)
- [ ] Shape이 유효한 값인가? (Filled, Outlined, Ghost)
- [ ] Size가 숫자인가? (32, 44, 48, 56)
- [ ] State가 UI 상태인가? (Disabled, Loading, Focus)

### 일반 컴포넌트
- [ ] Type이 허용된 값인가?
- [ ] Context가 구체적인가? (Inner, Item 등 금지)
- [ ] Layout, Content 사용 안 했는가?

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2025-01-15 | 초기 작성 |
| 2026-01-15 | **구조 개편**: Intent/Shape/Size 분리 |
| 2026-01-15 | Purpose/Variant 구조 폐기 |
| 2026-01-15 | 버튼 전용 상세 규칙 추가 |
| 2026-01-15 | Focus 상태 추가, Ghost Shape 추가 |

---

## 관련 문서

| 문서 | 역할 |
|------|------|
| [../MEMORY.md](../MEMORY.md) | 규칙 결정 배경 (WHY) |
| [../lessons_learned.md](../lessons_learned.md) | 네이밍 버그 패턴 |
