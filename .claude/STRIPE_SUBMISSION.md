# Stripe Marketplace Submission — TaxShieldAgent

## Critical Context for Any AI Reading This

**As of 2026-05-27 the Connect dependency has been removed.**
The $1 per-registration fee was the sole reason Connect was required.
That fee is gone — monetisation is now subscription-only (Pro/Agency tiers).
The app now submits from the ORIGINAL account (acct_1TLIcLCIG7RXIpX1).
No second account needed. Do NOT suggest creating a second account.

**App version:** 0.5.0
**Permissions:** payment_intent_read + tax_settings_write (charge_write REMOVED)
**Company email:** shield.agent.app@gmail.com
**Owner email:** diongross@gmail.com

---

## Account

| Purpose | Account | Email |
|---|---|---|
| Everything — submission + backend | acct_1TLIcLCIG7RXIpX1 | diongross@gmail.com |

---

## Submission Steps

### Step 1 — CLI Login (confirm correct account)
```powershell
stripe whoami
# Must show acct_1TLIcLCIG7RXIpX1
# If wrong: stripe login → select the correct account
```

### Step 2 — Set Distribution + Upload
```powershell
cd "D:\ALL_Hive\Opus_Lab\Prompts\Builds\TaxShieldAgent"

stripe apps set distribution public
stripe apps upload
# Uploads version 0.5.0
```

---

## Marketplace Listing — Fill In Exactly

```
Name:              TaxShieldAgent

Icon:              icon.png (verify 300x300px min, 1:1 ratio, PNG before submitting)

Built by:          Hive Intelligence

Category:          Tax & Finance

Subtitle:          US Economic Nexus monitor — know before you owe.

About:             Hive Intelligence builds AI-powered compliance tools for Stripe
                   merchants. TaxShieldAgent monitors Economic Nexus thresholds across
                   all 50 US states and automates state tax registration for $1 per
                   state. Built on Claude AI, DuckDB, and Stripe Tax.

Key Feature 1
  Title:           All 50 States Tracked
  Description:     Every Economic Nexus threshold monitored in real time. Know your
                   risk level — GREEN, YELLOW, RED, CRITICAL — before you owe.

Key Feature 2
  Title:           One-Click Tax Registration
  Description:     When you hit a threshold, register with that state via Stripe
                   Tax in one click. Human-confirmed, never automatic. Included
                   in Pro and Agency plans.

Key Feature 3
  Title:           Immutable Audit Log
  Description:     Every alert, every fix, every action logged permanently. Export
                   your compliance history any time as a PDF receipt.

Pricing:           Paid subscription
Pricing page:      https://taxshieldagent.com/#products

Support email:     shield.agent.app@gmail.com
Response time:     1 business day

Based in:          United States

Privacy policy:    https://taxshieldagent.com/privacy
Terms of service:  https://taxshieldagent.com/terms
Company website:   https://taxshieldagent.com
```

---

## Pre-Submit Checklist

```
[ ] New Stripe account created at shield.agent.app@gmail.com — NO Connect
[ ] CLI logged into new account (stripe whoami confirms it)
[ ] stripe apps set distribution public — succeeded with no error
[ ] stripe apps upload — succeeded, version 0.4.2 confirmed
[ ] icon.png verified: 300x300px minimum, 1:1 ratio, PNG
[ ] No localhost URLs in stripe-app.json
[ ] api.taxshieldagent.com/health responding in browser
[ ] taxshieldagent.com/privacy loads
[ ] taxshieldagent.com/terms loads
[ ] 5 screenshots ready — must show app INSIDE Stripe Dashboard
[ ] Test credentials ready — separate test merchant account, NO 2FA
[ ] All listing fields filled (name, icon, subtitle, about, features, pricing, support)
```

---

## After Submission

- Stripe reviews in ~4 business days
- Response goes to shield.agent.app@gmail.com
- If rejected: fix what they flag → re-upload → resubmit
- If approved: Dashboard → Apps → Review and Publish → Publish

---

## What Stays on the Original Account (acct_1TLIcLCIG7RXIpX1)

- All Connect operations
- Backend API (api.taxshieldagent.com on Railway)
- Merchant financial relationships
- $1 fee collection via Stripe Tax

The Marketplace listing calls the backend API. The two accounts are separate
but work together. This is the correct and Stripe-approved architecture.
