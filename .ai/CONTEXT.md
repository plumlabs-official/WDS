# Current Context

> 현재 작업 상태 및 세션 정보
>
> Last updated: 2026-01-16 (밤) | v2.0.0

---

## Figma 파일

| 항목 | 값 |
|------|-----|
| URL | https://www.figma.com/design/s4GdImD87fQsWwnRYQVbWV/App?node-id=14451-4060 |
| fileKey | `s4GdImD87fQsWwnRYQVbWV` |
| nodeId | `14451:4060` (Two-Stage 테스트 완료 화면) |
| 페이지 | [All] (전체 플로우 모음) |

---

## 현재 작업

### 완료됨 (2026-01-16 밤) - v2.0.0 릴리즈

#### 1. Human in the Loop + AI 검증 병합

**워크플로우:**
```
[후보 수집] → [사용자 선택] → [AI 검증 병합] → [결과 표시]
```

**수정 내용:**
- `handleExecuteMerge`: AI 검증 활성화 (`useAIValidation: true`)
- Auto Layout 부모 내 병합 시 레이아웃 보존 로직
- `isEmptyAutoLayoutWrapper` 함수로 무의미한 래퍼 감지

#### 2. 버그 수정 3건

| 버그 | 원인 | 해결 |
|------|------|------|
| 다중 선택 시 캐시 손실 | `chainCache.clear()`가 반복 함수 내부에 있음 | 진입점 함수로 이동 |
| dynamic-page 모드 에러 | `getNodeById` 동기 호출 | `getNodeByIdAsync` 사용 |
| 병합 후 노드 접근 에러 | 삭제된 노드의 `.name` 접근 | 병합 전 `chainName` 저장 |

#### 3. 자동 리마인드 체계 구축

**CLAUDE.md 추가:**
- Cleanup 작업 시 체크리스트 (5항목)
- Naming 작업 시 체크리스트 (4항목)
- AI Agent 작업 시 체크리스트 (3항목)
- 빌드/테스트 체크리스트 (4항목)
- 디버깅 시 체크리스트 (4항목)

**cleanup.ts 인라인 주석:**
- 파일 상단: 전체 체크리스트
- `chainCache` 선언부: clear 위치 경고
- `collectSelectionMergeCandidates`: clear 위치 확인

#### 4. lessons_learned.md 패턴 추가 (#13~#15)

- #13: 병합 후 삭제된 노드 접근 에러
- #14: getNodeById vs getNodeByIdAsync
- #15: 캐시 clear 위치 - 진입점 vs 반복 함수

#### 5. 문서 관리 감사 완료

**감사 결과:** `.claude/plans/gentle-exploring-quill.md`

| 상태 | 항목 |
|------|------|
| ✅ 양호 | 문서 계층, 지식 분산, 실패 패턴, AI 지침 |
| ⚠️ 미흡 | Last Updated 미표시, Cross-Reference 부재 |
| ⚠️ 주의 | 규칙 중복 (3곳 동시 업데이트 필요) |

---

## 완료됨 (2026-01-16 밤) - 문서 관리 최적화

#### 6. 문서 관리 개선 (감사 후 조치)

| 작업 | 대상 | 상태 |
|------|------|------|
| Last Updated 추가 | 12개 문서 | ✅ 완료 |
| SSOT 적용 | MEMORY.md (규칙 → 링크 참조) | ✅ 완료 |
| Cross-Reference 추가 | 7개 문서 | ✅ 완료 |

**수정된 파일:**
- CLAUDE.md, AGENTS.md
- .ai/MEMORY.md, SPEC.md, PRD.md, SKILL.md, lessons_learned.md
- .ai/design-system/naming-rules.md, autolayout-rules.md, accessibility-rules.md, figma-mcp-rules.md, token-structure.md
- agent-server/prompts/naming-context.md

#### 7. Auto Reference Rules 추가

- CLAUDE.md에 "Auto Reference Rules" 섹션 추가
- 작업 유형별 먼저 읽을 문서 + 섹션 지정
- WORKFLOW.md 생성 후 삭제 (CLAUDE.md Quick Reference와 중복)

---

## 다음 작업

- 없음 (문서 관리 최적화 완료)

---

## 비활성화된 기능

- **Deep Flatten** - 구조적 재설계 필요
- **AL 언래핑** - Alignment 속성 손실 문제

---

## Agent Server

```bash
# 통합 빌드 (권장)
npm run build:all

# 서버 실행
npm run server
# http://localhost:3001
```

---

## 참고

### 모델별 가격 (per 1M tokens)

| 모델 | Input | Output | 특징 |
|------|-------|--------|------|
| Haiku | $1 | $5 | 빠름, 저렴 |
| Sonnet | $3 | $15 | 균형 |
| Opus | $15 | $75 | 최고 품질 |
| Two-Stage | ~$1.3 | ~$6.5 | 비용 효율 + 품질 |

### 커밋 정보

| 항목 | 값 |
|------|-----|
| 버전 | v2.0.0 |
| 커밋 | 0b97365 |
| 브랜치 | main |
