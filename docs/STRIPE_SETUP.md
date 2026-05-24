# Stripe Setup Guide — TaxShieldAgent

Complete these steps once before running the app for the first time.

---

## Step 1: Create a Stripe Account

1. Go to **stripe.com**
2. Click **Start now** and sign up with your email
3. You do not need a registered business yet — full verification can be done later

---

## Step 2: Get Your Test Secret Key

1. Log in to Stripe Dashboard
2. Click **Developers** (top right)
3. Click **API keys**
4. Under **Standard keys**, find **Secret key** (starts with `sk_test_...`)
5. Click **Reveal test key** and copy it

> Keep this somewhere safe. You will paste it into `.env` as `STRIPE_SECRET_KEY`.

---

## Step 3: Create a Restricted Key (Recommended)

A restricted key limits what the app can do — safer than using the full secret key.

1. On the same **API keys** page, click **Create restricted key**
2. Name it: `TaxShieldAgent Dev`
3. Set these permissions only:
   - **Payment Intents** → Read
   - **Tax Registrations** → Write
4. Click **Create key**
5. Copy the key (starts with `rk_test_...`)

> Use this instead of `sk_test_...` as your `STRIPE_SECRET_KEY` in `.env`.

---

## Step 4: Enable Stripe Connect

TaxShieldAgent uses Stripe Connect to collect the $1 fee from merchants.

1. In Stripe Dashboard, go to **Connect** (left sidebar)
2. Click **Get started** and follow the onboarding
3. Once enabled, go to **Connect → Settings**
4. Copy your **Connect Client ID** (starts with `ca_...`)
5. Paste it into `.env` as `STRIPE_CONNECT_CLIENT_ID`

---

## Step 5: Install the Stripe CLI

The Stripe CLI lets you receive live webhook events on your local machine during development.

**Windows (recommended via Scoop):**
```bash
scoop install stripe
```

**Windows (direct download):**
- Go to stripe.com/docs/stripe-cli
- Download the Windows `.exe` and add it to your PATH

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Verify install:**
```bash
stripe --version
```

---

## Step 6: Log In to the Stripe CLI

```bash
stripe login
```

This opens a browser window. Authorize it with your Stripe account.

---

## Step 7: Get Your Webhook Signing Secret

1. Start the local webhook listener:
```bash
stripe listen --forward-to localhost:8000/webhooks/stripe
```

2. It will print a line like:
```
> Ready! Your webhook signing secret is whsec_abc123... (^C to quit)
```

3. Copy that `whsec_...` value
4. Paste it into `.env` as `STRIPE_WEBHOOK_SECRET`

> Keep this terminal running whenever you are testing locally.

---

## Step 8: Get Your Anthropic API Key

TaxShieldAgent uses Claude to generate compliance alert messages.

1. Go to **console.anthropic.com**
2. Sign up or log in
3. Click **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)
5. Paste it into `.env` as `ANTHROPIC_API_KEY`

---

## Step 9: Fill In Your .env File

```bash
# From the project root
cp .env.example .env
```

Open `.env` and fill in:

```
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=rk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...
DB_PATH=data/shield.db
APP_ENV=development
DEV_MERCHANT_ID=platform
NEXUS_CHECK_INTERVAL=900
```

Leave the `STRIPE_*_PRICE_ID` lines blank for now — those are filled in during Phase 3 (Stripe App packaging).

---

## Step 10: First Run

With your `.env` filled in and the Stripe CLI listener running:

```bash
# Install dependencies
pip install -r requirements.txt

# Pull your last 100 Stripe transactions into the local database
python src/agent/main.py --sync

# Start the web API
uvicorn src.web.api.app:app --reload --port 8000
```

Visit **http://localhost:8000/health** — if you see `{"status": "ok"}` you are ready to go.

---

## Checklist

- [ ] Stripe account created
- [ ] Restricted API key copied into `.env` as `STRIPE_SECRET_KEY`
- [ ] Stripe Connect enabled, Client ID in `.env`
- [ ] Stripe CLI installed and logged in
- [ ] Webhook signing secret copied into `.env` as `STRIPE_WEBHOOK_SECRET`
- [ ] Anthropic API key copied into `.env` as `ANTHROPIC_API_KEY`
- [ ] `python src/agent/main.py --sync` runs without errors
- [ ] `GET /health` returns 200 OK

Once all boxes are checked, move on to **BUILD_PLAN.md Phase 1.2 — Stripe Data Sync**.
