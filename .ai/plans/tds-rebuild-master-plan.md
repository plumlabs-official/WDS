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

### Phase 0: Inventory (30분) ✅
- [x] 0.1 기존 자산 목록화
- [x] 0.2 참조 파일 확인
- [x] 0.3 Publish 상태 확인

### Phase 1: Archive & Reset (1시간) ✅
- [x] 1.1 기존 TDS 파일 정리 시도 (고아 변수 참조 문제)
- [x] 1.2 **새 TDS 파일 생성** (깨끗한 상태로 시작)
- [x] 1.3 Variables/Styles/Libraries 없는 clean 상태 확인

### Phase 2: Variables (2-3시간) ✅ 완료
- [x] 2.1 Shadcraft Pro Variables 분석
- [x] 2.2 Export/Import 방법 발견
- [x] 2.3 Primitives Collection Import (357개)
- [x] 2.4 Theme Collection Import (252개)
- [x] 2.5 Mode Collection Import (62개)
- [x] 2.6 Theme에 "tds" 컬럼 추가 (Default 유지)
- [x] 2.7 tds 컬럼에 Tryve 색상 적용
- [x] 2.8 tds를 default로 설정 → Mode 자동 참조

### Phase 3: Typography (1-2시간) ✅ 완료
- [x] 3.1 Shadcraft Text Styles 분석 (변수 참조 확인)
- [x] 3.2 Tryve 폰트 결정: **Pretendard**
- [x] 3.3 font-sans → Pretendard (tds 컬럼)
- [x] 3.4 Text Styles 자동 적용 (변수 참조)
- [x] 3.5 Weight/Size 유지 (Tailwind 표준)

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

---

## 현재 상태 (2026-03-06 14:00)

### TDS 파일 상태
- **파일명:** TDS (Figma)
- **Variables:** 전체 Import 완료
  - Primitives (357) ✅
  - Theme (252) ✅ - tds/shadcn 컬럼 구조
  - Mode (62) ✅ - tds 참조
  - Pro (19) ✅
- **Typography:** Pretendard 적용 완료

### Theme 컬럼 구조
| 컬럼 | 용도 |
|------|------|
| **tds** | Tryve 색상 (default) |
| shadcn | 원본 참조용 |

### Tryve 색상 매핑 (적용 완료)
| shadcn 변수 | Tryve 값 | 용도 |
|-------------|----------|------|
| `primary` | `#00CC61` | CTA 버튼, 강조 |
| `secondary` | `#EFF5FD` | 카드 배경, 탭 pill |
| `destructive` | `#F33939` | 에러, 위험 |
| `success` | `#00CC61` | 성공 (= primary) |
| `warning` | `#FF6600` | 경고 (주황) |
| `muted` | `#D3D8DC` | 배경, disabled |
| `muted-foreground` | `#797979` | 서브 description |
| `foreground` | `#1A1A1A` | 기본 텍스트 (소프트 블랙) |

### Typography
| 항목 | 값 |
|------|-----|
| font-sans | **Pretendard** |
| 헤더/타이틀 | SemiBold (600) |
| 본문/설명 | Regular (400) |

### 다음 단계
1. Phase 4: Effects (Shadow) - 선택
2. Phase 5: Components (Button 등)
3. Dark 모드 색상 적용
4. Library Publish
