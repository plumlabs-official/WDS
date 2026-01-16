# ADR-0003: Naming Module Split

> Date: 2026-01-17 | Status: Accepted

## Context

`code.ts` (1,885줄)와 `modules/naming.ts` (1,745줄)가 단일 파일로 비대화.
- 수정 시 영향 범위 파악 어려움
- 테스트/디버깅 복잡
- 순환참조 위험

## Decision

**1. naming/ 모듈 분리 (Step 1)**
```
naming/
├── handler.ts   # AI 핸들러 (UI 메시지 처리)
├── direct.ts    # 직접 네이밍 (tryDirectNaming)
└── index.ts     # re-export
```

**2. helpers/ 세분화 (Step 2)**
```
naming/helpers/
├── constants.ts  # 상수/매핑 테이블
├── classify.ts   # 판별 함수 (isXxx)
├── validate.ts   # 검증/컨텍스트 체크
├── normalize.ts  # 정규화/중복 해결
├── infer.ts      # 이름 추론
└── index.ts      # re-export
```

**3. 순환참조 방지 규칙**
- 의존성 방향: `constants` → `classify/validate/normalize` → `infer`
- infer는 판단 로직 직접 구현 금지 (classify/validate 호출만)

**4. Import 정책**
- named export만, default 금지
- `modules/naming.ts`는 shim으로 유지 (하위 호환성)

## Consequences

- code.ts: 1,885줄 → 1,318줄 (30% 감소)
- 파일별 책임 명확 → 수정 영향 범위 축소
- 순환참조 방지 규칙으로 의존성 관리 용이

## Related

- Commits: `3a0735a`, `c57331c`, `17f69de`
