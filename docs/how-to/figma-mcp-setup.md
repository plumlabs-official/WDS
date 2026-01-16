# Figma MCP 설정 가이드

> Figma MCP (Model Context Protocol) 연동 설정

## 개요

Figma MCP를 사용하면 Claude Code에서 직접 Figma 파일에 접근하여 디자인 컨텍스트를 가져올 수 있습니다.

## 설정 방법

### 1. MCP 서버 설치

```bash
# Figma MCP 서버 설치 (글로벌)
npm install -g @anthropic/figma-mcp
```

### 2. Claude Code 설정

`~/.claude/settings.json`에 MCP 서버 추가:

```json
{
  "mcpServers": {
    "figma": {
      "command": "figma-mcp",
      "args": ["--token", "YOUR_FIGMA_ACCESS_TOKEN"]
    }
  }
}
```

### 3. Figma Access Token 발급

1. Figma 로그인
2. Settings > Account > Personal access tokens
3. 새 토큰 생성
4. 토큰 복사하여 설정에 추가

## 사용 방법

### 디자인 컨텍스트 가져오기

Claude Code에서:

```
Figma URL: https://www.figma.com/design/xxx/yyy?node-id=123-456
이 디자인의 구조를 분석해줘
```

### 스크린샷 가져오기

```
이 노드의 스크린샷을 보여줘
```

## 문제 해결

### MCP 연결 실패

- Figma 토큰 유효성 확인
- 네트워크 연결 확인
- Claude Code 재시작

## 관련 문서

- [Quickstart](../tutorials/quickstart.md)
- [네이밍 에이전트 실행](run-naming-agent.md)
