# Accessibility Rules - 접근성 규칙 가이드

> 접근성은 디자인 시스템의 선택 사항이 아닌 필수 요구 사항입니다.
> 특히 건강 관련 서비스는 다양한 스펙트럼의 사용자를 고려해야 합니다.
>
> 출처: WCAG 2.1, Apple HIG, Material Design, Gemini 리서치

---

## 색상 대비 (Color Contrast)

### WCAG 2.1 기준

| 요소 | 최소 대비 | 권장 대비 |
|------|----------|----------|
| 일반 텍스트 (< 18px) | 4.5:1 | 7:1 (AAA) |
| 큰 텍스트 (≥ 18px bold 또는 ≥ 24px) | 3:1 | 4.5:1 |
| UI 컴포넌트 / 그래픽 | 3:1 | 4.5:1 |
| 비활성 요소 | 요구 없음 | - |

### 웰위 색상 대비 검증

```
✅ 통과
- Primary (#00cc61) on White: 3.1:1 (큰 텍스트/UI용)
- Gray.900 (#1a1a1a) on White: 16:1
- White on Primary (#00cc61): 3.1:1

⚠️ 주의
- Primary 텍스트는 18px 이상에서만 사용
- 작은 텍스트는 Gray.900 또는 Gray.700 사용
```

### 대비 검증 도구

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Figma 플러그인: Stark, A11y - Color Contrast Checker

---

## 터치 타겟 (Touch Targets)

> `autolayout-rules.md`의 터치 타겟 규칙 참조

| 플랫폼 | 최소 크기 |
|--------|----------|
| iOS | 44x44px |
| Android | 48x48px |
| **웰위 통일** | **48x48px** |

### 적용 컴포넌트

- Button, Icon (터치 가능), TabItem, ListItem
- Toggle, Checkbox, Input
- Card (터치 가능)

---

## 스크린 리더 (Screen Reader)

### React Native 접근성 속성

| 속성 | 용도 | 필수 여부 |
|------|------|----------|
| `accessible` | 접근성 요소 지정 | ✅ 필수 |
| `accessibilityLabel` | 요소 설명 (읽어줄 텍스트) | ✅ 필수 |
| `accessibilityHint` | 동작 힌트 (선택적 추가 설명) | 권장 |
| `accessibilityRole` | 요소 역할 (button, link 등) | ✅ 필수 |
| `accessibilityState` | 상태 (disabled, selected 등) | 상황별 |

### 컴포넌트별 접근성 가이드

#### Image

```typescript
// ✅ 올바른 예시
<Image
  source={avatarUrl}
  accessible={true}
  accessibilityLabel="사용자 프로필 이미지"
  accessibilityRole="image"
/>

// ❌ 잘못된 예시
<Image source={avatarUrl} />  // accessibilityLabel 누락
```

#### Button

```typescript
// ✅ 올바른 예시
<Pressable
  accessible={true}
  accessibilityLabel="챌린지 시작하기"
  accessibilityHint="탭하면 새 챌린지가 시작됩니다"
  accessibilityRole="button"
  accessibilityState={{ disabled: isLoading }}
>
  <Text>시작하기</Text>
</Pressable>
```

#### Icon Button

```typescript
// ✅ 올바른 예시 - 아이콘만 있는 버튼
<Pressable
  accessible={true}
  accessibilityLabel="닫기"
  accessibilityRole="button"
>
  <CloseIcon />
</Pressable>

// ❌ 잘못된 예시
<Pressable>
  <CloseIcon />  // 스크린 리더가 "버튼"만 읽음
</Pressable>
```

#### Input

```typescript
// ✅ 올바른 예시
<TextInput
  accessible={true}
  accessibilityLabel="이메일 입력"
  accessibilityHint="이메일 주소를 입력하세요"
  accessibilityRole="text"
  accessibilityState={{ disabled: false }}
/>
```

---

## 동작 제어 (Motion)

### Reduce Motion 대응

사용자가 시스템 설정에서 '동작 줄이기'를 활성화한 경우:

