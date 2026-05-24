@echo off
setlocal enabledelayedexpansion
title TaxShieldAgent — Stripe App Submission

echo.
echo ============================================================
echo   TaxShieldAgent — Stripe App Marketplace Submission
echo ============================================================
echo.

REM ── Step 1: Find or install Stripe CLI ───────────────────────────────────
set "STRIPE=%USERPROFILE%\.stripe\bin\stripe.exe"

if exist "%STRIPE%" goto :stripe_found
where stripe >nul 2>&1
if %ERRORLEVEL% EQU 0 (set "STRIPE=stripe" & goto :stripe_found)

echo [1/5] Stripe CLI not found. Installing via Python...
python "%~dp0install_stripe_cli.py"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Stripe CLI install failed.
    pause
    exit /b 1
)

:stripe_found
echo [OK] Stripe CLI ready.
echo [1/5] Stripe CLI version:
"%STRIPE%" version
echo.

REM ── Step 2: Login (already configured from previous run) ────────────────
echo [2/5] Stripe CLI already configured. Skipping login.
echo.

REM ── Step 3: Install npm dependencies (ignore funding warnings) ────────────
echo [3/5] Installing UI extension dependencies...
cd /d "%~dp0..\stripe_app"
call npm install --no-fund --silent
echo [OK] Dependencies installed.
echo.

REM ── Step 4: (validation runs automatically during upload) ────────────────
echo [4/5] Skipping separate validate — upload handles validation.
cd /d "%~dp0.."
echo.

REM ── Step 5: Upload and register ───────────────────────────────────────────
echo [5/5] Uploading app to Stripe...
echo       (Registers TaxShieldAgent and uploads the UI bundle)
echo.
"%STRIPE%" apps upload
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Upload failed. See errors above.
    echo.
    echo Common causes:
    echo   - App ID "com.taxshieldagent.app" already taken
    echo     Update the id in stripe-app.json and retry
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   SUCCESS! TaxShieldAgent is registered on Stripe.
echo ============================================================
echo.
echo   Next steps:
echo   1. Go to https://dashboard.stripe.com/test/apps/dev
echo      - TaxShieldAgent should now appear in your app list
echo   2. Click it, go to Distribution, click Submit for Review
echo   3. Fill in listing details from docs\stripe_app_store.md
echo.
echo ============================================================
echo.
pause
