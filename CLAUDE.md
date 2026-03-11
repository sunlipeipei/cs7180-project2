# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DeepWork** is a full-stack Pomodoro timer built for users who reject rigid session transitions. When a focus session ends, the timer sends a gentle notification — it never auto-switches modes or forces a break. Sessions are logged automatically on completion. An analytics dashboard gives users visibility into their historical focus patterns by tag, day, and week.

Key product philosophy: **non-coercive transitions**. The timer notifies, never coerces.

## Stack

- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4
- **Backend:** Next.js API Routes — Pages Router for most routes (`src/pages/api/v1/`), App Router for health only (`src/app/api/v1/health/`)
- **Database:** MongoDB Atlas + Mongoose 8
- **Auth:** JWT in HTTP-only cookies
- **Testing:** Vitest + @testing-library/react + happy-dom + mongodb-memory-server + supertest

## Commands

```bash
npm run dev                    # Dev server
npm test                       # Run test suite (vitest run)
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage (80% threshold on lines/functions/branches/statements)
npm run build                  # Production build
npm run lint                   # ESLint
npx tsc --noEmit               # TypeScript type check
npx vitest run __tests__/integration/use-timer.test.ts  # Run a single test file
```

## TDD Workflow

This project uses a strict two-phase TDD workflow enforced by Claude Code hooks (`.claude/hooks/`):

**Phase 1 — Write tests first:**
```
/project:write-tests <feature>
```
- Writes failing integration tests into `__tests__/integration/`
- Uses `@testing-library/react` with Vitest; requirements sourced from `project_memory/PRD.md`
- Confirms all new tests are in red state before stopping
- Test files ONLY — no implementation code

**Phase 2 — Implement to pass tests:**
```
/project:implement <feature>
```
- Set `CLAUDE_TDD_MODE=implement` in the shell environment
- Test files are locked by `guard-test-files.sh` — edits to `__tests__/` are rejected
- Implement minimum code to pass each test
- Never modify test files; if a test seems wrong, explain why and let the user decide

**Active hooks:**
- `PreToolUse[Edit|Write]`: `guard-test-files.sh` — blocks edits to test files during implement phase
- `PreToolUse[Bash]`: `guard-npm-install.sh` — blocks unauthorized package installs
- `PreToolUse[Bash]`: `guard-git-commit.sh` — runs tests before allowing commits (skips new red test files in write-tests phase)
- `PostToolUse[Write]`: `post-write-lint.sh` — runs `npx tsc --noEmit` after each file write
- `Stop`: `stop-check-tests.sh` — verifies test suite passes before session end (implement mode only)

## Architecture

### Backend

```
Route Handler (src/pages/api/v1/**) → Service (src/lib/services/*.ts) → Mongoose Model (src/lib/models/*.ts) → MongoDB
```

This project uses a flat, pragmatic pattern — **NOT** Repository/Service/Controller layering.

- **Route handlers** (`src/pages/api/v1/`): Parse request, validate input, call service functions, return response. Each handler includes auth verification. Routes: `auth/`, `sessions.ts`, `sessions/[id].ts`, `settings.ts`, `analytics.ts`, `accumulated.ts`, `tags.ts`
- **Services** (`src/lib/services/*.ts`): Business logic as plain exported functions. No classes, no dependency injection.
- **Models** (`src/lib/models/*.ts`): Mongoose schemas and models. Data shape and validation only.
- **App Router API:** Only `/api/v1/health` lives in `src/app/api/v1/health/route.ts`.

### Frontend

```
Pages (src/app/*/page.tsx) → Components (src/components/*.tsx) → Hooks (src/hooks/*.ts)
```

- **Pages:** `/` (timer), `/dashboard` (analytics), `/auth`
- **Components:** `CircularTimer`, `AccumulatedBar`, `TimerWidget`, `BreakSuggestion`, `SessionList`, `AuthScreen`
- **Hooks:** `useTimer` (core timer logic)

**Timer is entirely client-side.** The server is only contacted on:
1. Page load (hydrate settings + today's accumulated focus)
2. Session completion (persist session)
3. Analytics navigation (fetch aggregated history)

`useTimer` uses absolute timestamps (`endTimeRef = Date.now() + seconds * 1000`) so the countdown survives browser tab throttling.

### Key Types

```typescript
type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerSettings {
    workMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    accThreshold: number;  // accumulated minutes before long break is offered
}
```

### File Placement

| Type | Path | Naming |
|------|------|--------|
| Integration test | `__tests__/integration/{feature}.test.ts(x)` | kebab-case |
| Unit test | `__tests__/unit/{feature}.test.ts` | kebab-case |
| Component | `src/components/{Name}.tsx` | PascalCase |
| Hook | `src/hooks/use{Name}.ts` | camelCase |
| Service | `src/lib/services/{feature}.ts` | camelCase |
| Model | `src/lib/models/{Name}.ts` | PascalCase |
| API Route (Pages) | `src/pages/api/v1/{feature}.ts` | kebab-case |
| Page | `src/app/{route}/page.tsx` | Next.js convention |

### Explicitly Out of Scope (v1)

- Calendar integration
- Team or social accountability features
- Native mobile apps
- Distraction blocking (browser extension)
- Context restoration tooling