```typescript
import { AccessibilityInfo } from 'react-native';

// 설정 확인
const [reduceMotion, setReduceMotion] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

  const listener = AccessibilityInfo.addEventListener(
    'reduceMotionChanged',
    setReduceMotion
  );

  return () => listener.remove();
}, []);

// 애니메이션 조건부 적용
const animationDuration = reduceMotion ? 0 : 300;
```

### 애니메이션 가이드라인

| 상황 | Reduce Motion OFF | Reduce Motion ON |
|------|-------------------|------------------|
| 페이지 전환 | 슬라이드 애니메이션 | 즉시 전환 |
| 버튼 피드백 | 스케일/색상 변화 | 색상 변화만 |
| 로딩 스피너 | 회전 애니메이션 | 정적 표시 또는 진행바 |
| 토스트 알림 | 슬라이드 인/아웃 | 즉시 표시/숨김 |

---

## 포커스 관리 (Focus Management)

### 모달/팝업 포커스

```typescript
// 모달 열릴 때 첫 번째 요소로 포커스 이동
const firstFocusableRef = useRef<View>(null);

useEffect(() => {
  if (isOpen && firstFocusableRef.current) {
    AccessibilityInfo.setAccessibilityFocus(
      findNodeHandle(firstFocusableRef.current)
    );
  }
}, [isOpen]);
```

### 포커스 순서

1. 논리적 순서로 탐색 가능해야 함
2. 모달 열리면 모달 내부로 포커스 트랩
3. 모달 닫히면 트리거 요소로 포커스 복귀

---

## 다크 모드 접근성

### 대비 유지

```
Light Mode: Gray.900 on White (16:1) ✅
Dark Mode: Gray.100 on Gray.900 (12:1) ✅
```

### 다크 모드 특수 규칙

| 항목 | Light Mode | Dark Mode |
|------|------------|-----------|
| 배경 | #FFFFFF | #121212 (순수 검정 X) |
| 기본 텍스트 | Gray.900 | Gray.100 |
| 보조 텍스트 | Gray.600 | Gray.400 |
| Primary 색상 | #00cc61 | #00cc61 (채도 유지 또는 약간 낮춤) |

---

## 폰트 크기 (Dynamic Type)

### 시스템 폰트 크기 대응

```typescript
import { PixelRatio, useWindowDimensions } from 'react-native';

// 폰트 스케일 팩터 확인
const fontScale = PixelRatio.getFontScale();

// 최소/최대 폰트 크기 제한
const clampedFontSize = Math.min(Math.max(baseFontSize * fontScale, 12), 32);
```

### 폰트 크기 가이드

| 요소 | 기본 크기 | 최소 | 최대 |
|------|----------|------|------|
| Body | 16px | 14px | 24px |
| Caption | 12px | 12px | 18px |
| Heading | 24px | 20px | 36px |

---

## 검증 체크리스트

### 색상

- [ ] 텍스트 대비 4.5:1 이상 (일반 텍스트)
- [ ] 큰 텍스트/UI 대비 3:1 이상
- [ ] 색상만으로 정보 전달하지 않음 (아이콘/텍스트 병행)

### 터치

- [ ] 터치 타겟 48x48px 이상
- [ ] 터치 요소 간 8px 이상 간격

### 스크린 리더

- [ ] 모든 Image에 accessibilityLabel
- [ ] 모든 Button에 accessibilityLabel + accessibilityRole
- [ ] 아이콘 버튼에 의미 있는 레이블

### 동작

- [ ] Reduce Motion 설정 대응
- [ ] 필수 애니메이션만 유지

### 포커스

- [ ] 모달 열릴 때 포커스 이동
- [ ] 논리적 탐색 순서

---

## 테스트 방법

### iOS

1. 설정 → 손쉬운 사용 → VoiceOver 활성화
2. 앱 탐색하며 모든 요소 읽히는지 확인

### Android

1. 설정 → 접근성 → TalkBack 활성화
2. 앱 탐색하며 모든 요소 읽히는지 확인

### 자동화 테스트

```bash
# React Native 접근성 테스트 라이브러리
npm install @testing-library/react-native

# 접근성 검증 예시
expect(getByRole('button')).toHaveAccessibleName('시작하기');
```

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-01-15 | 초기 작성 (WCAG 2.1, Gemini 리서치 기반) |
