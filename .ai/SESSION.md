# Session Memory

> 세션 단기 기억 (compact 후 이어갈 내용)
>
> Last updated: 2026-01-19 03:00 | v3.1.0

---

## Figma 파일

| 항목 | 값 |
|------|-----|
| URL | https://www.figma.com/design/s4GdImD87fQsWwnRYQVbWV/App?node-id=14451-4060 |
| fileKey | `s4GdImD87fQsWwnRYQVbWV` |
| nodeId | `14451:4060` |

---

## 완료된 작업 (요약)

| Phase | 버전 | ADR/문서 | 주요 커밋 |
|-------|------|----------|----------|
| 1: 문서 구조 | v2.1.x | [ADR-0002](../docs/architecture/ADRs/ADR-0002-documentation-structure.md) | `edb0cea`, `7003185` |
| 2: 코드 분리 | v2.2-2.3 | [ADR-0003](../docs/architecture/ADRs/ADR-0003-naming-module-split.md) | `3a0735a`, `17f69de` |
| 3: zod 검증 | v2.4.0 | - | `c4c1b5c` |
| 4: 패턴 API | v2.5.0 | - | `ffd41da` |
| 문서화 | - | ADR-0002, ADR-0003 생성 | `4448cc9` |
| /record 커맨드 | - | [record.md](../.claude/commands/record.md) | `3118488` |
| 패턴 HITL 통합 | - | - | `cf3c868` |
| 패턴 저장 순서 변경 | - | - | `4a85087` |
| 버튼 속성 자동 감지 | - | - | `83d86a5` |
| 컴포넌트 속성 확장 | - | - | `7ccf624` |
| 네이밍 테스트 완료 | - | - | `729d8ff` |
| Auto Layout 반응형 전환 | - | autolayout-rules v3.0 | `14c8428` |

상세: [CHANGELOG.md](../CHANGELOG.md)

---

## 현재 세션 (2026-01-18)

### 완료
- [x] 레이어 네이밍 타입별 테스트 ✅
  - 컴포넌트 속성 (cornerRadius, effects, strokeWidth) 정상
  - 버튼 속성 자동 감지 (Intent/Shape/State/Icon) 정상
  - Avatar/Card/Input/Toggle 힌트 정상

### 완료 (Auto Layout 반응형 전환)
- [x] **AI Auto Layout 반응형 모드로 교체**
  - 프롬프트 교체: `packages/agent-server/prompts/autolayout.md`
  - Fill 적극 사용 (70% 이상 → STRETCH)
  - Truncation 지원 추가 (Title/SubTitle)
  - 테스트 범위: 375px → 1024px

### 완료 (Auto Layout 후처리 안전 규칙 v3.1)
테스트 결과 발견된 5가지 이슈 수정:
1. [x] **Icon/Info 375x375** - 작은 요소(15% 미만) INHERIT 강제
2. [x] **Vector 너비 확장** - VECTOR/ELLIPSE/LINE 타입 INHERIT 강제
3. [x] **Header-Section 겹침 풀림** - y<=10 오버레이 패턴 감지 → ABSOLUTE
4. [x] **TabBar 플로팅 풀림** - 이름 패턴 + y>=80% → ABSOLUTE
5. [x] **프레임 높이 증가** - 위 규칙으로 해결

참고: `docs/specs/autolayout-rules.md` (v3.1)

### 다음 작업
- [ ] Figma에서 실제 테스트 진행

### 지속 테스트 (틈틈이)
- [ ] Input 컴포넌트 속성 감지 테스트
- [ ] Toggle 컴포넌트 속성 감지 테스트
- [ ] 기타 컴포넌트 속성 (cornerRadius, effects, strokeWidth) 반영 확인

---

## 이전 세션 (2026-01-17 #3) - 완료

**Phase 4 UI 통합 완료:**

### 완료 항목
- [x] HITL 모달 (적용/AI분석/모두자동적용)
- [x] AI 네이밍 ↔ 패턴 매칭 자동 통합
- [x] 패턴 DB 자동 저장 + 초기화 버튼
- [x] 컴포넌트 속성 확장 (cornerRadius, effects, strokeWidth)
- [x] 버튼 속성 자동 감지 (Intent/Shape/State/Icon)
- [x] layoutPositioning 버그 수정 (Ignore auto-layout 방지)

---

## 비활성화된 기능

- **Deep Flatten** - 구조적 재설계 필요
- **AL 언래핑** - Alignment 속성 손실 문제

---

## 참고

### 빌드 명령어

```bash
npm run build:all    # 통합 빌드
npm run server       # Agent Server (localhost:3001)
```

### 플랜 파일

`.claude/plans/gentle-exploring-quill.md`
