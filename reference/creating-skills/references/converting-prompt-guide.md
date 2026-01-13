# 프롬프트 → Skill 변환 상세 가이드

## Step 1: 유형 분석

**단일 프롬프트** (`prompts/xxx.md`)
→ `skills/{name}/SKILL.md` 생성

**순차적 프롬프트** (`prompts/xxx/*.md`)
→ `skills/{name}/SKILL.md` + `references/`

---

## Step 2: Frontmatter 작성

```yaml
---
name: {skill-name}
description: {무엇}. Use when user says "{한국어}", "{영어}". For X, use Y instead.
---
```

### name 규칙

- 소문자 + 숫자 + 하이픈만 (최대 64자)
- Gerund 형태: `creating-pr`, `fixing-bugs`
- "anthropic", "claude" 금지

### description 규칙 (핵심!)

Claude가 Skill 선택에 사용:

- **무엇을** + **언제 사용** 필수
- 한국어 + 영어 트리거 키워드
- 다른 Skill과 구분: "For X, use Y instead"
- 3인칭 (❌ "I can", "You can")

---

## Step 3: Skill 생성

### Case A: 단일 프롬프트

```
prompts/start-pr.md
    ↓
skills/creating-pr/SKILL.md (frontmatter + 기존 내용)
```

### Case B: 순차적 프롬프트

```
prompts/start_feature/
├── 1_get_context.md
└── 2_define.md
    ↓
skills/developing-feature/
├── SKILL.md (개요)
└── references/
    ├── 1_get_context.md
    └── 2_define.md
```

### Case C: 외부 가이드 참조

**해당 프롬프트 전용 가이드라면** references/로 이동:

```
prompts/start-pr.md (→ docs/guides/pr-guide.md 참조)
    ↓
skills/creating-pr/
├── SKILL.md
└── references/
    └── pr-guide.md
```

⚠️ 이동한 가이드 참조하는 다른 파일 경로 수정 필수 (AGENTS.md 등)

---

## Step 4: 원본 리다이렉트

**삭제 안 함, 리다이렉트로 변경:**

### 단일 프롬프트

`prompts/start-pr.md`:

```markdown
# start-pr

> `skills/creating-pr/`로 이동했습니다.

`skills/creating-pr/` 실행하세요.
```

### 순차적 프롬프트

폴더 삭제 → 단일 파일로 대체:

`prompts/start-feature.md`:

```markdown
# start-feature

> `skills/developing-feature/`로 이동했습니다.

`skills/developing-feature/` 실행하세요.
```

---

## Step 5: 검증

- [ ] `skills/{name}/SKILL.md` 생성
- [ ] frontmatter 규칙 준수
- [ ] description에 트리거 + 구분 포함
- [ ] **Step 0: To-Do 생성 섹션 포함** (3단계 이상인 경우 필수)
- [ ] prompts/ 리다이렉트로 변경
- [ ] 참조 파일 경로 수정 완료

---

## 네이밍 변환

`start-X` → `Xing-Y` 패턴 권장:

- `start-pr.md` → `creating-pr/`
- `start-feature.md` → `developing-feature/`
- `start_bugfix/` → `fixing-bugs/`
- `start-commit.md` → `committing-changes/`
