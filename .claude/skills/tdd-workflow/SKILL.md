---
name: tdd-workflow
description: "Enforces test-driven development workflow rules. Consult this skill whenever writing tests, implementing features, or working with the __tests__/ directory. Also consult when Claude needs to decide whether to modify a test file or an implementation file. This skill applies to all test-related and implementation tasks."
---

# TDD Workflow Rules

This project uses strict two-phase TDD. The phases are enforced by hooks and slash commands.

## Phase 1: Write Tests (red state)

Invoked by: `/project:write-tests [feature description]`

In this phase:
- Create test files in `__tests__/integration/`
- Use `@testing-library/react` with Vitest for testing
- Cover happy paths, error cases, and edge cases
- Do not write any implementation code
- End state: all new tests FAIL

## Phase 2: Implement (green state)

Invoked by: `/project:implement [feature description]`
Requires: `CLAUDE_TDD_MODE=implement` environment variable

In this phase:
- Read failing tests to understand expected behavior
- Write minimum implementation to pass tests
- Files in `__tests__/` are blocked by a PreToolUse hook -- do not attempt to edit them
- Follow `app/page.tsx -> Components (UI) -> Hooks (stateful logic) -> Services (data/API)` architecture
- End state: all tests PASS

## When to consult this skill

- Before creating any file in `__tests__/`: check which phase you are in
- Before modifying any test file: this is only allowed in Phase 1
- When a test fails during implementation: fix the implementation, not the test
- When deciding where to put new code: follow the file naming conventions below

## File placement reference

| Type | Path pattern | Naming |
|------|-------------|--------|
| Integration test | `__tests__/integration/{phase}-{feature}.test.tsx` | kebab-case |
| Unit test | `__tests__/unit/{feature}.test.ts` | kebab-case |
| Component test | `__tests__/components/{ComponentName}.test.tsx` | PascalCase |
| Component | `components/{Name}.tsx` | PascalCase |
| Hook | `hooks/use{Name}.ts` | camelCase |
| Service | `services/{feature}Service.ts` | camelCase |
| Types | `types.ts` | shared types file |
| Page | `app/page.tsx` | Next.js convention |

## Composition rule

app/page.tsx -> Components (UI) -> Hooks (stateful logic) -> Services (data/API)

## Test structure template

```typescript
describe('Feature: [feature name]', () => {
  function setup() {
    render(<ComponentUnderTest />)
  }

  it('should [expected behavior] when [condition]', async () => {
    // 1. Arrange: set up initial state
    // 2. Act: perform the action
    // 3. Assert: check the result
  });
});
```
