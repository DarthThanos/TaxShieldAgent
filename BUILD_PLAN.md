# TaxShieldAgent — Master Build Plan

> This is the living project roadmap. Update it as phases complete. Every session should start here.

**Current Status:** Phase 1 in progress — Core Engine scaffold complete, integration and testing next.

---

## Phase Overview

| Phase | Name | Goal | Status |
|---|---|---|---|
| 0 | Concept & Scaffold | Architecture, docs, skeleton code | COMPLETE |
| 1 | Core Engine | Working nexus detection + alerts | IN PROGRESS |
| 2 | Web Dashboard | UI for merchants to see/act on alerts | PENDING |
| 3 | Stripe App | Package for Stripe Marketplace | PENDING |
| 4 | Launch | Go live, first paying users | PENDING |
| 5 | Scale | Agency tier, white-label, API | PENDING |

---

## Phase 0 — Concept & Scaffold (COMPLETE)

- [x] Define core concept (Economic Nexus detection + $1 fix model)
- [x] Choose tech stack (KDB-X, PyKX, Claude API, FastAPI, Stripe Connect)
- [x] Create project directory structure
- [x] Write comprehensive README.md
- [x] Start CHANGELOG.md
- [x] Write BUSINESS_MODEL.md
- [x] Write OPERATIONS.md
- [x] Write BUILD_PLAN.md (this file)
- [x] Scaffold all code files (stubs + signatures in place)

---

## Phase 1 — Core Engine (IN PROGRESS)

### 1.1 DuckDB Data Layer
- [ ] Run `pip install -r requirements.txt` — verify `duckdb` installs cleanly
- [ ] Run `python src/agent/main.py --sync` with test Stripe key — verify `data/shield.db` is created
- [ ] Open `data/shield.db` in Python REPL and verify `transactions`, `nexus_alerts`, `audit_log` tables exist
- [ ] Insert test row and verify `get_nexus_status()` returns it correctly
- [ ] Verify audit log entries are written on nexus check

### 1.2 Stripe Data Sync
- [ ] Create Stripe test account (or use existing sandbox)
- [ ] Generate Restricted API Key: Read on PaymentIntents + Write on Tax Registrations
- [ ] Test `webhook_handler.py` receives events with correct signature verification
- [ ] Test `main.py --sync` pulls last 100 payments and writes to KDB-X
- [ ] Verify state extraction from `shipping.address.state` and `metadata.state`

### 1.3 Nexus Engine
- [ ] Unit test `nexus_engine.py` against all 50 state thresholds in `nexus_data.py` (test cases for TX $500k, KS $0, OR no tax)
- [ ] Verify risk scoring tiers (GREEN / YELLOW / RED / CRITICAL)
- [ ] Verify "no sales tax states" (MT, NH, OR, DE, AK) are correctly skipped
- [ ] End-to-end test: inject 201 test transactions for TX → should trigger CRITICAL alert

### 1.4 Claude Agent
- [ ] Confirm Anthropic API key works with claude-opus-4-6
- [ ] Test `claude_agent.py` generates correct alert message for TX nexus breach
- [ ] Verify agent cannot call `remediator.py` without `user_confirmed=True`
- [ ] Verify agent reads KDB-X tables (read-only) via `tools.py`

### 1.5 Remediation Flow
- [ ] Test `remediator.py` in Stripe test mode (no real charges)
- [ ] Verify `stripe.tax.Registration.create` call structure is correct
- [ ] Verify $1 application fee only fires when `user_confirmed=True`
- [ ] Verify every remediation is logged to `audit_log` in KDB-X

### 1.6 FastAPI Integration
- [ ] Start FastAPI and hit `/health` endpoint → 200 OK
- [ ] POST to `/webhooks/stripe` with a test event → data lands in KDB-X
- [ ] GET `/dashboard/nexus-status` → returns current state risk table
- [ ] GET `/alerts` → returns list of open alerts
- [ ] POST `/alerts/{id}/confirm-fix` → triggers remediator with `user_confirmed=True`

### Phase 1 Exit Criteria
- [ ] Full end-to-end flow works: Stripe webhook → KDB-X → Nexus detection → Alert → Fix
- [ ] All tests pass (`pytest tests/`)
- [ ] No hardcoded secrets in any file

---

## Phase 2 — Web Dashboard

### 2.1 React Frontend
- [ ] Bootstrap React + Vite app in `src/web/dashboard/`
- [ ] Install Stripe UI Toolkit / Elements
- [ ] Build NexusMap component (US map showing state risk levels — green/yellow/red)
- [ ] Build AlertList component (open alerts with FIX button)
- [ ] Build TransactionFeed component (last 50 transactions from KDB-X)
- [ ] Build AuditLog component (read-only history of all fixes)
- [ ] Wire FIX button → POST `/alerts/{id}/confirm-fix` → confirmation modal → execute

