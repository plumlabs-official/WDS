# Session Memory

> 세션 단기 기억 (compact 후 이어갈 내용)
>
> Last updated: 2026-01-17 | v2.4.0

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
| v2.2.1 | Screen 네이밍 + 경로 수정 | `c57331c` |

**v2.2.1 버그 수정:**
- `api-usage.json` 경로: `process.cwd()` → `__dirname` 기반
- Screen 레벨 네이밍: 프롬프트에 "모든 노드 결과 반환" 명시
- 최상위 프레임 디버그 로깅 추가

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
│   ├── direct.ts        # 직접 네이밍 로직
│   └── helpers/         # Step 2에서 분리됨
└── modules/
    └── naming.ts        # shim (Step 2에서 변환)
```

---

## 완료됨 (2026-01-17) - Phase 2 Step 2 ✅

### Helpers 코드 분리

| 버전 | 작업 | 커밋 |
|------|------|------|
| v2.3.0 | helpers 분리 (5개 파일) | `17f69de` |

**결과:**
- modules/naming.ts: 1,745줄 → 10줄 (shim)
- helpers로 분리: 5개 파일

**helpers 구조:**
```
naming/helpers/
├── constants.ts   # 601줄 - 모든 상수/매핑
├── classify.ts    # 347줄 - 판별 함수
├── validate.ts    # 235줄 - 검증/컨텍스트 체크
├── normalize.ts   # 170줄 - 정규화/중복 해결
├── infer.ts       # 494줄 - 이름 추론
└── index.ts       # 142줄 - re-export
```

**가드레일 적용:**
- infer.ts는 classify/validate 호출만 (중복 구현 금지)
- 순환참조 방지: constants(아래) → classify/validate/normalize → infer(위)
- named export만, default 금지
- modules/naming.ts는 shim (하위 호환성 유지)

---

## 완료됨 (2026-01-17) - Phase 3 ✅

### zod 런타임 검증

| 버전 | 작업 | 커밋 |
|------|------|------|
| v2.4.0 | zod 스키마 검증 추가 | `ee3c2ff` |

**적용 위치:**
- common: `naming-schema.ts` - 스키마 정의 + 검증 함수
- agent-server: `naming.ts` - LLM 응답 검증 적용

**스키마 구조:**
```typescript
NamingResultItemSchema = {
  nodeId: string,           // 필수
  suggestedName: string,    // 필수
  componentType: string,    // 필수
  confidence: number,       // 0-1
  reasoning: string,        // 필수
  // 버튼 전용 (선택)
  intent?, shape?, size?, state?, icon?,
  // 일반 컴포넌트 (선택)
  context?, purpose?, variant?
}
```

**검증 함수:**
- `validateNamingResponse()` - 배열 전체 검증 + 부분 데이터 추출
- `validateSuggestedName()` - 개별 이름 규칙 검증
- `validateButtonNaming()` - 버튼 형식 검증

---

## 다음 작업

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
