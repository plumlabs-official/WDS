# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 커밋 후 자동 기록 시스템 (3중 안전망)
- coach 스킬 v4 - 초보 친화 규칙 추가
- `/record` 커맨드 - 작업 완료 기록 자동화 (CHANGELOG + SESSION 연동)

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