### 2.2 Authentication
- [ ] Implement Stripe Connect OAuth flow for merchant onboarding
- [ ] Store `stripe_account_id` per user session
- [ ] Gate dashboard routes behind valid Stripe Connect session

### 2.3 Notifications
- [ ] Add email alert for CRITICAL nexus breach (SendGrid or Resend)
- [ ] Add in-app toast notifications for new alerts
- [ ] Add "snooze alert" feature (7-day snooze max)

### Phase 2 Exit Criteria
- [ ] Merchant can onboard, see their nexus map, receive alerts, and click FIX
- [ ] Mobile responsive
- [ ] Works in Chrome, Firefox, Safari

---

## Phase 3 — Stripe App Packaging

### 3.1 Stripe App Setup
- [ ] Install Stripe CLI: `stripe apps create taxshieldagent`
- [ ] Configure `stripe-app.json` with required permissions:
  - `payment_intents:read`
  - `tax_registrations:write`
  - `charges:write` (for application fees)
- [ ] Build App UI using Stripe UI Extensions SDK
- [ ] Test App in Stripe Dashboard sandbox
- [ ] Stripe App Store listing copy ready (see `docs/stripe_app_store.md`)

### 3.2 Stripe Connect Platform
- [ ] Wire `src/payments/stripe_connect.py` — replace placeholders
- [ ] Implement Connect onboarding flow (Standard Connect for simplicity)
- [ ] Test application fee on `payment_intent` via connected account
- [ ] Verify fee collection works in Stripe test mode

### 3.3 Subscription Billing
- [ ] Wire `src/payments/subscriptions.py` — replace placeholders
- [ ] Create Stripe Products + Prices for Free/Pro/Agency tiers
- [ ] Implement plan enforcement middleware (feature flags per tier)
- [ ] Test upgrade/downgrade flow

### Phase 3 Exit Criteria
- [ ] App installable from Stripe Dashboard by any merchant
- [ ] Subscriptions billing correctly
- [ ] Application fees collected on every $1 fix

---

## Phase 4 — Launch

### 4.1 Infrastructure
- [ ] Deploy to Railway (or Render): `railway up`
- [ ] Configure production environment variables
- [ ] Set up Stripe live-mode webhooks pointing to production URL
- [ ] Verify DuckDB `data/shield.db` is written to a persistent Railway volume (not ephemeral)
- [ ] Configure daily `shield.db` file backup to S3 or Railway volumes

### 4.2 Submit to Stripe App Marketplace
- [ ] Complete Stripe App Review checklist
- [ ] Submit app for review (typically 2–4 week review period)
- [ ] Prepare support documentation

### 4.3 Pre-Launch Marketing
- [ ] Post on r/entrepreneur, r/ecommerce, r/stripe
- [ ] Launch on Product Hunt
- [ ] Reach out to 10 Stripe merchants directly (LinkedIn / X)
- [ ] Write 1 SEO blog post: "How to know if you owe sales tax in every US state"
- [ ] Set up simple landing page (can be README rendered via GitHub Pages)

### Phase 4 Exit Criteria
- [ ] App live in Stripe Marketplace
- [ ] First 5 paying users on Pro plan
- [ ] Revenue > $50/month

---

## Phase 5 — Scale

- [ ] Agency tier fully implemented (multi-merchant dashboard)
- [ ] White-label option (custom branding for accounting firms)
- [ ] Public REST API with API key management
- [ ] Avalara / TaxJar integration as alternative fix provider
- [ ] Automated quarterly nexus report generation (PDF export)
- [ ] Expand beyond US (Canada GST/HST nexus — future)
- [ ] Revenue > $500/month passive

---

## Ongoing / Evergreen Tasks

- [ ] Keep `nexus_data.py` up to date as states change thresholds
- [ ] Monitor Stripe API changelog for Tax Registration API updates
- [ ] Review audit logs monthly for anomalies
- [ ] Respond to Stripe App Store reviews

---

## Key Milestones

| Milestone | Target Date | Revenue Target |
|---|---|---|
| Phase 1 complete | 2026-04-26 | $0 |
| Phase 2 complete | 2026-05-10 | $0 |
| Stripe App submitted | 2026-05-17 | $0 |
| First paying user | 2026-06-01 | $9.99 |
| 10 Pro users | 2026-07-01 | ~$100/mo |
| 50 Pro users | 2026-10-01 | ~$500/mo |
| 100 users (mix) | 2027-01-01 | ~$1,200/mo |
