# Naming Rules - 네이밍 규칙 가이드

> 이 문서는 AI 네이밍 에이전트와 개발자가 **반드시 준수해야 하는** 네이밍 규칙을 정의합니다.
> 실수 방지를 위해 **금지 사항**을 명확히 명시합니다.

---

## 네이밍 형식

```
ComponentType/Purpose/Variant/Size/State
```

| 슬롯 | 필수 | 설명 | 예시 |
|------|------|------|------|
| ComponentType | ✅ | 컴포넌트 타입 | Button, Card, Section |
| Purpose | ✅ | 역할/용도 | CTA, Profile, Challenge |
| Variant | ❌ | 시각적 스타일 | Primary, Secondary, Outline |
| Size | ❌ | 크기 (특정 타입만) | XS, SM, MD, LG, XL |
| State | ❌ | UI 상태 (필요시만) | Disabled, Pressed, Loading |

**예시:**
- `Button/CTA/Primary/LG`
- `Button/CTA/Primary/LG/Disabled` (상태 명시 필요 시)
- `Card/Profile`
- `Section/Challenge`
- `Container/ButtonArea`

---

## 허용된 컴포넌트 타입

### 최상위
- `Screen`

### 구조 컨테이너
- `TopBar`, `TabBar`, `Section`, `Container`

### UI 컴포넌트
- `Card`, `Button`, `Input`, `Avatar`, `Icon`, `Image`
- `ListItem`, `TabItem`, `Badge`, `Tag`, `Header`

### 피드백
- `Toast`, `Modal`, `Snackbar`, `Overlay`

### 로딩
- `Skeleton`, `Spinner`

### 기타
- `Toggle`, `Checkbox`, `ProgressBar`, `Timer`, `HomeIndicator`, `Frame`

---

## Size 적용 규칙 (중요!)

### Size 적용 O
| 컴포넌트 | 예시 |
|---------|------|
| Button | `Button/CTA/Primary/LG` |
| Input | `Input/Search/MD` |
| Avatar | `Avatar/User/MD` |
| Card | `Card/Profile/LG` |
| Badge | `Badge/Status/SM` |
| Icon | `Icon/Close/SM` |
| Tag | `Tag/Category/SM` |

### Size 적용 X (절대 금지!)
| 컴포넌트 | 올바른 예시 | 잘못된 예시 |
|---------|------------|------------|
| Container | `Container/ButtonArea` | `Container/ButtonArea/LG` ❌ |
| Section | `Section/Challenge` | `Section/Challenge/MD` ❌ |
| TopBar | `TopBar/Main` | `TopBar/Main/LG` ❌ |
| TabBar | `TabBar/Main` | `TabBar/Main/MD` ❌ |
| ListItem | `ListItem/Feed` | `ListItem/Feed/SM` ❌ |
| Image | `Image/Avatar` | `Image/Avatar/LG` ❌ |
| Screen | `Screen/Home` | `Screen/Home/Full` ❌ |
| Header | `Header/Main` | `Header/Main/LG` ❌ |
| Frame | `Frame/Unknown` | `Frame/Unknown/MD` ❌ |

**근거:** 디자인 시스템 베스트 프랙티스 (Morningstar Design System 등)에서 Container, Layout, Navigation 등은 "Default Size Only"

---

## Section vs Card vs ListItem 구분

| 타입 | 역할 | 사용 시점 |
|------|------|----------|
| **Section** | 여러 아이템을 **그룹화하는 컨테이너** | 목록 전체를 감싸는 영역 |
| **Card** | **독립적인 정보 단위** | 개별 카드 아이템 |
| **ListItem** | **리스트 내 개별 행** | 리스트형 항목 |

**올바른 계층 구조:**
```
Section/Challenge (컨테이너)
├── Card/Challenge (개별 카드 1)
├── Card/Challenge (개별 카드 2)
└── Card/Challenge (개별 카드 3)
```

**잘못된 예시:**
```
Card/Challenge (컨테이너) ❌ → Section/Challenge ✅
Section/Challenge (개별 아이템) ❌ → Card/Challenge ✅
```

---

## 절대 금지 사항 🚫

### 1. Layout 타입 금지
```
Layout/Main ❌
Layout/TopBar ❌
Layout/BottomBar ❌
```
**대체:**
- `Layout/Main` → `TopBar/Main` 또는 `Section/Main`
- `Layout/BottomBar` → `TabBar/Main`

### 2. Content 사용 금지
```
Content ❌
Content/Main ❌
```
**대체:**
- `Content` → `Container/[구체적역할]` (예: `Container/ButtonArea`)
- 역할을 알 수 없으면 `Frame/Unknown`

### 3. Purpose 생략 금지
```
Button/Primary ❌ (Purpose 누락)
Card/LG ❌ (Purpose 누락)
```
**올바른 형식:**
- `Button/CTA/Primary`
- `Card/Profile/LG`

### 4. 비즈니스 상태 추론 금지
```
Screen/Home/Authenticated ❌
Card/Challenge/Empty ❌
```
**금지 키워드 (비즈니스 상태):** Authenticated, Unauthenticated, Empty, Active, Success

**허용 키워드 (UI 상태):** Default, Pressed, Hover, Disabled, Loading, Focus
- UI 상태는 State 슬롯에서 사용 가능
- 예: `Button/CTA/Primary/LG/Disabled` ✅

