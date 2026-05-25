# TaxShieldAgent — Implementation Guide
# Optimized for Haiku (mechanical) + Sonnet (logic) execution

> Read `.claude/PHASE_PLAN.md` for the WHY behind each item.
> This file is the HOW — session-by-session, model-by-model.
>
> Every session ends at a COMMIT BOUNDARY. Only commit when tested.
> Update PHASE_PLAN.md status markers (🟡/✅) as you go.

---

## HOW TO START ANY SESSION

Paste this into the chat:
> "Read CLAUDE.md and .claude/IMPL_GUIDE.md. We are working on [SESSION NAME].
> Execute that session's steps exactly."

That's all Haiku or Sonnet needs to pick up context cold.

---

## PHASE A — Foundation
### (All 4 items are launch blockers — do these before anything else)

---

### SESSION A1 — Single shared DB connection
**Model: SONNET**
**Touches:** `src/agent/db.py`, `src/web/api/app.py`, `src/web/api/routes/dashboard.py`,
`src/web/api/routes/alerts.py`, `src/web/api/routes/connectors.py`,
`src/web/api/routes/subscriptions.py`, `src/web/api/routes/stripe_app.py`

**What to build:**
1. In `app.py` `lifespan()`: open ONE `ShieldDB` instance, store on `app.state.db`. Close it on shutdown.
2. Create a FastAPI dependency `get_db()` in a new file `src/web/api/deps.py` that returns `request.app.state.db`.
3. In every route file: replace the local `get_db()` function + `Depends(get_db)` import with the shared one from `deps.py`. Remove all `db.close()` calls from route handlers (lifetime is now app-scoped).
4. Remove `initialize_schema()` call from `ShieldDB.__init__`. It now lives in `lifespan()` only (called once at startup via `app.state.db`).
5. The agent loop (`src/agent/main.py`) already creates its own `ShieldDB` — that's fine for now (it's a separate process). Leave it; fix in Session A2.

**Verify before commit:**
```bash
uvicorn src.web.api.app:app --reload --port 8000
# Hit /health 10 times fast — no errors, no lock warnings
# Check logs: "Database schema initialised" appears exactly ONCE on startup
```
**Commit message:** `fix(db): single shared connection, schema init once at startup`

---

### SESSION A2 — Multi-tenant agent loop
**Model: SONNET**
**Touches:** `src/agent/main.py`, `src/agent/nexus_engine.py`

**What to build:**
1. In `main.py` `run_agent()`: remove the hardcoded `merchant_id = os.getenv("MERCHANT_ID")` lookup.
2. Add `db.get_all_active_merchants()` call at the top of each loop iteration.
3. Iterate: for each merchant run `nexus_engine.run_check(merchant_id)`.
4. Add `get_all_active_merchants()` method to `ShieldDB` in `db.py`:
   ```sql
   SELECT DISTINCT merchant_id FROM merchant_subscriptions WHERE status = 'active'
   UNION
   SELECT DISTINCT merchant_id FROM connected_platforms WHERE status = 'active'
   ```
5. Add a 1-second sleep between merchants to avoid API spikes.
6. Keep `MERCHANT_ID` env var as an override for single-merchant dev mode.

**Verify before commit:**
```bash
# Insert two test merchant rows in data/shield.db:
python -c "
from src.agent.db import ShieldDB
db = ShieldDB()
db.upsert_subscription('acct_test1','pro','sub_fake1')
db.upsert_subscription('acct_test2','pro','sub_fake2')
db.close()
"
# Run agent loop once:
python src/agent/main.py --run-agent
# Confirm logs show check running for BOTH merchants
```
**Commit message:** `fix(agent): multi-tenant loop — check all active merchants`

---

### SESSION A3 — JWT signature verification
**Model: SONNET**
**Touches:** `src/web/api/middleware/stripe_app_auth.py`

**What to build:**
1. Add `pip install PyJWT cryptography` to `requirements.txt`.
2. In `verify_stripe_app_token()`: in production mode, fetch Stripe's JWKS from
   `https://dashboard.stripe.com/api/s/auth/.well-known/jwks.json`, cache the keys
   (module-level dict, refresh every hour), and use `jwt.decode()` with the matching key.
