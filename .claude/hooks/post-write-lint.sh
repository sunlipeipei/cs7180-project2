#!/bin/bash
# post-write-lint.sh
# PostToolUse hook for Write
# Runs TypeScript type-check on newly written .ts files.
# Provides feedback to Claude if there are type errors.

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

# Only lint TypeScript source files, skip test files and node_modules
echo "$FILE_PATH" | grep -qE "\.tsx?$" || exit 0
echo "$FILE_PATH" | grep -q "node_modules" && exit 0

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

# Run tsc --noEmit on the specific file if tsconfig exists
if [ -f "tsconfig.json" ]; then
    TSC_OUTPUT=$(npx tsc --noEmit 2>&1 | grep -A 2 "$FILE_PATH" | head -15)
    if [ -n "$TSC_OUTPUT" ]; then
        echo '{"decision": "block", "reason": "TypeScript errors found in '"$FILE_PATH"':\n'"$(echo "$TSC_OUTPUT" | sed 's/"/\\"/g')"'"}'
        exit 0
    fi
fi

exit 0
