# Memory Bank

> 장기 의사결정 기록 (WHY)
>
> 참조: `reference/PM/바이브 코딩 및 WDS 프로젝트 문서 관리 가이드.pdf`

---

## Architecture

### Rule-based vs AI 기반
- **결정**: 하이브리드 방식 - Rule-based 우선, AI는 보조
- **이유**: Rule-based가 빠르고 예측 가능, AI는 복잡한 판단에만 사용

### Agent Server 분리
- **결정**: localhost:3001로 별도 서버 운영
- **이유**: Figma 플러그인 외부 API 호출 제한, UI에서 fetch로 통신

### 전처리 순서
```
1. 래퍼 제거 → 2. 중첩 병합 → 3. 컴포넌트 브레이크
4. 꺼진 레이어 삭제 → 5. AI 네이밍 → 6. AI Auto Layout → 7. 간격 표준화
```

---

## Naming

### Layout 타입 금지
- `Layout/Main` ❌ → `TopBar/Main` 또는 `Section/Main` ✅
- **이유**: Layout은 너무 일반적, 구체적 타입 사용

### Purpose 필수화
- `Button/Primary` ❌ → `Button/CTA/Primary` ✅
- **이유**: Purpose가 없으면 역할 불명확

### Blacklist 이름 (Content, Layout 등)
- 금지 패턴: `Content`, `Layout`, `Inner`, `Wrapper`, `Box`, `Item`
- Direct Naming에서 `null` 반환 → AI에게 위임
- **이유**: 규칙 위반 폴백이 AI 분석 기회 박탈

### 최상위 스크린 프레임
- PAGE 바로 아래 프레임은 `Screen/[Purpose]` 사용
- 예: `Screen/Home`, `Screen/Profile`

### 네이밍 우선순위
```
1. 구조적 네이밍 (부모 도메인 기반)
2. 아이콘 라이브러리 (carbon:xxx, solar:xxx)
3. 하이픈 아이콘 패턴 (user-circle-02)
4. 한글 레이블 (홈, 라운지)
5. 아이콘 상태 컨테이너 (on/off 자식)
6. camelCase → PascalCase
7. Section 추론 (자식 키워드 기반)
```

### Section vs Card vs ListItem 구분
| 타입 | 역할 | 예시 |
|------|------|------|
| Section | 여러 아이템을 그룹화 | `Section/Challenge` |
| Card | 독립적인 정보 단위 | `Card/Challenge` |
| ListItem | 리스트 내 개별 행 | `ListItem/Challenge` |

### AI 대상 노드 타입 확대
- 기존: FRAME only → 변경: FRAME, GROUP, COMPONENT, INSTANCE
- **이유**: GROUP 등도 의미 있는 컴포넌트일 수 있음

### Validator 도입
- AI 응답 검증: Purpose 필수, 금지 패턴, Size 규칙
- **위치**: `agent-server/src/agents/naming.ts`

---

## AutoLayout

### AI 기반만 사용
- Rule-based Auto Layout 삭제
- **이유**: 스크린샷 기반 AI 분석이 더 정확

### FILL 최소화 원칙
- `layoutGrow: 1` (FILL)은 95% 이상 채우는 경우에만
- 기본값: `layoutAlign: INHERIT`, `layoutGrow: 0`

### NONE 응답 처리
- AI가 `NONE` 반환 시 Auto Layout 미적용
- **이유**: 일부 레이아웃은 Auto Layout 부적합

### 방향 추론 로직
```typescript
const horizontalDiff = Math.abs(first.x - second.x);
const verticalDiff = Math.abs(first.y - second.y);
direction = horizontalDiff > verticalDiff ? 'HORIZONTAL' : 'VERTICAL';
```

### 크기 변화 검증
- 적용 전/후 비교, 5px 이상 변화 시 경고

---

## Cleanup

### 의미 없는 래퍼 조건
1. 그룹 또는 프레임
2. 자식이 정확히 1개
3. 시각적 스타일 없음 (fill, stroke, effect)
4. Auto Layout 없음

> **변경**: 크기 조건 제거됨. 크기가 달라도 단일 자식이면 병합 대상.

### 동일 이름 중첩 무조건 병합
- `Icon/User > Icon/User` → 크기/스타일 무관하게 병합
- **이유**: 동일 이름 = 불필요한 중첩
- **구현**: `findSingleChildChain()`에서 동일 이름이면 `isSimilarSize` 스킵

### Auto Layout 복원 방식
- 병합 전 Auto Layout 설정 저장 (mode, gap, padding 등)
- 병합 후 저장된 설정으로 복원
- **이유**: 추론보다 원본 값 복원이 정확

### 레이아웃 보존 전략
- 오프셋을 padding으로 변환
- 시각적 결과 동일 보장
- 레이아웃 깨짐 감지 시 `beforeSnapshot` 기준 위치 보정

### 스타일 전이
| 속성 | 병합 방식 |
|------|----------|
| `fills` | 하위→상위 순서로 레이어 병합 |
| `strokes` | 모든 노드의 stroke 병합 |
| `effects` | 모든 노드의 shadow/blur 병합 |
| `cornerRadius` | 가장 큰 값 사용 |
| `clipsContent` | 하나라도 true면 true |

---

## Component Break

### 크기 복원 로직
- `detachInstance()` 후 내부 constraints가 풀리면서 크기 변경
- 원래 크기 저장 → detach 후 복원

### 중첩 보조 레이어 처리
- 보조 레이어 (Ratio, Constraints, Spacer): 삭제
- 일반 레이어 (Shape 등): 원본 크기 기준 스케일 다운
- cleanup 전 Auto Layout 해제로 HUG 방지
