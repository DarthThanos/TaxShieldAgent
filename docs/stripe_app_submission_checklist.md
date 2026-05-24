# Stripe App Submission Checklist — TaxShieldAgent

Step-by-step guide for submitting TaxShieldAgent to the Stripe App Marketplace.

---

## Code Audit Status (v0.4.2)

| Check | Status | Notes |
|---|---|---|
| Hardcoded localhost URLs | ✅ FIXED | All URLs → `https://api.taxshieldagent.com` via `stripe_app/src/config.ts` |
| Permission purposes | ✅ FIXED | Detailed justifications in `stripe-app.json` |
| CSP localhost in connect-src | ✅ FIXED | Removed — production only |
| post_install_action URL | ✅ FIXED | Production HTTPS URL |
| PaymentNexusDetail error state | ✅ FIXED | Full try/catch with Banner error display |
| Icon 256x256 PNG | ✅ PASS | `stripe_app/icon.png` confirmed |
| Empty state handling | ✅ PASS | Both components handle null/empty data |
| Privacy policy URL | ✅ PASS | `https://taxshieldagent.com/privacy` in listing |
| Listing description | ✅ PASS | Specific, accurate, non-vague |
| **App ID verified on Dashboard** | ⚠️ ACTION NEEDED | Confirm `com.taxshieldagent.app` at dashboard.stripe.com/apps/dev |
| **Backend deployed to production** | ⚠️ ACTION NEEDED | Deploy to `https://api.taxshieldagent.com` before submission |

---

## Prerequisites

- [ ] Stripe CLI installed and updated to latest version (`stripe version` — minimum v1.19.0)
- [ ] Stripe developer account with app development enabled
- [ ] `stripe login` completed and authenticated
- [ ] Node.js 18+ installed for building the UI extension

## 1. App Manifest Validation

- [ ] Run `stripe apps validate` from the project root to check `stripe-app.json`
- [⚠️] Verify `id: "com.taxshieldagent.app"` matches your registered app ID on the Stripe Developer Dashboard — go to **dashboard.stripe.com/apps/dev** to confirm or update
- [ ] Verify `version` follows semver and is incremented from any previous submission
- [✅] All `permissions` have detailed, specific `purpose` strings (fixed v0.4.2)
- [✅] Permissions match actual backend API calls made on merchant's behalf

## 2. Permission Justifications

Stripe reviews every permission request. Prepare written justifications:

| Permission | Justification |
|---|---|
| `payment_intents_read` | We read payment intent amounts and customer state metadata to aggregate sales totals by US state for Economic Nexus threshold calculations. |
| `tax_registrations_write` | When a merchant confirms a fix, we create a Stripe Tax registration for the target state on their behalf. |
| `charges_write` | We create a $1 charge to the merchant's default payment method as the platform fee for each state registration. |

- [ ] Justifications saved and ready for the submission form

## 3. UI Extension Build

- [ ] Run `cd stripe_app && npm install`
- [ ] Run `stripe apps build` — must complete without errors
- [ ] Test in Stripe Dashboard sandbox: `stripe apps start`
- [ ] Verify `NexusOverview` renders on Dashboard home
- [ ] Verify `PaymentNexusDetail` renders on payment detail pages

## 4. Backend Requirements

- [ ] Backend deployed to production URL (`https://api.taxshieldagent.com`)
- [ ] HTTPS enforced — Stripe rejects HTTP backends in production
- [ ] `/stripe-app/health` endpoint returns 200
- [ ] `/stripe-app/nexus-summary` responds in under 500ms
- [ ] CORS configured to allow requests from `https://dashboard.stripe.com`
- [ ] JWT verification implemented for production (not dev-mode passthrough)

## 5. Privacy & Legal

- [ ] Privacy policy published at `https://taxshieldagent.com/privacy`
- [ ] Privacy policy covers: what data is accessed, how it is stored, retention period, third-party sharing, deletion process
- [ ] Terms of service published at `https://taxshieldagent.com/terms`
- [ ] Support page live at `https://taxshieldagent.com/support`
- [ ] Support email configured and monitored

## 6. App Store Listing

- [ ] App name: "TaxShieldAgent — Sales Tax Nexus Monitor"
- [ ] Tagline under 120 characters
- [ ] Description written and proofread (see `docs/stripe_app_store.md`)
- [ ] Category set to "Tax & Compliance"
- [ ] Icon uploaded: 256x256 PNG (`stripe_app/icon.png`)
- [ ] Up to 5 screenshots captured from the sandbox dashboard
- [ ] Screenshots show real (anonymized) data, not empty states

## 7. Testing in Sandbox

- [ ] Install the app on a Stripe test-mode account
- [ ] Verify post-install callback redirects to dashboard
- [ ] Create test payments in multiple US states
- [ ] Verify nexus alerts appear in the Dashboard panel
- [ ] Click FIX on a test alert — verify $1 charge is created in test mode
- [ ] Verify tax registration is created in test mode
- [ ] Test error states: backend down, invalid account, no permissions
- [ ] Test with a fresh account (no prior data) — verify graceful empty state
- [ ] Test uninstall flow — verify cleanup

## 8. Submission

- [ ] Run `stripe apps upload` to upload the built app
- [ ] Fill out the submission form on the Stripe Developer Dashboard
- [ ] Attach permission justifications
- [ ] Provide test account credentials for Stripe reviewers (sandbox account)
- [ ] Submit for review

## 9. Review Process — What to Expect

- Stripe's app review typically takes **2 to 4 weeks**
- A Stripe reviewer will install your app on a test account and verify:
  - All permissions are justified and used
  - UI renders correctly in the Dashboard
  - No excessive API calls or performance issues
  - Privacy policy is adequate
  - The app does what the listing says it does
- You may receive feedback requesting changes — respond promptly

## 10. Common Rejection Reasons

| Reason | How to Avoid |
|---|---|
| Unused permissions requested | Only request permissions you actually use in code |
| Slow panel load (>2s) | Keep `/nexus-summary` under 500ms; cache aggressively |
| Missing privacy policy | Publish before submitting — Stripe checks the URL |
| Vague permission purposes | Be specific: "Read payment amounts to calculate state sales totals" not "Access payment data" |
| Broken post-install flow | Test the callback URL works and redirects correctly |
| UI crashes on empty state | Handle the "no data yet" case gracefully |
| HTTP backend URL | Must be HTTPS in production |

## 11. Post-Approval Steps

- [ ] Verify the app appears in the Stripe App Marketplace
- [ ] Test installation from the Marketplace listing (not just CLI)
- [ ] Set up monitoring/alerting on the production backend
- [ ] Announce launch in changelog and marketing channels
- [ ] Monitor Stripe's app analytics dashboard for install/uninstall rates
- [ ] Set up a process for responding to Stripe's ongoing compliance reviews
- [ ] Plan the next version — Stripe requires updates to go through review again
