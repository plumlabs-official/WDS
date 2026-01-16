# ADR-0002: Documentation Structure

> Date: 2026-01-17 | Status: Accepted

## Context

프로젝트 문서가 여러 곳에 중복/분산되어 있어 유지보수 부담 증가.
- 같은 규칙이 3곳에 복사됨
- 어디가 최신인지 불명확
- AI 작업 시 잘못된 문서 참조 가능성

## Decision

**1. SSOT 원칙 도입**
- `docs/specs/` = 규칙/사양의 유일한 진실 (Single Source of Truth)
- 다른 곳에서는 링크만, 본문 복사 금지

**2. Diátaxis 방식 채택**
- `specs/` - 규칙/사양 (SSOT)
- `how-to/` - 실행 레시피
- `architecture/` - 설계/배경 (SSOT 아님)

**3. .ai/ 와 research/ 역할 경계**
- `.ai/` = AI 작업용 단기 메모 (링크 중심, 상세 금지)
- `research/` = 외부 참고자료 (NOT SSOT 명시)

## Consequences

- 문서 수정 시 한 곳만 변경하면 됨
- AI가 잘못된 문서 참조할 확률 감소
- 신규 참여자가 "어디를 봐야 하나" 명확

## Related

- Commits: `edb0cea`, `7003185`, `0919a10`, `f13fbc0`
- Spec: `docs/specs/index.md`
