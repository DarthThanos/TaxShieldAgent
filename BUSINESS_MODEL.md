# TaxShieldAgent — Business Model

> This document covers pricing strategy, payment infrastructure, go-to-market plan, and revenue projections.

---

## The Problem (Market Validation)

**South Dakota v. Wayfair (2018)** changed everything for online sellers. Before this ruling, you only owed sales tax where you had physical presence. Now, every state with a sales tax can demand you collect it once you hit their Economic Nexus threshold — typically $100,000/year in sales OR 200 transactions.

**The pain is real and measurable:**
- 45 states + DC have sales tax
- 43 of them have Economic Nexus laws
- Average penalty for non-compliance: 25% of unpaid tax + interest
- Average Stripe merchant has no idea this applies to them
- The "discovery moment" is usually an audit letter — by then it's too late

**This is a $2B+ market** (sales tax compliance software). The existing players (Avalara, TaxJar, Vertex) target enterprise. Nobody has cracked the $10/month merchant-level market at scale. We are that product.

---

## Pricing Tiers

### Free Plan — $0/month
**For:** Solo sellers just getting started, merchants < $50k annual revenue

| Feature | Included |
|---|---|
| States monitored | 3 (user chooses) |
| Nexus alerts | 1 per month |
| Transaction history | 30 days |
| One-click registration | $1 per fix |
| AI explanations | Basic |
| Audit log | 30 days |

**Purpose:** Get merchants hooked. They feel the value the moment they see a real alert.

---

### Pro Plan — $9.99/month ($99.90/year — save 2 months)
**For:** Growing merchants, $50k–$2M annual revenue

| Feature | Included |
|---|---|
| States monitored | All 50 |
| Nexus alerts | Unlimited, real-time |
| Transaction history | 1 year |
| One-click registration | $1 per fix |
| AI explanations | Full (Claude) |
| Audit log | Full history + export |
| Email notifications | ✓ |
| Priority support | ✓ |

**This is the core product.** 50 Pro subscribers = $499.50/month recurring. That's the passive income goal.

---

### Agency Plan — $49.00/month ($490/year — save 2 months)
**For:** Accountants, bookkeepers, e-commerce consultants managing 5+ clients

| Feature | Included |
|---|---|
| Merchants managed | Up to 20 |
| Everything in Pro | ✓ (per merchant) |
| Unified agency dashboard | ✓ |
| White-label branding | ✓ |
| REST API access | ✓ |
| Bulk alert management | ✓ |
| Dedicated support | ✓ |

**This is the multiplier.** One agency subscriber at $49 covers 20 merchants. And they'll upgrade their clients to Pro once they see the value.

---

### Per-Action Pricing (All Plans)

| Action | Price | Notes |
|---|---|---|
| State tax registration fix | $1.00 | Per state, per merchant |
| Expedited fix (same-day) | $5.00 | Future feature |
| Quarterly nexus report (PDF) | $2.00 | Future feature |

---

## Payment Infrastructure

### Platform: Stripe Connect (Standard)

We use **Stripe Connect** so that:
1. Merchants connect their existing Stripe account in one click
2. We collect application fees directly from their transactions
3. We never touch merchant funds — Stripe handles everything
4. KYC/compliance is Stripe's problem, not ours

### Payment Flows

**Flow A: Subscription Billing**
```
Merchant subscribes to Pro/Agency
    → Stripe Billing creates recurring subscription
    → $9.99 or $49.00 charged monthly to merchant's card
    → Revenue lands in our Stripe platform account
```

**Flow B: Per-Action Fee ($1 Fix)**
```
Merchant clicks FIX on a nexus alert
    → user_confirmed = True
    → stripe.tax.Registration.create() called
    → On merchant's next Stripe transaction:
        → application_fee_amount = 100 (cents)
        → $1 deducted from their payout, credited to us
```

**Flow C: Annual Billing (Discount)**
```
Merchant selects annual plan
    → Single charge: $99.90 (Pro) or $490 (Agency)
    → 2 months free vs monthly
```

### Stripe Products to Create (Before Launch)

```
Products:
  - TaxShieldAgent Pro Monthly    → $9.99/mo
  - TaxShieldAgent Pro Annual     → $99.90/yr
  - TaxShieldAgent Agency Monthly → $49.00/mo
  - TaxShieldAgent Agency Annual  → $490.00/yr

Application Fee:
  - Per-fix fee: $1.00 (100 cents) via payment_intent application_fee_amount
```

### PLACEHOLDER NOTICE

`src/payments/stripe_connect.py`, `src/payments/subscriptions.py`, and `src/payments/billing.py` are currently **scaffolded with placeholders**. Before launch:
1. Create the above Products in Stripe Dashboard
2. Add Price IDs to `.env`
3. Wire up the Connect OAuth flow in `stripe_connect.py`
4. Wire up subscription creation in `subscriptions.py`
5. Wire up application fee in `billing.py`

