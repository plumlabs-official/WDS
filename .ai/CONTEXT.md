# Current Context

> 현재 작업 상태 및 세션 정보
>
> 마지막 업데이트: 2026-01-15

---

## Figma 파일

| 항목 | 값 |
|------|-----|
| URL | https://www.figma.com/design/s4GdImD87fQsWwnRYQVbWV/App?node-id=13563-1488 |
| fileKey | `s4GdImD87fQsWwnRYQVbWV` |
| nodeId | `13563:1488` |
| 페이지 | [All] (전체 플로우 모음) |

---

## 현재 작업

### 완료됨 (2026-01-15)
- 버튼 네이밍 구조 개편: Intent/Shape/Size 분리
  - 상세 논의: `reference/decisions/button-naming-discussion-2026-01-15.md`
- 문서 구조 간소화 (가이드 기준 88점)
- SPEC.md, SKILL.md 추가

### 대기 중
- Figma에서 새 네이밍 구조 테스트

### 보류됨
- GPT 리서치 추가 제안 (`reference/DS/GPT-리서치-요약.md`)
  - Patterns 레이어, StateLayer 토큰 → 실무 필요 시 검토

---

## Agent Server

```bash
cd agent-server && npm run build && npm start
# http://localhost:3001
```

| 엔드포인트 | 설명 |
|-----------|------|
| GET /health | 헬스체크 |
| POST /agents/naming/context | 컨텍스트 기반 네이밍 |
| POST /agents/autolayout | 오토레이아웃 분석 |
| POST /agents/cleanup/validate | 병합 검증 (AI) |

---

## 문서 구조

```
.ai/
├── PRD.md             # 제품 요구사항
├── SPEC.md            # 기술 사양 및 API
├── MEMORY.md          # 아키텍처 결정 (WHY)
├── CONTEXT.md         # 현재 상태 (이 파일)
├── lessons_learned.md # 버그 패턴 (WHAT)
├── SKILL.md           # 반복 작업 패턴
└── design-system/     # 도메인별 규칙

agent-server/prompts/  # AI 프롬프트
```

---

## 다음 세션 참고

1. **버튼 네이밍**: `Button/Intent/Shape/Size` 구조 (기존 Purpose/Variant 폐기)
2. **규칙 확인 순서**: MEMORY.md → design-system/*.md
3. **버그 패턴**: lessons_learned.md
4. **결정 히스토리**: reference/decisions/
