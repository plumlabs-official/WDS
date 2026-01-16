# Technical Specification

> 시스템 아키텍처 및 기술 정책
>
> Last updated: 2026-01-17 | v2.1.2

---

> **Note**: API 상세(endpoint/schema/에러코드)는 [`api-contract.md`](api-contract.md)가 SSOT입니다.
> 이 문서에는 API 목록을 재작성하지 않고, 아키텍처/정책/흐름만 정의합니다.

---

## Architecture

```
┌─────────────────────┐
│   Figma Plugin      │
│   (code.ts)         │
└─────────┬───────────┘
          │ postMessage
┌─────────▼───────────┐
│   UI (ui.html)      │
│   (sandbox iframe)  │
└─────────┬───────────┘
          │ fetch (localhost:3001)
┌─────────▼───────────┐
│   Agent Server      │
│   (Express)         │
└─────────┬───────────┘
          │ API call
┌─────────▼───────────┐
│   Claude API        │
└─────────────────────┘
```

### 통신 제약
- Figma 플러그인은 외부 API 직접 호출 불가
- UI iframe에서 localhost Agent Server로 fetch
- Agent Server가 Claude API 프록시 역할

---

## Agent Server API

> **상세는 [`api-contract.md`](api-contract.md) 참조**

### 제공 API 목록

| Endpoint | 목적 |
|----------|------|
| `GET /health` | 헬스체크 |
| `POST /agents/naming/context` | 컨텍스트 기반 네이밍 |
| `POST /agents/autolayout` | Auto Layout 분석 |
| `POST /agents/cleanup/validate` | 병합 전후 검증 |

### 비기능 요구사항

| 항목 | 정책 |
|------|------|
| Timeout | 60초 (Claude API 응답 대기) |
| Retry | 실패 시 1회 재시도 |
| Logging | 요청/응답 로깅 (개발 모드) |
| Body Size | 50MB 제한 (base64 이미지) |

---

## Figma Plugin API 주의사항

### detachInstance() 크기 복원
```typescript
// 원래 크기 저장 → detach → 복원
const originalWidth = node.width;
const originalHeight = node.height;
const detached = node.detachInstance();

if (Math.abs(detached.width - originalWidth) > 1) {
  detached.resize(originalWidth, originalHeight);
}
```

### children 배열 순회
```typescript
// 직접 순회 - 삭제 시 에러
for (const child of node.children) { ... }

// 복사 후 순회
for (const child of [...node.children]) { ... }
```

### 좌표 계산
```typescript
// 절대 좌표 = 부모 좌표 + 상대 좌표
const absoluteX = parent.x + child.x;
const absoluteY = parent.y + child.y;
```

---

## 데이터 플로우

### 1. AI Naming
```
UI 버튼 클릭
  → code.ts: 선택 노드 수집, 스크린샷 생성
  → UI: fetch /agents/naming/context
  → Agent Server: Claude API 호출
  → UI: 결과 수신
  → code.ts: node.name = suggestedName
```

### 2. AI Auto Layout
```
UI 버튼 클릭
  → code.ts: children 위치/크기 수집
  → UI: fetch /agents/autolayout
  → Agent Server: Claude API 호출
  → UI: 결과 수신
  → code.ts: layoutMode, gap, padding 적용
```

### 3. Cleanup (전처리)
```
UI 버튼 클릭
  → code.ts: 래퍼 제거, 중첩 병합
  → (선택적) /agents/cleanup/validate로 검증
  → code.ts: 결과 반영
```

---

## Edge Cases

### 네이밍
- 빈 프레임: `Container/Empty` 반환
- 이미지만 있는 프레임: `Image/[추론된 용도]`
- 텍스트만 있는 프레임: `Text/[역할]`

### 네이밍 노드 분류 흐름
```
노드 순회
  ↓
1. shouldSkipNaming() → 스킵 (VECTOR, LINE, 상태값)
  ↓ (통과)
2. shouldSkipForParentComponent() → 스킵 (Button/Card/Icon 내부)
   예외: 언더스코어 포함 노드는 스킵 안 함
  ↓ (통과)
3. 언더스코어 포함? → AI 위임 (무조건)
  ↓ (아니면)
4. tryDirectNaming() → 직접 변환 (성공 시)
  ↓ (null 반환)
5. hasValidSemanticName() → 유지 (이미 시맨틱)
  ↓ (아니면)
6. AI 위임
```

### Auto Layout
- 자식 1개: NONE 반환 (Auto Layout 불필요)
- 겹치는 자식: NONE 반환 (Free layout 유지)
- 95% 이상 채우는 자식만 FILL 적용

### Cleanup
- 자식 좌표 비정상 (부모 범위 벗어남): 스킵
- 동일 이름 중첩: 크기 무관 무조건 병합

---

## 기술 제약

| 제약 | 해결 |
|------|------|
| Figma 플러그인 외부 API 불가 | Agent Server 프록시 |
| ES6+ 일부 미지원 | esbuild 타겟 es6 |
| base64 이미지 prefix | `data:image` prefix 제거 후 전송 |
| JSON body 크기 | Express limit 50mb 설정 |

---

## 관련 문서

| 문서 | 역할 |
|------|------|
| [api-contract.md](api-contract.md) | API 상세 (SSOT) |
| [../architecture/prd.md](../architecture/prd.md) | 제품 요구사항 |
| [../architecture/lessons-learned.md](../architecture/lessons-learned.md) | Edge case 및 버그 패턴 |
