"""
Stripe App API routes for TaxShieldAgent.

Lightweight endpoints optimised for the Stripe Dashboard side-panel.
These are called by the Stripe UI Extension and must respond in < 500 ms.
"""

from __future__ import annotations

import logging
import os
from typing import Any

from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse

from src.agent.db import ShieldDB
from src.web.api.middleware.auth import get_merchant_id
from src.web.api.routes.stripe_app_config import BACKEND_URL

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stripe-app", tags=["stripe-app"])


# -- Dependencies -------------------------------------------------------------

def _get_db() -> ShieldDB:
    db_path = os.getenv("DB_PATH", "data/shield.db")
    return ShieldDB(db_path=db_path)


# -- Routes -------------------------------------------------------------------

@router.get("/health")
async def health() -> dict[str, str]:
    """Simple health check for Stripe App pre-flight requests."""
    return {"status": "ok", "app": "taxshieldagent"}


@router.get("/nexus-summary")
async def nexus_summary(
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(_get_db),
) -> dict[str, Any]:
    """Lightweight nexus summary for the Stripe Dashboard panel.

    Returns only YELLOW / RED / CRITICAL states to keep the panel
    focused on actionable risks.
    """
    try:
        all_states = db.get_nexus_status(merchant_id)

        # Filter to at-risk states only
        risk_levels = {"YELLOW", "RED", "CRITICAL"}
        at_risk = [
            s for s in all_states if s.get("risk_level", "GREEN") in risk_levels
        ]

        # Build a slim response
        states: list[dict[str, Any]] = []
        critical_count = 0

        for s in at_risk:
            risk = s.get("risk_level", "YELLOW")
            threshold = float(s.get("threshold_revenue", 100_000))
            total_sales = float(s.get("total_sales", 0))
            pct = (total_sales / threshold * 100) if threshold else 0

            if risk == "CRITICAL":
                critical_count += 1

            states.append(
                {
                    "state": s.get("state", ""),
                    "risk_level": risk,
                    "total_sales": total_sales,
                    "threshold": threshold,
                    "pct": round(pct, 1),
                    "alert_id": s.get("alert_id") or s.get("id"),
                }
            )

        # Sort: CRITICAL first, then RED, then YELLOW
        severity = {"CRITICAL": 0, "RED": 1, "YELLOW": 2}
        states.sort(key=lambda x: severity.get(x["risk_level"], 3))

        return {
            "at_risk_count": len(states),
            "critical_count": critical_count,
            "states": states,
        }

    finally:
        db.close()


@router.post("/stripe-app-callback")
async def stripe_app_callback(request: Request) -> RedirectResponse:
    """Post-install callback invoked by Stripe after a merchant installs the app.

    Saves the merchant's Stripe account ID as a connected platform and
    redirects them to the standalone TaxShieldAgent dashboard.
    """
    # Extract account info from query params or body
    params = dict(request.query_params)
    account_id = params.get("account_id") or params.get("stripe_user_id", "")

    if account_id:
        logger.info(
            "Stripe App installed by account %s — saving as connected platform",
            account_id,
        )
        try:
            db = _get_db()
            # Ensure the merchant exists in our database
            db.conn.execute(
                """
                INSERT INTO platforms (merchant_id, platform, status, connected_at)
                VALUES (?, 'stripe', 'active', CURRENT_TIMESTAMP)
                ON CONFLICT (merchant_id, platform) DO UPDATE
                SET status = 'active'
                """,
                [account_id],
            )
            db.close()
        except Exception:
            logger.exception("Failed to save Stripe App install for %s", account_id)

    dashboard_url = f"{BACKEND_URL}/dashboard"
    return RedirectResponse(url=dashboard_url, status_code=302)
