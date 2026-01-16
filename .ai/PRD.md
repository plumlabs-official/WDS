# Project Overview

> Wellwe Design System Automator
>
> Last updated: 2026-01-16 | v2.0.0
>
> **기술 사양**: `SPEC.md` 참조

---

## Summary

Figma 디자인 파일을 자동으로 정리하고 디자인 시스템 규격에 맞게 변환하는 플러그인 + Agent Server.

### Target User
- 디자이너: Figma 파일 정리
- 개발자: 디자인 시스템 코드 생성

### Mission
> 5분의 스펙 작성이 수 시간의 리팩토링을 줄여준다.

---

## Core Features

### 1. AI Naming
컴포넌트 레이어에 시맨틱 이름 자동 부여

```
Frame 123 → Button/CTA/Primary/LG
```

### 2. AI Auto Layout
적절한 Auto Layout 자동 적용

```
Free layout → Vertical, gap=16, padding=16
```

### 3. Cleanup (전처리)
- 의미 없는 래퍼 제거
- 동일 이름 중첩 병합
- 꺼진 레이어 삭제

### 4. Componentize
레이어를 재사용 가능한 컴포넌트로 변환

---

## Tech Stack

| 영역 | 기술 |
|------|------|
| Figma Plugin | TypeScript, esbuild |
| Agent Server | Express, Claude API |
| Communication | postMessage, fetch |

---

## Architecture

```
┌─────────────────────┐
│   Figma Plugin      │
│   (code.ts)         │
└─────────┬───────────┘
          │ postMessage
┌─────────▼───────────┐
│   UI (ui.html)      │
│   (iframe)          │
└─────────┬───────────┘
          │ fetch
┌─────────▼───────────┐
│   Agent Server      │
│   (localhost:3001)  │
└─────────┬───────────┘
          │ API call
┌─────────▼───────────┐
│   Claude API        │
└─────────────────────┘
```

---

## Success Metrics

- [ ] 네이밍 정확도 90% 이상
- [ ] Auto Layout 적용 후 시각적 변화 없음
- [ ] 처리 시간 10초 이내 (단일 화면)

---

## Constraints

### 네이밍 규칙
- `.ai/design-system/naming-rules.md` 참조
- Layout, Content 타입 금지
- Purpose 필수

### 기술 제약
- Figma 플러그인은 외부 API 직접 호출 불가
- ES6+ 일부 문법 미지원 (esbuild 타겟 es6)

---

## Roadmap

### Phase 1 (현재)
- 기본 AI 네이밍
- AI Auto Layout
- 전처리 도구

### Phase 2 (예정)
- 디자인 토큰 추출
- 컴포넌트 코드 생성
- 디자인 시스템 자동 구축

---

---

## 관련 문서

| 문서 | 역할 |
|------|------|
| [SPEC.md](SPEC.md) | 기술 사양 및 API 명세 |
| [MEMORY.md](MEMORY.md) | 의사결정 기록 |
| [design-system/naming-rules.md](design-system/naming-rules.md) | 네이밍 규칙 |
