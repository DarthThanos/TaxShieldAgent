# TaxShieldAgent — Operations Guide

> This guide covers everything needed to run TaxShieldAgent in development and production. Read this before touching any code.

---

## System Requirements

| Component | Minimum | Recommended |
|---|---|---|
| Python | 3.11 | 3.12 |
| RAM | 2 GB | 4 GB |
| Disk | 1 GB | 10 GB |
| OS | Linux/macOS/Windows/WSL2 | Ubuntu 22.04 LTS |

> **No external database required.** DuckDB is embedded in Python — `pip install duckdb` is all you need. The database is a single portable `.db` file.

---

## Environment Variables

All secrets live in `.env`. Never commit this file. Copy `.env.example` to get started:

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description | Where to Get It |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API key | console.anthropic.com |
| `STRIPE_SECRET_KEY` | Stripe restricted key (read txns + write tax) | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe Dashboard → Webhooks |
| `STRIPE_PLATFORM_KEY` | Platform/Connect secret key | Stripe Dashboard (Connect account) |
| `DB_PATH` | DuckDB file path | `data/shield.db` (default) |
| `APP_ENV` | Environment | `development` or `production` |
| `APP_SECRET_KEY` | FastAPI session secret | Generate with `openssl rand -hex 32` |

### Optional Variables

| Variable | Description | Default |
|---|---|---|
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for Pro Monthly | (set after Stripe Products created) |
| `STRIPE_AGENCY_PRICE_ID` | Stripe Price ID for Agency Monthly | (set after Stripe Products created) |
| `SENDGRID_API_KEY` | Email alerts (Phase 2) | — |
| `NEXUS_CHECK_INTERVAL` | Seconds between nexus checks | `900` (15 min) |
| `ALERT_THRESHOLD_PCT` | % of nexus limit to start alerting | `0.90` (90%) |

---

## Local Development Setup

### Step 1: KDB-X Installation

1. Download KDB-X Community from kx.com (requires free registration)
2. Place the `q` binary on your PATH
3. Verify: `q --version` should print the KDB-X version

### Step 2: Python Environment

```bash
cd TaxShieldAgent/
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 3: Initial Data Sync

DuckDB initializes automatically on first run — no server to start.

```bash
# Pulls last 100 PaymentIntents from Stripe and populates data/shield.db
python src/agent/main.py --sync
```

### Step 4: Start the Agent Loop

```bash
# Runs nexus checks every 15 minutes (configurable via NEXUS_CHECK_INTERVAL)
python src/agent/main.py --run-agent
```

### Step 5: Start the Web API

Open a new terminal:
```bash
uvicorn src.web.api.app:app --reload --port 8000
```

### Step 6: Test Webhooks Locally (Stripe CLI)

```bash
stripe listen --forward-to localhost:8000/webhooks/stripe
```

API is now live at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

---

## Docker Setup (Recommended for Dev Parity)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

### Services in docker-compose.yml

| Service | Port | Description |
|---|---|---|
| `api` | 8000 | FastAPI web server |
| `agent` | — | Python agent loop (nexus checks every 15 min) |

Both services share the `./data` volume — they read/write the same `shield.db` file. No separate database container needed.

---

## API Endpoints

All endpoints return JSON. Auth via Stripe Connect session token (header: `X-Stripe-Account`).

### Health
```
GET /health
→ {"status": "ok", "kdb": "connected", "stripe": "connected"}
```

### Dashboard
```
GET /dashboard/nexus-status
→ List of states with current sales totals and risk levels

GET /dashboard/summary
→ Total sales YTD, states at risk, alerts pending
```

### Alerts
```
GET /alerts
→ List of open nexus alerts

GET /alerts/{alert_id}
→ Single alert detail with AI explanation

POST /alerts/{alert_id}/confirm-fix
→ Execute state registration + charge $1 fee
Body: {"user_confirmed": true}

