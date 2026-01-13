# Subagent System Prompt 설계 가이드

> 이 문서는 `SKILL.md`에서 호출됩니다. 단독으로 사용하지 마세요.

---

## 🎯 설계 원칙

System Prompt 작성 시 다음 원칙을 준수한다:

1. **명확성(Clarity) 최우선**: 모호한 표현("적절히", "충분히")을 배제하고, LLM이 오해할 여지가 없는 명확한 지시어를 사용한다.
2. **구조화(Structure)**: 줄글이 아닌 Step-by-Step 리스트, 마크다운 헤더를 사용하여 가독성을 높인다.
3. **맥락(Context) 주입**: 단순 기능 수행을 넘어, 프로젝트의 가이드(`docs/guides/`)와 도메인 지식을 참조하게 한다.
4. **To-Do 우선**: 3단계 이상의 워크플로우는 반드시 업무 시작 전 To-Do 생성 섹션을 포함한다.

---

## Part A: 추가 인터뷰

> **호출 시점**: `SKILL.md` Step 3에서 호출

System Prompt 작성에 필요한 추가 정보를 수집한다.

### 질문 목록

1. **Input**: "이 에이전트가 작업을 시작하려면 어떤 정보가 필요한가요?"
   - 예: 회의록, 에러 메시지, 파일 경로, 백로그 문서

2. **Output**: "최종 결과물은 어떤 형태로 받고 싶으세요?"
   - 예: 마크다운 테이블, 체크리스트, 코드 블록, 요약

3. **참고 가이드**: "참고할 가이드가 있나요? (`docs/guides/`)"
   - 없으면 skip

### 가이드 매핑 표

| Subagent 유형 | 연결할 가이드 |
|--------------|--------------|
| code-reviewer | `docs/guides/frontend-coding-style-guide.md` |
| security-auditor | `docs/guides/ai-safety-guide.md` |
| test-runner | `docs/guides/frontend-testing-guide.md` |
| db-expert | `docs/guides/supabase-database-guide.md` |
| feature-builder | `docs/guides/frontend-feature-development-guide.md` |
| prd-drafter | `docs/guides/frontend-overview.md`, `skills/developing-feature/` |

> **Process (처리 로직)**, **핵심 원칙**은 AI가 Role + Goal + Input에서 추론하여 초안에 포함.

---

## Part B: 초안 작성

> **호출 시점**: `SKILL.md` Step 4에서 호출

확보된 정보를 바탕으로 `2_system-prompt-template.md` 구조에 맞춰 System Prompt 초안을 작성한다.

### 필수 섹션

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

### 선택적 섹션

필수 4개 (`# Title`, `## Role`, `## Workflow`, `## Output Format`) 외 에이전트 특성에 따라 추가:

- `## Quality Standards` — 품질 기준이 중요할 때
- `## Edge Cases` — 예외 처리가 필요할 때
- `## Knowledge Base` — 참조 파일/문서가 있을 때
- `## Decision Guidelines` — 판단 기준이 필요할 때
- `## Constraints` — 제약 조건이 있을 때
- `## Examples` — 입출력 예시가 도움될 때

---

## Part C: 전문가 리뷰 시뮬레이션

> **호출 시점**: `SKILL.md` Step 5에서 호출

작성된 초안을 두 명의 가상 전문가가 검토하는 과정을 시뮬레이션한다.

### 리뷰어 페르소나

1. **Anthropic 수석 프롬프트 엔지니어 (Technical)**
   - 구조적 결함 지적
   - 모호한 지시 식별
   - 환각 가능성 경고
   - 정량적 기준 부재 지적

2. **도메인 전문가 (Domain)**
   - 비즈니스 목표 달성 여부 평가
   - 실무 적합성 검토
   - 누락된 edge case 지적

### 출력 형식

```
🧐 전문가 리뷰 시뮬레이션 중...

🔧 프롬프트 엔지니어:
"{구체적 지적}"

📈 도메인 전문가:
"{구체적 지적}"

👉 개선 방향: {반영할 내용}
```

리뷰 내용을 반영하여 초안을 수정한 후, `SKILL.md` Step 6으로 진행한다.

---

## 📚 작성 팁

### 명령조 사용

LLM에게는 "해주세요"보다 **"하라(Do)", "분석하라(Analyze)", "출력하라(Output)"**가 더 효과적이다.

### 플레이스홀더 활용

변동되는 값은 `{변수명}` 형태로 표기하여 템플릿화한다.

### 정량적 기준 제시

- ❌ **모호**: 적절히 분석하라
- ✅ **명확**: 키워드 5개를 추출하라

- ❌ **모호**: 충분히 검토하라
- ✅ **명확**: 3개 이상의 edge case를 확인하라

### Few-Shot 활용

복잡한 지시가 필요한 경우, 프롬프트 내에 `예시:` 섹션을 만들어 입출력 샘플을 포함시킨다.
