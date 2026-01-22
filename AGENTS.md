# Project Constitution

> WDS (WellWe Design System) - AI 행동 지침
>
> Last updated: 2026-01-17 | v2.1.0

## Tech Stack

- **Figma Plugin**: TypeScript 기반 플러그인 (`packages/figma-plugin/`)
- **Agent Server**: Express + Claude API (`packages/agent-server/`, localhost:3001)
- **Common**: 공유 타입/스키마 (`packages/common/`)
- **Design System**: 자동화된 네이밍, 오토레이아웃, 컴포넌트화

## Core Rules

1. **문서 우선**: 모든 작업 전 `docs/`, `.ai/` 문서 참조
2. **네이밍 규칙 준수**: `docs/specs/naming-schema.md` 필수 참조
3. **Read First**: 코드 수정 전 반드시 해당 파일 Read 먼저
4. **작은 단위**: 한 번에 50줄 이상 작성 금지

## Forbidden

### 네이밍 금지 사항
> 상세: `docs/specs/naming-schema.md` → "절대 금지 사항" 섹션

### 코드 작성 금지 사항
- 읽지 않은 파일 수정 제안
- 과도한 탐색 (3회 이상 연속 검색)
- 테스트 없는 배포

## Memory Bank

| 용도 | 파일 |
|------|------|
| SSOT 인덱스 | `docs/specs/index.md` |
| 실패 패턴 | `docs/architecture/lessons-learned.md` |
| 현재 상태 | `.ai/SESSION.md` |
| 네이밍 규칙 | `docs/specs/naming-schema.md` |
| 반복 작업 | `.ai/RECIPES.md` |

## Project Structure

```
/
├── AGENTS.md               # 프로젝트 헌법 (이 파일)
├── CLAUDE.md               # Claude Code 지침
├── CONTRIBUTING.md         # SSOT 정책, 문서 업데이트 규칙
├── docs/                   # 문서 (목적 중심)
│   ├── START-HERE.md       # 진입점 (5분 시작)
│   ├── specs/              # SSOT (규칙/사양/계약)
│   ├── how-to/             # 작업별 실행 레시피
│   └── architecture/       # 설계/배경/ADR
├── packages/
│   ├── figma-plugin/       # Figma 플러그인
│   ├── agent-server/       # AI Agent Server
│   └── common/             # 공유 타입/스키마
├── .ai/                    # AI 전용 메모리 (링크 중심)
│   ├── SESSION.md          # 세션 단기 기억
│   └── RECIPES.md          # 반복 작업 레시피
└── research/               # 외부 참고자료 (SSOT 아님)
```

## Quick Commands

> 상세: `.ai/RECIPES.md` → "빌드" 섹션

| 명령 | 설명 |
|------|------|
| `npm run build:all` | 통합 빌드 (common + plugin + server) |
| `npm run build:plugin` | Figma 플러그인만 빌드 |
| `npm run build:server` | Agent Server만 빌드 |
| `npm run server` | Agent Server 실행 |
| `/context` | 토큰 사용량 확인 |

---

## 문서 관리 원칙

> 출처: `reference/PM/` 바이브 코딩 가이드

### 1. Diátaxis 구조
- `docs/tutorials/`: 처음 따라 하는 가이드
- `docs/guides/`: 목적 기반 레시피
- `docs/specs/`: 규칙/사양 (SSOT)
- `docs/architecture/`: 의사결정/아키텍처

### 2. 프롬프트 관리
- Agent Server 프롬프트: `packages/agent-server/prompts/`
- 규칙 문서(`docs/specs/`)와 동기화 유지
- 변경 시 **양쪽 모두 업데이트**

### 3. 플랜 모드 활용
- 복잡한 작업 전 `plan mode`로 설계 승인
- plan 파일 → `.claude/plans/` 폴더 보관
- 코드 작성 전 아키텍처 검토

### 4. 회고 문화
- 실패 패턴 즉시 `docs/architecture/lessons-learned.md` 기록
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
| [docs/specs/index.md](docs/specs/index.md) | SSOT 인덱스 |
| [docs/architecture/lessons-learned.md](docs/architecture/lessons-learned.md) | 버그 패턴 및 해결책 |
| [docs/specs/naming-schema.md](docs/specs/naming-schema.md) | 네이밍 규칙 상세 |
| [.ai/RECIPES.md](.ai/RECIPES.md) | 반복 작업 레시피 |
