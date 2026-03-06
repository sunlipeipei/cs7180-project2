# Manual API Test Report

**Date:** 2026-03-05
**Branch:** feature/5-session-logging
**Environment:** macOS Darwin 24.6.0, Next.js 16 dev server (port 7001), MongoDB 7 (Docker), Node.js

## Test Results

All 13 manual curl tests passed against a real MongoDB instance.

| # | Endpoint | Description | Expected | Actual | Result |
|---|----------|-------------|----------|--------|--------|
| 1 | POST /api/v1/auth/register | Register User A | 201 | 201 | PASS |
| 2 | POST /api/v1/auth/login | Login User A | 200 + Set-Cookie | 200 + Set-Cookie | PASS |
| 3 | POST /api/v1/sessions | Focus session (1500s) | 201 | 201 | PASS |
| 4 | POST /api/v1/sessions | Short break session (300s) | 201 | 201 | PASS |
| 5 | GET /api/v1/sessions | List User A sessions | 200, 2 sessions | 200, 2 sessions | PASS |
| 6 | POST /api/v1/sessions | No auth cookie | 401 | 401 | PASS |
| 7 | POST /api/v1/sessions | Missing duration | 400 | 400 | PASS |
| 8 | POST /api/v1/sessions | Zero duration | 400 | 400 | PASS |
| 9 | POST /api/v1/sessions | Invalid mode "nap" | 400 | 400 | PASS |
| 10 | POST /api/v1/auth/register | Register User B | 201 | 201 | PASS |
| 11 | POST /api/v1/auth/login | Login User B | 200 + Set-Cookie | 200 + Set-Cookie | PASS |
| 12 | POST /api/v1/sessions | Long break session (600s, User B) | 201 | 201 | PASS |
| 13 | GET /api/v1/sessions | List User B sessions (isolation) | 200, 1 session | 200, 1 session | PASS |

## Bugs Found

None. All endpoints behaved as expected.

## Automated Test Suite

24/24 vitest integration tests also pass (`npx vitest run`).

## Notes

- Port 7000 is reserved by macOS AirPlay (ControlCenter); used port 7001 instead.
- GET /api/v1/sessions returns sessions sorted by `createdAt` descending.
- Response bodies include Mongoose fields (`_id`, `__v`, `createdAt`).

## Summary

**13/13 manual tests passed. 0 bugs found. 24/24 automated tests green.**
