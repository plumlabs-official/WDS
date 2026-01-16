---
name: creating-skills
description: Creates Agent Skills from scratch or converts prompts to Skill format. Use when user says "스킬 만들어줘", "새 스킬", "프롬프트를 스킬로 변환". For isolated context/tool restrictions, use creating-subagent instead.
---

# Agent Skill 생성

새 Skill을 만들거나 기존 프롬프트를 Skill로 변환합니다.

---

## 🚦 Step 0: Skill vs Subagent 결정 (필수)

**⚠️ 생성 전 반드시 확인:** 사용자 요청이 Skill에 적합한지 판단한다.

### Skill이 적합한 경우 ✅

- Claude에게 **전문 지식/가이드라인** 추가 (예: "우리 팀 PR 표준으로 리뷰해줘")
- **현재 대화 컨텍스트**에서 실행되어야 함
- Claude가 **자동으로** 관련 상황에서 적용해야 함
- 단일 목적의 빠른 작업 (changelog 생성, 커밋 메시지, 포맷팅)

### Subagent가 적합한 경우 → `creating-subagent` 스킬로 안내 ❌

- **컨텍스트 분리** 필요 (긴 탐색/연구 결과가 메인 대화 오염 방지)
- **도구 접근 제한** 필요 (read-only, Bash만 허용 등)
- **병렬 실행** 필요 (여러 작업 동시 수행)
- 완료된 작업의 **독립 검증**

### AI 추론 후 제안 (애매한 경우)

사용자 요청을 분석하여 AI가 먼저 판단하고 제안한다:

```
🤔 요청을 분석해보니 **{Skill/Subagent}**가 더 적합해 보입니다.

**이유:**
- {핵심 판단 근거 1-2개}

**예시:** {유사한 기존 Skill/Subagent 언급}

이 방향으로 진행할까요? 아니면 다른 방식을 원하시나요?
```

**Subagent가 적합하다고 판단되면:**
- 위 형식으로 Subagent 추천 이유를 설명
- 사용자 동의 시 `creating-subagent` 스킬로 전환

---

## 자동 경로 선택

사용자 의도에 따라 자동 분기:

- **"스킬 만들어줘", "새 스킬"** → Path A
- **"프롬프트를 스킬로 변환", "xxx.md를 Skill로"** → Path B
- **의도 불명확** → 아래 질문

```
🎯 어떤 작업이 필요한가요?
A. 새 Skill 생성 - 처음부터 새로운 Skill 만들기
B. 프롬프트 변환 - 기존 prompts/ 파일을 Skill로 변환
```

---

## Path A: 새 Skill 생성

**상세 절차:** `references/new-skill-guide.md`

### Step 0: To-Do 생성 (Path A)

```
□ 1. 정보 수집 (목적, 트리거, 기대 결과물)
□ 2. 이해 확인 (사용자 승인)
□ 3. SKILL.md 생성 (frontmatter + 본문)
□ 4. 검증 (규칙 준수 확인)
□ 5. Command 등록
```

### 핵심 흐름

1. **정보 수집** - Skill 목적, 트리거 조건, 기대 결과물
2. **이해 확인** - 사용자 승인 필수
3. **SKILL.md 생성** - frontmatter + 본문 (200-300 lines)
4. **검증** - 규칙 준수 확인
5. **Command 등록** - `.claude/commands/`에 호출 파일 생성

---

## Path B: 프롬프트 → Skill 변환

**상세 절차:** `references/converting-prompt-guide.md`

### Step 0: To-Do 생성 (Path B)

```
□ 1. 분석 (단일/순차적 프롬프트 판별)
□ 2. Skill 생성 (frontmatter + 구조 변환)
□ 3. 원본 리다이렉트
□ 4. 검증 (경로 참조 수정 확인)
□ 5. Command 등록
```

### 핵심 흐름

1. **분석** - 단일/순차적 프롬프트 판별
2. **Skill 생성** - frontmatter 추가 + 구조 변환
3. **원본 리다이렉트** - 삭제 안 함, 리다이렉트로 변경
4. **검증** - 경로 참조 수정 확인
5. **Command 등록** - `.claude/commands/`에 호출 파일 생성

---

## Frontmatter 필수 규칙

### name

- 소문자 + 숫자 + 하이픈만 (최대 64자)
- Gerund 형태 권장: `creating-pr`, `fixing-bugs`
- "anthropic", "claude" 금지

### description (핵심!)

Claude가 Skill 선택에 사용하는 유일한 정보:

- **무엇을** + **언제 사용** 필수 포함
- 한국어 + 영어 트리거 키워드 포함
- 다른 Skill과 구분: "For X, use Y instead"
- 3인칭 작성 (❌ "I can help", "You can use")

**예시:**

```yaml
---
name: fixing-bugs
description: Analyzes implementation before planning safe bug fixes. Use when user says "버그 수정", "이슈 해결". For new features, use developing-feature instead.
---
```

---

## ⚠️ 핵심 원칙

### ❌ 금지

- 오버스펙 (요청하지 않은 기능 추가)
- 500+ lines (목표 200-300)
- 모호한 description (구체적 트리거 필수)

### ✅ 필수

- description에 트리거 조건 명시
- 순차적 단계는 references/로 분리
- 다른 Skill과 명확히 구분

---

## Command 등록

Skill 생성 후 반드시 `/` 슬래시 명령어로 호출할 수 있도록 command 파일을 생성합니다.

### 대상 디렉토리 선택

- 원본이 `prompts/mcdonalds/`에 있으면 → `mcdonalds/`
- 모노레포 공통 도구 (커밋, 릴리즈 등) → `monorepo/`
- 특정 앱 전용이면 → 해당 앱 네임스페이스 (예: `popow-frontend/`)

### 파일 생성

**경로:** `.claude/commands/{dir}/start-{name}.md`

```yaml
---
description: {Skill의 한 줄 설명}
allowed-tools: {필요한 도구 권한, 예: Bash(git:*)}
---

@skills/{name}/SKILL.md
```

### 예시

`start-commit.md`:

```yaml
---
description: 변경사항을 분석하고 Conventional Commits 형식으로 커밋합니다.
allowed-tools: Bash(git:*)
---

@skills/committing-changes/SKILL.md
```

---

## 기대 결과

- `skills/{name}/SKILL.md` 생성
- `skills/{name}/references/` 생성 (필요시)
- 기존 prompts/ 리다이렉트 처리 (변환 시)
- `.claude/commands/{dir}/start-{name}.md` 생성
