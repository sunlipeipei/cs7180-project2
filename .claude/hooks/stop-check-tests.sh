#!/bin/bash
# stop-check-tests.sh
# Stop hook
# In implement mode, prevents Claude from stopping if tests are still failing.

INPUT=$(cat)

# Check if a stop hook is already active to prevent infinite loops
STOP_HOOK_ACTIVE=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(str(data.get('stop_hook_active', False)).lower())
except:
    print('false')
" 2>/dev/null)

if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
    exit 0
fi

# Only enforce in implement mode
if [ "$CLAUDE_TDD_MODE" != "implement" ]; then
    exit 0
fi

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

TEST_OUTPUT=$(npm test 2>&1)
TEST_EXIT=$?

if [ $TEST_EXIT -ne 0 ]; then
    FAILING=$(echo "$TEST_OUTPUT" | grep -E "(FAIL|✕|×)" | head -10)
    echo "Tests are still failing. Continue implementing until all tests pass:" >&2
    echo "$FAILING" >&2
    exit 2
fi

# Remind agent to commit if there are uncommitted changes
UNCOMMITTED=$(git -C "$CLAUDE_PROJECT_DIR" status --porcelain 2>/dev/null)
if [ -n "$UNCOMMITTED" ]; then
    echo "Reminder: uncommitted changes detected. Did you forget to commit?" >&2
    echo "$UNCOMMITTED" >&2
fi

exit 0