### 5. 잘못된 타입 생성 금지
```
HomeScreen/... ❌
LoginScreen/... ❌
UserCard/... ❌
ChallengeCard/... ❌
```
**올바른 형식:**
- `HomeScreen` → `Screen/Home`
- `UserCard` → `Card/User` 또는 `Card/Profile`

### 6. 넘버링 금지
```
Content_1, Content_2 ❌
Item_3 ❌
Frame_123 ❌
```
**대체:** 각각 고유한 Purpose 부여

### 7. 모호한 이름 금지
```
Inner ❌
Item ❌
Wrapper ❌
Box ❌
```
**대체:** 구체적인 역할 명시 (예: `Container/ButtonArea`)

---

## Purpose 추론 가이드

### Button Purpose
| Purpose | 설명 | 예시 |
|---------|------|------|
| CTA | 주요 행동 유도 | 가입, 시작하기, 구매, 확인 |
| Submit | 폼 제출 | 제출, 저장 |
| Cancel | 취소 | 취소, 닫기 |
| Close | 닫기 (X 아이콘) | 모달/팝업 닫기 |
| Back | 뒤로가기 | 이전 화면 |
| Next | 다음 단계 | 다음, 계속 |
| Share | 공유 | 공유하기 |
| Like | 좋아요 | 좋아요, 즐겨찾기 |
| More | 더보기 | 옵션, 메뉴 |

### Card/Section Purpose
| Purpose | 설명 |
|---------|------|
| Profile | 사용자 프로필 |
| Product | 상품 정보 |
| Feed | 피드/게시물 |
| Challenge | 챌린지/미션 |
| Stats | 통계/수치 |
| Banner | 배너/프로모션 |

### Container Purpose
| Purpose | 설명 |
|---------|------|
| ButtonArea | 버튼 그룹 |
| IconGroup | 아이콘 그룹 |
| ActionBar | 액션 버튼 모음 |
| InfoSection | 정보 표시 영역 |
| ImageArea | 이미지 영역 |

### Image Purpose
| Purpose | 설명 |
|---------|------|
| Avatar | 프로필 이미지 |
| Banner | 배너 이미지 |
| Product | 상품 이미지 |
| Thumbnail | 썸네일 |
| Background | 배경 이미지 |
| Logo | 로고 |

---

## 검증 체크리스트

프롬프트 수정 또는 코드 변경 시 다음 항목 확인:

- [ ] Layout 타입 사용 여부 → 금지
- [ ] Content 단독 사용 여부 → 금지
- [ ] Purpose 누락 여부 → 모든 컴포넌트에 필수
- [ ] Size가 올바른 컴포넌트에만 적용되었는지
- [ ] 비즈니스 상태 키워드 포함 여부 → 금지
- [ ] 넘버링 사용 여부 → 금지
- [ ] Section/Card/ListItem 구분이 올바른지

---

---

## UI 상태 (State) 규칙

### 허용된 UI 상태
| State | 설명 | 적용 컴포넌트 |
|-------|------|--------------|
| Default | 기본 상태 (생략 가능) | 모든 컴포넌트 |
| Pressed | 눌린 상태 | Button, TabItem, ListItem |
| Hover | 마우스 오버 (웹) | Button, Card, ListItem |
| Disabled | 비활성 상태 | Button, Input, Toggle, Checkbox |
| Loading | 로딩 중 | Button, Card, Section |
| Focus | 포커스 상태 | Input, Button |

### State 사용 규칙
1. **기본 상태(Default)는 생략**: `Button/CTA/Primary/LG` (Default 생략)
2. **상태 명시 필요 시만 추가**: `Button/CTA/Primary/LG/Disabled`
3. **비즈니스 상태와 혼동 금지**: UI 상태만 State 슬롯에 사용

**올바른 예시:**
```
Button/CTA/Primary/LG/Disabled ✅
Input/Search/MD/Focus ✅
Card/Profile/Loading ✅
```

**잘못된 예시:**
```
Button/CTA/Primary/LG/Authenticated ❌ (비즈니스 상태)
Card/Challenge/Empty ❌ (비즈니스 상태)
Screen/Home/Active ❌ (모호한 상태)
```

---

## 피드백/로딩 컴포넌트 Purpose

### Toast Purpose
| Purpose | 설명 |
|---------|------|
| Success | 성공 알림 |
| Error | 에러 알림 |
| Warning | 경고 알림 |
| Info | 정보 알림 |

### Modal Purpose
| Purpose | 설명 |
|---------|------|
| Confirm | 확인 다이얼로그 |
| Alert | 경고 다이얼로그 |
| Form | 폼 입력 모달 |
| FullScreen | 전체 화면 모달 |

### Skeleton Purpose
| Purpose | 설명 |
|---------|------|
| Card | 카드 로딩 플레이스홀더 |
| List | 리스트 로딩 플레이스홀더 |
| Profile | 프로필 로딩 플레이스홀더 |
| Text | 텍스트 로딩 플레이스홀더 |

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2025-01-15 | 초기 작성 |
| 2025-01-15 | Purpose 슬롯 필수화 |
| 2025-01-15 | Layout, Content 완전 금지 |
| 2025-01-15 | Size 적용 컴포넌트 제한 |
| 2025-01-15 | Section vs Card vs ListItem 구분 규칙 |
| 2026-01-15 | UI 상태(State) 슬롯 추가 |
| 2026-01-15 | 피드백/로딩 컴포넌트 타입 추가 (Toast, Modal, Snackbar, Overlay, Skeleton, Spinner) |
