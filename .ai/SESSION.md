# Session Memory

> 세션 단기 기억 (compact 후 이어갈 내용)
>
> Last updated: 2026-01-17 | v2.5.0

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

상세: [CHANGELOG.md](../CHANGELOG.md)

---

## 이번 세션 (2026-01-17)

**완료:**
- Phase 2 Step 2: helpers 5개 파일 분리
- Phase 3: zod 런타임 검증
- Phase 4 MVP: 패턴 API Backend
- 3겹 기록 체계 확립 (ADR + CHANGELOG + SESSION)
- `/record` 커맨드 생성
- **coach 스킬 v4 완성** - 초보 친화 규칙 추가
- **커밋 후 자동 기록 시스템** - 3중 안전망
- **문서 역할 경계 규칙** - HOW/WHAT/WHY 분리

**커밋:** `17f69de` → `5c14cb4` (6개 추가)

**이번 세션 주요 커밋:**
- `2b900e0` feat: coach 스킬 v4 - 초보 친화 규칙 추가
- `678d537` feat: 커밋 후 자동 기록 시스템 (3중 안전망)
- `71ac9aa` docs: 슬래시 커맨드 생성 체크리스트 추가
- `5c14cb4` docs: 문서 역할 경계 규칙 + lessons-learned 사건 추가

**자동 기록 시스템:**
- A: PostToolUse hook → 리마인드 메시지 (테스트 필요)
- B: `.claude/scripts/auto-changelog.sh` → CHANGELOG 자동 업데이트 ✅
- C: CLAUDE.md 체크리스트 ✅

**문서 역할 경계:**
- `CLAUDE.md` = HOW (체크리스트 + 근거 링크)
- `lessons-learned.md` = WHAT (사건 + 맥락)
- `ADR` = WHY (팀 규칙 변경)

---

## 다음 작업

### 즉시 (세션 재시작 후)
- [ ] **hook 테스트**: 커밋 시 리마인드 메시지 뜨는지 확인
- [ ] hook 안 되면 git post-commit hook으로 대체

### 이후
| 옵션 | 설명 | 추천 이유 |
|------|------|----------|
| **A) Phase 4 UI 통합** | Figma 플러그인 패턴 매칭 UI | 백엔드 완성됨, 사용자 가치 즉시 전달 |
| B) Agent Server 리팩토링 | naming.ts 분리 | 내부 개선, 우선순위 낮음 |

**A 선택 시 첫 작업:**
- [ ] `packages/figma-plugin/src/ui/` - 패턴 매칭 결과 컴포넌트
- [ ] `packages/figma-plugin/src/code.ts` - `/patterns/match` API 호출

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
