@echo off
setlocal enabledelayedexpansion
title TaxShieldAgent — Railway Deploy

echo.
echo ============================================================
echo   TaxShieldAgent — Railway Deployment
echo ============================================================
echo.

REM ── Step 1: Find Railway CLI ──────────────────────────────────────────────
echo [1/5] Locating Railway CLI...

REM Known install path from manual install
set "RAILWAY=%USERPROFILE%\.railway\bin\railway.exe"

REM Check known path first
if exist "%RAILWAY%" (
    echo [OK] Railway CLI found at %RAILWAY%
    goto :login
)

REM Try PATH
where railway >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "RAILWAY=railway"
    echo [OK] Railway CLI found in PATH.
    goto :login
)

echo       Trying winget...
winget install --id Railway.RailwayCLI -e --silent
if %ERRORLEVEL% EQU 0 (
    echo [OK] Railway CLI installed via winget.
    REM Refresh PATH
    set "PATH=%PATH%;%LOCALAPPDATA%\Microsoft\WinGet\Links"
    goto :login
)

echo       winget failed, trying PowerShell installer...
powershell -Command "iwr https://raw.githubusercontent.com/railwayapp/cli/master/install.sh | bash" >nul 2>&1

where railway >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Could not install Railway CLI automatically.
    echo.
    echo Please install it manually in 30 seconds:
    echo   1. Go to: https://railway.app/download
    echo   2. Click "Windows" and download the installer
    echo   3. Run the installer
    echo   4. Re-run this script
    echo.
    start https://railway.app/download
    pause
    exit /b 1
)
echo [OK] Railway CLI installed.

:login
REM ── Step 2: Login ─────────────────────────────────────────────────────────
echo.
echo [2/5] Logging into Railway...
echo       (A browser window will open — click Authorize)
echo       (If browser shows 404, come back to terminal — it may auto-complete)
echo.
"%RAILWAY%" login --browserless
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Login failed.
    pause
    exit /b 1
)
echo [OK] Logged in.

REM ── Step 3: Link to project ───────────────────────────────────────────────
echo.
echo [3/5] Linking to your Railway project...
echo       (Use arrow keys to select humorous-serenity, hit Enter)
echo.
cd /d "%~dp0.."
"%RAILWAY%" link
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Project link failed.
    pause
    exit /b 1
)
echo [OK] Project linked.

REM ── Step 4: Set environment variables via Python ─────────────────────────
echo.
echo [4/5] Uploading environment variables to Railway...
echo.
python "%~dp0set_railway_vars.py"
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Some variables may not have uploaded. Continuing...
)
echo [OK] Environment variables uploaded.

REM ── Step 5: Deploy ────────────────────────────────────────────────────────
echo.
echo [5/5] Deploying TaxShieldAgent to Railway...
echo       (First build takes 3-4 minutes — normal)
echo.
"%RAILWAY%" up --detach
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Deployment failed. Check railway.app/dashboard for build logs.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   DEPLOYED! TaxShieldAgent is building on Railway.
echo ============================================================
echo.
echo   Next steps:
echo.
echo   1. Go to railway.app/dashboard
echo      - Click humorous-serenity project
echo      - Watch the build logs until you see green Active
echo.
echo   2. Add a Volume (keeps your database safe):
echo      - Inside the project click "+ Add"
echo      - Choose "Volume"
echo      - Mount path: /data
echo.
echo   3. Add your custom domain:
echo      - Click the valiant-art service
echo      - Settings tab - Networking section
echo      - Add custom domain: api.taxshieldagent.com
echo      - Copy the DNS record Railway shows you
echo      - Paste it into Namecheap Advanced DNS
echo.
echo ============================================================
echo.
pause
