#!/bin/bash
# guard-npm-install.sh
# PreToolUse hook for Bash
# Blocks npm install / npm add / yarn add unless CLAUDE_ALLOW_INSTALL=true
# This enforces the rule: "Do not add npm packages unless explicitly listed in the task"

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

if [ "$CLAUDE_ALLOW_INSTALL" = "true" ]; then
    exit 0
fi

if echo "$COMMAND" | grep -qE "(npm install|npm i |npm add|yarn add|pnpm add|pnpm install)"; then
    # Allow install with no arguments (restoring node_modules from lockfile)
    if echo "$COMMAND" | grep -qE "^(npm install|npm i|yarn install|pnpm install)$"; then
        exit 0
    fi
    # Allow dev dependency installs for @types packages only
    if echo "$COMMAND" | grep -qE "@types/"; then
        exit 0
    fi
    echo "BLOCKED: Adding new npm packages is not allowed unless the task explicitly requires it. If this package is needed, ask the user to confirm." >&2
    exit 2
fi

exit 0
