# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DeepWork -- A Pomodoro-based focus timer with flexible non-coercive sessions, automatic session logging, and analytics

## Stack

- **Frontend:** Next.js 16 + React 19 + TypeScript + TailwindCSS 4 + Lucide React (icons)

## Commands

Available commands:

```bash
npm run dev          # Dev server
npx vitest run       # Run test suite
npm run build        # Production build
npx tsc --noEmit     # TypeScript type check
```

## TDD Workflow

This project uses a strict two-phase TDD workflow enforced by Claude Code hooks (`.claude/hooks/`):

**Phase 1 -- Write tests first:**
```
/project:write-tests <feature>
```
- Writes failing integration tests into `__tests__/integration/`
- Confirms all new tests are in red state before stopping
- Test files ONLY -- no implementation code

**Phase 2 -- Implement to pass tests:**
```
/project:implement <feature>
```
- Test files are locked by `guard-test-files.sh` -- edits to `__tests__/` are rejected
- Implement minimum code to pass each test
- Never modify test files; if a test seems wrong, explain why and let the user decide

**Active hooks:**
- `PreToolUse[Edit|Write]`: `guard-test-files.sh` -- blocks edits to test files during implement phase
- `PreToolUse[Bash]`: `guard-npm-install.sh` -- blocks unauthorized package installs
- `PreToolUse[Bash]`: `guard-git-commit.sh` -- runs tests before allowing commits
- `PostToolUse[Write]`: `post-write-lint.sh` -- runs ESLint/tsc after each file write
- `Stop`: `stop-check-tests.sh` -- verifies test suite on session end

## Architecture

### Layering
```
app/page.tsx -> Components (UI) -> Hooks (stateful logic) -> Services (data/API)
```
- Components: pure UI, receive props and callbacks
- Hooks: encapsulate reusable stateful logic
- Services: return typed data from APIs or mock sources

### Key Type Definitions
```typescript
type Mode = "focus" | "break"
// CircularTimerProps interface defined in components/CircularTimer.tsx
```

### Feature Phases
Sprint 1: Auth + Timer + Session creation; Sprint 2: Analytics, settings, tags

### Explicitly Out of Scope
Calendar integration, social/team features, native mobile, distraction blocking
