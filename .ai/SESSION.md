# Session Memory

> 세션 단기 기억 (compact 후 이어갈 내용)
>
> Last updated: 2026-01-17 | v2.2.0

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

## 완료됨 (2026-01-17) - Phase 2 Step 1 ✅

### Naming 코드 분리

| 버전 | 작업 | 커밋 |
|------|------|------|
| v2.2.0 | Naming 코드 분리 | `3a0735a` |

**결과:**
- code.ts: 1,885줄 → 1,318줄 (**567줄 감소, 30%**)
- naming/handler.ts: 483줄 (4 핸들러 + 타입 + 상태 + 유틸)
- naming/direct.ts: 156줄 (tryDirectNaming, collectAllNodes)
- naming/index.ts: 31줄 (re-export)

**구조:**
```
packages/figma-plugin/src/
├── code.ts              # 메인 엔트리 (1,318줄)
├── naming/
│   ├── index.ts         # 통합 export
│   ├── handler.ts       # AI 핸들러 + 타입 + 상태
│   └── direct.ts        # 직접 네이밍 로직
└── modules/
    └── naming.ts        # 헬퍼 함수 (Step 2에서 분리 예정)
```

---

## 다음 작업

### Phase 2 Step 2: helpers 분리 (다음)
- modules/naming.ts → naming/helpers/ (classify.ts, infer.ts, normalize.ts, validate.ts)
- 우선순위: 낮음 (현재 구조로도 작동)

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
