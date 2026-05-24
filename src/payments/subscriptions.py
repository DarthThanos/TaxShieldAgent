"""
Plan tier management for TaxShieldAgent.

Defines the FREE / PRO / AGENCY plan tiers with their feature limits
and provides helpers for checking permissions and upgrading.

Plan tier is persisted in the ``merchant_subscriptions`` DuckDB table.
Run ``scripts/setup_stripe_products.py`` to create Stripe Products and
populate STRIPE_*_PRICE_ID env vars before accepting paid subscriptions.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from enum import Enum
from typing import Any

from . import stripe_connect

logger = logging.getLogger(__name__)


class PlanTier(Enum):
    FREE = "free"
    PRO = "pro"
    AGENCY = "agency"


@dataclass
class MerchantPlan:
    merchant_id: str
    tier: PlanTier
    stripe_subscription_id: str | None
    states_monitored_limit: int
    alerts_per_month_limit: int
    multi_merchant: bool


# ---------------------------------------------------------------------------
# Plan limits
# ---------------------------------------------------------------------------

PLAN_LIMITS: dict[PlanTier, dict[str, Any]] = {
    PlanTier.FREE: {
        "states_monitored_limit": 3,
        "alerts_per_month_limit": 1,
        "multi_merchant": False,
    },
    PlanTier.PRO: {
        "states_monitored_limit": 50,
        "alerts_per_month_limit": -1,  # unlimited
        "multi_merchant": False,
    },
    PlanTier.AGENCY: {
        "states_monitored_limit": 50,
        "alerts_per_month_limit": -1,  # unlimited
        "multi_merchant": True,
    },
}

# Features and the minimum tier required to use them
_FEATURE_MINIMUM_TIER: dict[str, PlanTier] = {
    "all_states": PlanTier.PRO,
    "unlimited_alerts": PlanTier.PRO,
    "multi_merchant": PlanTier.AGENCY,
    "ai_explanations": PlanTier.PRO,
    "audit_export": PlanTier.PRO,
}

_TIER_RANK: dict[PlanTier, int] = {
    PlanTier.FREE: 0,
    PlanTier.PRO: 1,
    PlanTier.AGENCY: 2,
}


def get_merchant_plan(merchant_id: str) -> MerchantPlan:
    """Return the active plan for a merchant.

    Looks up the ``merchant_subscriptions`` table in DuckDB.
    Falls back to FREE if no subscription record exists.
    """
    try:
        from src.agent.db import ShieldDB
        db_path = os.getenv("DB_PATH", "data/shield.db")
        db = ShieldDB(db_path=db_path)
        try:
            record = db.get_subscription(merchant_id)
        finally:
            db.close()

        if record and record.get("status") in ("active", "cancelling"):
            tier_str = record.get("tier", "free").lower()
            try:
                tier = PlanTier(tier_str)
            except ValueError:
                tier = PlanTier.FREE
            sub_id = record.get("stripe_subscription_id")
        else:
            tier = PlanTier.FREE
            sub_id = None

    except Exception:
        logger.warning("Could not load plan for merchant %s — defaulting to FREE", merchant_id)
        tier = PlanTier.FREE
        sub_id = None

    limits = PLAN_LIMITS[tier]
    return MerchantPlan(
        merchant_id=merchant_id,
        tier=tier,
        stripe_subscription_id=sub_id,
        states_monitored_limit=limits["states_monitored_limit"],
        alerts_per_month_limit=limits["alerts_per_month_limit"],
        multi_merchant=limits["multi_merchant"],
    )


def is_feature_allowed(merchant_id: str, feature: str) -> bool:
    """Check whether a merchant's plan permits a given feature.

    Supported features: ``"all_states"``, ``"unlimited_alerts"``,
    ``"multi_merchant"``, ``"ai_explanations"``, ``"audit_export"``.

    # PLACEHOLDER: Uses get_merchant_plan() which currently always
    # returns FREE.
    """
    plan = get_merchant_plan(merchant_id)
    required_tier = _FEATURE_MINIMUM_TIER.get(feature)

    if required_tier is None:
        logger.warning("Unknown feature %r requested for merchant %s", feature, merchant_id)
        return False

    return _TIER_RANK[plan.tier] >= _TIER_RANK[required_tier]


def upgrade_plan(
    merchant_id: str,
    new_tier: PlanTier,
    annual: bool = False,
) -> dict[str, Any]:
    """Upgrade a merchant to a new plan tier.

    Creates a Stripe Subscription via ``stripe_connect.create_subscription()``
    and returns the result.

    # PLACEHOLDER: Requires STRIPE_*_PRICE_ID env vars and a real
    # subscription flow before this will work in production.
    """
    if new_tier == PlanTier.FREE:
        raise ValueError("Cannot 'upgrade' to the free tier. Use cancel instead.")

    result = stripe_connect.create_subscription(
        stripe_account_id=merchant_id,
        plan=new_tier.value,
        annual=annual,
    )

    logger.info(
        "Upgraded merchant %s to %s (annual=%s): subscription_id=%s",
        merchant_id,
        new_tier.value,
        annual,
        result.get("id", "unknown"),
    )
    return result
