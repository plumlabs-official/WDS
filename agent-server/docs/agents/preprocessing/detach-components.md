# Detach Components (컴포넌트 브레이크)

## 개요
컴포넌트 인스턴스를 일반 프레임으로 전환합니다.
디자인 시스템 재구성 전 기존 컴포넌트 연결을 끊을 때 사용합니다.

## 타입
- **Rule-based** (LLM 사용 안 함)

## 동작 방식
1. 선택된 프레임의 모든 자식을 재귀적으로 탐색
2. `INSTANCE` 타입 노드 식별
3. `detachInstance()` 호출하여 일반 프레임으로 전환
4. 전환된 개수 알림

## 코드
```typescript
if (node.type === 'INSTANCE') {
  node.detachInstance();
}
```

## 사용 시점
- 기존 디자인 시스템에서 분리하여 새로 구성할 때
- 컴포넌트 구조를 수정해야 할 때
- 일회성 디자인으로 전환할 때

## 주의사항
- 한 번 detach하면 원래 컴포넌트와의 연결이 영구적으로 끊김
- 중첩된 인스턴스도 모두 detach됨
- Undo (Cmd+Z)로 복구 가능

## 파일 위치
- 구현: `src/code.ts` → `handleDetachComponents()`
