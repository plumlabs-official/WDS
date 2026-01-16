# WellWe Design System Automator

> Figma 디자인 시스템 자동화 플러그인 + AI Agent Server

## Quick Start

### 1. 설치

```bash
# 의존성 설치
npm install

# Agent Server 의존성 설치
cd agent-server && npm install && cd ..
```

### 2. 빌드

```bash
# 통합 빌드 (플러그인 + 서버)
npm run build:all
```

### 3. 실행

```bash
# Agent Server 실행 (별도 터미널)
npm run server
# http://localhost:3001

# Figma에서 플러그인 로드
# Plugins > Development > Import plugin from manifest
# manifest.json 선택
```

## 프로젝트 구조

```
/
├── packages/
│   ├── figma-plugin/     # Figma 플러그인
│   ├── agent-server/     # AI Agent Server (Claude API)
│   └── common/           # 공유 타입/스키마
├── docs/                 # 문서
│   ├── tutorials/        # 시작 가이드
│   ├── guides/           # 작업별 가이드
│   ├── specs/            # 규칙/사양 (SSOT)
│   └── architecture/     # 아키텍처/ADR
├── .ai/                  # AI 협업용 메모리
└── reference/            # 외부 참고자료
```

## 주요 기능

- **AI Naming**: 레이어 구조 분석 후 의미 있는 이름 자동 지정
- **Auto Layout**: AI 기반 레이아웃 자동 적용
- **Cleanup**: 무의미한 래퍼/중첩 자동 정리
- **Componentize**: 컴포넌트 브레이크 및 정리

## 문서

| 문서 | 설명 |
|------|------|
| [docs/tutorials/quickstart.md](docs/tutorials/quickstart.md) | 빠른 시작 가이드 |
| [docs/guides/](docs/guides/) | 작업별 상세 가이드 |
| [docs/specs/](docs/specs/) | 네이밍/오토레이아웃 규칙 |
| [docs/architecture/](docs/architecture/) | 아키텍처 및 의사결정 |

## 개발

```bash
# 플러그인 watch 모드
npm run watch

# 타입 체크
npm run typecheck

# 서버 실행
npm run server
```

## 라이선스

MIT
