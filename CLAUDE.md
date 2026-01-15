# Claude Code Instructions

> 이 파일은 Claude Code 세션 시작 시 자동으로 로드됩니다.

## Quick Reference

| 용도 | 파일 |
|------|------|
| 프로젝트 구조 | `docs/INDEX.md` |
| 네이밍 규칙 | `.ai/design-system/naming-rules.md` |
| 결정 + 실수 패턴 | `.ai/lessons_learned.md` |
| 빠른 요약 | `.ai/MEMORY.md` |

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
