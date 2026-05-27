# Changelog

All notable changes to TaxShieldAgent will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.5.0] — 2026-05-27

### Removed — Connect Dependency (Marketplace Compliance Refactor)

**Why:** Stripe does not allow Connect platform accounts to publish to the public
Marketplace. The $1 per-registration fee was the sole reason Connect was required.
Removing it unblocks Marketplace submission from the original account with no
second account needed. Monetisation moves to a clean subscription model.

**What changed:**
- `stripe-app.json` — removed `charge_write` permission, bumped version to 0.5.0
- `remediator.py` — removed `charge_fix_fee()` and `platform_account_id`; tax
  registration logic unchanged
- `stripe_connect.py` — removed Connect OAuth functions (`generate_connect_oauth_url`,
  `exchange_oauth_code`, `get_account_details`); subscription billing retained
- `subscriptions.py` routes — removed `$1.00 per state registration` fix_fee from
  plan listing; replaced with `included in plan`
- `.env.example` — removed `STRIPE_PLATFORM_KEY`, `STRIPE_CONNECT_CLIENT_ID`,
  `STRIPE_REDIRECT_URI` (Connect-only vars)
- `stripe_app_auth.py` — renamed source label from `stripe_connect_header` to
  `stripe_app_header`

**What did NOT change:**
- All nexus monitoring, alerting, and detection logic — untouched
- Tax registration via `stripe.tax.Registration.create` — untouched
- Subscription billing (Pro/Agency) — untouched
- All connectors (Shopify, PayPal, Square, Etsy, Amazon) — untouched
- Audit log and PDF export — untouched

### Unreleased / Planned
- Email/SMS alert notifications (SendGrid/Resend)
- Amazon SP-API native connector (replace CSV import)

---

## [0.4.4-submission-ready] — 2026-04-12

### Added — Stripe App Registration + Submission Automation
- `scripts/stripe_submit.bat` — double-click Windows batch script that handles the entire submission flow end-to-end:
  1. Detects if Stripe CLI is installed; auto-installs via `winget` if missing
  2. Handles `stripe login` (opens browser OAuth)
  3. Runs `npm install` in `stripe_app/` to pull UI extension dependencies
  4. Runs `stripe apps validate` — aborts with clear error if manifest fails
  5. Runs `stripe apps upload` — registers TaxShieldAgent on Stripe's servers for the first time and uploads the UI extension bundle
  - Clear error messages for every failure mode (CLI not found, npm missing, login failed, ID conflict)
- `stripe_app/tsconfig.json` — TypeScript compiler config for the UI extension (ES2020, strict mode, react-jsx, bundler module resolution)
- `stripe_app/package.json` — updated version to `0.4.2`, pinned `@stripe/ui-extension-sdk` to `latest`, added `@types/react` and `typescript` dev dependencies

### Fixed
- `stripe_app/src/config.ts` — single source of truth for `BACKEND_URL`
- `stripe_app/src/views/NexusOverview.tsx` — imports `BACKEND_URL` from config
- `stripe_app/src/views/PaymentNexusDetail.tsx` — imports `BACKEND_URL` from config, full try/catch with Banner error state
- `stripe-app.json` — all localhost URLs removed, CSP is production-only, version bumped to `0.4.2`, permission purposes expanded with exact API call descriptions

### How to Submit
```
Double-click: scripts\stripe_submit.bat
```
That's it. Script handles everything. After it completes, go to `dashboard.stripe.com/test/apps/dev`, click TaxShieldAgent → Distribution → Submit for Review.

### Still Required Before Review Approval (not code)
- Backend deployed to `https://api.taxshieldagent.com` (Railway — see `OPERATIONS.md`)
- Privacy policy live at `https://taxshieldagent.com/privacy`
- Screenshots of the dashboard panel for the listing (5 screenshots)

---

## [0.4.3-stripe-review-ready] — 2026-04-12

### Added — Stripe App Marketplace Submission Fixes
- `stripe_app/src/config.ts` — single source of truth for `BACKEND_URL`

### Fixed — Stripe Review Blockers
- `stripe_app/src/views/NexusOverview.tsx` — removed hardcoded `localhost:8001`
- `stripe_app/src/views/PaymentNexusDetail.tsx` — removed hardcoded `localhost:8001`, added full `try/catch` with Banner error display
- `stripe-app.json` — removed localhost from CSP, fixed post_install URL to HTTPS, updated version to `0.4.2`, expanded permission purpose strings
- `docs/stripe_app_submission_checklist.md` — added Code Audit Status table

