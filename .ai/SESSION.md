# Session Memory

> 세션 단기 기억 (compact 후 이어갈 내용)
>
> Last updated: 2026-01-17 | v2.1.0

---

## Figma 파일

| 항목 | 값 |
|------|-----|
| URL | https://www.figma.com/design/s4GdImD87fQsWwnRYQVbWV/App?node-id=14451-4060 |
| fileKey | `s4GdImD87fQsWwnRYQVbWV` |
| nodeId | `14451:4060` |

---

## 현재 작업

### 완료됨 (2026-01-17) - v2.1.0 구조 리팩토링

#### Phase 1: 문서/디렉토리 구조 재설계 ✅

| 작업 | 상태 |
|------|------|
| 1.1 루트 문서 생성 (README, CHANGELOG, CONTRIBUTING) | ✅ |
| 1.2 docs/ 구조 생성 (Diátaxis: tutorials, guides, specs, architecture) | ✅ |
| 1.3 SSOT 이동 (.ai/design-system → docs/specs) | ✅ |
| 1.4 .ai/ 역할 재정의 (SESSION, DECISIONS, RECIPES) | ✅ |
| 1.5 packages/ 구조 생성 (모노레포: figma-plugin, agent-server, common) | ✅ |
| 1.6 워크스페이스 설정 | ✅ |
| 검증: npm run build:all 성공 | ✅ |
| CLAUDE.md, AGENTS.md 경로 업데이트 | ✅ |

---

## 다음 작업

### Phase 2: 코드 리팩토링
- 파일 책임 분리 (handlers/, extractors/, naming/, validators/)
- Dead Code 삭제
- 중복 함수 추출 → common 패키지

### Phase 3: zod 런타임 검증
- common 패키지에 스키마 정의 완료
- agent-server에 적용 필요

### Phase 4: 네이밍 패턴 라이브러리
- 크로스-스크린 네이밍 일관성 기능

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
