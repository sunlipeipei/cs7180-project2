---
trigger: always_on
---

# DeepWork Project Rules

## Project Overview

**DeepWork is a full-stack Pomodoro-based focus timer that respects flow states, automates session logging, and gives users data to understand their productivity patterns. Unlike traditional Pomodoro timers that force session transitions, DeepWork uses gentle notifications and tracks accumulated focus time across a day.**

**Target users: grad students, software engineers, and remote professionals who need flexible deep work support — validated through three Mom Test interviews (February 2026).**

## Core Principles

1. **High Quality Development:** All code must be production-ready, readable, and strictly adhere to high quality standards.
2. **Professional Aesthetics:** The UI must adhere to a premium, non-generic look using Tailwind CSS. **CRITICAL AESTHETIC RULE:** While you must use Tailwind CSS as the primary styling method, you MUST perfectly match the exact visual design defined in `project_memory/deepwork_prototype.jsx`. This means extending `tailwind.config.ts` to include the specific custom colors (e.g., `#c8843a`), fonts (_Playfair Display_, _JetBrains Mono_, _Lato_), and translating any custom CSS features (like the SVG grain overlay `<feTurbulence>`, complex soft glows `<feGaussianBlur>`, and custom animations like `pulse-ring`) into Tailwind classes or custom global CSS. Do NOT default to generic Tailwind colors or fonts if they conflict with the prototype.
3. **Test-Driven:** No feature is considered complete without automated tests.
4. **Collaboration First:** We strictly use Scrum on GitHub Issues and standard feature branch/Pull Request workflows.
5. **Frequent Commits:** Commit code often to establish valid development checkpoints. Specifically, a commit must be made every time a major feature (or sub-component) is completed.

## Workflow Execution Rules for Agents

- When implementing a feature, ensure a corresponding GitHub Issue exists.
- **Every time we create a commit, it must reference the GitHub issue that we are currently working on.**
- Always verify your work via automated tests before notifying the user of completion.
- **When a feature is properly tested and implemented, you must ask the user if they want to close the issue.**
- Prioritize non-API dependent tools like local `transformers.js` for ML tasks to ensure low cost and high privacy for the user.

## Stick to the truth

- **Do not feel like you have to please me, I prefer that you say no or contradict me if I'm wrong.**
- **Feel free to tell me that you don't know something or that you are not confident instead of making up stuff.**
- **Always base your answers on evidence, unless I tell you otherwise**

## Tech Stack

- **Framework**: Next.js (App Router) — serves both frontend and API as a single deployable unit
- **Frontend**: React, Tailwind CSS
- **Backend**: Next.js API Routes (versioned under `/api/v1/`)
- **Database**: MongoDB (Atlas free tier), Mongoose ODM
- **Auth**: JWT (HTTP-only, Secure, SameSite=Strict cookies) + bcrypt
- **Deployment**: Vercel
- **Testing**: Vitest, React Testing Library, Supertest, Playwright

## Coding Rules

**Critical DB decision:** User settings are embedded in the Users document (not a separate collection) — 1:1 relationship, always co-read.

### General

- **All code in TypeScript with strict types**
- **Use Mongoose **`lean()` for read queries — returns plain objects, not Mongoose documents
- **Use MongoDB aggregation pipelines for analytics — never fetch raw session arrays to the client**
- **All list endpoints support pagination (**`page`, `limit` params → `{ data, pagination }` response)
- **No in-memory state across requests — serverless functions are stateless**
- **Do not add npm packages without explicit approval**
- **Do not invent new architectural patterns — follow what exists in the codebase**

### File Organization

- **API routes**: `app/api/v1/{resource}/route.ts` — follows Next.js App Router conventions
- **Pages**: `app/` — use route groups `(auth)` and `(main)` to separate layouts
- **Components**: `components/*.tsx` — flat directory, one file per component
- **Hooks**: `hooks/*.ts` — custom React hooks
- **Contexts**: `contexts/*.tsx` — React context providers
- **Services**: `lib/services/*.ts` — business logic functions
- **Models**: `lib/models/*.ts` — Mongoose schemas and models
- **Middleware**: `lib/middleware/*.ts` — auth verification, error formatting
- **Shared utils**: `lib/` — DB connection (`db.ts`), constants, error classes

### Error Handling

- **Services throw typed errors with status codes: **`throw new AppError(404, 'Session not found')`
- **Route handlers wrap service calls in try/catch and return appropriate **`NextResponse`
- `AppError` class defined in `lib/errors.ts` — all custom errors extend it
- **API responses follow consistent shape:**
  - **Success: **`{ data: ... }`
  - **Error: **`{ error: { code: number, message: string } }`

### Auth Patterns

- **JWT stored in HTTP-only, Secure, SameSite=Strict cookie — client never touches the token**
- `verifyAuth(request)` helper extracts and validates JWT from cookie, returns userId or throws 401
- **Protected route handlers call **`verifyAuth()` as their first line
- **Token refresh: if token is near expiration on any request, reissue a fresh cookie in the response**
- **Single role (no role-based access control in v1)**

### Frontend — Non-Obvious Rules

- **Timer countdown is entirely client-side (hooks) — server is never contacted during ticking**
- **Optimistic updates after session completion: update local state immediately, POST in background**
- **Absolute Visual Fidelity:** The frontend build MUST perfectly replicate the aesthetics of `deepwork_prototype.jsx`. If a Tailwind utility class cannot achieve a specific complex style (like a stacked box-shadow, a specific SVG filter, or a grain overlay), you must use custom CSS. The final result must look indistinguishable from the prototype screenshot, not a generic approximation.

## Code Quality

