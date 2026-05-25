# TaxShieldAgent — Instructions for AI Assistants

**Project:** Compliance-as-a-Service for Stripe merchants. Monitors US economic-nexus
thresholds across all 50 states and automates sales-tax registration.

## ⭐ ACTIVE ROADMAP — READ FIRST

The public-readiness engineering plan lives at **`.claude/PHASE_PLAN.md`**.
Read it at the start of any work session. It is the source of truth for what to build and
in what order. Keep its status markers (⬜/🟡/✅) current as work progresses.

**Phases A and B are launch blockers** — the app is NOT safe for more than one real user until
they are done (DB concurrency, multi-tenant agent loop, JWT verification, CORS).

## Working rules
- Update `.claude/PHASE_PLAN.md` status when you start/finish an item.
- Record meaningful changes in `CHANGELOG.md`.
- Never weaken the human-in-the-loop safety model: tax registrations require explicit
  `user_confirmed=True`; the $1 fee charges only after confirmation; the audit log is immutable.
- Secrets live in `.env` only — never commit them.

## Key paths
- `src/agent/` — db (DuckDB), nexus engine, Claude agent, webhook handler
- `src/web/api/` — FastAPI app, routes, auth middleware
- `src/web/dashboard/` — React + Vite frontend
- `src/payments/` — Stripe Connect, subscriptions, billing (partly scaffolded)
