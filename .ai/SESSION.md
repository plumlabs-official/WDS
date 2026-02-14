# Session Memory

> 세션 단기 기억 (compact 후 이어갈 내용)
>
> Last updated: 2026-02-12 | v3.4.0

---

## 현재 세션 (2026-02-15)

### 완료: AGENTS.md → CONSTITUTION.md rename
- Codex 전용 `~/AGENTS.md`와 혼동 방지
- CLAUDE.md, CONSTITUTION.md 내 참조 업데이트
- Agent: Claude

---

## 이전 세션 (2026-02-13)

### 완료: WellWe TF 간트차트 일정 수정

- 타임라인 → 간트차트 형태로 변경
- 워크샵 일정: 2/25, 3/11, 3/25, 4/8 (2주 간격 수요일)
- 1차: 온보딩 리뷰 + 원데이 정리
- 2~4차: 전주 디벨롭 리뷰 + 새 주제 워크샵

---

## 이전 세션 (2026-02-12)

### 완료: WellWe TF 일정표 2차 리뷰

**Lenny Director 모드** 사용 (Design Director + Product Leader + WellWe Domain Expert)

**수정 내역:**
- 상태 오류 2건 수정 (미완료/부분완료 → 완료)
- 누락 항목 4건 추가 (간소화 주제 e, f, h)
- 비고 보강 1건 (유료 챌린지 전용 라운지)

**회고 도출 개선점 (추후):**
- 4차 세션 부하 분산 (21개 항목)
- 상태 표기 세분화
- 비고 컬럼 정형화

---

### 완료: WellWe 프로덕트 디자인 간소화 TF 일정표

**Lenny Director 모드** 사용 (Design Director + Product Leader + WellWe Domain Expert)

**산출물:**
- `wellwe-simplification-schedule.tsv` - 구글 시트 복붙용
- `wellwe-simplification-schedule.gs` - Apps Script 자동화

**일정:**
| 세션 | 날짜 | 워크샵 항목 |
|------|------|-----------|
| 1차 | 2026-02-27 | 10개 (온보딩/진입) |
| 2차 | 2026-03-13 | 11개 (피드/소셜) |
| 3차 | 2026-03-27 | 9개 (결제/수익화) |
| 4차 | 2026-04-10 | 22개 (마무리/QA) |

---

## 이전 세션 (2026-02-11)

### 완료: 문서 SSOT 통합

`.ai/prompts/auto-layout-responsive.md` 간소화 (112줄 → 23줄)
- 상세 규칙은 `docs/specs/autolayout-rules.md` 링크로 대체
- 체크리스트만 유지

---

## 이전 세션 (2026-02-06)

### 완료: Agent Teams 병렬 작업 테스트

**커밋:** `557665f`

**방법:** Design Director + Engineering Lead가 **동시에** 파일 생성

| Agent | 산출물 |
|-------|--------|
| Design Director | `src/styles/variables.css` (70+ CSS 변수) |
| Engineering Lead | `src/modules/cleanup/utils.ts` (6개 함수) |

---

### 완료: Quick Wins 리팩토링 (Lenny Agent Teams)

**커밋:** `fc611be`

**방법:** Lenny's Product Team Agent Teams 모드로 Design Director + Engineering Lead 병렬 분석

**변경 요약:**
- deprecated `modules/naming.ts` shim 삭제
- `BaseResponse<T>` common으로 통합 (SSOT)
- `SHAPE_TYPES` 상수 통합 (`constants.ts` 신규)
- tsconfig.json ES2022로 통일
- `AGENT_SERVER_URL` 환경변수화 (`config/env.ts` 신규)

**남은 리팩토링 (Medium effort):**
- cleanup.ts 분리 (37,000+ 토큰)
- code.ts 핸들러 분리 (1,800+ 줄)
- CSS Variables 토큰 시스템 (Design)

---

## 이전 세션 (2026-02-05)

### 완료: 네이밍 충돌 안정화 Phase A

**커밋:**
- `fe9fde6` feat: 네이밍 충돌 안정화 - SSOT 정책 적용
- `633c444` fix: P1 충돌 안정화 보완

**핵심 정책:**
1. 충돌 후보 전부 보류 (자동 suffix 금지)
2. 실제 적용 성공 노드만 패턴 저장
3. `naming-patterns.json` 로컬 전용 (git 추적 해제)

**변경 요약:**
- handler.ts: 3개 핸들러 충돌 로직 통일 + 중복 제안 1차 감지
- normalize.ts: `/id` fallback 함수 제거
- ui.html: 충돌 배지 + 패턴 저장 가드 + 상태 초기화
- naming.ts: Content → Body 슬롯 변경 (Codex 기여)

### Phase B (다음)

| 항목 | 설명 | 우선순위 |
|------|------|----------|
| 동시 적용 가능성 개선 | 이름 교환 케이스 과보류 문제 | P1 |
| AI 프롬프트 형제 컨텍스트 | `siblings[]` 필드 추가 | P1 |
| 금지 패턴 저장 가드 | Content, Layout, _ 재검증 | P2 |
| `naming-patterns.seed.json` | 고정 시드 파일 관리 | P2 |

---

## Figma 파일

| 항목 | 값 |
|------|-----|
| URL | https://www.figma.com/design/s4GdImD87fQsWwnRYQVbWV/App?node-id=14451-4060 |
| fileKey | `s4GdImD87fQsWwnRYQVbWV` |
| nodeId | `14451:4060` |