---

## Go-To-Market Strategy

### Channel 1: Stripe App Marketplace (PRIMARY)

**This is the entire distribution strategy.** Stripe has 3+ million active merchants. The App Marketplace is the first place merchants look when they need a new tool. Being listed here is essentially free, targeted distribution.

Steps:
1. Build to Stripe App spec (Phase 3)
2. Submit for Stripe review
3. Get listed in "Tax & Compliance" category
4. Optimize listing title, description, and screenshots
5. Collect reviews (first 10 users are critical for social proof)

**Expected conversion:** Even 0.01% of Stripe's merchant base = 300 users.

---

### Channel 2: SEO Content (SECONDARY)

Target keywords that Stripe merchants actually search:
- "do I owe sales tax in [state]"
- "stripe economic nexus"
- "stripe sales tax compliance"
- "wayfair ruling small business"
- "how to register for sales tax"

One good blog post per month + a free "Nexus Calculator" tool = steady organic traffic.

---

### Channel 3: Accountant/Bookkeeper Partnerships

Target: 500,000+ QuickBooks ProAdvisors and independent bookkeepers in the US.

- Offer Agency plan at $49/month (they can mark it up to their clients)
- Reach via: AIPB, NACPB, LinkedIn, Reddit (r/Accounting)
- "Refer a merchant, get a month free" referral program

---

### Channel 4: E-Commerce Communities

- Reddit: r/ecommerce, r/entrepreneur, r/fulfillment, r/Etsy, r/AmazonFBA
- Facebook Groups: Shopify Entrepreneurs, WooCommerce Community
- Discord: various e-commerce servers
- Product Hunt launch (Day 1)

**Messaging:** Never lead with "tax compliance." Lead with: *"I built a tool that automatically watches your Stripe sales so you never get blindsided by a surprise state tax audit."* That's the hook.

---

## Revenue Projections

### Conservative Case

| Month | Pro Users | Agency Users | Fixes/mo | MRR |
|---|---|---|---|---|
| M1 (launch) | 5 | 0 | 3 | $52.95 |
| M3 | 20 | 1 | 15 | $264.80 |
| M6 | 50 | 3 | 40 | $687.50 |
| M12 | 100 | 8 | 80 | $1,471.00 |

### Base Case (Stripe Marketplace listed)

| Month | Pro Users | Agency Users | Fixes/mo | MRR |
|---|---|---|---|---|
| M1 | 15 | 1 | 10 | $209.85 |
| M3 | 50 | 5 | 40 | $789.50 |
| M6 | 150 | 15 | 120 | $2,363.50 |
| M12 | 300 | 30 | 250 | $4,737.00 |

### Optimistic Case (Viral / Press)

| Month | Pro Users | Agency Users | Fixes/mo | MRR |
|---|---|---|---|---|
| M6 | 500 | 50 | 300 | $7,747.50 |
| M12 | 1,000 | 100 | 600 | $15,295.00 |

**The goal: $500/month passive in 6 months.** This is Conservative Case M6 territory with 50 Pro users. Very achievable.

---

## Cost Structure

| Cost | Monthly | Notes |
|---|---|---|
| KDB-X Community License | $0 | Free for personal/small commercial |
| Railway hosting | ~$5–$20 | Scales with usage |
| Anthropic API (Claude) | ~$5–$50 | ~$0.10 per alert generation |
| Stripe fees | 2.9% + $0.30 | On subscription charges |
| Domain + email | ~$2 | |
| **Total** | **~$12–$72/month** | |

**Break-even: 8 Pro subscribers.** Everything after that is profit.

---

## Competitive Landscape

| Competitor | Price | Target | Our Edge |
|---|---|---|---|
| Avalara | $20–$300+/mo | Enterprise | 10x cheaper, Stripe-native |
| TaxJar | $19–$99/mo | Mid-market | Cheaper, AI-powered alerts |
| Stripe Tax | Free–usage | Stripe merchants | We add nexus monitoring + alerts |
| Manual CPA | $100+/hr | All | Automated, instant, $1/fix |

**Stripe Tax** is our closest "competitor" but it doesn't monitor nexus or send alerts — it just calculates tax. We are the monitoring layer that tells you *when* you need to act. We're complementary, not competing.

---

## Exit Strategy (Long-Term)

1. **Acquisition by Stripe** — they acquire compliance add-ons regularly
2. **Acquisition by Avalara/TaxJar** — they want SMB market penetration
3. **Grow to $10k MRR and sell on Acquire.com** — SaaS multiples at 3–5x ARR
4. **Keep as passive income** — at $2k MRR it basically runs itself

---

*Last updated: 2026-04-12*