- **Formatting & Linting:** You must adhere to ESLint and Prettier formatting standard rules. Code that does not pass linting cannot be merged.
- **Code Coverage Minimum:** `70%` code coverage is strictly enforced.

## Testing Rules

### Philosophy: TDD with Testing Trophy

**Red → Green → Refactor. Write tests first, then implement to make them pass.**

**We use the \*\***testing trophy\*\* approach: heavy on integration tests, light on unit tests. We care if the system works end-to-end, not if individual functions return expected outputs.

### What to Test

- **API integration tests (primary)**: Use Supertest to test full HTTP request → response cycles against Next.js API routes. Test with a real test database. These are the tests that matter.
- **Component tests (secondary)**: Use React Testing Library to test user-facing behavior — render component, simulate interaction, assert on DOM output. Do NOT test implementation details (state values, hook internals).
- **Unit Testing**: Write robust unit tests (using Vitest) for logic and individual components.
- **End-to-End Testing**: Use **Playwright** to map and verify the user journey across the core usage scenarios.
- **Do NOT write**: Unit tests for route handlers, services, or models. Do not mock Mongoose. Do not test implementation details.

### Test Structure

**Each API integration test should:**

1. **Set up test data (create user, create sessions as needed)**
2. **Make HTTP request via Supertest**
3. **Assert response status + body shape**
4. **Assert database state changed correctly (query MongoDB to verify)**
5. **Clean up test data**

**Each component test should:**

1. **Render component with props**
2. **Simulate user interaction (click, type)**
3. **Assert on visible DOM output — what the user sees**
4. **Never assert on internal state or hook return values**

### CRITICAL RULE: Test files are read-only during implementation

**When implementing features (making tests pass), NEVER modify test files in `__tests__/`.**
**If a test fails, fix the implementation code, NOT the test.**
**The ONLY exception: import path changes due to file restructuring.**

**UI Implementation Exception During Testing:** When executing the "Code Chat" phase to make tests pass, you must STILL fulfill the aesthetic requirements of the prototype. Passing the functional tests is required, but delivering a UI that visually matches `project_memory/deepwork_prototype.jsx` is equally mandatory, even if the tests do not assert aesthetic values.

## Workflow

**This project uses a \*\***two-chat TDD workflow\*\*:

### Chat 1 — Test Chat

- **Reads the sprint requirements from GitHub Issues**
- **Writes test files ONLY (integration + component + unit as needed)**
- **Does NOT write any implementation code**
- **Runs **`npx vitest run` at the end to confirm all tests FAIL (red state)

### Chat 2 — Code Chat

- **Implements the feature to make all existing tests pass while simultaneously ensuring the UI 100% matches the bespoke aesthetic from the prototype.**
- **Follows all rules in `rules.md`**
- **Does NOT modify any files in **`__tests__/`
- **Runs **`npx vitest run` to confirm all tests PASS before committing

### Git Workflow

- **Branch naming**: `feature/<issue-number>-<short-description>` (e.g., `feature/12-session-create`)
- **Commit messages**: Conventional Commits format:
  - `test: add session creation integration tests` (red phase)
  - `feat: implement session creation endpoint` (green phase)
  - `refactor: extract duration validation` (refactor phase)
  - `fix: correct accumulated focus timezone bug`
  - `docs: add API endpoint documentation`
  - `chore: configure vitest for integration tests`
- **PR workflow**: One PR per feature/issue. Link to GitHub Issue in PR description. All tests must pass before merge.

## Commands

```bash
# Development
npm run dev                    # Start Next.js dev server
npm run build                  # Production build
npm run lint                   # ESLint

# Database
# MongoDB Atlas — no local migration commands. Use Mongoose schemas as source of truth.

# Testing
npx vitest run                 # Run all tests once
npx vitest run --reporter=verbose  # Verbose output
npx vitest run __tests__/integration/sessions.test.ts  # Run specific file
npx vitest --coverage          # Run with coverage report
```

## Design References

- **PRD: **`PRD.md` in project_memory directory
- **Architecture: **`technical architecture.md` in project_memory directory
- **Mom Test notes: **`mom_test_notes.md` in project_memory directory (user research backing every feature decision)
- **UI Design: **`deepwork_prototype.jsx` in project_memory directory

### Key Product Decisions (from user research)

- **Non-coercive transitions**: Timer sends gentle notification on session end — never forces a break. Users can acknowledge and continue. This is table stakes, not a feature.
- **Automatic logging**: Sessions log on completion with zero manual entry. Manual logging fails within one week (validated across all 3 interviews).
- **Accumulated focus**: Track daily total focus time, not just per-session. Configurable threshold (default: 100 min) triggers long break reminder. This is the differentiating feature for professional users.
- **Guided break suggestions**: Suggest healthy activities (water, stretch, walk) during breaks. Two of three interviewees default to phone/social media without guidance.
- **Flexible durations**: Customizable work/break lengths per session. Standard 25-min Pomodoro is a non-starter for engineering tasks.

## Do's and Don'ts

- **Do** use Mongoose `lean()` for read queries and aggregation pipelines for analytics
- **Do** cache the MongoDB connection for serverless reuse (`lib/db.ts`)
- **Don't** use Express — Next.js API Routes exclusively
- **Don't** create a Repository/Controller layer — call Mongoose models directly from services
- **Don't** use classes or dependency injection — plain exported functions only
- **Don't** store JWT in localStorage — HTTP-only cookies only
- **Don't** use Axios — use native `fetch`
- **Don't** mock Mongoose in tests — use a real test database
- **Don't** add npm packages without explicit approval
- **Don't** modify test files during implementation (Code Chat)