---

## 완료된 작업 (요약)

| Phase | 버전 | ADR/문서 | 주요 커밋 |
|-------|------|----------|----------|
| 1: 문서 구조 | v2.1.x | [ADR-0002](../docs/architecture/ADRs/ADR-0002-documentation-structure.md) | `edb0cea`, `7003185` |
| 2: 코드 분리 | v2.2-2.3 | [ADR-0003](../docs/architecture/ADRs/ADR-0003-naming-module-split.md) | `3a0735a`, `17f69de` |
| 3: zod 검증 | v2.4.0 | - | `c4c1b5c` |
| 4: 패턴 API | v2.5.0 | - | `ffd41da` |
| 문서화 | - | ADR-0002, ADR-0003 생성 | `4448cc9` |
| /record 커맨드 | - | [record.md](../.claude/commands/record.md) | `3118488` |
| 패턴 HITL 통합 | - | - | `cf3c868` |
| 패턴 저장 순서 변경 | - | - | `4a85087` |
| 버튼 속성 자동 감지 | - | - | `83d86a5` |
| 컴포넌트 속성 확장 | - | - | `7ccf624` |
| 네이밍 테스트 완료 | - | - | `729d8ff` |
| Auto Layout 반응형 전환 | - | autolayout-rules v3.0 | `14c8428` |
| Auto Layout 후처리 + constraints | - | autolayout-rules v3.1 | `fd66107` |

상세: [CHANGELOG.md](../CHANGELOG.md)

---

## 현재 세션 (2026-01-25)

### 환경 변경
- 프로젝트 경로 통합: `~/figma-design-system-automator` 삭제 → iCloud 경로만 사용
- `/wds` 커맨드 경로 업데이트: `~/.claude/commands/wds.md`
- 새 경로: `~/Library/Mobile Documents/com~apple~CloudDocs/Projects/WDS`

---

## 이전 세션 (2026-01-19)

### 완료 (재귀적 반응형 적용 v3.2)

#### 1. 인덱스 매핑 버그 수정
- AI 응답의 인덱스가 재정렬 후 잘못된 노드에 적용되는 버그
- `originalIndexToNode` 매핑으로 해결

#### 2. 재귀적 FILL 적용 (`applyRecursiveFill`)
- Auto Layout 있는 부모 → `layoutSizingHorizontal = 'FILL'`
- Auto Layout 없는 부모 → `constraints.horizontal = 'STRETCH'`
- 최대 깊이 5까지 재귀

#### 3. Safe Zone 패턴 (카드 고정)
- Feed, Grid, Masonry, List 패턴 내부는 STRETCH 안 함
- Card/, Section/Image 패턴은 완전 스킵
- 모바일 퍼스트: 카드는 고정 크기 유지

#### 4. 위치 기반 constraints
- **Button/** → CENTER (가운데 고정)
- **Container/ActionButtons** → MAX (우측)
- **Icon/** 좌측 (x < 30%) → MIN
- **Icon/** 우측 (x > 70%) → MAX
- 위치 기반 체크: 20%/50%/80% 기준

#### 5. Top-level 강제 STRETCH
- AI가 INHERIT 반환해도 80% 이상 전체너비 요소는 강제 STRETCH
- 후처리 안전망 역할

#### 6. AI 프롬프트 개선
- "절대 위치 배치 판단 금지" 명시
- "전체 너비 요소 = 무조건 STRETCH" 강조
- 파일: `packages/agent-server/prompts/autolayout.md`

### 테스트 결과
- ✅ Header/TabBar/SubTab 반응형 동작
- ✅ 피드 카드 고정 크기 (Safe Zone)
- ✅ Button CENTER 정렬
- ⚠️ 일부 내부 요소 정렬 미세 조정 필요

### 참고 샘플
- `14365:1706` - 수동 반응형 샘플 (justify-between 패턴)

### 다음 작업
- [ ] Header 내부 좌우 정렬 미세 조정
- [ ] SubTab 탭 균등 분배 개선
- [ ] 실제 Figma에서 375px → 600px 테스트

---

## 이전 세션 (2026-01-18) - 완료

### 완료
- [x] 레이어 네이밍 타입별 테스트 ✅
- [x] AI Auto Layout 반응형 모드로 교체
- [x] 후처리 안전 규칙 v3.1
- [x] ABSOLUTE 요소 constraints

---

## 이전 세션 (2026-01-17 #3) - 완료

**Phase 4 UI 통합 완료:**

### 완료 항목
- [x] HITL 모달 (적용/AI분석/모두자동적용)
- [x] AI 네이밍 ↔ 패턴 매칭 자동 통합
- [x] 패턴 DB 자동 저장 + 초기화 버튼
- [x] 컴포넌트 속성 확장 (cornerRadius, effects, strokeWidth)
- [x] 버튼 속성 자동 감지 (Intent/Shape/State/Icon)
- [x] layoutPositioning 버그 수정 (Ignore auto-layout 방지)

---

## 비활성화된 기능

- **Deep Flatten** - 구조적 재설계 필요
- **AL 언래핑** - Alignment 속성 손실 문제

---

## 참고

### 빌드 명령어

```bash
npm run build:all    # 통합 빌드
npm run server       # Agent Server (localhost:3001)
```

### 플랜 파일

`.claude/plans/gentle-exploring-quill.md`
