# Project Constitution

> Wellwe Design System Automator - AI 행동 지침
>
> Last updated: 2026-01-16 | v2.0.0

## Tech Stack

- **Figma Plugin**: TypeScript 기반 플러그인
- **Agent Server**: Express + Claude API (localhost:3001)
- **Design System**: 자동화된 네이밍, 오토레이아웃, 컴포넌트화

## Core Rules

1. **문서 우선**: 모든 작업 전 `.ai/` 폴더 문서 참조
2. **네이밍 규칙 준수**: `.ai/design-system/naming-rules.md` 필수 참조
3. **Read First**: 코드 수정 전 반드시 해당 파일 Read 먼저
4. **작은 단위**: 한 번에 50줄 이상 작성 금지

## Forbidden

### 네이밍 금지 사항
> 상세: `.ai/design-system/naming-rules.md` → "절대 금지 사항" 섹션

### 코드 작성 금지 사항
- 읽지 않은 파일 수정 제안
- 과도한 탐색 (3회 이상 연속 검색)
- 테스트 없는 배포

## Memory Bank

| 용도 | 파일 |
|------|------|
| 장기 결정 | `.ai/MEMORY.md` |
| 실패 패턴 | `.ai/lessons_learned.md` |
| 현재 상태 | `.ai/CONTEXT.md` |
| 네이밍 규칙 | `.ai/design-system/naming-rules.md` |

## Project Structure

```
/
├── AGENTS.md               # 프로젝트 헌법 (이 파일)
├── CLAUDE.md               # Claude Code 지침
├── src/                    # Figma 플러그인
├── agent-server/           # AI Agent Server + 프롬프트
├── .ai/                    # AI 전용 지식 저장소
└── reference/              # 참고 자료 (PDF)
```

## Quick Commands

> 상세: `.ai/SKILL.md` → "빌드" 섹션

| 명령 | 설명 |
|------|------|
| `npm run build:all` | 통합 빌드 (플러그인 + 서버) |
| `/context` | 토큰 사용량 확인 |

---

## 문서 관리 원칙

> 출처: `reference/PM/` 바이브 코딩 가이드

### 1. 지식 분산
- 중앙 README에 몰아넣지 않음
- 도메인별 `.ai/design-system/*.md`로 분리
- AI 주의력 최적화

### 2. 프롬프트 관리
- Agent Server 프롬프트: `agent-server/prompts/`
- 규칙 문서(`.ai/design-system/`)와 동기화 유지
- 변경 시 **양쪽 모두 업데이트**

### 3. 플랜 모드 활용
- 복잡한 작업 전 `plan mode`로 설계 승인
- plan 파일 → 프로젝트 내 `plans/` 폴더 보관
- 코드 작성 전 아키텍처 검토

### 4. 회고 문화
- 실패 패턴 즉시 `.ai/lessons_learned.md` 기록
- AI 실수도 기록 → 다음 세션에서 방지
- 형식: 문제 → 원인 → 해결 → 재발 방지

### 5. 문서 = 코드
- 문서 변경도 Git으로 관리
- 살아있는 문서로 취급 (지속 업데이트)
- Single Source of Truth 유지

### 6. AI 협업 지침
- 모호하면 추측 말고 **질문**
- 시니어 개발자처럼 품질 체크
- 테스트 작성 → 문서화 병행

---

## 관련 문서

| 문서 | 역할 |
|------|------|
| [CLAUDE.md](CLAUDE.md) | 작업 지침 및 체크리스트 |
| [.ai/MEMORY.md](.ai/MEMORY.md) | 의사결정 기록 (WHY) |
| [.ai/lessons_learned.md](.ai/lessons_learned.md) | 버그 패턴 및 해결책 (WHAT) |
| [.ai/design-system/naming-rules.md](.ai/design-system/naming-rules.md) | 네이밍 규칙 상세 |
