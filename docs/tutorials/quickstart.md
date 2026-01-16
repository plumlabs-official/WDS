# Quickstart

> 10분 안에 WellWe Design System Automator 시작하기

## 1. 설치

```bash
# 프로젝트 클론
git clone <repository-url>
cd figma-design-system-automator

# 의존성 설치
npm install
cd agent-server && npm install && cd ..
```

## 2. 환경 설정

### Agent Server 설정

```bash
# agent-server/.env 파일 생성
cd agent-server
cp .env.example .env

# .env 파일 편집 - Claude API 키 설정
ANTHROPIC_API_KEY=your-api-key-here
```

## 3. 빌드 및 실행

```bash
# 터미널 1: 통합 빌드
npm run build:all

# 터미널 2: Agent Server 실행
npm run server
# http://localhost:3001 에서 실행됨
```

## 4. Figma 플러그인 로드

1. Figma Desktop App 실행
2. `Plugins` > `Development` > `Import plugin from manifest...`
3. 프로젝트의 `manifest.json` 선택
4. 플러그인이 "Development" 메뉴에 추가됨

## 5. 첫 번째 실행

1. Figma에서 프레임 선택
2. 플러그인 실행 (`Plugins` > `Development` > `WellWe Design System Automator`)
3. 원하는 기능 선택:
   - **Naming**: 레이어 이름 자동 지정
   - **Auto Layout**: 레이아웃 자동 적용
   - **Cleanup**: 무의미한 래퍼 정리

## 다음 단계

- [네이밍 에이전트 상세 가이드](../guides/run-naming-agent.md)
- [네이밍 규칙 이해하기](../specs/naming-schema.md)