---

## [0.4.2-billing-live] — 2026-04-12

### Added — Subscription Billing End-to-End
- `scripts/setup_stripe_products.py` — one-command Stripe Product + Price creation for all 4 tiers (Pro Monthly, Pro Annual, Agency Monthly, Agency Annual). Prints Price IDs and auto-patches `.env`. Run with full secret key (`sk_test_...`), handles restricted key detection with a clear error.
- `merchant_subscriptions` table in DuckDB (`src/agent/db.py`) — tracks merchant tier, Stripe subscription ID, and status (`active` / `cancelling`)
- `db.upsert_subscription()`, `db.get_subscription()`, `db.cancel_subscription()` — full lifecycle DB methods
- `src/web/api/routes/subscriptions.py` — 4 new REST endpoints:
  - `GET /subscriptions/current` — merchant's active plan, limits, feature flags
  - `POST /subscriptions/upgrade` — create Stripe Subscription + persist to DB
  - `POST /subscriptions/cancel` — cancel at period end + mark DB status
  - `GET /subscriptions/plans` — static pricing table for all tiers
- Subscriptions router wired into `src/web/api/app.py` (32 total routes)

### Fixed
- `src/payments/subscriptions.py` — `get_merchant_plan()` now does a real DuckDB lookup instead of always returning FREE. Gracefully falls back to FREE on any DB error.
- `src/payments/stripe_connect.py` — Price IDs and OAuth Client ID now read at call-time (not module load time), so `.env` changes take effect without a server restart
- `src/payments/stripe_connect.py` — OAuth URL builder reads `STRIPE_CONNECT_CLIENT_ID` and `STRIPE_REDIRECT_URI` from env at call-time
- `src/payments/stripe_connect.py` — env var precedence: `STRIPE_CONNECT_CLIENT_ID` → `STRIPE_CLIENT_ID` (matches `.env` key name)

### Status
- $1 registration fee: **LIVE** (wired in v0.4.1)
- Subscription billing: **LIVE** (this release — needs Stripe Products created via `scripts/setup_stripe_products.py`)
- Stripe App Marketplace submission: **READY** (follow `docs/stripe_app_submission_checklist.md`)
- Next step: run `python scripts/setup_stripe_products.py --key sk_test_YOUR_KEY` to create Products, then restart API

---

## [0.4.1-launch-ready] — 2026-04-12

### Added
- `stripe_app/icon.png` — 256x256 PNG app icon (navy background, indigo shield, TS + checkmark)
- `stripe_app/create_icon.py` — script to regenerate icon if needed (`python stripe_app/create_icon.py`)
- `docs/OWNER_OPERATIONS_GUIDE.md` — owner's daily/monthly playbook (start commands, revenue tracking, troubleshooting)
- `docs/END_USER_GUIDE.md` — merchant-facing guide (plain English nexus explainer, 5-step setup, platform connection steps, FAQ)
- `docs/MARKETING_PLAN.md` — zero-ad-spend GTM plan (5 channels, launch week day-by-day, 90-day revenue targets, $500/mo MRR roadmap)

### Status
- All Stripe App submission blockers resolved
- Icon: DONE
- Manifest: DONE
- UI Extension: DONE
- App Store listing copy: DONE
- Submission checklist: DONE
- Next step: follow `docs/stripe_app_submission_checklist.md`

---

## [0.4.0-stripe-app] — 2026-04-12

