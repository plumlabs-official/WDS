---
description: 완료된 작업을 기록하는 표준 사후정리 도구 (CHANGELOG + SESSION.md)
allowed-tools: [Read, Edit, Glob, Grep, Bash]
---

# /record Command

완료된 작업을 기록하는 표준 사후정리 도구.

## 사용법

```
/record <type> <message>
```

## 타입

| type | 설명 | CHANGELOG 섹션 |
|------|------|----------------|
| `feature` | 새 기능 | Added |
| `refactor` | 구조 개선 | Changed |
| `fix` | 버그 수정 | Fixed |
| `docs` | 문서 변경 | Changed |

## 실행 절차

### 1. Git Diff 분석

```bash
# 마지막 태그 이후 변경 요약
git diff --stat $(git describe --tags --abbrev=0 2>/dev/null || echo HEAD~10)..HEAD
git diff --name-status $(git describe --tags --abbrev=0 2>/dev/null || echo HEAD~10)..HEAD
```

### 2. ADR 필요 여부 판정

다음 조건 중 하나라도 해당하면 **ADR 생성 제안** (자동 생성 아님):

| 조건 | 설명 |
|------|------|
| `packages/*/src/` 디렉토리 구조 변경 | rename/move 5개 이상 |
| `docs/specs/` 변경 | SSOT 규칙 변경 |
| 새 모듈/패키지 추가 | 아키텍처 결정 |

**ADR 제안 시 출력:**
```
⚠️ ADR 후보 감지:
- [조건 설명]
- 제안: docs/architecture/ADRs/ADR-XXXX-[제목].md 생성
- 진행하려면 승인해주세요.
```

### 3. CHANGELOG.md 업데이트

```markdown
## [Unreleased]

### {섹션}
- {message}
```

- 버전 번호는 수동 태깅 시 확정
- `[Unreleased]` 섹션이 없으면 생성

### 4. SESSION.md 링크 추가

"완료된 작업" 테이블에 한 줄 추가:
```markdown
| {type}: {message 요약} | - | - | `{최신커밋hash}` |
```

### 5. 완료 메시지

```
✅ 기록 완료
- CHANGELOG: {섹션}에 추가
- SESSION: 링크 추가
- 커밋: {hash}
{ADR 제안이 있으면 표시}
```

## 예시

```
/record feature 패턴 라이브러리 Backend API 추가
/record refactor naming 모듈 helpers 분리
/record fix Screen 레벨 네이밍 누락 수정
```

## 주의사항

- `/record`는 **커밋 후** 실행 (커밋되지 않은 변경은 무시)
- ADR은 자동 생성하지 않음 (품질 문제) - 제안만
- 버전 태그는 별도 수동 작업
