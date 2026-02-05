# Start Here

> WellWe Design System Automator - 5분 시작 가이드

---

## 5분 빠른 시작

```bash
# 1. 설치
git clone <repository-url>
cd WDS
npm install

# 2. 환경 설정
cp packages/agent-server/.env.example packages/agent-server/.env
# .env 파일에 ANTHROPIC_API_KEY 설정

# 3. 빌드 & 실행
npm run build:all
npm run server  # localhost:3001
```

**Figma 플러그인 로드:**
1. Figma Desktop > `Plugins` > `Development` > `Import plugin from manifest...`
2. `packages/figma-plugin/manifest.json` 선택
3. 프레임 선택 후 플러그인 실행

---

## 문서 구조

| 폴더 | 설명 | 용도 |
|------|------|------|
| [specs/](specs/) | **SSOT** - 규칙/사양/계약 | 정답은 여기 |
| [how-to/](how-to/) | 작업별 실행 레시피 | 실행 가이드 |
| [architecture/](architecture/) | 설계/배경/의사결정 | 맥락 이해 |

---

## Quick Links

### 자주 사용하는 가이드
- [네이밍 에이전트 실행](how-to/run-naming-agent.md)
- [Figma MCP 설정](how-to/figma-mcp-setup.md)
- [릴리즈 체크리스트](how-to/release-checklist.md)

### 규칙 참조 (SSOT)
- [네이밍 스키마](specs/naming-schema.md)
- [오토레이아웃 규칙](specs/autolayout-rules.md)
- [API 계약](specs/api-contract.md)
- [전체 SSOT 인덱스](specs/index.md)

### 아키텍처
- [시스템 개요](architecture/overview.md)
- [ADRs](architecture/ADRs/)
- [Lessons Learned](architecture/lessons-learned.md)

---

## 다음 단계

상세한 설명이 필요하면 [네이밍 에이전트 실행 가이드](how-to/run-naming-agent.md)를 참조하세요.
