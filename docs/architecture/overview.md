# 시스템 아키텍처

> WellWe Design System Automator 전체 구조

## 개요

```
┌─────────────────┐     ┌─────────────────┐
│  Figma Plugin   │────▶│  Agent Server   │
│  (TypeScript)   │◀────│  (Express)      │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   Claude API    │
                        │   (Anthropic)   │
                        └─────────────────┘
```

## 컴포넌트

### Figma Plugin (`packages/figma-plugin/`)

- **역할**: Figma UI와 상호작용, 노드 조작
- **기술**: TypeScript, Figma Plugin API
- **주요 모듈**:
  - `handlers/`: UI 메시지 처리
  - `naming/`: 네이밍 파이프라인
  - `extractors/`: 노드 컨텍스트 추출
  - `validators/`: 검증 로직

### Agent Server (`packages/agent-server/`)

- **역할**: Claude API 연동, AI 분석 수행
- **기술**: Express, TypeScript
- **포트**: localhost:3001
- **주요 모듈**:
  - `agents/naming/`: 네이밍 에이전트
  - `agents/autolayout/`: 오토레이아웃 에이전트

### Common (`packages/common/`)

- **역할**: 공유 타입, 스키마, 유틸리티
- **주요 파일**:
  - `types.ts`: 공통 타입 정의
  - `naming-schema.ts`: zod 스키마
  - `validators.ts`: 공통 검증 함수

## 데이터 흐름

### 네이밍 파이프라인

```
1. [선택된 노드]
      ↓
2. [Direct Naming 시도]
      ├── 성공 → 적용
      └── 실패/Blacklist → AI로 위임
            ↓
3. [컨텍스트 추출]
   (텍스트, 아이콘, 구조)
            ↓
4. [Agent Server 요청]
            ↓
5. [Claude API 분석]
            ↓
6. [응답 검증 (zod)]
            ↓
7. [후처리 + 적용]
```

## 의사결정 기록

- [ADR-0001: 네이밍 스키마](ADRs/ADR-0001-naming-schema.md)

## 관련 문서

- [네이밍 스키마 상세](../specs/naming-schema.md)
- [API Contract](../specs/api-contract.md)
