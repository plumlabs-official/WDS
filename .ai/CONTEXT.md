# Current Context

> 현재 작업 상태 및 세션 정보
>
> 마지막 업데이트: 2026-01-16 (오후)

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

### 완료됨 (2026-01-16 오후)
- **API 크레딧 충전 완료**
- **UI 모델 선택 기능 추가**
  - Figma UI에서 Haiku/Sonnet/Opus 선택 가능
  - 모든 AI 기능(네이밍, 오토레이아웃)에 적용
  - 수정 파일: ui.html, claude.ts, naming.ts, autolayout.ts, types.ts
- **/price 커맨드 추가**
  - API 비용 실시간 확인
  - `price-history.log`에 히스토리 기록
  - 수정 파일: ~/.claude/commands/price.md
- **커맨드 문서화 체계 수립**
  - `~/.claude/commands/README.md` 생성
  - 커맨드 생성 시 목적/의존파일/동작방식 기록

### 완료됨 (2026-01-16 오전)
- **네이밍 5개 이슈 수정** (검증 대기)
  - parentNodeId 전달 → 부모 suggestedName과 비교
  - 언더스코어→슬래시 후처리
  - RECTANGLE 조건 완화 (`&&` → `||`)
- **API 안정화**
  - max_tokens: 32768
  - 스트리밍 방식 적용 (타임아웃 해결)
- **프롬프트 캐싱 적용** (`cache_control: ephemeral`)

### 검증 대기
- 부모-자식 동일 이름 후처리 (`Header/Main > Header/Main` 해결 여부)
- 프롬프트 캐싱 작동 확인 (cache_read_input_tokens 로그)
- UI 모델 선택 기능 테스트

### 다음 세션 TODO
1. Figma에서 모델 선택 테스트 (Haiku vs Sonnet 비교)
2. /price로 비용 확인 + 로그 기록 검증
3. 남은 이슈: Icon/User 오분류, 자동생성 이름

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

1. **모델 선택**: Figma UI 상단에서 Haiku/Sonnet/Opus 선택
2. **비용 확인**: `/price` 커맨드 실행 → `price-history.log`에 기록
3. **버튼 네이밍**: `Button/Intent/Shape/Size` 구조
4. **버그 패턴**: lessons_learned.md (AI Agent 섹션)
5. **커맨드 문서**: `~/.claude/commands/README.md`

### 모델별 가격 (per 1M tokens)

| 모델 | Input | Output | 특징 |
|------|-------|--------|------|
| Haiku | $1 | $5 | 빠름, 저렴 |
| Sonnet | $3 | $15 | 균형 (기본값) |
| Opus | $15 | $75 | 최고 품질 |
