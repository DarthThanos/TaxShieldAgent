# Domain + Railway Deployment Guide
## How to go from zero to a live website with a custom domain
### Reference guide built from TaxShieldAgent deployment — 2026-04-22

---

## OVERVIEW
This guide documents the exact steps to:
1. Register a domain on Namecheap
2. Deploy a Python/FastAPI backend to Railway
3. Wire up a custom domain (api.yourdomain.com + yourdomain.com)
4. Serve a landing page from the backend

---

## STEP 1 — Register the Domain on Namecheap

1. Go to **namecheap.com**
2. Search for your domain name
3. Add to cart and purchase (~$10-15/year for .com)
4. After purchase, domain shows as **ACTIVE** in your Namecheap dashboard
5. You do NOT need to touch DNS yet — just confirm it's active

---

## STEP 2 — Set Up Railway Project

1. Go to **railway.com** and log in (or create account)
2. Click **New Project**
3. Select **Empty Project**
4. Inside the project, click **New Service** → **Empty Service**
5. Railway creates a service (it will have a random name like "valiant-art")
6. Leave it empty for now — deployment comes next

---

## STEP 3 — Deploy Your Backend to Railway

### Requirements
Your project needs these files at the root:

**`Dockerfile`** (Railway detects this automatically):
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN mkdir -p data
```

**`start.py`** (handles Railway's dynamic $PORT):
```python
import os, uvicorn
port = int(os.environ.get("PORT", 8000))
if __name__ == "__main__":
    uvicorn.run("src.web.api.app:app", host="0.0.0.0", port=port, log_level="info")
```

**`.railwayignore`** (prevents .env from overriding Railway vars):
```
.env
.env.local
data/
__pycache__/
*.pyc
.git/
node_modules/
```

**In your `app.py`** — use `override=False` so Railway env vars take priority:
```python
load_dotenv(find_dotenv(usecwd=True), override=False)
```

### Deploy Command
Install Railway CLI first (Python method if winget fails):
```python
# Download from GitHub releases API
import urllib.request, zipfile, os, winreg
url = "https://github.com/railwayapp/cli/releases/latest/download/railway_windows_amd64.zip"
# Extract to %USERPROFILE%\.railway\bin\railway.exe
```

Then from your project folder in PowerShell:
```powershell
& "$env:USERPROFILE\.railway\bin\railway.exe" link   # links to your Railway project
& "$env:USERPROFILE\.railway\bin\railway.exe" up     # deploys
```

Railway will:
- Build the Docker image
- Deploy the container
- Give you a URL like `valiant-art-production-fd10.up.railway.app`

### Set Environment Variables on Railway
Use `railway variables set KEY=VALUE` or upload via script:
```python
# scripts/set_railway_vars.py — reads .env and uploads to Railway
import subprocess
from pathlib import Path
RAILWAY_EXE = str(Path.home() / ".railway" / "bin" / "railway.exe")
# reads each line of .env and calls: railway variables set KEY=VALUE
```

**Critical Railway variables to set:**
- `APP_ENV=production`
- `DB_PATH=/data/shield.db` (if using persistent volume)
- `PORT` — Railway sets this automatically, do NOT override it

---

## STEP 4 — Add Custom Domain to Railway (api.yourdomain.com)

1. In Railway dashboard, go to your service → **Settings** → **Networking**
2. Scroll to **Custom Domains**
3. Click **+ Add Domain**
4. Type: `api.yourdomain.com`
5. Set port to **8080** (or whatever your app listens on)
6. Railway shows you two DNS records:

| Type | Host | Value |
|------|------|-------|
| CNAME | api | xxxxxxxx.up.railway.app. |
| TXT | _railway-verify.api | railway-verify=xxxxxxxxx |

---

## STEP 5 — Add DNS Records in Namecheap

1. Go to **namecheap.com** → **Domain List** → click **Manage** on your domain
2. Click **Advanced DNS** tab
3. Click **Add New Record** for each record Railway gave you:

**For api.yourdomain.com:**
- Type: **CNAME Record** | Host: `api` | Value: `xxxxxxxx.up.railway.app.` | TTL: Automatic
- Type: **TXT Record** | Host: `_railway-verify.api` | Value: `railway-verify=xxxxxxxxx` | TTL: Automatic

4. Save changes
5. Back in Railway — wait for the yellow warning triangle to turn into a **green checkmark** (5-30 minutes)

---

## STEP 6 — Add Root Domain (yourdomain.com)

Same process as Step 4-5 but for the root domain:

1. Railway → Settings → Networking → **+ Add Domain**
2. Type: `yourdomain.com` (no subdomain prefix)
3. Port: **8080**
4. Railway gives you different DNS records:

| Type | Host | Value |
|------|------|-------|
| CNAME | @ | yyyyyyyy.up.railway.app. |
| TXT | _railway-verify | railway-verify=yyyyyyyyy |

5. In Namecheap Advanced DNS, add:
- Type: **CNAME Record** | Host: `@` | Value: `yyyyyyyy.up.railway.app.` | TTL: Automatic
- Type: **TXT Record** | Host: `_railway-verify` | Value: `railway-verify=yyyyyyyyy` | TTL: Automatic

> **Note:** Namecheap may already have an A Record for `@` — delete it first before adding the CNAME.

---

## STEP 7 — Serve a Landing Page from FastAPI

Add routes to your FastAPI `app.py` to serve HTML files:

```python
from pathlib import Path
from fastapi.responses import HTMLResponse

