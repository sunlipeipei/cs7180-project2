#!/bin/bash
# guard-test-files.sh
# PreToolUse hook for Edit|Write
# Blocks modifications to test files when CLAUDE_TDD_MODE=implement

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    fp = data.get('tool_input', {}).get('file_path', '')
    if not fp:
        fp = data.get('tool_input', {}).get('file', '')
    print(fp)
except:
    print('')
" 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
    exit 0
fi

if [ "$CLAUDE_TDD_MODE" = "implement" ]; then
    if echo "$FILE_PATH" | grep -qE "(/__tests__/|\.test\.(ts|tsx|js|jsx)$|\.spec\.(ts|tsx|js|jsx)$)"; then
        echo "BLOCKED: Test files are read-only in implementation mode. Fix your implementation code to make the test pass. Do NOT modify the test." >&2
        exit 2
    fi
fi

exit 0
