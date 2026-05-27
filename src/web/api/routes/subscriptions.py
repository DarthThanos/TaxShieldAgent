"""
Subscription management endpoints for TaxShieldAgent.

Provides plan lookup, upgrade, and cancellation for merchant subscriptions.
All billing flows go through Stripe Connect via stripe_connect.py.
"""

from __future__ import annotations

import logging
import os
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from src.agent.db import ShieldDB
from src.payments.subscriptions import (
    PlanTier,
    get_merchant_plan,
    upgrade_plan,
)
from src.payments.stripe_connect import cancel_subscription
from src.web.api.middleware.auth import get_merchant_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


# -- Request models -----------------------------------------------------------

class UpgradeRequest(BaseModel):
    plan: str          # "pro" or "agency"
    annual: bool = False


class CancelRequest(BaseModel):
    subscription_id: str


# -- Dependencies -------------------------------------------------------------

def get_db() -> ShieldDB:
    db_path = os.getenv("DB_PATH", "data/shield.db")
    return ShieldDB(db_path=db_path)


# -- Routes -------------------------------------------------------------------

@router.get("/current")
async def get_current_plan(
    merchant_id: str = Depends(get_merchant_id),
) -> dict[str, Any]:
    """Return the merchant's current plan tier and limits."""
    plan = get_merchant_plan(merchant_id)
    return {
        "merchant_id": plan.merchant_id,
        "tier": plan.tier.value,
        "stripe_subscription_id": plan.stripe_subscription_id,
        "states_monitored_limit": plan.states_monitored_limit,
        "alerts_per_month_limit": plan.alerts_per_month_limit,
        "multi_merchant": plan.multi_merchant,
        "features": {
            "all_states": plan.tier != PlanTier.FREE,
            "unlimited_alerts": plan.tier != PlanTier.FREE,
            "ai_explanations": plan.tier != PlanTier.FREE,
            "audit_export": plan.tier != PlanTier.FREE,
            "multi_merchant": plan.tier == PlanTier.AGENCY,
        },
    }


@router.post("/upgrade")
async def upgrade_merchant_plan(
    body: UpgradeRequest,
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> dict[str, Any]:
    """Upgrade the merchant to Pro or Agency plan.

    Creates a Stripe Subscription for the merchant's connected account.
    Requires ``STRIPE_PRO_PRICE_ID`` / ``STRIPE_AGENCY_PRICE_ID`` to be
    set in the environment (run ``scripts/setup_stripe_products.py`` first).
    """
    plan_str = body.plan.lower()
    if plan_str not in ("pro", "agency"):
        raise HTTPException(
            status_code=400,
            detail="plan must be 'pro' or 'agency'",
        )

    try:
        tier = PlanTier.PRO if plan_str == "pro" else PlanTier.AGENCY
        result = upgrade_plan(
            merchant_id=merchant_id,
            new_tier=tier,
            annual=body.annual,
        )

        # Persist the subscription to the DB so get_merchant_plan() reflects it
        sub_id = result.get("id", "")
        if sub_id:
            db.upsert_subscription(
                merchant_id=merchant_id,
                tier=plan_str,
                stripe_subscription_id=sub_id,
            )

        return {
            "success": True,
            "plan": plan_str,
            "annual": body.annual,
            "subscription_id": sub_id,
        }
    except RuntimeError as exc:
        # Price IDs not yet configured
        raise HTTPException(status_code=503, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("Upgrade failed for merchant %s", merchant_id)
        raise HTTPException(status_code=500, detail="Subscription upgrade failed")
    finally:
        db.close()


@router.post("/cancel")
async def cancel_merchant_plan(
    body: CancelRequest,
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> dict[str, Any]:
    """Cancel a merchant subscription at period end.

    The plan remains active until the billing period ends, then reverts to Free.
    """
    try:
        ok = cancel_subscription(body.subscription_id)

        if ok:
            # Mark as cancelling in our DB — the plan stays active until period end
            db.cancel_subscription(
                merchant_id=merchant_id,
                stripe_subscription_id=body.subscription_id,
            )

        return {
            "success": ok,
            "subscription_id": body.subscription_id,
            "note": "Subscription will remain active until the end of the billing period",
        }
    except Exception as exc:
        logger.exception("Cancellation failed for merchant %s", merchant_id)
        raise HTTPException(status_code=500, detail="Cancellation failed")
    finally:
        db.close()


@router.get("/plans")
async def list_plans() -> list[dict[str, Any]]:
    """Return pricing information for all available plans."""
    return [
        {
            "tier": "free",
            "name": "Free",
            "price_monthly": 0,
            "price_annual": 0,
            "states_monitored": 3,
            "unlimited_alerts": False,
            "ai_explanations": False,
            "audit_export": False,
            "multi_merchant": False,
            "fix_fee": "included in plan",
        },
        {
            "tier": "pro",
            "name": "Pro",
            "price_monthly": 9.99,
            "price_annual": 99.90,
            "states_monitored": 50,
            "unlimited_alerts": True,
            "ai_explanations": True,
            "audit_export": True,
            "multi_merchant": False,
            "fix_fee": "included in plan",
        },
        {
            "tier": "agency",
            "name": "Agency",
            "price_monthly": 49.00,
            "price_annual": 490.00,
            "states_monitored": 50,
            "unlimited_alerts": True,
            "ai_explanations": True,
            "audit_export": True,
            "multi_merchant": True,
            "fix_fee": "included in plan",
        },
    ]
