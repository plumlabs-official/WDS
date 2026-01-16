#!/bin/bash
# PostToolUse hook - git commit 명령어 감지 후 auto-changelog 실행
# 사용: PostToolUse matcher="Bash"로 호출됨

# 디버그: hook 호출 확인
echo "[DEBUG] post-bash-hook.sh called at $(date)" >> /tmp/claude-hook-debug.log

# stdin에서 JSON 입력 읽기
INPUT=$(cat)
echo "[DEBUG] INPUT: $INPUT" >> /tmp/claude-hook-debug.log

# command 필드 추출 (jq 없이 grep으로 처리)
COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# git commit 명령어인지 확인
if [[ "$COMMAND" == *"git commit"* ]]; then
  # auto-changelog 실행
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  "$SCRIPT_DIR/auto-changelog.sh" 2>/dev/null || true

  # 리마인드 메시지
  echo ""
  echo "⚠️  커밋 완료! /record로 SESSION.md도 업데이트하세요."
  echo "   예: /record feature 기능 설명"
fi

exit 0
