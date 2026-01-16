# Session Memory

> 세션 단기 기억 (compact 후 이어갈 내용)
>
> Last updated: 2026-01-17 | v2.1.3

---

## Figma 파일

| 항목 | 값 |
|------|-----|
| URL | https://www.figma.com/design/s4GdImD87fQsWwnRYQVbWV/App?node-id=14451-4060 |
| fileKey | `s4GdImD87fQsWwnRYQVbWV` |
| nodeId | `14451:4060` |

---

## 현재 작업

### 완료됨 (2026-01-17) - Phase 1 문서 구조 ✅

| 버전 | 작업 | 커밋 |
|------|------|------|
| v2.1.0 | 문서/디렉토리 구조 재설계 | `edb0cea` |
| v2.1.1 | GPT 피드백 - 구조 단순화 | `7003185` |
| v2.1.2 | API 중복 제거 | `0919a10` |
| v2.1.3 | 인용 규칙 보강 | `f13fbc0` |

---

## 진행 중: Phase 2 Step 1 - Naming 코드 분리

### 분석 완료

**이동할 함수들 (code.ts → naming/):**

| 대상 | 목적지 | 줄 수 |
|------|--------|-------|
| `handleNamingAgent` | handler.ts | 210줄 |
| `handleNamingResult` | handler.ts | 24줄 |
| `handleNamingBatchResult` | handler.ts | 27줄 |
| `handleNamingContextResult` | handler.ts | 29줄 |
| `tryDirectNaming` | direct.ts | 80줄 |
| `collectAllNodes` | direct.ts | 10줄 |

**함께 이동할 타입/상태:**
- `NamingResultMessage`, `NamingBatchResultMessage`, `NamingContextResultMessage`
- `pendingNamingNode`, `pendingNamingNodes`

**의존성:**
- handler.ts → direct.ts, modules/naming.ts, 유틸 함수들
- direct.ts → modules/naming.ts (20+ 함수)

### 다음 세션에서 할 것

1. `naming/handler.ts` 생성 (핸들러 4개 + 타입 + 상태)
2. `naming/direct.ts` 생성 (tryDirectNaming, collectAllNodes)
3. `code.ts`에서 import로 대체
4. `npm run build:all` 테스트
5. Figma에서 Naming 기능 테스트

---

## 다음 작업 (Phase 2 이후)

### Phase 2 Step 2: helpers 분리
- modules/naming.ts → helpers/classify.ts, infer.ts, normalize.ts, validate.ts

### Phase 3: zod 런타임 검증
- schemaVersion 필드 추가 (GPT 피드백)
- suggestedName 최소 규칙 체크

### Phase 4: 네이밍 패턴 라이브러리 (MVP)
- visual 유사도 제외하고 구조 기반 매칭만 먼저

---

## 비활성화된 기능

- **Deep Flatten** - 구조적 재설계 필요
- **AL 언래핑** - Alignment 속성 손실 문제

---

## 플랜 파일

`.claude/plans/gentle-exploring-quill.md`

---

## 참고

### 빌드 명령어

```bash
npm run build:all    # 통합 빌드 (common + plugin + server)
npm run server       # Agent Server 실행 (localhost:3001)
```

### 모델별 가격 (per 1M tokens)

| 모델 | Input | Output | 특징 |
|------|-------|--------|------|
| Haiku | $1 | $5 | 빠름, 저렴 |
| Sonnet | $3 | $15 | 균형 |
| Opus | $15 | $75 | 최고 품질 |