POST /alerts/{alert_id}/snooze
→ Snooze alert for 7 days
Body: {"days": 7}
```

### Webhooks
```
POST /webhooks/stripe
→ Receives Stripe events (PaymentIntent.succeeded, etc.)
→ Protected by Stripe webhook signature verification
```

---

## DuckDB Operations

DuckDB is embedded — no server process. The database is a single file at `data/shield.db`.

### Inspect the Database (Python REPL)

```python
import duckdb
con = duckdb.connect("data/shield.db")

# Check transaction count
con.execute("SELECT COUNT(*) FROM transactions").fetchone()

# Check current nexus risks by state
con.execute("""
    SELECT state, SUM(amount) as total_sales, COUNT(*) as tx_count
    FROM transactions
    WHERE YEAR(created_at) = YEAR(CURRENT_DATE)
    GROUP BY state ORDER BY total_sales DESC
""").df()

# View audit log
con.execute("SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 20").df()

# View open alerts
con.execute("SELECT * FROM nexus_alerts WHERE status = 'open'").df()
```

### Backup
```bash
# DuckDB backup — just copy the file
cp data/shield.db backups/shield-$(date +%Y%m%d).db
```

### Reset (dev only — NEVER in production)
```bash
rm data/shield.db
# Database recreates on next app start
```

---

## Production Deployment (Railway)

### Initial Deploy

1. Push code to GitHub
2. Create new Railway project → "Deploy from GitHub"
3. Add environment variables in Railway dashboard
4. Railway will auto-detect and deploy

### Railway Services to Create

1. **api** — FastAPI app (`uvicorn src.web.api.app:app --host 0.0.0.0 --port $PORT`)
2. **agent** — Python agent loop (`python src/agent/main.py --run-agent`)
3. **kdbx** — KDB-X (use custom Dockerfile in `src/kdb/`)

### Production Checklist

- [ ] `APP_ENV=production` is set
- [ ] KDB-X data volume is persistent (not ephemeral)
- [ ] Stripe live-mode keys are set (not test keys)
- [ ] Stripe webhook endpoint is pointing to production URL
- [ ] Webhook secret matches production endpoint
- [ ] Daily KDB-X backup job is configured
- [ ] Sentry or similar error tracking is wired up

---

## Monitoring

### What to Watch

| Metric | Warning | Critical |
|---|---|---|
| KDB-X connection | > 2 retries | Connection refused |
| Webhook ingestion lag | > 5 min | > 30 min |
| Agent loop runtime | > 60 sec | > 5 min |
| Claude API latency | > 3 sec | > 10 sec |
| Stripe API errors | Any 4xx | Any 5xx |

### Logs

- Agent logs: `logs/agent.log` (also stdout)
- API access logs: `logs/api.log`
- Audit log (KDB-X): `select from audit_log` — immutable, never delete

---

## Troubleshooting

### KDB-X won't start
```bash
# Check if port 5000 is already in use
lsof -i :5000
# Kill the process, then restart q
```

### Stripe webhooks not arriving
1. Check `stripe listen` is running (local dev)
2. Check webhook endpoint URL in Stripe Dashboard
3. Verify `STRIPE_WEBHOOK_SECRET` matches the endpoint's signing secret
4. Check `/webhooks/stripe` returns 200 (not 4xx)

### Claude agent returns no response
1. Verify `ANTHROPIC_API_KEY` is set and valid
2. Check Anthropic API status at status.anthropic.com
3. Check `logs/agent.log` for error details

### Nexus engine returning wrong states
1. Run `checkNexus[]` directly in KDB-X to verify raw data
2. Check `nexus_data.py` thresholds for the state in question
3. Verify transactions have correct `state` field (not `Unknown`)

---

## Security Notes

1. **Never commit `.env`** — it's in `.gitignore`
2. **Stripe keys are restricted** — read-only on transactions, write-only on tax registrations
3. **KDB-X is local-only** — never expose port 5000 to the internet
4. **User confirmation required** — `user_confirmed=True` must be explicit before any fix executes
5. **Audit log is immutable** — once written, audit records cannot be deleted via the API

---

*Last updated: 2026-04-12 | See CHANGELOG.md for version history*
