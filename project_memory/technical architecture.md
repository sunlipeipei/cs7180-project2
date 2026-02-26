# DeepWork — Full-Stack Architecture

**Authors:** Qi (Dako) Wei, Lipeipei Sun | **Date:** February 2026

---

## Overview

```
┌─────────────┐       ┌───────────────────┐       ┌────────────────┐
│  React UI   │──────▶│  /api/v1/* routes  │──────▶│  MongoDB Atlas │
│  (Next.js)  │◀──────│  (App Router)     │◀──────│  (Free Tier)   │
└─────────────┘ JSON  └───────────────────┘       └────────────────┘
                         ▲ JWT in HTTP-only cookie
```

**Tech stack:** Next.js (App Router), React, Tailwind CSS, Next.js API Routes, MongoDB (Atlas free tier), Mongoose, JSON Web Tokens (JWT), bcrypt, Vercel (deployment).

Next.js serves both the frontend and a versioned public API as a single deployable unit on Vercel. The timer countdown is entirely client-side — the server is only contacted on page load (to hydrate settings and today's accumulated focus), on session completion (to persist it), and on analytics navigation (to fetch aggregated history). Serverless cold starts never affect the ticking experience.

---

## Backend Pattern

**API routes follow a flat, pragmatic pattern — NOT the Repository → Service → Controller layering:**

```
Route Handler → Service/Util → Mongoose Model → MongoDB
```

- **Route handlers** (`app/api/v1/*/route.ts`): Parse request, validate input, call service functions, return `NextResponse`. Each handler includes auth verification.
- **Services** (`lib/services/*.ts`): Business logic as plain exported functions. Receive parsed data, return results or throw errors. No classes, no DI — just functions.
- **Models** (`lib/models/*.ts`): Mongoose schemas and models. Data shape and validation only.
- **Middleware** (`lib/middleware/*.ts`): Auth verification, error formatting. Used by route handlers, not as Express-style middleware chain.

## Frontend Pattern

- **Pages** (`app/*/page.tsx`): Four routes — `/` (timer), `/analytics`, `/auth/login`, `/auth/register`.
- **Components** (`components/*.tsx`): Pure presentational — `CircularTimer`, `AccumulatedBar`, `SessionTag`, `BreakSuggestion`, notification toast, `Settings` modal.
- **Hooks** (`hooks/*.ts`): Timer state (`useTimer`), auth state, accumulated focus tracking.
- **Context** (`contexts/*.tsx`): User data and settings loaded on mount, shared via React context.

**Timer countdown is entirely client-side. The server is only contacted:**

1. **On page load (hydrate settings + today's accumulated focus)**
2. **On session completion (persist session)**
3. **On analytics navigation (fetch aggregated history)**


---

## Database Design

Three MongoDB collections.

**Users** — One document per account: credentials, metadata, and embedded timer settings. Settings are embedded (not a separate collection) because they have a strict 1:1 relationship with users and are always read together.

**Sessions** — One document per completed focus session: user reference, duration, tag, timestamp. Compound index on user ID + timestamp, since nearly every query filters by user and ranges by date.

**Tags** — User-tag pairs with usage frequency, powering the autocomplete dropdown. Optional — can be deferred to Sprint 2 and derived from sessions at query time in the meantime.

---

## Auth Flow

On login/registration the server sets a JWT as an HTTP-only, Secure, SameSite=Strict cookie. The client never touches the token directly — the browser attaches it automatically. Protected routes run middleware that verifies the token and extracts the user ID; invalid/missing tokens return 401, which the frontend handles by redirecting to `/auth/login`. Tokens are refreshed proactively: if a request arrives with a token near expiration, the server reissues a fresh cookie.

---

## Accumulated Focus — Discussion Point

Server-computed: the client fetches today's total from the server on page load and after each session completion. This guarantees cross-device consistency (phone session shows up on laptop) at the cost of one lightweight indexed query per load. If perceived latency becomes an issue, the timer renders immediately with the accumulated bar in a loading state — no local caching or reconciliation needed.

---

## Key Design Decisions

**Next.js API routes, not Express.** One deployable unit, one set of env vars, no CORS — appropriate for a two-person, two-week timeline. The `/api/v1/` prefix satisfies the public API requirement.

**Vercel + Atlas.** Zero infrastructure management. Push to GitHub, get a production URL. Atlas free tier provides 512 MB, more than enough.

**Embedded settings.** 1:1 with users, always co-read, never independently queried. A separate collection adds a fetch with no benefit.

**Complex state management, not real-time.** The rubric requires "real-time updates OR complex state management." DeepWork's timer, mode switching, accumulated tracking, break suggestions, and tagging form a non-trivial client-side state graph — no WebSocket layer needed for a single-user tool.

---

## Sprint Boundary

**Sprint 1 (March 1):** Auth + timer + session creation + basic session list. Delivers the core loop: sign up → run timer → session persists → see history on re-login.

**Sprint 2 (March 10):** Analytics dashboard, settings persistence, tag management, public API docs, UI polish. Adds depth to a foundation that already works end-to-end.

This ordering is deliberate — if Sprint 2 runs long, the app still covers every Functionality rubric criterion.
