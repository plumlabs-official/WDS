# Agent System Overview

## 아키텍처

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Orchestrator                                 │
│                    (실행 순서 조율, 결과 취합)                          │
└─────────────────────────────────────────────────────────────────────┘
                                   │
     ┌─────────────┬───────────────┼───────────────┬─────────────┐
     ▼             ▼               ▼               ▼             ▼
┌─────────┐  ┌──────────┐  ┌───────────┐  ┌─────────┐  ┌─────────────┐
│ Cleanup │  │AutoLayout│  │  Spacing  │  │ Naming  │  │Componentize │
│   Agent │  │  Agent   │  │   Agent   │  │  Agent  │  │    Agent    │
├─────────┤  ├──────────┤  ├───────────┤  ├─────────┤  ├─────────────┤
│룰 베이스 │  │LLM 추론  │  │ 룰 베이스  │  │LLM 추론 │  │  하이브리드  │
└─────────┘  └──────────┘  └───────────┘  └─────────┘  └─────────────┘
     │             │               │               │             │
     └─────────────┴───────────────┼───────────────┴─────────────┘
                                   ▼
                          ┌───────────────┐
                          │ Figma Plugin  │
                          │  (결과 적용)   │
                          └───────────────┘
```

## 에이전트 목록

| 에이전트 | 타입 | 역할 | 실행 순서 |
|----------|------|------|----------|
| [Cleanup](./cleanup-agent.md) | 룰 베이스 | 의미없는 래퍼 제거 | 1 |
| [AutoLayout](./autolayout-agent.md) | LLM 추론 | 레이아웃 방향/간격 추론 | 2 |
| [Spacing](./spacing-agent.md) | 룰 베이스 | 간격 토큰 표준화 | 3 |
| [Naming](./naming-agent.md) | LLM 추론 | 컴포넌트 이름 추론 | 4 |
| [Componentize](./componentize-agent.md) | 하이브리드 | 컴포넌트 후보 탐지/변환 | 5 (선택) |

## 실행 파이프라인

```
Input: Figma Selection
         │
         ▼
┌─────────────────────────────────────────────┐
│  1. Cleanup Agent (룰 베이스)                │
│     • 의미없는 래퍼 제거                      │
│     • 레이어 구조 단순화                      │
│     즉시 실행, 빠름                          │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  2. AutoLayout Agent (LLM 추론)             │
│     • 스크린샷 촬영                          │
│     • 레이아웃 방향/간격 추론                 │
│     API 호출, 2-5초                         │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  3. Spacing Agent (룰 베이스)                │
│     • gap/padding 토큰 값으로 정규화          │
│     즉시 실행, 빠름                          │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  4. Naming Agent (LLM 추론)                 │
│     • 스크린샷 촬영                          │
│     • 컴포넌트 타입/Variant/Size 추론        │
│     API 호출, 2-5초 per node               │
└─────────────────────────────────────────────┘
         │
         ▼ (선택적)
┌─────────────────────────────────────────────┐
│  5. Componentize Agent (하이브리드)          │
│     • 반복 요소 탐지 (룰)                    │
│     • 컴포넌트화 가치 판단 (LLM)             │
│     • Figma 컴포넌트 생성                    │
└─────────────────────────────────────────────┘
         │
         ▼
Output: 정리된 Figma Design
```

## 타입별 특성

### 룰 베이스 에이전트

| 특성 | 값 |
|------|-----|
| 실행 환경 | Figma Plugin (브라우저) |
| 속도 | 즉시 (~100ms) |
| 비용 | 무료 |
| 정확도 | 높음 (명확한 조건) |
| 유연성 | 낮음 (새 패턴 대응 어려움) |

**적합한 작업:**
- 조건이 명확한 판단
- 단순 변환/정규화
- 대량 처리

### LLM 추론 에이전트

| 특성 | 값 |
|------|-----|
| 실행 환경 | Agent Server (Node.js) |
| 속도 | 2-5초 per request |
| 비용 | API 호출 비용 발생 |
| 정확도 | 높음 (맥락 이해) |
| 유연성 | 높음 (새 패턴 대응 가능) |

**적합한 작업:**
- 시각적 판단 필요
- 맥락 의존적 결정
- 복잡한 분류

## API 엔드포인트

### Agent Server (http://localhost:3001)

| 엔드포인트 | 메서드 | 에이전트 | 설명 |
|-----------|--------|----------|------|
| `/health` | GET | - | 서버 상태 확인 |
| `/agents/naming` | POST | Naming | 단일 노드 네이밍 |
| `/agents/naming/batch` | POST | Naming | 복수 노드 일괄 처리 |
| `/agents/autolayout` | POST | AutoLayout | 레이아웃 분석 |

### Request/Response 형식

모든 에이전트는 동일한 응답 형식 사용:

```typescript
// 성공
{
  "success": true,
  "data": { ... }  // 에이전트별 결과
}

// 실패
{
  "success": false,
  "error": "Error message"
}
```

## 에러 처리

### 폴백 전략

```
LLM 에이전트 실패 시:
┌─────────────────┐     실패      ┌─────────────────┐
│  LLM 추론       │ ───────────► │  룰 베이스 폴백  │
│  (정확도 높음)   │              │  (기본 동작)     │
└─────────────────┘              └─────────────────┘
```

### 재시도 정책

- 타임아웃: 30초
- 재시도 횟수: 3회
- 재시도 간격: 1초, 2초, 4초 (exponential backoff)

## 성능 최적화

### 배치 처리

개별 호출 대신 배치 API 사용:

```typescript
// ❌ 비효율적
for (const node of nodes) {
  await fetch('/agents/naming', { body: node });
}

// ✅ 효율적
await fetch('/agents/naming/batch', {
  body: { nodes: nodes }
});
```

### 캐싱

동일 스크린샷 재처리 방지 (구현 예정):

```typescript
const cache = new Map<string, NamingResult>();
const hash = md5(screenshot);

if (cache.has(hash)) {
  return cache.get(hash);
}
```

## 로깅

### 서버 로그 형식

```
[Agent] Action: details
[Naming] Analyzing node: 123:456
[Naming] Success: Button/Primary/MD
[AutoLayout] Failed: Timeout
```

### 클라이언트 로그 형식

```
=== 래퍼 제거 결과 ===
  - Frame 1430107280
  - Group 1

=== 네이밍 변경 결과 ===
  Frame 123 → Button/Primary/MD
  Frame 456 → Avatar/LG
```

## 설정

### 환경 변수

```bash
# Agent Server
PORT=3001
ANTHROPIC_API_KEY=sk-ant-...

# 옵션
LOG_LEVEL=info
CACHE_ENABLED=true
```

### 디자인 토큰

`config/tokens.ts`에서 관리:

```typescript
// Spacing 토큰
export const spacing = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64];

// 컴포넌트 사이즈
export const componentSize = {
  button: { height: { sm: 32, md: 48, lg: 56 } },
  avatar: { xs: 27, sm: 38, md: 44, lg: 56, xl: 62 },
  // ...
};
```

## 개발 가이드

### 새 에이전트 추가

1. `agent-server/src/agents/`에 에이전트 파일 생성
2. `agent-server/src/types.ts`에 타입 정의
3. `agent-server/src/index.ts`에 라우트 추가
4. `docs/agents/`에 문서 작성

### 테스트

```bash
# 서버 시작
cd agent-server && npm run dev

# Health check
curl http://localhost:3001/health

# Naming 테스트
curl -X POST http://localhost:3001/agents/naming \
  -H "Content-Type: application/json" \
  -d '{"nodeId":"test","screenshot":"...","currentName":"Frame 1",...}'
```
