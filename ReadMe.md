# TaxShieldAgent

**Automated US Sales Tax Compliance for Stripe Merchants**

> *"We watch your nexus so you don't get hit with a surprise $50,000 tax bill."*

---

## Request Access

This product is in **private early access** — currently onboarding Stripe merchants by invitation only.

To request a demo or early access, email:

**diongross@gmail.com** — Subject: `TaxShieldAgent Access Request`

Include your name, your Stripe merchant volume (approximate), and the states you sell into. Reviewed personally.

> Stripe billing integration is in active development. Early access users lock in founding-member pricing.

---

---

## What This Is

After the 2018 Supreme Court ruling in *South Dakota v. Wayfair*, every US state can require online sellers to collect and remit sales tax — even if the seller has never set foot in that state. The trigger is called **Economic Nexus**: typically **$100,000 in sales** or **200 transactions** per state, per year.

Most small-to-mid-size Stripe merchants have no idea they're crossing these lines. By the time they find out — usually via a state audit letter — they're looking at back-taxes, penalties, and interest.

**TaxShieldAgent fixes this.** It runs silently in the background, watches every Stripe transaction, and the moment you're approaching a nexus threshold in any US state, it fires an alert and offers a one-click fix to register you for sales tax compliance — for **$1**.

---

## Who This Is For

- **Stripe merchants** selling physical goods, SaaS, or digital products to US customers
- **E-commerce stores** growing fast and selling across state lines
- **Accountants and bookkeepers** managing multiple clients (Agency plan)
- **Stripe platforms and marketplaces** (white-label integration)

---

## Core Features

| Feature | Free | Pro | Agency |
|---|---|---|---|
| States monitored | 3 | All 50 | All 50 (multi-merchant) |
| Real-time nexus alerts | | ✓ | ✓ |
| One-click state registration | ✓ ($1/fix) | ✓ ($1/fix) | ✓ ($1/fix) |
| Transaction history | 30 days | 1 year | Unlimited |
| AI compliance explanations | | ✓ | ✓ |
| Audit log export | | ✓ | ✓ |
| Multi-merchant dashboard | | | ✓ |
| White-label branding | | | ✓ |
| API access | | | ✓ |
| Priority support | | ✓ | ✓ |
| Monthly price | $0 | $9.99 | $49.00 |

---

## How It Works

```
Stripe Transactions
       │
       ▼
  Webhook Listener  ──────────────────────────────────────────┐
       │                                                       │
       ▼                                                       │
  KDB-X Living Table                                          │
  (microsecond aggregation)                                   │
       │                                                       │
       ▼                                                       │
  Nexus Rules Engine                                          │
  (50-state threshold database)                              │
       │                                                       │
       ▼                                                       ▼
  ALERT: "You're at $94,200 in Texas.        Audit Log
  You'll hit nexus in ~12 more sales."       (immutable)
       │
       ▼  [User clicks FIX]
  Claude AI Agent
  (drafts explanation + confirmation)
       │
       ▼  [User confirms — REQUIRED]
  Stripe Tax Registration API
  + $1 Application Fee charged
       │
       ▼
  ✓ Compliant. Done.
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Analytical DB | DuckDB (embedded) | Zero install, single file, blazing fast GROUP BY on millions of rows — MIT licensed, fully portable |
| AI reasoning | Claude API (claude-opus-4-6) | Legal-grade explanations, zero hallucinations on structured data |
| Web API | FastAPI | Async, fast, easy Stripe webhook handling |
| Payments | Stripe Connect | Platform fees, subscriptions, one-click Connect onboarding |
| Frontend | React + Vite | Stripe App UI Kit compatible |
| Infrastructure | Docker + Railway | One-command deploy, scales to zero |

---

## Project Structure

```
TaxShieldAgent/
├── README.md                    # This file
├── CHANGELOG.md                 # Version history
├── BUILD_PLAN.md                # Development roadmap
├── BUSINESS_MODEL.md            # Pricing, GTM, revenue model
├── OPERATIONS.md                # How to run and deploy
├── .env.example                 # Required environment variables
├── docker-compose.yml           # Full local dev stack
├── requirements.txt             # Python dependencies
│
├── src/
│   ├── agent/
│   │   ├── main.py              # Entry point: sync + agent loop
│   │   ├── db.py                # DuckDB data layer (transactions, alerts, audit log)
│   │   ├── nexus_engine.py      # Core nexus detection logic
│   │   ├── claude_agent.py      # Claude API integration
│   │   ├── remediator.py        # Stripe API fix actions
│   │   ├── webhook_handler.py   # Stripe webhook ingestion
│   │   └── nexus_data.py        # 50-state threshold database
│   │
│   ├── web/
│   │   ├── api/
│   │   │   ├── app.py           # FastAPI application
│   │   │   ├── routes/
│   │   │   │   ├── dashboard.py # Dashboard data endpoints
│   │   │   │   ├── alerts.py    # Alert management
│   │   │   │   └── webhooks.py  # Stripe webhook receiver
│   │   │   └── middleware/
│   │   │       └── auth.py      # Stripe Connect auth
│   │   └── dashboard/           # React frontend (Phase 2)
│   │
│   └── payments/
│       ├── stripe_connect.py    # Stripe Connect platform logic
│       ├── subscriptions.py     # Plan management (Free/Pro/Agency)
│       └── billing.py           # $1 application fee logic
│
├── docs/
│   ├── nexus_thresholds.md      # State-by-state nexus rules reference
│   ├── stripe_app_store.md      # Stripe App Marketplace listing copy
│   └── api_reference.md         # API documentation
│
└── tests/
    ├── test_nexus_engine.py
    ├── test_remediator.py
    └── test_webhooks.py
