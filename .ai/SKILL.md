# SKILL.md

> 이 프로젝트의 반복 작업 패턴
>
> AI가 `/advise` 또는 자동으로 참조

---

## 빌드

### Figma 플러그인 빌드
```bash
cd /Users/zenkim_office/figma-design-system-automator && npm run build
```
- 결과: `dist/code.js` 생성
- Figma에서 "Run last plugin" 또는 재로드

### Agent Server 빌드 & 실행
```bash
cd /Users/zenkim_office/figma-design-system-automator/agent-server && npm run build && npm start
```
- 결과: `http://localhost:3001` 실행
- 헬스체크: `curl localhost:3001/health`

### 둘 다 빌드 (전체)
```bash
cd /Users/zenkim_office/figma-design-system-automator && npm run build && cd agent-server && npm run build
```

---

## 새 Agent 추가

### 1. 타입 정의
`agent-server/src/types.ts`:
```typescript
export interface NewAgentRequest extends BaseRequest {
  // 필요한 필드
}

export interface NewAgentResult {
  // 결과 필드
}
```

### 2. Agent 구현
`agent-server/src/agents/new-agent.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk';
import type { NewAgentRequest, NewAgentResult, BaseResponse } from '../types';

export async function analyzeNewAgent(
  request: NewAgentRequest
): Promise<BaseResponse<NewAgentResult>> {
  // 구현
}
```

### 3. 라우트 등록
`agent-server/src/index.ts`:
```typescript
import { analyzeNewAgent } from './agents/new-agent';

app.post('/agents/new-agent', async (req, res) => {
  // 핸들러
});
```

### 4. 프롬프트 작성
`agent-server/prompts/new-agent.md`

---

## 디버깅

### Figma 플러그인 콘솔
- Figma > Plugins > Development > Open Console

### Agent Server 로그
- 터미널에서 `npm start` 출력 확인
- `[Naming]`, `[AutoLayout]` 등 prefix로 필터링

### API 테스트
```bash
curl -X POST http://localhost:3001/agents/naming/context \
  -H "Content-Type: application/json" \
  -d '{"screenScreenshot":"...", "nodes":[...]}'
```

---

## 문서 업데이트

### 버그 수정 후
1. `lessons_learned.md`에 패턴 추가
2. 관련 있으면 `MEMORY.md` 결정사항 업데이트

### 새 기능 후
1. `SPEC.md`에 API 명세 추가
2. `PRD.md` Roadmap 업데이트

### 커밋 메시지 형식
```
<type>: <한글 요약>

- 상세 내용 1
- 상세 내용 2

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

---

## 자주 쓰는 Figma API

### 노드 순회
```typescript
// children 복사 후 순회 (삭제 안전)
for (const child of [...node.children]) {
  if (isNodeValid(child)) {
    // 처리
  }
}
```

### 크기 복원
```typescript
const originalWidth = node.width;
const originalHeight = node.height;
const detached = node.detachInstance();
detached.resize(originalWidth, originalHeight);
```

### 스크린샷 생성
```typescript
const bytes = await node.exportAsync({ format: 'PNG', scale: 1 });
const base64 = figma.base64Encode(bytes);
```

---

## 체크리스트

### PR 전
- [ ] `npm run build` 성공 (플러그인)
- [ ] `npm run build` 성공 (agent-server)
- [ ] Figma에서 테스트 완료

### 릴리즈 전
- [ ] CONTEXT.md 현재 상태 업데이트
- [ ] lessons_learned.md 버그 패턴 추가
