# Current Context

> 현재 작업 상태 및 세션 정보
>
> 마지막 업데이트: 2026-01-16

---

## Figma 파일

| 항목 | 값 |
|------|-----|
| URL | https://www.figma.com/design/s4GdImD87fQsWwnRYQVbWV/App?node-id=14436-6854 |
| fileKey | `s4GdImD87fQsWwnRYQVbWV` |
| nodeId | `14436:6854` (테스트용 챌린지 선택 화면) |
| 페이지 | [All] (전체 플로우 모음) |

---

## 현재 작업

### 완료됨 (2026-01-16)
- **네이밍 5개 이슈 수정** (검증 대기)
  - parentNodeId 전달 → 부모 suggestedName과 비교
  - 언더스코어→슬래시 후처리
  - RECTANGLE 조건 완화 (`&&` → `||`)
- **API 안정화**
  - max_tokens: 32768
  - 스트리밍 방식 적용 (타임아웃 해결)
- **프롬프트 캐싱 적용** (`cache_control: ephemeral`)
- **문서 정리**
  - lessons_learned.md: AI Agent 버그 패턴 + 작은 샘플 검증 패턴 추가
  - coaching-issues.md: 기술적 패턴 → lessons_learned.md로 이관, 용도 명확화

### 검증 대기 (크레딧 충전 필요)
- 부모-자식 동일 이름 후처리 (`Header/Main > Header/Main` 해결 여부)
- 프롬프트 캐싱 작동 확인

### 다음 세션 TODO
1. API 크레딧 충전
2. 네이밍 후처리 검증
3. Haiku 모델 테스트 (67% 비용 절감)
4. 남은 이슈: Icon/User 오분류, 자동생성 이름

### 보류됨
- GPT 리서치 추가 제안 → 실무 필요 시 검토

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

1. **API 크레딧 충전 필수** (Anthropic 콘솔)
2. **버튼 네이밍**: `Button/Intent/Shape/Size` 구조
3. **비용 절약 플랜**: `.claude/plans/gentle-exploring-quill.md`
4. **버그 패턴**: lessons_learned.md (AI Agent 섹션 추가됨)
5. **Haiku 모델**: $1/$5 (Sonnet $3/$15의 1/3 가격)
