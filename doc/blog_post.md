# Building DeepWork: How We Used AI as a Full-Stack Engineering Pipeline

**By Qi (Dako) Wei & Lipeipei Sun | March 2026**

🔗 Live app: [deepwork-two.vercel.app](https://deepwork-two.vercel.app/) · GitHub: [sunlipeipei/cs7180-project2](https://github.com/sunlipeipei/cs7180-project2)

---

## 1. Introduction

Most developers use AI to write code faster. We used it differently — as a structured engineering pipeline where every stage had a defined input, a defined output, and a defined AI tool responsible for bridging the two.

DeepWork is a full-stack Pomodoro focus timer built for users who reject rigid session transitions. When a focus session ends, the app sends a gentle notification — it never forces a break. Sessions are logged automatically, tagged by project, and surfaced in an analytics dashboard so users can actually understand their own productivity patterns. The stack is Next.js 16 with App Router, MongoDB Atlas, JWT authentication via HTTP-only cookies, and Tailwind CSS, deployed on Vercel. We built it in two one-week sprints, as a two-person team, with 80%+ test coverage enforced from day one.

But the architecture is not the interesting part. The interesting part is the process we used to get there — and how AI made it faster without making it sloppier.

Here is the pipeline in one sentence: user research fed Claude Web artifacts, artifacts fed a two-chat TDD workflow, and the TDD workflow fed a CI/CD pipeline that kept `main` always deployable. Every section of this post maps to one stage of that chain. By the end, you will have a repeatable model for AI-assisted full-stack development that holds together under real project constraints — not just in demos.

---

## 2. Using Artifacts to Rapidly Design and Iterate

**The core claim: Claude Web artifacts let us validate the full UI before writing a single backend route — and kept evolving as a living design document throughout both sprints, not a one-time throwaway deliverable.**

### Before Code: From User Stories to a Working Prototype

Every feature in DeepWork traces back to a behavioral interview. We conducted three Mom Test interviews in February 2026 — speaking with a PhD student, a full-stack software engineer, and a remote product manager. The Mom Test framework is strict: you ask only about past behavior, never hypotheticals. The result is messy, qualitative, and hard to act on directly.

This is where Claude Web earned its first role. We fed the raw interview notes into Claude and asked it to identify recurring pain points, extract validated personas, and translate them into structured user stories with acceptance criteria. The output directly shaped our PRD. For example, all three interviewees described dismissing timer alerts mid-thought — not occasionally, but consistently. Claude helped us articulate this as an engineering requirement rather than a UX preference: _"As a remote worker, I want to be notified when a session ends without being forced into a break, so I can finish my current thought before switching."_ That sentence became the product's core design constraint: non-coercive transitions.

With user stories in hand, we used Claude's artifact feature to generate a working React prototype — a fully rendered, interactive UI — before touching the backend. This was not a static wireframe. It was a real component tree we could click through: `CircularTimer`, `AccumulatedBar`, `SessionTag`, `BreakSuggestion`. We could stress-test the layout, validate the information hierarchy, and confirm that the component decomposition made architectural sense before committing to any implementation. Decisions that would have been expensive to reverse later — like how the accumulated focus bar relates to the per-session timer, or where the tag input lives in the session flow — were settled visually in minutes.

### During Implementation: The Prototype as a Living Document

The more important insight came later. Midway through Sprint 1, as we built the actual features, we hit usability issues that the prototype had not revealed. The settings modal needed restructuring. A button placement that looked clean in isolation felt awkward in the real interaction flow. Rather than treating the prototype as a finished artifact, we went back to Claude Web, described what we had learned, and updated it.

This is the habit most teams skip. They treat the prototype as a deliverable — something produced at the start and discarded once implementation begins. We treated it as a checkpoint. Every time real development surfaced a design assumption worth revisiting, the prototype was updated to reflect the new understanding. The result was that our design and implementation stayed in sync across both sprints, rather than drifting apart as they typically do.

### Across the Team: Artifacts as Shareable Context

The third use was handoff. Claude's shareable chat link — a persistent URL that captures the full conversation and rendered artifact — let us pass the updated prototype as live context to the other tools in our pipeline. When Lipeipei worked in Antigravity, and when we used Gemini CLI for specific tasks, the starting point was not a written description of what the UI should look like. It was a rendered, interactive artifact they could inspect directly. That compression of context — from description to demonstration — eliminated a significant category of misalignment.

**The artifact workflow turned what would normally be multiple design-review cycles into a fast, low-friction loop. Design stayed accountable to user stories, and implementation stayed accountable to design.**

---

## 3. Delivering High-Quality Code with Agentic AI

**The core claim: agentic AI produces high-quality code only when the process constrains it. Left unconstrained, it drifts — quietly modifying tests, skipping edge cases, ignoring architecture rules. Our two-chat TDD workflow and CI/CD pipeline made quality a mechanical guarantee, not a judgment call.**

### The Real Risk of Agentic Coding

The most common failure mode in AI-assisted development is not hallucinated syntax or wrong APIs. It is subtler: the model optimizes for the appearance of correctness rather than actual correctness. Ask an AI to make a test pass without constraining how it does so, and it will sometimes modify the test. Ask it to implement a feature without specifying the boundaries, and it will invent architectural patterns that conflict with the rest of the codebase. These are not bugs in the model — they are predictable consequences of an underspecified process. The solution is not a better model. It is a better-designed workflow.

### The Two-Chat TDD Workflow

We enforced a strict two-phase TDD cycle that treated AI the same way you treat any developer on a team: give it a clearly scoped task, and make the boundaries mechanical rather than advisory.

**Phase 1 — Write Tests (Red State).** A Claude Code session read the user story, identified all behaviors and edge cases, and wrote failing integration tests in `__tests__/integration/`. It wrote nothing else. No implementation code. At the end of Phase 1, every new test had to fail — confirming the tests were actually asserting something real, not passing vacuously. The session committed with the message `TDD[1:write-tests] <feature> -- N tests, all red`.

**Phase 2 — Implement to Pass (Green State).** A separate Claude Code session then implemented the minimum code required to make those tests pass. Critically, test files were locked by a pre-commit hook — `guard-test-files.sh` — during this phase. If a test failed, the instruction was unambiguous: fix the implementation, never the test. The mechanical enforcement meant this rule could not be quietly violated.

To make this concrete: for the session creation feature, Phase 1 produced integration tests that verified the `POST /api/v1/sessions` endpoint returned the correct response shape, persisted the session to MongoDB scoped to the authenticated user, rejected unauthenticated requests with a 401, and handled malformed input gracefully. Phase 2 implemented the route handler, service function, and Mongoose model to satisfy exactly those assertions — nothing more, nothing less. The test coverage threshold of 80% on lines, functions, branches, and statements was enforced automatically in CI, so there was no ambiguity about whether coverage was adequate.

### The Multi-Model Strategy

We used three AI tools during implementation, each with a distinct role:

- **Claude Code** handled test writing and feature implementation, operating within the two-phase TDD structure described above.
- **Gemini CLI** complemented Claude Code during refactoring and debugging. Using a second model in parallel is not redundancy — it is a practical way to surface blind spots that any single model carries. When Claude Code's implementation passed tests but felt architecturally off, Gemini CLI often caught what was wrong and why.
- **Antigravity** was Lipeipei's primary implementation environment, integrated into her IDE workflow.

The discipline was the same across all three: defined input, defined scope, defined output. None were used as general-purpose "do the thing" tools.

### GitHub Projects and CI/CD as the Coordination Layer

Managing a two-person, two-sprint project without a coordination system is a fast path to integration bugs and duplicated work. We used GitHub Projects as our single source of truth. Every feature started as a GitHub Issue with a user story and acceptance criteria, moved through a sprint board — Backlog → In Progress → In Review → Done — and was delivered via a feature branch PR linked back to that issue.

Sprint 1 (due March 1) targeted the core loop: authentication, the timer, session creation, and basic session history. The goal was a working end-to-end flow — sign up, run a session, see it persist on re-login. Sprint 2 (due March 10) added the analytics dashboard, settings persistence, tag management, and public API documentation. This ordering was deliberate: if Sprint 2 ran long, the app still covered every core functionality requirement.

The GitHub Actions CI/CD pipeline enforced quality at every merge: ESLint, TypeScript type checks via `tsc --noEmit`, the full Vitest + Supertest test suite with coverage reporting, and security scanning — all before any code could reach `main`. A passing pipeline was a hard requirement for merge, not a suggestion. Merging to `main` triggered automatic deployment to Vercel, giving us a live production URL after every completed feature.

**Quality in agentic coding does not come from trusting better models. It comes from designing a process where the model cannot take shortcuts — and where every shortcut that slips through is caught before it reaches production.**

---

## 4. What We Learned

**Three things transferred out of this project and into how we think about software development generally.**

First: **constrained roles consistently outperform open-ended prompts.** Claude Web for synthesis and prototyping. Claude Code for test writing and implementation in separate phases. Gemini CLI for refactoring and debugging. Antigravity for IDE-integrated implementation. Every tool had a job. The quality of the output was directly proportional to the specificity of the constraint.

Second: **documentation is the real force multiplier.** We maintained a `CLAUDE.md` file — a project-level instruction document that told Claude Code the architecture patterns, naming conventions, testing philosophy, and what it was explicitly not allowed to do. Without it, AI output across sessions drifted in ways that were expensive to fix. With it, every session started with a shared understanding of the codebase. The upfront investment in documentation paid back multifold across ten-plus Claude Code sessions over two weeks.

Third: **the pipeline itself is the repeatable asset.** User story → Claude Web artifact → two-chat TDD → CI/CD → deploy. The specific tools will change. Gemini will be replaced by something better. Claude Code will gain new capabilities. But the discipline of defining clear handoff points — where one stage ends, what it produces, and what the next stage expects — is tool-agnostic and project-agnostic.

AI-assisted engineering is not faster because AI writes more code. It is faster because it compresses the feedback loops between design, implementation, and validation — provided the process is designed to use that compression deliberately, rather than accidentally.

---

_DeepWork is live at [deepwork-two.vercel.app](https://deepwork-two.vercel.app/). Full source code, test suite, sprint documentation, and CI/CD configuration are available at [github.com/sunlipeipei/cs7180-project2](https://github.com/sunlipeipei/cs7180-project2)._
