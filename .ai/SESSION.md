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

**커밋:** `17f69de` → (현재)

**coach 스킬 v4 주요 변경:**
- 스파이크 2단계 분리 (Spike A: 통신 에코 → Spike B: API 연동)
- Gates 실패 상태 필수 포함
- Record/Changelog 정책 일관성 (스파이크 = SESSION.md만)
- 용어 번역 섹션 (답변 맨 위)
- Recommendation 쉬운 한국어 1문장
- Next Actions 행동 중심
- "어디에 표시?" 명시
- Plan B2 figma.notify 먼저
- 측정 부담 제거 ("처음엔 생략 가능")

---

## 다음 작업 (추천: A)

| 옵션 | 설명 | 추천 이유 |
|------|------|----------|
| **A) Phase 4 UI 통합** | Figma 플러그인 패턴 매칭 UI | 백엔드 완성됨, 사용자 가치 즉시 전달 |
| B) Agent Server 리팩토링 | naming.ts 분리 | 내부 개선, 우선순위 낮음 |
| C) 테스트 코드 추가 | 단위 테스트 작성 | 안정성 향상, 나중에 |

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
