# Claude Code Instructions

> 이 파일은 Claude Code 세션 시작 시 자동으로 로드됩니다.
>
> Last updated: 2026-01-16 | v2.0.0

## Quick Reference

| 용도 | 파일 |
|------|------|
| 프로젝트 헌법 | `AGENTS.md` |
| 기술 사양/API | `.ai/SPEC.md` |
| 아키텍처 결정 (WHY) | `.ai/MEMORY.md` |
| 버그 패턴 (WHAT) | `.ai/lessons_learned.md` |
| 반복 작업 패턴 | `.ai/SKILL.md` |
| 현재 상태 | `.ai/CONTEXT.md` |
| 네이밍 규칙 | `.ai/design-system/naming-rules.md` |

## Auto Reference Rules

> 작업 유형에 따라 **먼저 읽어야 할 문서**. 실수 방지를 위한 자동 참조.

| 요청 유형 | 문서 | 읽을 범위 |
|----------|------|----------|
| Cleanup/병합 작업 | `.ai/lessons_learned.md` | "Cleanup 버그 패턴" 섹션 |
| Naming 작업 | `.ai/design-system/naming-rules.md` | 전체 |
| AI Agent/서버 수정 | `.ai/lessons_learned.md` | "AI Agent 버그 패턴" 섹션 |
| 빌드/디버깅 | `.ai/SKILL.md` | "빌드", "디버깅" 섹션 |
| 문서 구조 변경 | `AGENTS.md` | "문서 관리 원칙" 섹션 |
| 새 기능 설계 | `.ai/MEMORY.md` | 관련 도메인 섹션 |

**규칙**: 해당 작업 시작 전, 위 문서의 지정 섹션을 먼저 읽고 진행

## Workflow

### 단순 작업 (플랜 모드 X)
- 오타 수정
- 단일 파일 수정
- 명확한 버그 수정

### 복잡한 작업 (플랜 모드 O)
- 새 기능 추가
- 아키텍처 변경
- 다중 파일 수정

### 불확실할 때
- 추측하지 말고 **질문 먼저**
- "이해가 맞나요?" 확인

### Cleanup 작업 시 (cleanup.ts 수정 전)
- [ ] `getNodeByIdAsync` 사용 (getNodeById 금지, dynamic-page 모드)
- [ ] 캐시 clear는 진입점 함수에서만 (반복 함수 내부 금지)
- [ ] 노드 삭제 전 필요한 속성(.name 등) 미리 저장
- [ ] children 배열 복사 후 순회
- [ ] 좌표 계산에서 절대/상대 구분

### Naming 작업 시
> 상세: `.ai/design-system/naming-rules.md`

- [ ] Layout, Content 타입 금지
- [ ] 비즈니스 상태 추론 금지 (Authenticated, Empty 등)

### AI Agent 작업 시 (agent-server 수정)
> 상세: `.ai/lessons_learned.md` → "AI Agent 버그 패턴"

- [ ] max_tokens: 32768 (100+ 노드)
- [ ] 스트리밍 필수

### 빌드 후 테스트 전
> 상세: `.ai/SKILL.md` → "빌드"

- [ ] `npm run build:all` (통합 빌드)
- [ ] **플러그인 리로드 확인** (Figma에서 Reload)

### 디버깅 시
- [ ] **추측 → 수정** 금지
- [ ] **추측 → 유저에게 검증 요청 → 확인 후 수정**
- [ ] 첫 시도부터 디버그 로그 추가
- [ ] 예상대로 안 되면 조건문부터 확인

## Token Saving

### DO
- 필요한 파일/부분만 읽기
- `.ai/` 문서 링크로 규칙 참조
- 한 번에 완결되는 작업 단위로 진행

### DON'T
- 3회 이상 연속 검색 금지
- 긴 파일 전체 읽기 금지
- 읽지 않은 파일 수정 제안 금지

## Agent Server

> 상세: `.ai/SKILL.md` → "빌드", `.ai/SPEC.md` → "Agent Server API"
