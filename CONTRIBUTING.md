# Contributing Guide

WellWe Design System Automator 프로젝트에 기여해주셔서 감사합니다.

---

## SSOT 정책

> **Single Source of Truth** - 규칙/사양/계약의 정답은 한 곳에만

### 원칙

1. **SSOT는 `docs/specs/` 하나** - 규칙/사양/계약은 여기만 수정
2. **`.ai/`와 `prompts/`에는 SSOT 본문 복사 금지** - 요약/링크만
3. **중요 변경은 ADR로 기록** - 회귀 방지

### 문서 업데이트 규칙

| 변경 유형 | 수정 위치 | ADR 필요 |
|----------|----------|----------|
| 네이밍 규칙 변경 | `docs/specs/naming-schema.md` | O |
| API 계약 변경 | `docs/specs/api-contract.md` | O |
| 버그 패턴 추가 | `docs/architecture/lessons-learned.md` | X |
| 가이드 업데이트 | `docs/how-to/*.md` | X |

### API 변경 시

```
API 변경 → api-contract.md만 수정
         → technical-spec.md는 링크 유지 (상세 작성 금지)
         → 중요 변경은 ADR 작성
```

---

## 개발 환경 설정

### 필수 요구사항

- Node.js 18+
- npm 9+
- Figma Desktop App

### 설치

```bash
git clone <repository-url>
cd figma-design-system-automator
npm install
cd agent-server && npm install && cd ..
```

## 코드 스타일

### TypeScript

- strict 모드 사용
- 명시적 타입 선언 권장
- ES6+ 문법 사용 (단, Figma 플러그인 호환성 주의)

### 네이밍 규칙

- 파일명: kebab-case (`naming-handler.ts`)
- 클래스/타입: PascalCase (`NamingResult`)
- 함수/변수: camelCase (`handleNaming`)
- 상수: UPPER_SNAKE_CASE (`MAX_DEPTH`)

## 커밋 메시지

```
<type>: <description>

[optional body]

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Type

- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드/설정 변경

## PR 프로세스

1. 브랜치 생성: `feature/<feature-name>` 또는 `fix/<issue-name>`
2. 변경 사항 커밋
3. PR 생성 (템플릿 사용)
4. 리뷰 후 머지

## 문서 작성

### 위치

| 문서 유형 | 위치 |
|----------|------|
| 진입점 | `docs/START-HERE.md` |
| 작업 가이드 | `docs/how-to/` |
| 규칙/사양 (SSOT) | `docs/specs/` |
| 아키텍처/ADR | `docs/architecture/` |

### ADR (Architecture Decision Record)

새로운 아키텍처 결정 시 ADR 작성:

```markdown
# ADR-XXXX: 제목

## 상태
제안됨 / 승인됨 / 폐기됨

## 컨텍스트
왜 이 결정이 필요한가?

## 결정
무엇을 결정했는가?

## 결과
이 결정의 영향은?
```

## 테스트

### 빌드 테스트

```bash
npm run build:all
npm run typecheck
```

### 기능 테스트

1. Figma에서 플러그인 리로드
2. 테스트 프레임에서 기능 실행
3. 콘솔 로그 확인

## 질문/이슈

- GitHub Issues에 등록
- 버그 리포트 시 재현 단계 포함
