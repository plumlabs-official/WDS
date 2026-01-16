# 네이밍 에이전트 실행 가이드

> 레이어에 의미 있는 이름 자동 지정하기

## 사전 요구사항

- Agent Server 실행 중 (`npm run server`)
- Figma 플러그인 로드됨

## 실행 방법

### 1. 대상 선택

- 단일 프레임 또는 여러 프레임 선택
- 전체 스크린 또는 특정 컴포넌트 영역

### 2. 플러그인 실행

1. `Plugins` > `Development` > `WellWe Design System Automator`
2. **Naming** 버튼 클릭

### 3. 결과 확인

- 콘솔에서 진행 상황 확인 (개발자 도구)
- 레이어 패널에서 변경된 이름 확인

## 네이밍 규칙

### 기본 구조

```
Type/Intent/Shape/Size[/State][/Icon]
```

### 예시

| Before | After |
|--------|-------|
| `Frame 1234` | `Button/Primary/Filled/48` |
| `Group 5678` | `Card/Product/Main` |
| `icon-user` | `Icon/User` |

## 문제 해결

### AI가 잘못된 이름을 지정하는 경우

1. 콘솔 로그 확인
2. 노드 구조 확인 (자식 텍스트/아이콘)
3. [네이밍 규칙](../specs/naming-schema.md) 참조

### 서버 연결 실패

```bash
# 서버 상태 확인
curl http://localhost:3001/health

# 서버 재시작
npm run server
```

## 관련 문서

- [네이밍 스키마](../specs/naming-schema.md)
- [릴리즈 체크리스트](release-checklist.md)
