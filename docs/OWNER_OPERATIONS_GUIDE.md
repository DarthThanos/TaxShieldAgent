# TaxShieldAgent -- Owner Operations Guide

This is your personal playbook for running TaxShieldAgent day-to-day. You built this thing to be mostly hands-off. This guide tells you what the "mostly" part looks like.

---

## Daily Operations (5 Minutes a Day)

### Check the Dashboard

Open your browser and go to:

```
http://localhost:3000
```

You should see the main dashboard with a map of the United States, merchant cards, and status indicators. If you see this, the app is running. If you see "This site can't be reached," the app is stopped (see **Starting the App** below).

### What the Colors Mean

| Color | What It Means | Do You Need to Do Anything? |
|---|---|---|
| **GREEN** | Merchant is safely below all state thresholds | No. Everything is fine. |
| **YELLOW** | Merchant is approaching a threshold (70-89% of $100k) | No. The merchant will see a warning on their dashboard. |
| **RED** | Merchant is very close to crossing a threshold (90-99%) | No. The merchant gets an email alert. They can click FIX for $1. |
| **CRITICAL** | Merchant has crossed the threshold and needs to register | No. The merchant gets urgent alerts. If they click FIX, you earn $1. |

The short version: **you don't need to do anything for any color.** The system handles alerts and registration automatically. You're just checking that the lights are on.

### What to Do When You Get an Alert Email

You may receive alert emails at your admin address. Here's what each one means:

- **"New merchant connected"** -- Someone installed your app. Great. Do nothing.
- **"Registration completed"** -- A merchant clicked FIX and registered in a state. You earned $1. Do nothing.
- **"System health warning"** -- Something might be wrong with the app. Check the dashboard. If it loads, you're probably fine. If it doesn't, see **What to Do When Things Break** below.
- **"Scan failed for [merchant]"** -- The system couldn't pull transaction data for a merchant. This usually fixes itself on the next scan. If you see it repeatedly for the same merchant, their API connection may have expired (they'll need to reconnect their store).

### How to Tell If the App Is Running vs. Stopped

1. Try loading `http://localhost:3000` -- if the dashboard appears, the frontend is running.
2. Try loading `http://localhost:8000/health` -- if you see `{"status": "healthy"}`, the backend is running.
3. If the dashboard loads but shows "No data available," the backend might be stopped while the frontend is still up. Start the backend (see below).

---

## Starting the App Each Time

Every time you restart your computer (or close the terminal windows), you need to start two things: the backend and the frontend. Here's how.

### Step 1: Start the Backend

Open a terminal (Command Prompt, PowerShell, or Git Bash) and type:

```
cd D:\ALL_Hive\Opus_Lab\Prompts\Builds\TaxShieldAgent
python -m uvicorn backend.main:app --reload --port 8000
```

You should see output that says something like `Uvicorn running on http://0.0.0.0:8000`. **Leave this terminal window open.** If you close it, the backend stops.

### Step 2: Start the Frontend

Open a **second** terminal window and type:

```
cd D:\ALL_Hive\Opus_Lab\Prompts\Builds\TaxShieldAgent\frontend
npm start
```

You should see output that ends with something like `Compiled successfully!` and your browser should automatically open to `http://localhost:3000`. **Leave this terminal window open too.**

### What If Something Won't Start

**Backend won't start ("address already in use")**
Another process is using port 8000. Either close whatever else is running, or kill the process:
```
netstat -ano | findstr :8000
taskkill /PID <the_number_you_see> /F
```
Then try starting the backend again.

**Backend won't start ("ModuleNotFoundError")**
You need to install dependencies:
```
pip install -r requirements.txt
```

**Frontend won't start ("command not found: npm")**
Node.js isn't installed or isn't in your PATH. Download and install it from https://nodejs.org.

**Frontend won't start ("Cannot find module")**
You need to install dependencies:
```
cd D:\ALL_Hive\Opus_Lab\Prompts\Builds\TaxShieldAgent\frontend
npm install
```

### How to Check If It's Healthy

After both are running, visit:

```
http://localhost:8000/health
```

You should see something like:

```json
{
  "status": "healthy",
  "database": "connected",
  "stripe": "connected",
  "last_scan": "2026-04-12T08:00:00Z"
}
```

If `stripe` says `"disconnected"`, make sure the Stripe CLI listener is running (see Stripe webhooks section below).

---

## When a Real Merchant Connects

This is the exciting part. Here's what happens when someone actually installs your app from the Stripe Marketplace:

### What Happens Automatically (You Do Nothing)

1. The merchant clicks "Install" on the Stripe App Marketplace.
2. Stripe sends a webhook to your backend.
3. TaxShieldAgent creates a new merchant record in the database.
4. The system immediately pulls the last 12 months of their transaction data from Stripe.
5. Transactions are aggregated by state.
6. Each state is compared against the $100k economic nexus threshold.
7. The merchant sees their risk map on their dashboard within about 2 minutes.
8. If any states are YELLOW, RED, or CRITICAL, the merchant gets an email alert.

### What You Need to Do Manually

**Nothing.** The entire flow is automated. That's the whole point.

### How to Check Their Data in the Dashboard

1. Go to `http://localhost:3000`
2. You should see a list of connected merchants in the sidebar
3. Click on any merchant to see their state-by-state breakdown
4. Each state shows: total revenue, transaction count, threshold percentage, and status color

### How to Verify the $1 Fee Was Collected

When a merchant clicks FIX on a CRITICAL state:

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Payments** in the left sidebar
3. Look for a $1.00 payment from that merchant
4. The payment description will say "TaxShieldAgent - State Registration: [STATE]"