3. If signature verification fails, return `None` (caller already handles None as 401).
4. Remove the `logger.critical(...)` + "accepting without verification" block — replace with
   a clean `logger.debug("Stripe App JWT verified for account_id=%s", ...)`.
5. In `auth.py`: in production, remove the "trust any X-Stripe-Account string" path.
   Accept ONLY verified JWT payloads for `account_id`.

**Verify before commit:**
```bash
# Test with a forged token in APP_ENV=production:
curl -H "Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJhY2NvdW50X2lkIjoiYWNjdF9oYWNrZWQifQ.fakesig" \
  http://localhost:8000/dashboard/summary
# Must return 401, not data
```
**Commit message:** `fix(auth): verify Stripe App JWT signatures in production`

---

### SESSION A4 — Fix CORS config
**Model: HAIKU** ← small, exact, no judgment needed
**Touches:** `src/web/api/app.py`

**Exact change:**
Find this block:
```python
_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
```
Replace with:
```python
_origins = (
    os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
    if os.getenv("CORS_ALLOWED_ORIGINS")
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,  # header-based auth, not cookies
```

Also add to Railway env vars (add to OPERATIONS.md too):
```
CORS_ALLOWED_ORIGINS=https://your-railway-domain.up.railway.app,https://dashboard.stripe.com
```

**Verify before commit:**
```bash
# Confirm app starts, /health returns 200
uvicorn src.web.api.app:app --port 8000
curl http://localhost:8000/health
```
**Commit message:** `fix(cors): spec-valid config, header auth does not need allow_credentials`

---

## PHASE B — Trust

---

### SESSION B1 — Email alert delivery
**Model: SONNET** (logic) then **HAIKU** (wiring)

