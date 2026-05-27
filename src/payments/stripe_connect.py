"""
Subscription billing for TaxShieldAgent.

Handles Pro and Agency plan subscriptions via Stripe Checkout.
No Connect, no OAuth, no application fees — pure subscription billing.
Merchants subscribe directly; the app is a Stripe Marketplace extension.

Requires STRIPE_PRO_PRICE_ID and STRIPE_AGENCY_PRICE_ID env vars.
Create these products in your Stripe Dashboard before going live.
"""

from __future__ import annotations

import logging
import os
from typing import Any

import stripe

logger = logging.getLogger(__name__)


def _get_price_map() -> dict[str, dict[str, str]]:
    """Read Price IDs from env at call-time so .env changes take effect without restart."""
    return {
        "pro": {
            "monthly": os.getenv("STRIPE_PRO_PRICE_ID", ""),
            "annual": os.getenv("STRIPE_PRO_ANNUAL_PRICE_ID", ""),
        },
        "agency": {
            "monthly": os.getenv("STRIPE_AGENCY_PRICE_ID", ""),
            "annual": os.getenv("STRIPE_AGENCY_ANNUAL_PRICE_ID", ""),
        },
    }


def create_subscription(
    stripe_account_id: str,
    plan: str,
    annual: bool = False,
) -> dict[str, Any]:
    """Create a Stripe Subscription for a connected account.

    ``plan`` must be ``"pro"`` or ``"agency"``.
    Set ``annual=True`` for yearly billing.

    Returns the Stripe Subscription object as a dict.

    # PLACEHOLDER: Requires STRIPE_*_PRICE_ID env vars to be set with
    # real Price IDs from your Stripe Dashboard before this will work.
    """
    _price_map = _get_price_map()
    if plan not in _price_map:
        raise ValueError(f"Unknown plan: {plan!r}. Must be 'pro' or 'agency'.")

    billing_period = "annual" if annual else "monthly"
    price_id = _price_map[plan][billing_period]

    if not price_id:
        raise RuntimeError(
            f"Price ID for plan={plan!r} ({billing_period}) is not configured. "
            f"Set the corresponding STRIPE_*_PRICE_ID environment variable."
        )

    subscription = stripe.Subscription.create(
        customer=stripe_account_id,
        items=[{"price": price_id}],
        # No application_fee_percent — subscription billing, not Connect platform fees
    )

    logger.info(
        "Created %s %s subscription (id=%s) for account %s",
        plan,
        billing_period,
        subscription["id"],
        stripe_account_id,
    )
    return dict(subscription)


def cancel_subscription(subscription_id: str) -> bool:
    """Cancel a subscription at the end of the current billing period.

    Returns True on success, raises on Stripe errors.
    """
    stripe.Subscription.modify(
        subscription_id,
        cancel_at_period_end=True,
    )
    logger.info("Subscription %s set to cancel at period end", subscription_id)
    return True


