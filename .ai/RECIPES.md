# RECIPES

> AI용 워크플로우 - 링크 중심, SSOT 복사 금지
>
> Last updated: 2026-01-17

---

## 빌드 명령어

```bash
# 통합 빌드
npm run build:all

# 개별 빌드
npm run build:plugin   # Figma 플러그인
npm run build:server   # Agent Server

# 서버 실행
npm run server         # localhost:3001
```

---

## 디버깅

```bash
# API 헬스체크
curl localhost:3001/health

# 플러그인 콘솔
Figma > Plugins > Development > Open Console
```

---

## 문서 참조 (링크)

| 용도 | 문서 |
|------|------|
| 네이밍 규칙 | [docs/specs/naming-schema.md](../docs/specs/naming-schema.md) |
| 오토레이아웃 규칙 | [docs/specs/autolayout-rules.md](../docs/specs/autolayout-rules.md) |
| API 계약 | [docs/specs/api-contract.md](../docs/specs/api-contract.md) |
| 버그 패턴 | [docs/architecture/lessons-learned.md](../docs/architecture/lessons-learned.md) |

---

## 커밋 형식

```
<type>: <한글 요약>

- 상세 내용

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

---

## 체크리스트

### PR 전
- [ ] `npm run build:all` 성공
- [ ] Figma 플러그인 테스트 완료

### 버그 수정 후
- [ ] `docs/architecture/lessons-learned.md` 패턴 추가
