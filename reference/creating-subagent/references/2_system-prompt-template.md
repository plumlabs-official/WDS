# System Prompt 표준 템플릿

예시 3개 (`doc-updater`, `automation-scout`, `writing-approval`) 분석 기반 역추출.

---

## Frontmatter

```yaml
---
name: { kebab-case-name }
description: |
  {역할}. {역할 설명}.
  Use {proactively | immediately | when} {상황}.
  한국어 트리거: "{키워드1}", "{키워드2}", "{키워드3}".
model: inherit
---
```

---

## System Prompt

### 필수 구조

```markdown
# {Agent 이름}

{한 줄 역할 설명}

## Role

너는 **{역할}**이다.

**[핵심 원칙]**
1. {원칙 1}
2. {원칙 2}
3. {원칙 3}

**[참고 가이드]**
- {docs/guides/xxx.md}

## Workflow

### Step 0: To-Do 생성 (3단계 이상 필수)

업무 시작 전 아래 To-Do를 생성하여 진행 상황을 추적한다:

```
□ Step 1: {단계명}
□ Step 2: {단계명}
□ Step N: ...
```

### Step 1: {단계명}

{구체적 행동}

### Step 2: {단계명}

{구체적 행동}

### Step N: ...

## Output Format

{구체적 출력 형식}
```

---

### 선택적 섹션

> **필수 4개 (`# Title`, `## Role`, `## Workflow`, `## Output Format`) 외 모든 섹션은 자유.**

에이전트 특성에 따라 필요한 섹션을 추가. 예시:
- `## Quality Standards` — 품질 기준이 중요할 때
- `## Edge Cases` — 예외 처리가 필요할 때
- `## Knowledge Base` — 참조 파일/문서가 있을 때
- `## Decision Guidelines` — 판단 기준이 필요할 때
- `## Constraints` — 제약 조건이 있을 때
- `## Examples` — 입출력 예시가 도움될 때
- 기타 에이전트에 맞는 커스텀 섹션

---

## 요약

| 구분 | 섹션 |
|------|------|
| **필수** | `# Title`, `## Role`, `## Workflow`, `## Output Format` |
| **선택** | 에이전트 특성에 따라 자유롭게 추가 |

---

## 핵심 패턴

1. **To-Do 우선**: 3단계 이상 워크플로우는 `Step 0: To-Do 생성` 필수
2. **Step 형식**: `### Step N: {단계명}`
3. **Bold 강조**: `**Look for:**`, `**[중요]**`
4. **코드 블록**: 출력 형식은 마크다운 코드 블록으로
5. **테이블**: 체크리스트, 비교표에 활용
6. **조건부 진행**: `{조건}일 때만 다음 단계 진행` 명시
