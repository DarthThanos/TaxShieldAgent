# TaxShieldAgent -- Merchant Guide

Welcome to TaxShieldAgent. This guide will walk you through everything you need to know to protect your business from unexpected sales tax obligations. No accounting degree required.

---

## What Is TaxShieldAgent?

**In plain English:** TaxShieldAgent watches your sales across all your online stores and tells you when you've sold enough in a particular state that you're legally required to collect and remit sales tax there. When that happens, we help you register with that state for just $1.

### Why Does This Exist?

In 2018, the Supreme Court ruled in *South Dakota v. Wayfair* that states can require online sellers to collect sales tax -- even if you don't have a physical presence in that state. The rule is simple: if you sell more than about $100,000 into a state in a year, that state can (and will) require you to collect sales tax.

### What Happens If You Ignore It?

States are actively auditing online sellers. If you've crossed a threshold and haven't registered, you could owe back taxes, interest, and penalties. The good news: if you register proactively (which is what TaxShieldAgent helps you do), most states won't penalize you for past sales. The key is acting before they come to you.

---

## Getting Started -- 5 Steps

### Step 1: Install from the Stripe Dashboard

1. Go to the [Stripe App Marketplace](https://marketplace.stripe.com)
2. Search for **TaxShieldAgent**
3. Click **Install**
4. Authorize the app to read your transaction data (read-only -- we can never move your money)

That's it. Your Stripe account is now connected.

### Step 2: Connect Your First Store

Your Stripe account is automatically connected when you install the app. If Stripe is your only sales channel, you can skip to Step 3.

If you sell on other platforms (Shopify, Etsy, Amazon, PayPal, Square), you'll want to connect those too. This is important because **sales from ALL your channels count toward state thresholds.** You might be under the limit on Stripe alone, but over the limit when you add Etsy sales on top.

To connect additional stores, click **Settings > Connected Stores** in your TaxShieldAgent dashboard.

(Detailed instructions for each platform are in the **Connecting Your Other Stores** section below.)

### Step 3: Wait 2 Minutes for Your First Scan

After you connect, TaxShieldAgent pulls your last 12 months of transaction data and analyzes it state by state. This usually takes about 2 minutes. You'll see a loading indicator, and then your risk map will appear.

### Step 4: Understand Your Dashboard

Your dashboard shows a color-coded map of the United States. Each state is colored based on how close you are to that state's economic nexus threshold. See the **Understanding Your Risk Map** section below for what each color means.

You'll also see:
- **A summary bar** at the top showing how many states are in each status
- **A state list** below the map with detailed numbers for each state
- **Your connected stores** in the sidebar

### Step 5: What to Do If You See a RED or CRITICAL Alert

Don't panic. A RED alert means you're approaching a threshold. A CRITICAL alert means you've crossed it. In either case:

1. Click on the state to see the details
2. For CRITICAL states, you'll see a **FIX** button
3. Clicking FIX starts the state registration process for $1
4. Follow the prompts to complete registration

More details are in the **How to Fix a Nexus Alert** section below.

---

## Understanding Your Risk Map

Your dashboard map uses five colors. Here's what each one means and what you should do.

### GREEN -- You're Fine

**What it means:** Your sales in this state are well below the threshold (under 70% of the limit). You have plenty of room.

**What to do:** Nothing. Keep selling. TaxShieldAgent will keep monitoring and let you know if things change.

### YELLOW -- Watch This State

**What it means:** Your sales in this state are between 70% and 89% of the threshold. You're not in trouble yet, but you're heading in that direction.

**What to do:** Nothing urgent. Just be aware that if your sales continue at this pace, you may cross the threshold in the coming months. TaxShieldAgent will alert you before that happens.

### RED -- Act Soon

**What it means:** Your sales in this state are between 90% and 99% of the threshold. You're very close to the line.

**What to do:** Start thinking about registration. You don't have to act right this second, but you'll likely cross the threshold soon. When you do, you'll want to register promptly.

### CRITICAL -- Register Now

**What it means:** You've crossed the economic nexus threshold in this state. You are legally required to register, collect, and remit sales tax there.

**What to do:** Click the **FIX** button on that state. TaxShieldAgent will walk you through state tax registration for $1. The sooner you register, the better -- proactive registration almost always avoids penalties.

### Blue -- No Sales Tax

**What it means:** This is one of the five states with no state sales tax: Alaska*, Delaware, Montana, New Hampshire, or Oregon. You will never owe state sales tax here, no matter how much you sell.

**What to do:** Nothing, ever. These states are permanently safe.

*Alaska has no state sales tax, but some local jurisdictions do charge sales tax. TaxShieldAgent monitors this separately and will alert you if relevant.*

---

## How to Fix a Nexus Alert ($1)

When a state turns CRITICAL on your dashboard, here's exactly what to do.

### Step 1: Click on the CRITICAL State

On your dashboard map or in the state list, click on the state that's marked CRITICAL. This opens the state detail view.

### Step 2: Review the Details

You'll see:
- Your total sales into that state over the last 12 months
- The state's threshold amount (usually $100,000)
- How much you've exceeded the threshold by
- The number of transactions

### Step 3: Click the FIX Button

At the bottom of the state detail view, you'll see a large **FIX -- Register in [State] for $1** button. Click it.

### Step 4: Confirm Your Business Information

You'll be asked to confirm:
- Your legal business name
- Your business address
- Your federal EIN (Employer Identification Number)
- Your business type (sole proprietor, LLC, corporation, etc.)

This information is used to file your state registration.

### Step 5: Pay the $1 Fee

Your payment method on file with Stripe is charged $1. This is a one-time fee for this specific state registration. You are not signing up for a subscription -- it's $1 total.

### Step 6: Registration Is Submitted

TaxShieldAgent submits your registration with the state. Here's what happens next:

- **Immediately:** You receive a confirmation email with your submission details
- **Within 2-7 business days:** The state processes your registration and issues you a sales tax permit number
- **You'll receive another email** when your permit is approved, along with instructions for what to do next

### What Happens After You Register

Once you're registered in a state, you are required to:

1. **Collect sales tax** from customers in that state on future orders
2. **File sales tax returns** with that state (usually monthly or quarterly)
3. **Remit the collected tax** to the state by the filing deadline

Most e-commerce platforms (Shopify, Etsy, Amazon) can automatically collect sales tax for you once you enter your permit number in their settings. For filing and remitting, many sellers use services like TaxJar AutoFile or Avalara to handle it automatically.

TaxShieldAgent handles the **detection and registration** part. The ongoing collection and filing is handled by your e-commerce platform and/or a tax filing service.

---

## Connecting Your Other Stores

### Why This Matters

Here's the key thing most sellers miss: **states count ALL your sales, from ALL channels, combined.** If you sell $60,000 on Shopify and $50,000 on Etsy into the same state, you've crossed the $100,000 threshold even though neither platform alone would trigger it.

TaxShieldAgent can only protect you if it can see all your sales. Connecting all your stores takes a few minutes and gives you the complete picture.

### How to Connect Shopify

1. In your TaxShieldAgent dashboard, go to **Settings > Connected Stores**
2. Click **Add Store > Shopify**
3. Enter your Shopify store URL (e.g., `yourstore.myshopify.com`)
4. Click **Connect**
5. You'll be redirected to Shopify to authorize the connection
6. Click **Install App** on the Shopify authorization page
7. You'll be redirected back to TaxShieldAgent
8. Your Shopify order history will begin importing (this may take a few minutes for large stores)

### How to Connect Etsy

1. In your TaxShieldAgent dashboard, go to **Settings > Connected Stores**
2. Click **Add Store > Etsy**
3. Click **Connect to Etsy**
4. You'll be redirected to Etsy to authorize the connection
5. Click **Allow Access** on the Etsy authorization page
6. You'll be redirected back to TaxShieldAgent
7. Your Etsy order history will begin importing

**Important note about Etsy:** Etsy is a "marketplace facilitator" in most states, which means Etsy collects and remits sales tax on your behalf for orders placed through Etsy. However, your Etsy sales **still count toward your nexus threshold** for your other channels. If you also sell on Shopify or your own website, those Etsy sales push you closer to the threshold for non-marketplace sales.

### How to Connect PayPal

1. In your TaxShieldAgent dashboard, go to **Settings > Connected Stores**
2. Click **Add Store > PayPal**
3. Click **Connect to PayPal**
4. Log in to your PayPal Business account when prompted
5. Authorize TaxShieldAgent to access your transaction history (read-only)
6. You'll be redirected back to TaxShieldAgent
7. Your PayPal transaction history will begin importing

PayPal connection works best with a PayPal Business account. If you have a personal account, you may need to upgrade to Business first (it's free on PayPal's end).

### How to Upload Amazon CSV

Amazon doesn't offer a direct API connection for third-party seller data, so you'll upload a CSV file instead.

**How to find and download your Amazon sales data:**

1. Log in to [Amazon Seller Central](https://sellercentral.amazon.com)
2. Go to **Reports > Business Reports**
3. Click **Sales and Traffic by Date** (or **Detail Page Sales and Traffic by State** if available)
4. Set the date range to the last 12 months
5. Click **Download CSV**
6. Save the file to your computer

**How to upload it to TaxShieldAgent:**

1. In your TaxShieldAgent dashboard, go to **Settings > Connected Stores**
2. Click **Add Store > Amazon**
3. Click **Upload CSV**
4. Select the file you downloaded from Seller Central
5. TaxShieldAgent will parse the file and import your Amazon sales data
6. You'll see a confirmation showing how many transactions were imported

**Note:** Since Amazon data is uploaded manually, you'll want to re-upload a fresh CSV every month or so to keep your data current. TaxShieldAgent will remind you when your Amazon data is getting stale.

**Also important:** Like Etsy, Amazon is a marketplace facilitator and collects tax on your behalf. But your Amazon sales still count toward nexus thresholds for your non-marketplace channels.

### How to Connect Square

1. In your TaxShieldAgent dashboard, go to **Settings > Connected Stores**
2. Click **Add Store > Square**
3. Click **Connect to Square**
4. Log in to your Square account when prompted
5. Authorize TaxShieldAgent to access your transaction data (read-only)
6. You'll be redirected back to TaxShieldAgent
7. Your Square transaction history will begin importing

Square is commonly used for in-person sales. If you have a physical store or sell at markets/fairs, connecting Square ensures those sales are counted toward your nexus analysis too.

---

## Frequently Asked Questions

### "I sell on Etsy -- doesn't Etsy handle my taxes?"

**Partially.** Etsy is a marketplace facilitator, which means Etsy collects and remits sales tax on orders placed through Etsy in most states. You don't have to do anything for those specific Etsy orders.

**But here's the catch:** Your Etsy sales still count toward your economic nexus threshold for your *other* sales channels. If you sell $80,000 through Etsy and $30,000 through your Shopify store into the same state, you've crossed the $100,000 threshold. That means you need to register in that state and start collecting sales tax on your Shopify orders (even though Etsy is already handling the Etsy side).

TaxShieldAgent tracks your combined sales across all platforms so you can see the real picture.

### "Do I need an accountant?"

**Not for what TaxShieldAgent does.** We handle the monitoring (watching your sales across all states and platforms) and the registration (filing the paperwork to register you in a state when you cross the threshold). No accountant needed for those steps.

**Where you might want professional help:** Once you're registered in a state, you need to file sales tax returns and remit collected tax to that state on a regular schedule (usually monthly or quarterly). Many sellers handle this themselves using services like TaxJar AutoFile or Avalara, which automate the filing process. But if your situation is complex -- multiple entities, international sales, unusual product types -- a CPA who specializes in e-commerce sales tax can be worth the investment.

### "Is the $1 fee per month or per registration?"

**Per registration.** You pay $1 only when you click FIX on a specific state. That's it. There's no recurring charge for that registration.

Your monthly subscription (Free, Pro at $9.99/mo, or Agency at $49/mo) covers the monitoring and alerting. The $1 fee is only for the actual act of registering you with a state.

### "What if I've already crossed the threshold and never registered?"

**Register now.** The longer you wait, the more potential back taxes and penalties accumulate.

The good news: most states have **voluntary disclosure programs** (VDPs) that offer reduced penalties -- sometimes zero penalties -- for sellers who come forward and register proactively. The key word is "proactively," meaning you register before the state contacts you about it.

TaxShieldAgent's registration process works the same whether you just crossed the threshold today or crossed it six months ago. Click FIX, pay $1, and get registered.

If you've been over the threshold for a long time and are worried about significant back-tax exposure, that's a good time to consult a CPA or sales tax specialist. But step one is always the same: register.

### "How many states can I monitor?"

It depends on your plan:

| Plan | States Monitored | Price |
|---|---|---|
| **Free** | Up to 3 states (your highest-sales states) | $0/mo |
| **Pro** | All 50 states | $9.99/mo |
| **Agency** | All 50 states for multiple businesses | $49/mo |

If you sell in more than 3 states, Pro is strongly recommended. You don't want to miss a threshold just because it wasn't in your top 3.

### "What's the difference between the plans?"

| Feature | Free | Pro ($9.99/mo) | Agency ($49/mo) |
|---|---|---|---|
| States monitored | 3 | All 50 | All 50 |
| Connected platforms | 2 | Unlimited | Unlimited |
| Scan frequency | Weekly | Daily | Daily |
| Alert emails | Yes | Yes | Yes |
| $1 fix registrations | Yes | Yes | Yes |
| Multi-business support | No | No | Yes (up to 10) |
| Priority support | No | Yes | Yes |

### "Can I try it before I pay?"

Absolutely. The Free plan is genuinely free -- not a trial. You can use it indefinitely with up to 3 states and 2 connected platforms. Most sellers start on Free and upgrade to Pro when they realize they're selling in more states than they thought.

---

## Privacy and Security

We take your data seriously. Here's exactly what we can and can't do:

### What We CAN See
- Your transaction history (amounts, dates, customer states) -- this is what we need to calculate your nexus risk
- Your basic business information (name, address, EIN) -- this is what we need to file state registrations

### What We CANNOT Do
- **We never store your banking information.** Payments are handled entirely by Stripe.
- **We cannot move your money.** Our access to your Stripe account is read-only. We can see transactions but cannot create charges, issue refunds, or transfer funds.
- **We cannot register you without your permission.** The FIX button requires you to manually click it and confirm. We will never register you in a state automatically.

### Your Data is Logged and Auditable
Every action TaxShieldAgent takes on your behalf is recorded in an audit log. You can view this log anytime at **Settings > Audit Log.** It shows:
- Every scan performed on your accounts
- Every alert generated
- Every registration submitted
- Every data access event

### Disconnecting
You can disconnect TaxShieldAgent at any time:
1. Go to **Settings > Connected Stores**
2. Click **Disconnect** next to any store
3. To fully remove the app, uninstall it from the Stripe App Marketplace

When you disconnect, we stop accessing your data immediately. Your historical data is retained for 30 days in case you reconnect, then permanently deleted.

---

## Getting Help

- **Email:** support@taxshieldagent.com
- **Dashboard:** Click the **?** icon in the bottom-right corner of your dashboard for contextual help
- **Knowledge base:** Available at Settings > Help Center

We typically respond to support requests within 24 hours on business days.

---

*Last updated: April 2026*