_SITE_DIR = Path(__file__).resolve().parents[3] / "docs" / "site"

@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def landing_page():
    return HTMLResponse((_SITE_DIR / "index.html").read_text(encoding="utf-8"))

@app.get("/privacy", response_class=HTMLResponse, include_in_schema=False)
async def privacy_page():
    return HTMLResponse((_SITE_DIR / "privacy.html").read_text(encoding="utf-8"))

@app.get("/terms", response_class=HTMLResponse, include_in_schema=False)
async def terms_page():
    return HTMLResponse((_SITE_DIR / "terms.html").read_text(encoding="utf-8"))
```

Put your HTML files in `docs/site/index.html`, `docs/site/privacy.html`, etc.

---

## STEP 8 — Verify Everything Works

Test these URLs after DNS propagates:
```
https://api.yourdomain.com/health    → should return {"status":"ok"}
https://yourdomain.com               → should show landing page
https://yourdomain.com/privacy       → should show privacy policy
https://yourdomain.com/terms         → should show terms of service
```

---

## COMMON ISSUES & FIXES

| Problem | Fix |
|---------|-----|
| `$PORT not a valid integer` | Create `start.py` that reads `os.environ.get("PORT", 8000)` |
| `.env overriding Railway vars` | Add `.env` to `.railwayignore`, use `override=False` in load_dotenv |
| `APP_ENV stuck on development` | Set `APP_ENV=production` in Railway variables, default to "production" in code |
| Railway CLI not in PATH | Use full path: `& "$env:USERPROFILE\.railway\bin\railway.exe"` |
| `No linked project found` | Must run `railway up` from the project folder, not home directory |
| DNS not propagating | Wait 5-30 minutes; use dnschecker.org to monitor |
| Namecheap CNAME conflict | Delete existing A Record for `@` before adding CNAME |

---

## COST SUMMARY
- **Namecheap domain:** ~$10-15/year
- **Railway Hobby plan:** $5/month (includes enough for one small service)
- **Railway volume (persistent storage):** ~$0.25/GB/month

---

## TIME ESTIMATE
- Domain registration: 5 minutes
- Railway setup + first deploy: 15-20 minutes
- DNS setup in Namecheap: 5 minutes
- DNS propagation wait: 5-30 minutes
- Landing page wired up: 10 minutes
- **Total: ~1 hour end to end**
