# Project Constitution

> Wellwe Design System Automator - AI 행동 지침

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
- `Layout` 타입 사용 금지
- `Content` 단독 사용 금지
- Purpose 없는 네이밍 금지 (예: `Button/Primary` ❌)
- 비즈니스 상태 추론 금지 (Authenticated, Empty, Loading 등)

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
├── src/                    # Figma 플러그인
├── agent-server/           # AI Agent Server
├── .ai/                    # AI 전용 지식 저장소
├── docs/                   # 인간용 문서
└── reference/              # 참고 자료 (PDF, 가이드)
```

## Quick Commands

| 명령 | 설명 |
|------|------|
| `npm run build` | Figma 플러그인 빌드 |
| `cd agent-server && npm start` | Agent Server 실행 |
| `/context` | 토큰 사용량 확인 |
