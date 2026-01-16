#!/bin/bash
# 커밋 후 CHANGELOG.md 자동 업데이트 스크립트
# 사용: .claude/scripts/auto-changelog.sh

set -e

CHANGELOG_FILE="CHANGELOG.md"
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

if [ -z "$REPO_ROOT" ]; then
  echo "❌ Git 저장소가 아닙니다."
  exit 1
fi

cd "$REPO_ROOT"

# 최근 커밋 메시지 가져오기
COMMIT_MSG=$(git log -1 --pretty=%s)
COMMIT_HASH=$(git log -1 --pretty=%h)

# 커밋 타입 파싱 (feat:, fix:, refactor:, docs: 등)
if [[ "$COMMIT_MSG" =~ ^([a-z]+):\ (.+)$ ]]; then
  TYPE="${BASH_REMATCH[1]}"
  MESSAGE="${BASH_REMATCH[2]}"
else
  echo "⚠️  커밋 메시지 형식이 '<type>: <message>'가 아닙니다."
  echo "   수동으로 /record 실행이 필요합니다."
  exit 0
fi

# 타입 → CHANGELOG 섹션 매핑
case "$TYPE" in
  feat|feature)
    SECTION="Added"
    ;;
  fix)
    SECTION="Fixed"
    ;;
  refactor|chore)
    SECTION="Changed"
    ;;
  docs)
    SECTION="Changed"
    ;;
  *)
    echo "⚠️  알 수 없는 타입: $TYPE"
    echo "   수동으로 /record 실행이 필요합니다."
    exit 0
    ;;
esac

# CHANGELOG.md 존재 확인
if [ ! -f "$CHANGELOG_FILE" ]; then
  echo "❌ CHANGELOG.md 파일이 없습니다."
  exit 1
fi

# [Unreleased] 섹션에 이미 같은 내용이 있는지 확인 (중복 방지)
if grep -q "^- $MESSAGE" "$CHANGELOG_FILE"; then
  echo "ℹ️  이미 CHANGELOG에 기록됨: $MESSAGE"
  exit 0
fi

# [Unreleased] 섹션 찾기 및 업데이트
# 패턴: ## [Unreleased] 다음 줄에 ### $SECTION이 있으면 그 아래에 추가
# 없으면 ### $SECTION 섹션 생성

TEMP_FILE=$(mktemp)

awk -v section="$SECTION" -v message="$MESSAGE" '
BEGIN {
  found_unreleased = 0
  found_section = 0
  added = 0
}
/^## \[Unreleased\]/ {
  found_unreleased = 1
  print
  next
}
found_unreleased && /^### / {
  if ($0 == "### " section) {
    found_section = 1
    print
    print "- " message
    added = 1
    next
  } else if (!found_section && !added) {
    # 원하는 섹션이 없으면 새로 만들기
    print ""
    print "### " section
    print "- " message
    added = 1
    found_section = 1
  }
}
found_unreleased && /^## \[/ && !/^## \[Unreleased\]/ {
  # 다음 버전 섹션 시작 - Unreleased 끝
  if (!added) {
    print ""
    print "### " section
    print "- " message
    added = 1
  }
  found_unreleased = 0
}
{ print }
END {
  if (found_unreleased && !added) {
    print ""
    print "### " section
    print "- " message
  }
}
' "$CHANGELOG_FILE" > "$TEMP_FILE"

mv "$TEMP_FILE" "$CHANGELOG_FILE"

echo "✅ CHANGELOG 업데이트 완료"
echo "   섹션: $SECTION"
echo "   내용: $MESSAGE"
echo "   커밋: $COMMIT_HASH"
