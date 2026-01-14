---
name: wellwe-design-system-automator
description: Figma 디자인 시스템 자동화 플러그인. 명령 실행 전 이 파일을 먼저 참조하여 해당 기능의 문서(.md)와 구현(.ts)을 확인합니다.
---

# Wellwe Design System Automator

Figma 플러그인 + Agent Server 기반 디자인 시스템 자동화 도구

---

## 🚦 명령 실행 전 필수 확인

**모든 기능 수정/실행 전에 해당 기능의 문서와 구현 파일을 확인합니다.**

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

### 2. 네이밍 (Naming)

| 명령 | 문서 (.md) | 구현 (.ts) |
|------|-----------|-----------|
| `auto-naming-agent` | `agent-server/docs/agents/naming-agent.md` | `agent-server/src/agents/naming.ts` |

---

### 3. Auto Layout

| 명령 | 문서 (.md) | 구현 (.ts) |
|------|-----------|-----------|
| `apply-autolayout-agent` | `agent-server/docs/agents/autolayout-agent.md` | `agent-server/src/agents/autolayout.ts` |
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
| `run-all-agent` | 네이밍 → Auto Layout → 간격 표준화 (전처리 제외) |

---

## 실행 순서 (권장)

```
[수동] 1. 전처리
       ├─ 컴포넌트 브레이크 (필요시)
       ├─ 꺼진 레이어 삭제
       └─ 의미 없는 래퍼 제거

[자동] 2. 전체 실행 (with AI Agent)
       ├─ AI 네이밍
       ├─ AI Auto Layout
       └─ 간격 표준화
```

---

## 핵심 원칙

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
│   └── modules/                  # 룰 베이스 모듈
│       ├── cleanup.ts
│       ├── spacing.ts
│       ├── naming.ts
│       └── componentize.ts
│
├── agent-server/                 # Agent Server
│   ├── src/
│   │   ├── index.ts              # Express 서버
│   │   ├── agents/               # LLM 에이전트
│   │   │   ├── naming.ts
│   │   │   └── autolayout.ts
│   │   └── utils/
│   │       └── claude.ts         # Claude API 래퍼
│   └── docs/agents/              # 에이전트 문서
│       ├── preprocessing/        # 전처리 문서
│       ├── naming-agent.md
│       ├── autolayout-agent.md
│       └── ...
│
└── docs/
    └── INDEX.md                  # 이 파일 (최상위 참조)
```

---

## 수정 시 체크리스트

- [ ] 해당 기능의 .md 문서 확인
- [ ] 해당 기능의 .ts 구현 확인
- [ ] 수정 후 .md 문서 업데이트
- [ ] 빌드 (`npm run build`)
- [ ] 테스트
