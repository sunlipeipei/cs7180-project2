#!/bin/bash
# guard-git-commit.sh
# PreToolUse hook for Bash
# Runs npm test before allowing git commit. Blocks commit if tests fail.

INPUT=$(cat)

COMMAND=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('tool_input', {}).get('command', ''))
except:
    print('')
" 2>/dev/null)

if [ -z "$COMMAND" ]; then
    exit 0
fi

# Only intercept git commit (not git add, git status, etc.)
if echo "$COMMAND" | grep -qE "git commit"; then
    cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

    # Implement mode: all tests must pass (existing behavior)
    if [ "$CLAUDE_TDD_MODE" = "implement" ]; then
        TEST_OUTPUT=$(npm test 2>&1)
        TEST_EXIT=$?
        if [ $TEST_EXIT -ne 0 ]; then
            echo "BLOCKED: Tests failed. Fix failing tests before committing." >&2
            echo "$TEST_OUTPUT" | tail -20 >&2
            exit 2
        fi
        exit 0
    fi

    # Write-tests phase (CLAUDE_TDD_MODE unset or "write-tests"):
    # Newly added test files are intentionally red — exclude them.
    NEW_TEST_FILES=$(git diff --cached --name-only --diff-filter=A | grep -E "(^__tests__/|\.test\.(ts|tsx|js|jsx)$|\.spec\.(ts|tsx|js|jsx)$)")

    if [ -z "$NEW_TEST_FILES" ]; then
        # No new test files staged: run full suite
        TEST_OUTPUT=$(npm test 2>&1)
        TEST_EXIT=$?
        if [ $TEST_EXIT -ne 0 ]; then
            echo "BLOCKED: Tests failed. Fix failing tests before committing." >&2
            echo "$TEST_OUTPUT" | tail -20 >&2
            exit 2
        fi
    else
        # New test files detected: run only previously existing tests to check for regressions
        ALL_TEST_FILES=$(find __tests__ -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" 2>/dev/null | sort)

        EXISTING_TESTS=()
        while IFS= read -r f; do
            if ! echo "$NEW_TEST_FILES" | grep -qF "$f"; then
                EXISTING_TESTS+=("$f")
            fi
        done <<< "$ALL_TEST_FILES"

        if [ ${#EXISTING_TESTS[@]} -eq 0 ]; then
            # All test files are new — nothing pre-existing to regress
            exit 0
        fi

        TEST_OUTPUT=$(npx vitest run "${EXISTING_TESTS[@]}" 2>&1)
        TEST_EXIT=$?
        if [ $TEST_EXIT -ne 0 ]; then
            echo "BLOCKED: Previously passing tests are now failing." >&2
            echo "$TEST_OUTPUT" | tail -20 >&2
            exit 2
        fi
    fi
fi

exit 0
