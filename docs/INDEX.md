---
name: wellwe-design-system-automator
description: Figma 디자인 시스템 자동화 플러그인. 명령 실행 전 이 파일을 먼저 참조하여 해당 기능의 문서(.md)와 구현(.ts)을 확인합니다.
---

# Wellwe Design System Automator

Figma 플러그인 + Agent Server 기반 디자인 시스템 자동화 도구

---

## AI 전용 문서 (.ai/)

| 파일 | 설명 |
|------|------|
| `.ai/PRD.md` | 제품 요구사항 |
| `.ai/MEMORY.md` | 빠른 요약 (1페이지) |
| `.ai/CONTEXT.md` | 현재 작업 상태 |
| `.ai/lessons_learned.md` | **결정 + 실수 패턴 (도메인별)** |
| `.ai/design-system/naming-rules.md` | 네이밍 규칙 (SSOT) |
| `.ai/design-system/autolayout-rules.md` | 오토레이아웃 규칙 |
| `.ai/design-system/figma-mcp-rules.md` | 피그마-코드 매핑 |

---

## 기능별 참조 맵

### 1. 전처리 (Preprocessing)

전체 실행에서 **제외**됨. 수동으로만 실행.

| 명령 | 문서 (.md) | 구현 (.ts) |
|------|-----------|-----------|
| `cleanup-wrappers` | `agent-server/docs/agents/preprocessing/cleanup-wrappers.md` | `src/modules/cleanup.ts` |
| `detach-components` | `agent-server/docs/agents/preprocessing/detach-components.md` | `src/code.ts` → `handleDetachComponents()` |
| `delete-hidden-layers` | `agent-server/docs/agents/preprocessing/delete-hidden-layers.md` | `src/code.ts` → `handleDeleteHiddenLayers()` |

---

### 2. 네이밍 (AI Only)

> **Note:** Rule-based 네이밍은 삭제됨. AI 네이밍만 사용.

| 명령 | 문서 (.md) | 구현 (.ts) |
|------|-----------|-----------|
| `auto-naming-agent` | `agent-server/docs/agents/naming-agent.md` | `src/code.ts` → `handleNamingAgent()` |
| (직접 변환) | - | `src/modules/naming.ts` (유틸 함수) |

**직접 변환 (AI 호출 없이):**
- 아이콘 라이브러리 → `Icon/Discovery`
- 한글 레이블 → `TabItem/Home`
- 하이픈 패턴 → `Icon/User`

---

### 3. Auto Layout (AI Only)

> **Note:** Rule-based Auto Layout은 삭제됨. AI Auto Layout만 사용.

| 명령 | 문서 (.md) | 구현 (.ts) |
|------|-----------|-----------|
| `apply-autolayout-agent` | `agent-server/docs/agents/autolayout-agent.md` | `src/code.ts` → `handleAutoLayoutAgent()` |
| `standardize-spacing` | `agent-server/docs/agents/spacing-agent.md` | `src/modules/spacing.ts` |

---

### 4. 컴포넌트 (Component)

| 명령 | 문서 (.md) | 구현 (.ts) |
|------|-----------|-----------|
| `componentize` | `agent-server/docs/agents/componentize-agent.md` | `src/modules/componentize.ts` |
| `componentize-convert` | `agent-server/docs/agents/componentize-agent.md` | `src/modules/componentize.ts` |

---

### 5. 전체 실행

| 명령 | 설명 |
|------|------|
| `run-all-agent` | AI 네이밍 → AI Auto Layout → 간격 표준화 (전처리 제외) |

---

## 실행 순서 (권장)

```
[수동] 1. 전처리
       ├─ 컴포넌트 브레이크 (필요시)
       ├─ 꺼진 레이어 삭제
       └─ 의미 없는 래퍼 제거

[자동] 2. 전체 실행 (with AI Agent)
       ├─ AI 네이밍 (직접 변환 + LLM)
       ├─ AI Auto Layout
       └─ 간격 표준화
```

---

## 핵심 원칙

### AI 네이밍

1. **제외 조건** - 벡터, 도형, 상태값(on/off) 제외
2. **직접 변환** - 아이콘 라이브러리, 한글 레이블, 하이픈 패턴
3. **AI 분석** - 직접 변환 불가능한 FRAME만 Agent Server 호출

### Auto Layout Agent

1. **기존 디자인 100% 보존** - 적용 후 시각적 변화 없어야 함
2. **요소 순서 유지** - 레이어 순서 → 시각적 순서로 정렬 후 적용
3. **FILL 최소화** - 95% 이상 채우는 경우에만 사용
4. **기본값**: `layoutAlign: INHERIT`, `layoutGrow: 0`

### 전처리

1. **파괴적 작업** - 실행 전 확인 필수
2. **전체 실행 제외** - 수동으로만 실행
3. **Undo 가능** - Cmd+Z로 복구

---

## 파일 구조

```
/
├── src/                          # Figma 플러그인
│   ├── code.ts                   # 메인 엔트리
│   ├── ui.html                   # UI 패널
│   └── modules/
│       ├── cleanup.ts            # 래퍼 정리 (Rule-based)
│       ├── spacing.ts            # 간격 표준화 (Rule-based)
│       ├── naming.ts             # 네이밍 유틸 (직접 변환용)
│       └── componentize.ts       # 컴포넌트화
│
├── agent-server/                 # Agent Server
│   ├── prompts/                  # 프롬프트 파일 (외부화)
│   │   ├── naming-context.md     # 컨텍스트 기반 네이밍
│   │   ├── naming-single.md      # 단일 노드 네이밍
│   │   └── autolayout.md         # Auto Layout
│   ├── src/
│   │   ├── index.ts              # Express 서버
│   │   ├── agents/
│   │   │   ├── naming.ts         # AI 네이밍 (LLM)
│   │   │   └── autolayout.ts     # AI Auto Layout (LLM)
│   │   └── utils/
│   │       └── claude.ts         # Claude API 래퍼
│   └── docs/agents/
│
├── .ai/                          # AI 전용 지식 저장소
│   ├── PRD.md                    # 제품 요구사항
│   ├── MEMORY.md                 # 빠른 요약
│   ├── CONTEXT.md                # 현재 상태
│   ├── lessons_learned.md        # 결정 + 실수 패턴
│   └── design-system/            # 디자인 시스템 규칙
│
├── docs/                         # 인간용 문서
│   ├── INDEX.md                  # 이 파일
│   └── DEVELOPMENT-GUIDE.md      # 개발 가이드
│
└── reference/                    # 참고 자료 (PDF, 가이드)
```

---

## 삭제된 기능

- ~~`auto-naming`~~ → `auto-naming-agent` 사용
- ~~`apply-autolayout`~~ → `apply-autolayout-agent` 사용
- ~~`src/modules/autolayout.ts`~~ → 삭제됨

---

## 수정 시 체크리스트

- [ ] 해당 기능의 .md 문서 확인
- [ ] 해당 기능의 .ts 구현 확인
- [ ] 수정 후 .md 문서 업데이트
- [ ] 빌드 (`npm run build`)
- [ ] 테스트
