"""
$1 application-fee billing logic for TaxShieldAgent.

Handles charging the platform remediation fee and reporting on
collected revenue.

PLACEHOLDER MODULE: Fully structured but needs wiring to real
payment flows (called from remediator.py after a successful fix).
"""

from __future__ import annotations

import logging
from typing import Any

import stripe

logger = logging.getLogger(__name__)

PLATFORM_FIX_FEE_CENTS: int = 100  # $1.00


def charge_remediation_fee(
    stripe_account_id: str,
    payment_intent_id: str,
    stripe_secret_key: str,
) -> dict[str, Any]:
    """Attach the $1 platform fee to a PaymentIntent on a connected account.

    Modifies the given PaymentIntent to add an ``application_fee_amount``
    of 100 cents ($1.00).

    Returns ``{"charged": True, "fee_cents": 100, "payment_intent_id": ...}``
    on success, or ``{"charged": False, "error": ...}`` on failure.

    # PLACEHOLDER: In production, this is called from remediator.py after
    # successful fix.
    """
    stripe.api_key = stripe_secret_key

    try:
        stripe.PaymentIntent.modify(
            payment_intent_id,
            application_fee_amount=PLATFORM_FIX_FEE_CENTS,
            stripe_account=stripe_account_id,
        )
        logger.info(
            "Charged remediation fee of %d cents on PaymentIntent %s "
            "(account %s)",
            PLATFORM_FIX_FEE_CENTS,
            payment_intent_id,
            stripe_account_id,
        )
        return {
            "charged": True,
            "fee_cents": PLATFORM_FIX_FEE_CENTS,
            "payment_intent_id": payment_intent_id,
        }

    except stripe.error.StripeError as e:
        logger.error(
            "Failed to charge remediation fee on PaymentIntent %s "
            "(account %s): %s",
            payment_intent_id,
            stripe_account_id,
            str(e),
        )
        return {
            "charged": False,
            "error": str(e),
        }


def get_platform_revenue_summary(stripe_secret_key: str) -> dict[str, Any]:
    """Summarise platform revenue from application fees.

    Fetches the last 100 application-fee balance transactions and returns
    aggregate totals.

    Returns ``{"total_fees_collected": float, "fix_count": int,
    "period": "last_100_transactions"}``.

    # PLACEHOLDER: Wire up to dashboard reporting endpoint.
    """
    stripe.api_key = stripe_secret_key

    try:
        txns = stripe.BalanceTransaction.list(type="application_fee", limit=100)

        total_cents = 0
        count = 0
        for txn in txns.auto_paging_iter():
            total_cents += txn["amount"]
            count += 1

        return {
            "total_fees_collected": total_cents / 100.0,
            "fix_count": count,
            "period": "last_100_transactions",
        }

    except stripe.error.StripeError as e:
        logger.error("Failed to fetch platform revenue summary: %s", str(e))
        return {
            "total_fees_collected": 0.0,
            "fix_count": 0,
            "period": "last_100_transactions",
            "error": str(e),
        }
