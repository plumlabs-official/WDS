# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- WellWe 프로덕트 디자인 간소화 TF 일정표 생성 (TSV + Apps Script)
  - 140개 항목 MECE 분류 (12개 대분류)
  - 4회 워크샵 일정 (2/27, 3/13, 3/27, 4/10)
  - 워크샵 필요 여부 구분 (정책 결정 vs 실무 완성도)

### Changed
- `.ai/prompts/` 문서 간소화 - 상세 규칙은 `docs/specs/` 링크로 SSOT 통합 (중복 제거)

### Added
- **네이밍 충돌 안정화 Phase A** (SSOT 정책)
  - 충돌 후보 전부 보류 (자동 suffix `_2`, `/id` 금지)
  - 적용 성공 노드만 패턴 저장
  - 중복 제안 1차 감지 → 전부 보류 (P1 보완)
  - 충돌 배지 UI + 콘솔 로그
- AI Auto Layout 반응형 모드 전환 (Fill 적극 사용, 70% 기준)
- Truncation 지원 (Title/SubTitle 텍스트 자동 적용)
- 배경 요소 자동 감지 및 프레임 fills로 변환
- **후처리 안전 규칙** (v3.1): 작은요소/Vector/Icon 보호, 오버레이/플로팅 감지
- **ABSOLUTE 요소 반응형 constraints**: STRETCH/MIN/MAX 자동 설정
- layoutSizingHorizontal = FILL 자동 적용
- **재귀적 FILL 적용** (v3.2): 내부 자식까지 반응형 확장
- **Safe Zone 패턴**: Feed/Grid/Card 내부는 고정 크기 유지
- **위치 기반 constraints**: Button CENTER, ActionButtons MAX, Icon MIN/MAX
- **Top-level 강제 STRETCH**: AI가 INHERIT 반환해도 80% 이상 요소는 강제 STRETCH

### Changed
- `naming-patterns.json` 로컬 전용 (git 추적 해제, PR 노이즈 제거)
- Content → Body 슬롯 네이밍 변경 (SSOT 준수)
- autolayout-rules.md v3.1.0 (후처리 안전 규칙 추가)
- AI 프롬프트 개선: 절대 위치 판단 금지, 전체 너비 요소 STRETCH 강조

### Fixed
- 인덱스 매핑 버그 수정 (AI 응답 인덱스 ↔ 재정렬 후 노드 불일치)
### Added
- 컴포넌트 속성 확장 (cornerRadius, effects, strokeWidth) - Avatar/Card/Input/Toggle 힌트
- 버튼 속성 자동 감지 (Intent/Shape/State/Icon)
- 패턴 매칭 정확도 개선 (parentName, vectorPathHash, textFingerprint)

### Fixed
- Cleanup 노드 이동 시 layoutPositioning 버그 수정 (Ignore auto-layout 방지)
- 패턴 매칭 점수 계산 수정 (null==null → 1.0)
- 패턴 DB 저장 순서 변경 + 초기화 버튼 추가

## [2.5.0] - 2026-01-17

### Added
- 패턴 라이브러리 Backend API (`/patterns`, `/patterns/match`)
- 구조 기반 유사 패턴 매칭 (score 0-1)

## [2.4.0] - 2026-01-17

### Added
- zod 런타임 검증 (LLM 응답 스키마 체크)
- 부분 데이터 fallback (검증 실패 시 유효 항목만 사용)

## [2.3.0] - 2026-01-17

### Changed
- `modules/naming.ts` → `naming/helpers/` 분리 (5개 파일)
- 순환참조 방지 import 정책 적용

## [2.2.0] - 2026-01-17

### Changed
- `code.ts` → `naming/` 모듈 분리 (30% 라인 감소)
- handler, direct, helpers 책임 분리

## [2.1.0] - 2026-01-17

### Changed
- 문서 구조 Diátaxis 방식 적용
- SSOT 정책 도입 (`docs/specs/` = 유일한 규칙 원천)
- API 중복 제거 (api-contract.md가 API SSOT)

## [2.0.0] - 2026-01-16

### Added
- Human in the Loop + AI 검증 병합 워크플로우
- Auto Layout 부모 내 병합 시 레이아웃 보존 로직
- `isEmptyAutoLayoutWrapper` 함수로 무의미한 래퍼 감지
- 자동 리마인드 체계 (CLAUDE.md 체크리스트)
- cleanup.ts 인라인 주석 (체크리스트, 경고)

### Fixed
- 다중 선택 시 캐시 손실 (`chainCache.clear()` 위치 수정)
- dynamic-page 모드 에러 (`getNodeByIdAsync` 사용)
- 병합 후 노드 접근 에러 (병합 전 `chainName` 저장)

### Changed
- 네이밍 스키마: Purpose/Variant → Intent/Shape/Size 구조
- 문서 SSOT 적용 (naming-rules.md가 단일 진실 원천)
- Cross-Reference + Auto Reference Rules 추가

## [1.0.0] - 2026-01-14

### Added
- 초기 릴리즈
- AI Naming 기능
- AI Auto Layout 기능
- Cleanup (래퍼 제거, 중첩 병합)
- Componentize (컴포넌트 브레이크)
- Agent Server (Claude API 연동)
