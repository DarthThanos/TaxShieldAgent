# TaxShieldAgent — Public-Readiness Phase Plan

> Engineering plan to take TaxShieldAgent from "impressive demo" to production-grade,
> multi-user, top-of-class SaaS. Derived from an executive engineering assessment (2026-05-25).
> **Phases A–B are blockers and must ship before any public/multi-user exposure.**

Status legend: ⬜ not started · 🟡 in progress · ✅ done

---

## PHASE A — Foundation (make it safe for more than 1 real user) 🔴 BLOCKER

### A1. Fix the database concurrency model ⬜
**Problem:** `get_db()` (`src/web/api/routes/dashboard.py:25`) opens a NEW DuckDB connection per HTTP
request and re-runs `initialize_schema()` every time (`src/agent/db.py:27`). DuckDB is a single-writer
embedded engine, yet OPERATIONS.md runs `api` + `agent` as two processes on the same `shield.db`.
This breaks under real concurrency.
**Fix (recommended — Option A):** Migrate to Postgres (Railway one-click). Use a connection pool
injected via FastAPI dependency. Run schema/migrations ONCE at startup, never per-request.
**Fix (interim — Option B):** Single writer process only — fold the agent loop into the API process
as a scheduled task; share one connection behind a lock; init schema once in `lifespan`.
**Done when:** No per-request connection creation; concurrent requests + background checks run with
no lock errors; schema init happens once at startup.

### A2. Make the agent loop multi-tenant ⬜
**Problem:** `src/agent/main.py:107` checks only `MERCHANT_ID` (default "platform"). With N subscribers,
N-1 get zero monitoring — contradicts the core product promise.
**Fix:** Iterate every active merchant (from `merchant_subscriptions` / `connected_platforms`) each
cycle; run `nexus_engine.run_check()` per merchant. Stagger/batch to avoid DB + Claude API spikes.
**Done when:** A new subscriber is automatically monitored with no env/config change.

### A3. Verify Stripe App JWT signatures ⬜
**Problem:** `src/web/api/middleware/stripe_app_auth.py:54` decodes the JWT but accepts it WITHOUT
signature verification in production (logs a CRITICAL and proceeds). `auth.py:35` trusts any
`X-Stripe-Account` string. Net: no tenant isolation — anyone can impersonate any merchant.
**Fix:** Verify JWT against Stripe's JWKS / app secret. Remove the "trust any header string" path in
production. Reject unverified tokens.
**Done when:** A forged token / arbitrary account_id is rejected with 401 in production.

### A4. Fix CORS config ✅
**Problem:** `src/web/api/app.py:69` sets `allow_origins=["*"]` WITH `allow_credentials=True` — illegal
per CORS spec; browsers reject it. Works today only because auth is header-based.
**Fix:** Enumerate allowed origins, OR set `allow_credentials=False` while on header auth.
**Done when:** CORS config is spec-valid and intentional.

---

## PHASE B — Trust (don't lose/leak data; prove the math) 🟠

### B1. Wire alert delivery (email first) ✅
**Problem:** Generated alerts only go to `agent.log`. The merchant never sees them. The notification
IS the product. `SENDGRID_API_KEY` referenced in OPERATIONS but unwired.
**Fix:** Email delivery in the agent loop (Slack/webhook optional). Add a `notified_at` column to
prevent re-sends.
**Done when:** A new RED/CRITICAL alert reliably reaches the merchant once.

### B2. Add automated tests ✅
**Problem:** README advertises `tests/` but none committed. This product registers people for legal
tax obligations — the nexus math must be regression-protected.
**Fix:** Test `get_nexus_status` (`src/agent/db.py:182`) and `NexusEngine`: threshold boundaries
(89/90/100%), revenue-vs-transaction "worse of two", no-sales-tax states (MT/NH/OR/DE/AK), year
rollover, escalation dedup.
**Done when:** CI runs the suite green on every push.

### B3. Stop committing node_modules ✅
**Problem:** `stripe_app/node_modules/**` is checked into git.
**Fix:** Add to `.gitignore`; `git rm -r --cached stripe_app/node_modules`.
**Done when:** Repo is clean; reviewers/acquirers see a lean tree.

### B4. Observability ✅
**Fix:** Wire Sentry (or similar) for error tracking + basic uptime/latency alerts per OPERATIONS
monitoring table. Don't run passive-income SaaS blind.

### B5. Webhook idempotency / reliability ✅
**Fix:** Ensure webhook ingestion is idempotent (Stripe retries) and survives restarts. Verify the
full `tx_id` `INSERT OR REPLACE` path end to end.

---

## PHASE C — Experience (native look, fast onboarding) 🎨

### C1. Replace inline styles with a design system ✅
**Problem:** Entire dashboard styled with inline `style={{}}` (`src/web/dashboard/src/App.jsx`, ~250
lines). Unmaintainable, no theming, no clean hover/focus.
**Fix:** Adopt token-based styling. Since target is the Stripe App Marketplace, prefer Stripe's UI Kit
/ design tokens so the embedded app feels native inside the Stripe Dashboard.

### C2. First-run / empty / loading / offline states ✅
**Problem:** Merchant hardcoded to "platform"; only a binary online/offline dot.
**Fix:** Onboarding wizard (connect Stripe → first sync → nexus map), skeleton loaders, empty states,
graceful degraded states. Goal: merchant sees their real first state number in <60 seconds.

---

## PHASE D — Differentiation (top-of-class) ⭐

### D1. US nexus choropleth map ⬜
States colored green/yellow/red by risk; hover shows the projection. The hero screenshot for the
Marketplace listing + Product Hunt.

### D2. Forward-looking projection ⬜
Not just "you're at $94k" — "at your current 30-day run rate you'll cross Texas nexus ~July 18."
Compute velocity from existing transaction timestamps. Competitors don't have this.

### D3. Exposure estimate ⬜
When a state goes RED, show estimated back-tax exposure. This is the number that drives the FIX click.

### D4. Compliance receipts (audit log as a feature) ⬜
Exportable PDF "compliance receipts" for accountants/auditors. Audit log is already immutable —
package it as peace-of-mind.

---

## Build-phase summary

| Phase | Items | Theme | Gate |
|---|---|---|---|
| A — Foundation | A1–A4 | Safe for >1 real user | **Blocker before public** |
| B — Trust | B1–B5 | Don't lose/leak data; prove math | **Blocker before public** |
| C — Experience | C1–C2 | Native Stripe look, onboarding | Pre-marketing |
| D — Differentiation | D1–D4 | Top-of-class features | Growth |

**Reviewer's note:** Vision and code quality are strong — this is NOT a rewrite. A1–A3 are
non-negotiable before public exposure; everything else is upside.
