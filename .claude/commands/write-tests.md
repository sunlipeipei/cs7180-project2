---
description: "TDD Phase 1: Write failing integration tests for a feature. Use this to start a new feature by creating tests first (red state)."
allowed-tools: Read, Glob, Grep, Write, Bash
---

You are in TEST WRITING mode.

## Task

Write integration tests for: $ARGUMENTS

## Process

1. Read the feature requirements from `project_memory/PRD.md` (or the description provided in $ARGUMENTS)
2. Identify all behaviors, interactions, and edge cases to test
3. Write integration test files in `__tests__/integration/`
4. Use `@testing-library/react` with Vitest for testing
5. Run `npx vitest run` and confirm ALL new tests FAIL (red state)

## Test file structure

Each integration test must:

1. `render(<ComponentUnderTest />)`
2. Simulate user interactions or API calls
3. Assert the resulting state matches expected behavior

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

## Constraints

- Write test files ONLY -- no implementation code
- Do NOT modify any files outside `__tests__/`
- Do NOT modify existing test files unless extending them for the current feature
- Test assertions come from the functional requirements, not from guessing implementation details
- Use descriptive test names: `should [expected behavior] when [condition]`

## Output

After writing tests, run `npx vitest run` and report:
- List of test files created
- Summary of each test case
- Confirmation that all new tests fail with expected reasons

## Commit

After confirming red state, stage and commit your work:
1. Run `git status` to identify files you created in this session
2. Stage only those files (do not use `git add -A`)
3. Run: `git commit -m "TDD[1:write-tests] $ARGUMENTS -- N tests, all red"`
   Replace N with the actual number of new tests.
