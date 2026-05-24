"""
Alert management endpoints for TaxShieldAgent.

Provides CRUD-like operations on nexus alerts: listing, detail with
AI explanation, confirm-fix (triggers Stripe tax registration), snooze,
and nexus concept explainers.
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from src.agent.claude_agent import ComplianceAgent
from src.agent.db import ShieldDB
from src.agent.nexus_engine import NexusEngine
from src.agent.remediator import Remediator
from src.web.api.middleware.auth import get_merchant_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/alerts", tags=["alerts"])


# -- Request models -----------------------------------------------------------

class ConfirmFixRequest(BaseModel):
    user_confirmed: bool
    state: str


class SnoozeRequest(BaseModel):
    days: int = Field(..., ge=1, le=7)


# -- Dependencies -------------------------------------------------------------

def get_db() -> ShieldDB:
    db_path = os.getenv("DB_PATH", "data/shield.db")
    return ShieldDB(db_path=db_path)


def get_compliance_agent() -> ComplianceAgent:
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    return ComplianceAgent(api_key=api_key)


def get_remediator(db: ShieldDB = Depends(get_db)) -> Remediator:
    stripe_key = os.getenv("STRIPE_SECRET_KEY", "")
    platform_id = os.getenv("MERCHANT_ID", "platform")
    return Remediator(
        stripe_secret_key=stripe_key,
        platform_account_id=platform_id,
        db=db,
    )


# -- Helpers ------------------------------------------------------------------

def _find_alert(alerts: list[dict], alert_id: str) -> dict:
    """Find an alert by ID within a list, or raise 404."""
    for alert in alerts:
        if alert["id"] == alert_id:
            return alert
    raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")


# -- Routes -------------------------------------------------------------------

@router.get("/")
async def list_alerts(
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> list[dict[str, Any]]:
    """Return all open alerts for the merchant."""
    try:
        return db.get_open_alerts(merchant_id)
    finally:
        db.close()


@router.get("/explain-nexus/{state}")
async def explain_nexus(
    state: str,
    agent: ComplianceAgent = Depends(get_compliance_agent),
) -> dict[str, str]:
    """Return a plain-English explanation of economic nexus for a state."""
    explanation = agent.explain_nexus_concept(state.upper())
    return {"state": state.upper(), "explanation": explanation}


@router.get("/{alert_id}")
async def get_alert(
    alert_id: str,
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
    agent: ComplianceAgent = Depends(get_compliance_agent),
) -> dict[str, Any]:
    """Return a single alert with an AI-generated explanation attached."""
    try:
        alerts = db.get_open_alerts(merchant_id)
        alert = _find_alert(alerts, alert_id)

        ai_explanation = agent.generate_alert_message(
            state=alert["state"],
            total_sales=float(alert["total_sales"]),
            threshold=float(alert["threshold_revenue"]),
            pct=float(alert.get("total_sales", 0))
            / float(alert.get("threshold_revenue", 1))
            * 100,
            tx_count=int(alert["transaction_count"]),
        )

        result: dict[str, Any] = dict(alert)
        result["ai_explanation"] = ai_explanation
        return result
    finally:
        db.close()


@router.post("/{alert_id}/confirm-fix")
async def confirm_fix(
    alert_id: str,
    body: ConfirmFixRequest,
    merchant_id: str = Depends(get_merchant_id),
    remediator: Remediator = Depends(get_remediator),
) -> dict[str, Any]:
    """Trigger Stripe tax registration for the merchant in a given state.

    Requires explicit user confirmation (``user_confirmed: true``).
    """
    if body.user_confirmed is not True:
        raise HTTPException(
            status_code=400,
            detail="User confirmation is required to proceed with remediation",
        )

    try:
        result = remediator.execute_fix(
            merchant_id=merchant_id,
            alert_id=alert_id,
            state=body.state.upper(),
            user_confirmed=True,
        )

        # $1 fee: attach to the merchant's most recent PaymentIntent
        # We use the alert_id as a fallback reference — in production
        # this should be the most recent payment_intent_id for the merchant
        if result.get("success"):
            db = remediator.db
            recent = db.get_recent_transactions(merchant_id, limit=1)
            if recent:
                payment_intent_id = recent[0].get("payment_intent_id")
                if payment_intent_id:
                    fee_charged = remediator.charge_fix_fee(merchant_id, payment_intent_id)
                    result["fee_charged"] = fee_charged
                    result["fee_amount"] = "$1.00"
            else:
                result["fee_charged"] = False
                result["fee_note"] = "No recent transactions found to attach fee"

        return result
    except PermissionError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    finally:
        remediator.db.close()


@router.post("/{alert_id}/snooze")
async def snooze_alert(
    alert_id: str,
    body: SnoozeRequest,
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> dict[str, Any]:
    """Snooze an alert for up to 7 days.

    Phase 1 implementation: resolves the alert with a note.  Phase 2 will
    add a proper snooze status with automatic re-opening.
    """
    try:
        # Verify the alert exists and belongs to this merchant
        alerts = db.get_open_alerts(merchant_id)
        _find_alert(alerts, alert_id)

        # Phase 1: resolve with "snoozed" semantics
        now = datetime.now(timezone.utc)
        snooze_until = now + timedelta(days=body.days)

        # Update status to snoozed and set resolved_at to the snooze expiry
        db.conn.execute(
            """
            UPDATE nexus_alerts
            SET status = 'snoozed', resolved_at = ?
            WHERE id = ?
            """,
            [snooze_until, alert_id],
        )

        logger.info(
            "Alert %s snoozed until %s for merchant %s",
            alert_id,
            snooze_until.isoformat(),
            merchant_id,
        )

        return {"snoozed": True, "until": snooze_until.isoformat()}
    finally:
        db.close()
