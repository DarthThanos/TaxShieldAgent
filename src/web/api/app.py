"""
Main FastAPI application for TaxShieldAgent.

Assembles routers, configures CORS, and provides health and lifecycle
management for the API service.
"""

from __future__ import annotations

import logging
import os
from collections.abc import AsyncGenerator
from dotenv import load_dotenv, find_dotenv
# Load .env for local development only — do NOT override Railway's env vars
load_dotenv(find_dotenv(usecwd=True), override=False)
from contextlib import asynccontextmanager
from typing import Any

from pathlib import Path
import sentry_sdk
if _sentry_dsn := os.getenv("SENTRY_DSN"):
    sentry_sdk.init(dsn=_sentry_dsn, traces_sample_rate=0.2)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse

from src.agent.db import ShieldDB
from src.web.api.routes import alerts, audit, connectors, dashboard, stripe_app, subscriptions, webhooks

logger = logging.getLogger(__name__)

APP_VERSION = "0.4.4"


def _get_environment() -> str:
    return os.getenv("APP_ENV", "production")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: initialise the database schema on startup."""
    db_path = os.getenv("DB_PATH", "data/shield.db")
    logger.info(
        "Starting TaxShieldAgent API v%s (env=%s, db=%s)",
        APP_VERSION,
        _get_environment(),
        db_path,
    )
    db = ShieldDB(db_path=db_path)
    db.close()
    logger.info("Database schema initialised")
    yield
    logger.info("TaxShieldAgent API shutting down")


app = FastAPI(
    title="TaxShieldAgent API",
    version=APP_VERSION,
    description=(
        "Compliance-as-a-Service for Stripe merchants. Monitors economic "
        "nexus thresholds across US states and automates sales tax registration."
    ),
    lifespan=lifespan,
)

# -- CORS ---------------------------------------------------------------------

_env = _get_environment()
# Allow all origins — API uses header-based auth (X-Stripe-Account),
# not cookies, so wildcard CORS is safe.  Stripe Apps run inside an
# iframe whose origin varies, making a whitelist impractical.
_origins = (
    os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
    if os.getenv("CORS_ALLOWED_ORIGINS")
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,  # header-based auth, not cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# -- Routers ------------------------------------------------------------------

app.include_router(webhooks.router)
app.include_router(dashboard.router)
app.include_router(audit.router)
app.include_router(alerts.router)
app.include_router(connectors.router)
app.include_router(stripe_app.router)
app.include_router(subscriptions.router)


# -- Site pages (landing + privacy) -------------------------------------------

_SITE_DIR = Path(__file__).resolve().parents[3] / "docs" / "site"


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def landing_page():
    """Serve the TaxShieldAgent landing page."""
    html = (_SITE_DIR / "index.html").read_text(encoding="utf-8")
    return HTMLResponse(content=html)


@app.get("/privacy", response_class=HTMLResponse, include_in_schema=False)
async def privacy_page():
    """Serve the privacy policy page."""
    html = (_SITE_DIR / "privacy.html").read_text(encoding="utf-8")
    return HTMLResponse(content=html)


@app.get("/terms", response_class=HTMLResponse, include_in_schema=False)
async def terms_page():
    """Serve the terms of service page."""
    html = (_SITE_DIR / "terms.html").read_text(encoding="utf-8")
    return HTMLResponse(content=html)


# -- Health check -------------------------------------------------------------

@app.get("/health", tags=["system"])
async def health_check() -> dict[str, Any]:
    """Verify that the API and its DuckDB connection are healthy."""
    db_status = "connected"
    db_path = os.getenv("DB_PATH", "data/shield.db")
    try:
        db = ShieldDB(db_path=db_path)
        db.conn.execute("SELECT 1")
        db.close()
    except Exception as exc:
        logger.error("Health check DB probe failed: %s", exc)
        db_status = "error"

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "version": APP_VERSION,
        "db": db_status,
        "environment": _get_environment(),
    }


# -- Global exception handler ------------------------------------------------

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions: log the traceback and return a
    generic 500 so internal details are never leaked to clients."""
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )
