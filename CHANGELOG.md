# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