```

---

## Quick Start (Development)

### Prerequisites
- Python 3.11+
- Stripe account with Connect enabled
- Anthropic API key (console.anthropic.com)
- Docker (recommended)

> No database server required. DuckDB is embedded — it's just a Python package and a single `.db` file.

### 1. Clone and configure
```bash
git clone https://github.com/YOUR_USERNAME/taxshieldagent.git
cd taxshieldagent
cp .env.example .env
# Fill in your API keys in .env
```

### 2. Start with Docker (recommended)
```bash
docker-compose up -d
```

### 3. Start manually
```bash
# Terminal 1: Webhook listener + agent loop
python src/agent/main.py --run-agent

# Terminal 2: One-time historical sync from Stripe
python src/agent/main.py --sync

# Terminal 3: Web API
uvicorn src.web.api.app:app --reload --port 8000
```

> DuckDB starts automatically when the app runs — no separate database process needed.

---

## Safety Guarantees

TaxShieldAgent is built on a **human-in-the-loop** model. The AI **never acts autonomously** on your Stripe account.

- The agent can only **read** the DuckDB database — it cannot modify or delete transaction data
- Tax registrations require explicit `user_confirmed=True`
- The $1 fee only charges **after** you click "FIX" and confirm
- Every action is written to an immutable `audit_log` table
- Stripe secret keys are never stored in code — `.env` only

---

## Compliance Coverage

TaxShieldAgent monitors against the following nexus types:

| Type | Threshold | States |
|---|---|---|
| Economic Nexus (Revenue) | $100,000/year | 43 states |
| Economic Nexus (Transactions) | 200 transactions/year | 36 states |
| Lower thresholds | $10k–$50k | KS, MN, PA (others) |
| No sales tax | N/A | MT, NH, OR, DE, AK |

*Full state-by-state breakdown in `docs/nexus_thresholds.md`*

---

## Revenue Model Summary

| Stream | Rate | Notes |
|---|---|---|
| Subscription — Pro | $9.99/month | Recurring, per-merchant |
| Subscription — Agency | $49.00/month | Per-agency, covers all their clients |
| Per-action fee | $1.00 | Per state registration fix |
| Annual discount | 2 months free | $99.90/yr Pro, $490/yr Agency |

**Path to $500/month passive:**
- 50 Pro subscribers = $499.50/month
- With natural Stripe Marketplace discovery — zero ad spend required

---

## Status

Current version: **v0.1.0-scaffold** — See `CHANGELOG.md`

Active development phase: **Phase 1 — Core Engine**

---

## License

Copyright (c) 2026 Dion Gross. All Rights Reserved. Proprietary and Confidential.

---

*Built with Claude (Anthropic) + KDB-X + Stripe*
