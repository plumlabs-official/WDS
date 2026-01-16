# Claude Code Instructions

> 이 파일은 Claude Code 세션 시작 시 자동으로 로드됩니다.

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
- [ ] "Layout" 타입 사용 금지 → TopBar, Section 등 구체적 이름
- [ ] Purpose 필수: `Button/Primary` ❌ → `Button/CTA/Primary` ✅
- [ ] Container에 Size 적용 금지: `Container/ButtonArea/LG` ❌
- [ ] **비즈니스 상태 추론 금지**: Authenticated, Empty, Loading 등 사용 금지

### AI Agent 작업 시 (agent-server 수정)
- [ ] max_tokens: 32768 (100+ 노드 처리 시)
- [ ] 대량 요청 시 스트리밍 필수 (`client.messages.stream`)
- [ ] 후처리: **원래 이름** vs **AI 제안 이름** 구분 (제안 이름끼리 비교)

### 빌드 후 테스트 전
- [ ] UI/플러그인 변경 → `npm run build` (루트)
- [ ] 서버 변경 → `cd agent-server && npm run build && npm start`
- [ ] **플러그인 리로드 확인** (Figma에서 Reload)
- [ ] 변경 미적용 시 → 빌드/리로드 먼저 의심

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

```bash
# 실행
cd agent-server && npm run build && npm start

# 엔드포인트
# GET  /health              - 헬스체크
# POST /agents/naming/context - 컨텍스트 기반 네이밍
# POST /agents/autolayout   - 오토레이아웃 분석
```
