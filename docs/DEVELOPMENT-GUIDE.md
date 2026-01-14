# Development Guide

기능 개발 시 빠르고 정확한 구현을 위한 가이드입니다.

---

## 기능 요청 방법

### 좋은 요청 예시

```
"체크박스로 선택해서 원하는 레이어만 삭제하도록 변경해줘"
"체크박스를 끄면 Figma 레이어 선택 상태도 반영되게 해줘"
```

**특징:**
- 무엇을 → 어떻게 변경할지 명확
- UI 동작과 기대 결과 구체적
- 한 번에 하나의 기능

### 피해야 할 요청

```
"더 좋게 만들어줘"
"사용자 경험 개선해줘"
```

**문제:**
- 모호함 → 여러 번 확인 필요
- 범위 불명확 → 오버엔지니어링 위험

---

## 빠른 구현을 위한 조건

### 1. 기존 패턴 활용
- 이미 구현된 유사 기능 참조
- UI ↔ code.ts 통신 패턴 재사용
- 데이터 구조 확장 (새로 만들지 않기)

### 2. 단계별 구현
```
1. UI 변경 (HTML/CSS)
2. JS 함수 수정/추가
3. code.ts 메시지 핸들러 추가
4. 빌드 → 테스트
```

### 3. 피드백 루프
```
요청 → 구현 → 테스트 → 추가 요청 → 구현
```
- 한 번에 완벽하려 하지 않음
- 테스트 후 추가 요청으로 보완

---

## 케이스 스터디: 체크박스 레이어 삭제

### 요청 1
> "레이어를 한번에 찾고 삭제하려고 하는데 찾은 레이어 중 체크박스로 선택해서 원하는 레이어만 삭제하도록 변경해줘"

### 구현 단계
1. **UI 모달 수정** - 체크박스 목록으로 변경
2. **CSS 추가** - `.layer-item`, `.modal-layers-list`
3. **JS 함수** - `showHiddenLayersModal()` 수정, `toggleSelectAll()` 추가
4. **데이터 형식** - `names: string` → `layers: Array<{id, name}>`
5. **code.ts** - `confirmDeleteHiddenLayers(selectedIds)` 수정

### 요청 2 (테스트 후 추가)
> "체크박스를 끄면 Figma 레이어 선택 상태도 반영되게 해줘"

### 추가 구현
1. **UI** - `onchange="updateLayerSelection()"`
2. **JS** - `updateLayerSelection()` 함수 추가
3. **code.ts** - `update-hidden-selection` 메시지 처리, `updateHiddenLayerSelection()` 함수

### 성공 요인
- 기존 `handleDeleteHiddenLayers()` 기반 확장
- UI ↔ code.ts 통신 패턴 이미 확립
- 명확한 요청 → 즉시 구현 가능
- 테스트 후 추가 요청으로 완성도 향상

---

## UI ↔ code.ts 통신 패턴

### UI → code.ts
```javascript
// ui.html
parent.postMessage({
  pluginMessage: {
    type: 'command-name',
    data: { ... }
  }
}, '*');
```

### code.ts → UI
```typescript
// code.ts
figma.ui.postMessage({
  type: 'response-type',
  data: { ... },
});
```

### code.ts 메시지 핸들러
```typescript
async function handleUIMessage(msg: UIMessage) {
  // 특별 처리가 필요한 메시지
  if (msg.type === 'special-command') {
    handleSpecialCommand(msg.data);
    return;
  }

  // 일반 명령어
  handleCommandWithUI(msg.type);
}
```

---

## 체크리스트

### 기능 요청 시
- [ ] 무엇을 변경할지 명확한가?
- [ ] 기대하는 동작이 구체적인가?
- [ ] 기존 유사 기능이 있는가?

### 구현 시
- [ ] 기존 패턴 활용했는가?
- [ ] 단계별로 구현했는가?
- [ ] 빌드 후 테스트했는가?

### 테스트 후
- [ ] 추가 개선점 발견했는가?
- [ ] 명확하게 요청했는가?
