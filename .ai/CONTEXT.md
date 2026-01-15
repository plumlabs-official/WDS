# Current Context

> 현재 작업 상태 및 세션 정보
> 마지막 업데이트: 2026-01-15

---

## 현재 작업

### 진행 중
- (없음)

### 완료됨 (2026-01-15 세션 - 디자인 시스템 개선)

#### Phase 1: 높은 우선순위 ✅
- **UI 상태(State) 슬롯 추가**
  - 형식: `ComponentType/Purpose/Variant/Size/State`
  - 허용 상태: Default, Pressed, Hover, Disabled, Loading, Focus
- **피드백/로딩 컴포넌트 추가**
  - 피드백: Toast, Modal, Snackbar, Overlay
  - 로딩: Skeleton, Spinner
- **터치 타겟 규칙 추가**
  - 최소 48x48px (웰위 통일 기준)

#### Phase 2: 중간 우선순위 ✅
- **토큰 계층 구조 문서** (신규)
  - `.ai/design-system/token-structure.md`
  - 3단계: Global → Semantic → Component
- **접근성 규칙 문서** (신규)
  - `.ai/design-system/accessibility-rules.md`
  - WCAG 2.1, 스크린 리더, 동작 제어

#### Phase 3: 다크 모드 ✅
- **다크 모드 토큰 확장**
  - 배경: #121212 (순수 검정 대신)
  - 고도: 그림자 → 표면 밝기로 표현
  - 시맨틱 토큰 모드별 분기 (light/dark)
  - React Native 구현 예시

#### 프롬프트 동기화 ✅
- `naming-context.md` - State, 새 컴포넌트 반영
- `naming-single.md` - Purpose 슬롯, State, 새 컴포넌트 추가
- `autolayout.md` - 터치 타겟 48px 규칙 추가

#### 문서 간소화 ✅
- **토큰 58% 절약**
- `naming-context.md`: 208줄 → 89줄
- `naming-single.md`: 141줄 → 74줄
- `token-structure.md`: 484줄 → 184줄

#### 문서 중복 제거 ✅
- `CLAUDE.md`: 네이밍 규칙 요약 제거 (17줄)
- `MEMORY.md`: 잘못된 Content 규칙 수정
- `PRD.md`: "Project Overview"로 역할 명확화

#### 이전 세션 완료
- 프롬프트 외부화
- 문서 통합 정리 (lessons_learned.md)
- 코칭 규칙 설정

### 대기 중
- Figma 실제 테스트 (AI 네이밍, Auto Layout)

### 보류됨 (추후 재검토)
- GPT 리서치 추가 제안 사항 (`reference/DS/GPT-리서치-요약.md`)
  - Patterns 레이어: 실무 필요성 발생 시 검토
  - StateLayer 토큰: 현재 직접 색상 정의 방식으로 충분

---

## 최종 문서 구조

```
.ai/
├── PRD.md                 # 제품 요구사항
├── MEMORY.md              # 빠른 요약 (1페이지)
├── CONTEXT.md             # 현재 상태 (이 파일)
├── lessons_learned.md     # 결정 + 실수 패턴
└── design-system/
    ├── naming-rules.md        # 네이밍 (State 슬롯 추가)
    ├── autolayout-rules.md    # Auto Layout (터치 타겟 추가)
    ├── figma-mcp-rules.md     # Figma-코드 매핑
    ├── token-structure.md     # 토큰 계층 + 다크 모드
    └── accessibility-rules.md # 접근성 규칙

docs/
├── INDEX.md
└── DEVELOPMENT-GUIDE.md

agent-server/prompts/      # 모두 동기화 완료
├── naming-context.md
├── naming-single.md
└── autolayout.md

reference/DS/
└── 웰위 디자인 시스템 제작 리서치-Gemini.pdf
```

---

## 이번 세션 주요 변경

### 1. 네이밍 형식

```
ComponentType/Purpose/Variant/Size/State

예시:
- Button/CTA/Primary/LG (기본)
- Button/CTA/Primary/LG/Disabled (상태 명시)
```

### 2. 새 컴포넌트 타입

| 카테고리 | 타입 |
|---------|-----|
| 피드백 | Toast, Modal, Snackbar, Overlay |
| 로딩 | Skeleton, Spinner |

### 3. 토큰 계층

```
Global (Base) → Semantic (Alias) → Component
```

### 4. 다크 모드

| 항목 | Light | Dark |
|------|-------|------|
| 배경 | #FFFFFF | #121212 |
| 텍스트 | Gray.900 | Gray.100 |
| 고도 | Shadow | 표면 밝기 |

---

## Agent Server

```bash
cd agent-server && npm run build && npm start
# http://localhost:3001
```

| 엔드포인트 | 설명 |
|-----------|------|
| GET /health | 헬스체크 |
| POST /agents/naming/context | 컨텍스트 기반 네이밍 |
| POST /agents/autolayout | 오토레이아웃 분석 |

---

## 다음 세션 참고사항

1. **디자인 시스템 규칙 확인 순서**
   - 네이밍: `.ai/design-system/naming-rules.md`
   - 토큰: `.ai/design-system/token-structure.md`
   - 접근성: `.ai/design-system/accessibility-rules.md`

2. **리서치 출처**
   - `reference/DS/웰위 디자인 시스템 제작 리서치-Gemini.pdf`
   - Morningstar DS (Size 규칙)
   - Carbon DS (토큰 계층)
   - Material Design 3 (다크 모드)

3. **모든 프롬프트 동기화됨**
   - naming-context.md, naming-single.md, autolayout.md

---

## 중요 결정사항 (이번 세션)

1. **UI 상태 vs 비즈니스 상태 구분**
   - UI 상태 허용: Default, Pressed, Hover, Disabled, Loading, Focus
   - 비즈니스 상태 금지: Authenticated, Empty, Success

2. **터치 타겟 통일**
   - 48x48px (iOS 44px, Android 48px 중 큰 값)

3. **토큰 계층 도입**
   - Global → Semantic → Component 3단계
   - Figma 변수와 매핑 가능

4. **접근성 필수화**
   - WCAG 2.1 대비 기준
   - accessibilityLabel 필수
   - Reduce Motion 대응

5. **다크 모드 원칙**
   - 순수 검정(#000) 대신 #121212 사용
   - 그림자 대신 표면 밝기로 고도 표현
   - 채도 낮춘 피드백 색상
