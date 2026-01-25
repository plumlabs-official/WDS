# Session Memory

> 세션 단기 기억 (compact 후 이어갈 내용)
>
> Last updated: 2026-01-25 | v3.2.0

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
| Auto Layout 후처리 + constraints | - | autolayout-rules v3.1 | `fd66107` |

상세: [CHANGELOG.md](../CHANGELOG.md)

---

## 현재 세션 (2026-01-25)

### 환경 변경
- 프로젝트 경로 통합: `~/figma-design-system-automator` 삭제 → iCloud 경로만 사용
- `/wds` 커맨드 경로 업데이트: `~/.claude/commands/wds.md`
- 새 경로: `~/Library/Mobile Documents/com~apple~CloudDocs/Projects/WDS`

---

## 이전 세션 (2026-01-19)

### 완료 (재귀적 반응형 적용 v3.2)

#### 1. 인덱스 매핑 버그 수정
- AI 응답의 인덱스가 재정렬 후 잘못된 노드에 적용되는 버그
- `originalIndexToNode` 매핑으로 해결

#### 2. 재귀적 FILL 적용 (`applyRecursiveFill`)
- Auto Layout 있는 부모 → `layoutSizingHorizontal = 'FILL'`
- Auto Layout 없는 부모 → `constraints.horizontal = 'STRETCH'`
- 최대 깊이 5까지 재귀

#### 3. Safe Zone 패턴 (카드 고정)
- Feed, Grid, Masonry, List 패턴 내부는 STRETCH 안 함
- Card/, Section/Image 패턴은 완전 스킵
- 모바일 퍼스트: 카드는 고정 크기 유지

#### 4. 위치 기반 constraints
- **Button/** → CENTER (가운데 고정)
- **Container/ActionButtons** → MAX (우측)
- **Icon/** 좌측 (x < 30%) → MIN
- **Icon/** 우측 (x > 70%) → MAX
- 위치 기반 체크: 20%/50%/80% 기준

#### 5. Top-level 강제 STRETCH
- AI가 INHERIT 반환해도 80% 이상 전체너비 요소는 강제 STRETCH
- 후처리 안전망 역할

#### 6. AI 프롬프트 개선
- "절대 위치 배치 판단 금지" 명시
- "전체 너비 요소 = 무조건 STRETCH" 강조
- 파일: `packages/agent-server/prompts/autolayout.md`

### 테스트 결과
- ✅ Header/TabBar/SubTab 반응형 동작
- ✅ 피드 카드 고정 크기 (Safe Zone)
- ✅ Button CENTER 정렬
- ⚠️ 일부 내부 요소 정렬 미세 조정 필요

### 참고 샘플
- `14365:1706` - 수동 반응형 샘플 (justify-between 패턴)

### 다음 작업
- [ ] Header 내부 좌우 정렬 미세 조정
- [ ] SubTab 탭 균등 분배 개선
- [ ] 실제 Figma에서 375px → 600px 테스트

---

## 이전 세션 (2026-01-18) - 완료

### 완료
- [x] 레이어 네이밍 타입별 테스트 ✅
- [x] AI Auto Layout 반응형 모드로 교체
- [x] 후처리 안전 규칙 v3.1
- [x] ABSOLUTE 요소 constraints

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