You can also check **Connect > Transfers** if you're using Stripe Connect to handle the registration fees.

---

## Monthly Tasks

Set a calendar reminder for the 1st of each month. These take about 15 minutes total.

### 1. Check F Drive Backups Are Current

Your database and configuration files should be backed up to the F drive. Check that:

- `F:\Backups\TaxShieldAgent\` exists and has recent files
- The most recent backup file date matches within the last 7 days
- The backup file size is reasonable (not 0 KB, which would mean a failed backup)

If backups look stale, manually copy your database:
```
copy D:\ALL_Hive\Opus_Lab\Prompts\Builds\TaxShieldAgent\data\taxshield.db F:\Backups\TaxShieldAgent\taxshield_backup_%date%.db
```

### 2. Review the Audit Log

Check the audit log for any failed operations:

```
http://localhost:3000/admin/audit-log
```

Look for:
- Any entries marked **FAILED** -- these mean a registration or scan didn't complete
- Repeated failures for the same merchant -- may indicate a bad connection
- Any entries you don't recognize -- shouldn't happen, but worth checking

### 3. Check Stripe Dashboard for Subscription Revenue

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Billing > Subscriptions**
3. Note: how many active subscriptions you have, and at which plan level (Free / Pro $9.99 / Agency $49)
4. Click **Billing > Revenue** to see your MRR (Monthly Recurring Revenue) chart

### 4. Update Nexus Thresholds If Any States Changed

States occasionally change their economic nexus thresholds. This doesn't happen often (maybe once or twice a year), but when it does, you need to update the app.

1. Visit [Tax Foundation - Economic Nexus](https://taxfoundation.org/economic-nexus-state-sales-tax/) to check for any changes
2. If a state changed its threshold, open the file:
   ```
   D:\ALL_Hive\Opus_Lab\Prompts\Builds\TaxShieldAgent\backend\nexus_data.py
   ```
3. Find the state in the dictionary and update the `threshold_amount` value
4. Restart the backend for changes to take effect

---

## What to Do When Things Break

### Backend Won't Start

**Symptom:** You run the backend command and get an error.

**Fixes to try, in order:**
1. Check that Python is installed: `python --version` (should show 3.10 or higher)
2. Check for a port conflict: `netstat -ano | findstr :8000` -- if something is there, kill it
3. Check that your `.env` file exists in the project root and has the required values
4. Check the error message carefully. If it mentions a missing module, run `pip install -r requirements.txt`

### Dashboard Shows No Data

**Symptom:** The dashboard loads, but it's empty -- no merchants, no map data.

**Fixes to try:**
1. Check that the backend is running (visit `http://localhost:8000/health`)
2. Check that `DB_PATH` in your `.env` file points to a real database file
3. Check that the database file actually exists at that path
4. If the database is missing or corrupted, you may need to restore from your F drive backup

### Claude Isn't Generating Messages

**Symptom:** Merchants aren't getting AI-generated alert messages, or the message fields are blank.

**Fixes to try:**
1. Go to [Anthropic Console](https://console.anthropic.com) and check your credit balance
2. If you're out of credits, add more. The app uses very little (a few cents per day for typical usage)
3. Check that `ANTHROPIC_API_KEY` is set correctly in your `.env` file
4. Check the backend terminal window for any error messages mentioning "Anthropic" or "Claude"

### Stripe Webhooks Not Arriving

**Symptom:** New merchants install the app but nothing happens. Or merchants click FIX but registration doesn't process.

**Fixes to try:**
1. Make sure the Stripe CLI listener is running. Open a new terminal and run:
   ```
   stripe listen --forward-to localhost:8000/webhooks/stripe
   ```
2. If it says "stripe is not recognized," install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
3. Check that the webhook signing secret in your `.env` file matches what the Stripe CLI shows when it starts
4. In the Stripe Dashboard, go to **Developers > Webhooks** and check for failed deliveries

### Everything Looks Broken

If nothing above helps:
1. Stop both the backend and frontend (close both terminal windows)
2. Wait 10 seconds
3. Start the backend first, wait for it to say "running"
4. Start the frontend second
5. If it still doesn't work, check the `.env` file. Most problems come from missing or wrong environment variables

---

## Revenue Tracking

### Where to See Subscription Revenue

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Billing** in the left sidebar
3. **Subscriptions** shows each active subscriber and their plan
4. **Revenue** shows a chart of your MRR over time

### Where to See $1 Fix Fees

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Payments** in the left sidebar
3. Filter by amount: $1.00
4. These are your one-time registration fees

If you're using Stripe Connect:
- Go to **Connect > Transfers** to see fees flowing through the platform

### How to Calculate MRR Manually

Count up your active subscriptions:

```
(Number of Pro subscribers x $9.99) + (Number of Agency subscribers x $49.00) = Your MRR
```

Free users contribute $0 to MRR but may generate $1 fix fees and are your pipeline to paid conversions.

**Example:**
- 8 Pro subscribers = $79.92
- 2 Agency subscribers = $98.00
- Total MRR = $177.92
- Plus: 5 fix fees this month = $5.00 one-time revenue

---

## Quick Reference

| Task | How Often | Time Required |
|---|---|---|
| Check dashboard | Daily | 1 minute |
| Read alert emails | Daily | 2-4 minutes |
| Check backups | Monthly | 5 minutes |
| Review audit log | Monthly | 5 minutes |
| Check Stripe revenue | Monthly | 3 minutes |
| Update nexus thresholds | As needed (rare) | 10 minutes |
| Restart app after computer reboot | As needed | 2 minutes |

---

*Last updated: April 2026*
