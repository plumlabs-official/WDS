# Specs Index (SSOT)

> Single Source of Truth - 모든 규칙/사양/계약의 정답 위치
>
> Last updated: 2026-01-17

---

## SSOT 원칙

- **규칙/사양/계약이 바뀌면 이 폴더만 수정**
- `.ai/`, `prompts/`에는 본문 복사 금지 (링크/요약만)
- 중요 변경은 [ADR](../architecture/ADRs/)로 기록

---

## 문서 목록

### Naming
| 문서 | 설명 |
|------|------|
| [naming-schema.md](naming-schema.md) | 네이밍 규칙 (타입, 계층, 금지사항) |

### Layout
| 문서 | 설명 |
|------|------|
| [autolayout-rules.md](autolayout-rules.md) | 오토레이아웃 적용 규칙 |
| [token-structure.md](token-structure.md) | 디자인 토큰 구조 |

### API
| 문서 | 설명 |
|------|------|
| [api-contract.md](api-contract.md) | Agent Server API 계약 |
| [technical-spec.md](technical-spec.md) | 기술 사양 전체 |

### Figma/MCP
| 문서 | 설명 |
|------|------|
| [figma-mcp-rules.md](figma-mcp-rules.md) | Figma MCP 사용 규칙 |
| [accessibility-rules.md](accessibility-rules.md) | 접근성 규칙 |

---

## Quick Reference

```bash
# SSOT 위치
docs/specs/

# 규칙 변경 시
1. docs/specs/*.md 수정
2. (필요시) ADR 작성: docs/architecture/ADRs/ADR-xxxx-*.md
3. prompts/는 링크만 업데이트
```