### Added — Phase 3: Stripe App Packaging
- `stripe-app.json` — Stripe App manifest with permissions: `payment_intents_read`, `tax_registrations_write`, `charges_write`. Two UI viewports: dashboard home overview + payment detail panel
- `stripe_app/src/views/NexusOverview.tsx` — embedded Stripe Dashboard panel: fetches nexus status, green all-clear or risk banner, at-risk state list, inline FIX $1 confirmation flow, Connect More Platforms button
- `stripe_app/src/views/PaymentNexusDetail.tsx` — per-payment nexus impact panel (state, sales vs threshold, risk badge)
- `stripe_app/src/index.ts` — barrel exports for UI components
- `stripe_app/package.json` — Stripe UI Extension SDK dependency config
- `stripe_app/ICON_NEEDED.md` — icon spec (256x256 PNG, indigo #6366f1, required before submission)
- `src/web/api/middleware/stripe_app_auth.py` — Stripe App JWT verification (dev: passthrough with warning, prod: enforce)
- `src/web/api/routes/stripe_app.py` — `/stripe-app/` router: health, nexus-summary (lightweight panel endpoint), post-install callback
- `src/web/api/routes/stripe_app_config.py` — `BACKEND_URL` and `STRIPE_APP_ID` constants
- `docs/stripe_app_store.md` — complete Stripe App Marketplace listing copy (pain-first narrative, features, pricing, 5 screenshot descriptions, privacy summary)
- `docs/stripe_app_submission_checklist.md` — 11-section submission checklist (CLI setup, manifest validation, permissions table, privacy, review timeline, rejection mitigations)

### Fixed
- `ReadMe.md` — replaced stale "KDB-X tables" reference with "DuckDB database"
- `stripe_app` router wired into `app.py` (28 total routes now registered)

### Verified
- `GET /stripe-app/health` → 200 OK
- `GET /stripe-app/nexus-summary` → returns 4 at-risk states (PA RED 96%, CA YELLOW 82%, NY YELLOW 76%, FL YELLOW 78%)
- All 28 API routes registered and responding

---

## [0.3.1-stress-tested] — 2026-04-12

### Added
- `tests/stress_test.py` — full end-to-end stress test suite (7 tests)

### Stress Test Results — ALL PASSED
| Test | Result | Key Metric |
|---|---|---|
| Volume Insert — 1,000 transactions | PASS | 5.61s |
| Nexus Detection Accuracy — all 50 states | PASS | KS $0 threshold, OR no-tax, correct risk levels |
| Concurrent API Load — 50 simultaneous requests | PASS | avg 152ms, max 253ms, 0 failures |
| Edge Cases — null state, $0 amount, duplicates, lowercase | PASS | All handled gracefully |
| Multi-Platform Aggregation — Shopify+Etsy+Stripe+Amazon TX | PASS | Cross-platform totals correct |
| Alert Deduplication — 3x repeat checks | PASS | Exactly 1 alert per state, no duplicates |
| Performance — 10,000 transactions | PASS | Aggregation query: 4ms |

### Archived
- `F:/TaxShieldAgent_v0.3.0.zip` — snapshot with CHANGELOG, all source, excludes .env and node_modules
- Stripe Connect billing wired up
- Email/SMS alert notifications
- Amazon SP-API native connector

---

## [0.3.0-dashboard] — 2026-04-12

### Added
- Full React + Vite dashboard (`src/web/dashboard/`)
- `src/api/client.js` — centralized API client, all 18 backend endpoints
- `App.jsx` — dark sidebar layout, React Router, mobile-responsive, backend status indicator
- `pages/Dashboard.jsx` — 4 stat cards, color-coded state risk grid, risk table with FIX actions
- `pages/Alerts.jsx` — expandable alert cards, Claude AI explanation on demand, FIX confirmation modal ($1 flow), 7-day snooze
- `pages/Platforms.jsx` — connect/disconnect all 6 platforms, per-platform credential forms, Amazon CSV upload, Sync All button
- `pages/Transactions.jsx` — filterable transaction table with platform badges
- `pages/Audit.jsx` — audit log page scaffold
- `components/RiskBadge.jsx` — GREEN/YELLOW/RED/CRITICAL color badges
- `components/PlatformBadge.jsx` — per-platform colored badges
- `components/ConfirmModal.jsx` — reusable confirmation modal
- `components/Toast.jsx` — success/error toast notifications
- `components/StatCard.jsx` — summary stat cards
- `components/LoadingSpinner.jsx` — loading states
- Vite proxy config — dev server on port 3000, proxies API calls to port 8000

### Verified
- `npm run build` — 271 KB bundle, 0 errors, builds in 327ms
- Multi-state alert batching
- Email/SMS notification delivery
- Amazon SP-API native connector (replacing CSV import)

---

## [0.2.0-multi-platform] — 2026-04-12

### Added
- `src/connectors/` — full multi-platform connector architecture
  - `base.py` — `TransactionRecord` dataclass + `BaseConnector` ABC with shared state extraction and sync utilities
  - `stripe_connector.py` — Stripe PaymentIntents connector
  - `shopify_connector.py` — Shopify REST Admin API connector with OAuth helpers and Link-header pagination
  - `etsy_connector.py` — Etsy Open API v3 connector with full state name→code normalization and offset pagination
  - `paypal_connector.py` — PayPal Reporting API connector with 31-day window chunking and OAuth token caching
  - `square_connector.py` — Square Orders Search API connector with cursor pagination
  - `amazon_csv.py` — Amazon CSV import (Date Range Report + All Orders Report formats) as bridge for SP-API rate limits
  - `registry.py` — connector factory and `SUPPORTED_PLATFORMS` list
  - `sync_orchestrator.py` — orchestrates sync across all connected platforms per merchant
- `src/web/api/routes/connectors.py` — REST endpoints for connecting/disconnecting platforms, triggering syncs, and Amazon CSV upload
- `connected_platforms` table added to DuckDB schema
- `source_platform` column added to `transactions` table
- `get_nexus_status_by_platform()` — per-state nexus breakdown with platform attribution
- Connectors router wired into FastAPI app

### Fixed
- `load_dotenv(find_dotenv(usecwd=True), override=True)` in `main.py` and `app.py` — resolves `.env` not loading on Windows when running from project root
- Stripe v15 API compatibility: `Webhook.construct_event()`, direct keyword args on `tax.Registration.create()`
- `src/__init__.py` added — required for absolute `src.*` imports

### Verified Working
- DuckDB creates and queries correctly on Windows
- Nexus engine fires RED alert at 96% threshold (PA $96k / $100k)
- Claude API (claude-opus-4-6) generates real compliance alert messages
- FastAPI `/health` returns 200 with db connected status
- All 6 platform connectors pass syntax and import checks

---

## [0.1.0-scaffold] — 2026-04-12

### Added
- Project scaffold: full directory structure established
- `ReadMe.md` — comprehensive product README with feature table, architecture diagram, quick start, and revenue model
- `CHANGELOG.md` — this file
- `BUILD_PLAN.md` — phased development roadmap with milestone-based todo list
- `BUSINESS_MODEL.md` — pricing tiers, payment plan structure, Stripe App Store GTM strategy
- `OPERATIONS.md` — deployment guide covering local dev, Docker, and Railway production
- `src/kdb/shield.q` — KDB-X living table schema, nexus aggregation, upsert logic
- `src/kdb/nexus_rules.q` — 50-state economic nexus threshold rules
- `src/kdb/audit.q` — immutable audit log table and query functions
- `src/agent/nexus_data.py` — complete 50-state threshold database (revenue + transaction counts)
- `src/agent/nexus_engine.py` — core nexus detection logic with risk scoring
- `src/agent/claude_agent.py` — Claude API (claude-opus-4-6) integration for compliance reasoning
- `src/agent/tools.py` — agent tools wrapping KDB-X queries
- `src/agent/remediator.py` — Stripe Tax Registration API integration (human-approved only)
- `src/agent/webhook_handler.py` — Stripe webhook ingestion with signature verification
- `src/agent/main.py` — entry point: sync mode and agent loop mode
- `src/payments/stripe_connect.py` — Stripe Connect platform setup (PLACEHOLDER — wire up before launch)
- `src/payments/subscriptions.py` — plan tier management Free/Pro/Agency (PLACEHOLDER)
- `src/payments/billing.py` — $1 application fee logic (PLACEHOLDER)
- `src/web/api/app.py` — FastAPI application scaffold
- `src/web/api/routes/` — webhook, dashboard, alert route scaffolds
- `src/web/api/middleware/auth.py` — Stripe Connect auth middleware
- `.env.example` — all required environment variables documented
- `docker-compose.yml` — full local dev stack
- `requirements.txt` — pinned Python dependencies

### Architecture Decisions
- **Replaced KDB-X with DuckDB**: KDB-X Community license is machine-locked and non-portable — can't clone and run on another machine without re-registering. DuckDB is MIT licensed, embedded (no server), single `.db` file, fully portable, and more than fast enough for sales tax aggregations. This was the right call.
- Switched AI provider from Gemini to Claude (claude-opus-4-6) for superior structured-data reasoning
- Stripe Connect chosen over direct billing for zero-friction merchant onboarding
- Human-in-the-loop safety model: AI suggests, human confirms, system acts

---

## [0.0.1-concept] — 2026-02-02

### Added
- `ShieldAgent.md` — original build blueprint (KDB-X scaffold, PyKX bridge, Gemini agent concept)
- `ReadMe.md` (original) — developer manifest with file-by-file instructions

### Notes
- Initial concept documented. Tech stack validated. Monetization model identified.
