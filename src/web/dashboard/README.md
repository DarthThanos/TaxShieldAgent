# TaxShieldAgent Dashboard

React + Vite frontend for the TaxShieldAgent compliance platform.

## Prerequisites

- Node.js 18+ and npm
- TaxShieldAgent FastAPI backend running on port 8000

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts the dev server on [http://localhost:3000](http://localhost:3000).

The Vite dev server proxies API requests to `http://localhost:8000` (configurable via `VITE_API_URL` in `.env`).

## Production Build

```bash
npm run build
```

Output goes to `dist/`. Serve with any static file server; configure your reverse proxy to forward `/dashboard/*`, `/alerts/*`, `/connectors/*`, and `/health` requests to the FastAPI backend.

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_DEV_MERCHANT_ID` | `platform` | Merchant ID for development |

## Pages

- **Dashboard** — Nexus risk overview with US state map and risk table
- **Alerts** — Open compliance alerts with AI explanations and fix/snooze actions
- **Platforms** — Connect and manage Stripe, Shopify, Etsy, PayPal, Square, Amazon
- **Transactions** — Recent transaction feed with platform and state filters
- **Audit Log** — Compliance action history (coming soon)
