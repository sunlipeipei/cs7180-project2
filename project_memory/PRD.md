# Product Requirements Document
## DeepWork — A Pomodoro Timer for Deep Work

**Version:** 1.0 (Draft)  
**Authors:** Qi (Dako) Wei, Lipeipei Sun  
**Date:** February 2026  

---

## 1. Problem

Existing focus timer apps fail real users in four consistent ways, validated across three Mom Test interviews conducted in February 2026 using strict behavioral questioning (past behavior only, no hypotheticals):

**Rigid session transitions are universally rejected.** All three interviewees dismissed or ignored timer alerts when mid-thought. This is not a preference — it's a consistent behavioral pattern across personas. A forced break at the wrong moment causes complete context loss, which is worse than no timer at all. Non-coercive transitions are table stakes, not a differentiator.

**Manual logging fails within one week.** Every interviewee who tried manual tracking (Toggl, Calendar blocks) abandoned it within a week. Real-time logging requires meta-awareness that disrupts the focus it's trying to measure; retroactive logging is perceived as guessing. Automatic session logging is required, not optional.

**Breaks are unguided and default to phone use.** Two of three interviewees described social media or YouTube as their default break behavior. The third simply skips breaks entirely. None had a structured alternative readily available.

**Context restoration is a self-built workaround with no tooling support.** Two interviewees independently developed personal systems to recover context after interruptions — one uses voice memos, another uses sticky notes. These are friction-generating coping mechanisms for a real, unsolved problem.

A secondary finding: **users cannot distinguish deep work time from reactive/shallow time.** At the end of the day, they have no data to explain *why* the day felt productive or wasted — productivity proxies like commit history or tiredness are acknowledged as imprecise.

---

## 2. Target Users

Three validated personas from user research (behavioral interviews, February 2026):

**The Grad Student** — PhD student juggling coursework, lab research, and TAing. Needs structured focus without rigid interruptions. Has tried Forest and Toggl; abandoned both within two weeks for articulable reasons (wrong mental model, not just poor UX). Breaks default to phone use and generate guilt rather than recovery. No visibility into how time is distributed across projects.

**The Software Engineer** — Full-stack engineer, 4 years experience. Finds standard 25-minute intervals a non-starter for deep coding work — custom session lengths are a prerequisite for adoption, not a feature request. Has built a voice memo system for context restoration after interruptions, demonstrating a genuine, habituated workaround for a real problem. Cannot distinguish deep work hours from shallow/reactive hours using any existing tool.

**The Remote Professional** — Senior PM managing 2–3 client accounts, fully remote. Does not think in terms of individual sessions at all — her mental model is *accumulated daily focus time*. Would act on a signal that she's hit two hours of actual focused work and should take a meaningful break. Uses sticky notes for context restoration. Cannot separate busy days from productive days without data.

---

## 3. Solution

DeepWork is a full-stack Pomodoro-based focus timer that respects flow states, automates session logging, and gives users data to understand their own productivity patterns.

### Core Features

**Flexible, non-coercive timer**  
Work and break durations are customizable per session. When a session ends, DeepWork sends a *gentle notification* — it does not force a transition. Users can acknowledge and continue, or switch to a break. The timer logs actual focus time regardless of whether the user took the break.

**Automatic session logging with tagging**  
Sessions are logged automatically on completion. Users can optionally tag each session with a project or task category (e.g., "Coding — Auth Feature", "PR Reviews", "Client A — Report"). No manual entry required after the fact.

**Accumulated focus tracking**  
In addition to per-session timers, DeepWork tracks total accumulated focus time in a day. A configurable threshold (default: 100 minutes) triggers a long break reminder. This directly addresses the mental model of users who think in daily totals, not individual sessions.

**Guided break suggestions**  
When a break is triggered, DeepWork suggests a healthy break activity (drink water, stretch, step outside) rather than leaving users to default to their phone.

**Session analytics dashboard**  
Users can review historical focus data: time per project/tag, daily/weekly totals, session length distribution, and deep vs. shallow work breakdowns. This replaces the unreliable productivity proxies users currently rely on (commit history, tiredness level, calendar blocks).

**User authentication**  
JWT-based authentication so session history and settings persist across devices.

---

## 4. What Was Not Validated

The interviews explicitly did not surface demand for two commonly assumed features:

**Social/team accountability** was not raised by any interviewee as a desire or pain point. This confirms the v1 decision to exclude it.

**Calendar integration** was mentioned in passing by Interview 3, but when asked whether she'd prioritize it, the response was lukewarm. Not a v1 priority.

## 5. Out of Scope (v1)

- Calendar integration (Outlook, Google Calendar)
- Team or social accountability features
- Native mobile apps (web-first)
- Distraction blocking or screen monitoring

---

## 6. Success Metrics

- Users complete at least 3 sessions before dismissing the app (retention signal)
- Session log completion rate ≥ 80% without manual intervention
- At least one tag applied per session in ≥ 50% of sessions
- Users return on consecutive days (day-2 and day-7 retention)

---

## 7. Sprint Timeline

| Milestone | Due Date |
|-----------|----------|
| Sprint 1  | March 1, 2026 |
| Sprint 2 / Final Submission | March 10, 2026 |

---

## 8. Tech Stack

- **Frontend:** React / Next.js + TailwindCSS
- **Backend:** Node.js / Express or Next.js API routes
- **Database:** PostgreSQL or MongoDB
- **Auth:** JWT or OAuth