**Part 1 — Sonnet:** Design the delivery flow in `src/agent/notifier.py` (new file):
- `send_alert_email(merchant_id, alerts: list[dict])` using SendGrid.
- HTML email: state, risk level, $ amount, % of threshold, one sentence from Claude.
- Idempotent: check `notified_at` column (add to `nexus_alerts` table) before sending.
- Fallback: if no SendGrid key, log a warning and skip (don't crash the loop).

**Part 2 — Haiku:** Wire it in:
1. Add `notified_at TIMESTAMP` column migration to `ShieldDB.initialize_schema()`.
2. In `main.py` `run_agent()`, after generating alert messages, call `notifier.send_alert_email()`.
3. Add `SENDGRID_API_KEY` and `ALERT_FROM_EMAIL` to OPERATIONS.md env table.
4. Add `sendgrid` to `requirements.txt`.

**Verify before commit:**
```bash
# Set SENDGRID_API_KEY, trigger a fake RED alert, confirm email received.
# Without key set: confirm agent loop still runs without crashing.
```
**Commit message:** `feat(notifications): email delivery for RED/CRITICAL nexus alerts`

---

### SESSION B2 — Automated tests
**Model: HAIKU** (write stubs + fixtures) **+ SONNET** (review/fill logic)

**Haiku creates** `tests/test_nexus_engine.py` with these test cases (as stubs):
- `test_green_below_75pct` — sales at 74% → risk GREEN
- `test_yellow_at_75pct` — sales at 75% → risk YELLOW
- `test_red_at_90pct` — sales at 90% → risk RED
- `test_critical_at_100pct` — sales at 100% → risk CRITICAL
- `test_tx_count_worse_than_revenue` — low $ but 201 transactions → CRITICAL by count
- `test_no_tax_state_ignored` — Montana sales → not in results
- `test_year_rollover` — last year's sales don't count toward this year
- `test_escalation_no_dupe` — existing YELLOW alert → don't create second YELLOW

**Haiku also creates** `tests/conftest.py` with an in-memory DuckDB fixture:
```python
import pytest
from src.agent.db import ShieldDB

@pytest.fixture
def db():
    db = ShieldDB(db_path=":memory:")
    yield db
    db.close()
```

**Sonnet fills in** the actual test logic after stubs are written.

**Verify before commit:**
```bash
pytest tests/ -v
# All 8 tests green
```
**Commit message:** `test: nexus threshold + escalation boundary tests`

---

### SESSION B3 — Clean node_modules from git
**Model: HAIKU**
**Exact commands:**
```bash
# Add to .gitignore
echo "stripe_app/node_modules/" >> .gitignore

# Remove from git tracking (keep local files)
git rm -r --cached stripe_app/node_modules

# Commit
git add .gitignore
git commit -m "chore: remove committed node_modules, add to gitignore"
```
No code changes. No verification needed beyond `git status` showing clean.

---

### SESSION B4 — Sentry wiring
**Model: HAIKU**
**Touches:** `src/web/api/app.py`, `src/agent/main.py`, `requirements.txt`

1. Add `sentry-sdk[fastapi]` to `requirements.txt`.
2. In `app.py` top of file (after env load):
```python
import sentry_sdk
if dsn := os.getenv("SENTRY_DSN"):
    sentry_sdk.init(dsn=dsn, traces_sample_rate=0.2)
```
3. Same pattern in `main.py`.
4. Add `SENTRY_DSN` to OPERATIONS.md env table (optional).

**Verify before commit:**
```bash
# App starts without SENTRY_DSN set — no error
uvicorn src.web.api.app:app --port 8000
curl http://localhost:8000/health   # 200 ok
```
**Commit message:** `feat(observability): Sentry error tracking, opt-in via SENTRY_DSN`

---

## PHASE C — Experience

### SESSION C1 — Design system migration
**Model: SONNET**
Full Tailwind CSS migration of `src/web/dashboard/src/`. Replace all inline `style={{}}` with
Tailwind classes. Introduce a `src/web/dashboard/src/design/tokens.js` for colors/spacing.
This is a significant but purely cosmetic refactor — no logic changes.
*(Detailed breakdown warranted — open a new Sonnet session dedicated to this alone.)*

### SESSION C2 — Onboarding wizard + empty/loading states
**Model: SONNET**
New `src/web/dashboard/src/pages/Onboarding.jsx`. Steps: (1) connect Stripe, (2) first sync,
(3) nexus map reveal. Skeleton loaders for all existing pages. Empty states for Alerts/Transactions.

---

## PHASE D — Differentiation

### SESSION D1 — US nexus choropleth map
**Model: SONNET**
Add `react-simple-maps` or `d3`. New `NexusMap` component. Feed it `get_nexus_status()` data.
Color scale: green < 75%, yellow 75–90%, red 90–100%, critical 100%+. Hover shows $ + projection.

### SESSION D2 — Forward velocity projection
**Model: SONNET**
New method `db.get_nexus_velocity(merchant_id, state)` — computes 30-day rolling $ per day.
New endpoint `/dashboard/projections`. Returns: `{"state": "TX", "projected_nexus_date": "2026-07-18"}`.
Display in dashboard + NexusMap tooltip.

### SESSION D3 — Exposure estimate
**Model: HAIKU** (formula is simple once inputs known)
On RED/CRITICAL alert: estimate back-tax exposure = `total_sales * avg_state_rate * 1.25` (25% penalty).
State tax rates → add to `nexus_data.py`. Show on alert card.

### SESSION D4 — Compliance receipt PDF export
**Model: HAIKU**
Add `reportlab` or `weasyprint` to requirements. New endpoint `/audit/export-pdf`.
Template: header, merchant ID, date range, table of all audit actions, footer with disclaimer.

---

## QUICK REFERENCE — Model assignment

| Task type | Model |
|---|---|
| Architecture, security, complex rewrites | **Sonnet** |
| Multi-tenant loop design | **Sonnet** |
| JWT/auth security code | **Sonnet** |
| One-line config fixes | **Haiku** |
| Find/replace across files (exact pattern given) | **Haiku** |
| Writing test stubs from a spec | **Haiku** |
| Boilerplate from a template | **Haiku** |
| Adding a package + env var hookup | **Haiku** |
| Git operations | **Haiku** |
| New React page (logic-heavy) | **Sonnet** |
| New React component (template-like) | **Haiku** |
