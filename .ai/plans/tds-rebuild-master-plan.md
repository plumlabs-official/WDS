# TDS 재구축 마스터 플랜

> Created: 2026-03-06
> Source: Lenny Team Meeting

---

## 목표

- 기존 TDS 리셋
- shadcn Figma Kit (Shadcraft Pro) 기반으로 재구축
- 구조/네이밍 유지, 내용물(색상, 폰트)만 Tryve로 교체
- AI 바이브 코딩 최적화

---

## 타임라인

```
Day 1: Phase 0-1 (Inventory + Archive)
       ✓ 깨끗한 TDS 파일

Day 2: Phase 2 (Variables)
       ✓ Tryve 색상 토큰 완성

Day 3: Phase 3-4 (Typography + Effects)
       ✓ 전체 Foundation 완성

Day 4+: Phase 5 (Components)
       ✓ Button 완료 → 나머지 순차
```

---

## Phase 체크리스트

### Phase 0: Inventory (30분)
- [ ] 0.1 기존 자산 목록화
- [ ] 0.2 참조 파일 확인
- [ ] 0.3 Publish 상태 확인

### Phase 1: Archive & Reset (1시간)
- [ ] 1.1 [Archive] TDS 페이지 생성
- [ ] 1.2 컴포넌트 Detach
- [ ] 1.3 Archive로 이동
- [ ] 1.4 Library Unpublish
- [ ] 1.5 Local Styles 삭제
- [ ] 1.6 Variables 삭제

### Phase 2: Variables (2-3시간)
- [ ] 2.1 Shadcraft Pro Variables 분석
- [ ] 2.2 Tryve 색상 팔레트 정리
- [ ] 2.3 Primitives Collection 복제
- [ ] 2.4 Primitives 값 교체
- [ ] 2.5 Theme/Mode 연결 확인

### Phase 3: Typography (1-2시간)
- [ ] 3.1 Shadcraft Text Styles 분석
- [ ] 3.2 Tryve 폰트 결정
- [ ] 3.3 Text Styles 복제
- [ ] 3.4 Font Family 교체
- [ ] 3.5 Size/Weight 조정

### Phase 4: Effects (30분)
- [ ] 4.1 Shadow Styles 복제
- [ ] 4.2 값 조정

### Phase 5: Components
- [ ] 5.1 Button
- [ ] 5.2 Input
- [ ] 5.3 Card
- [ ] 5.4 Badge
- [ ] ...

### Phase 6: Publish & Test
- [ ] 6.1 TDS Library Publish
- [ ] 6.2 Hi-fi 테스트
- [ ] 6.3 AI 바이브 코딩 테스트

---

## 참고

- Shadcraft Pro Variable 구조: Primitives (357) → Theme (252) → Mode (62)
- 미팅 기록: `~/Project/lenny/meetings/2026-03-06_tds-rebuild-master-plan.md`
