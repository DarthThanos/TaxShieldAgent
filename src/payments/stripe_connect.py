"""
Stripe Connect platform logic for TaxShieldAgent.

Handles OAuth onboarding, subscription management, and account
retrieval for connected Stripe accounts.

PLACEHOLDER MODULE: All functions are fully structured and documented
but require real Stripe Product/Price IDs before production use.
Set the STRIPE_*_PRICE_ID environment variables after creating the
corresponding products in your Stripe Dashboard.
"""

from __future__ import annotations

import logging
import os
from typing import Any

import stripe

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Price IDs — read at call-time so .env changes take effect without restart
# ---------------------------------------------------------------------------

def _get_price_map() -> dict[str, dict[str, str]]:
    """Read Price IDs from env at call-time (not module load time)."""
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


# OAuth
STRIPE_CLIENT_ID = os.getenv("STRIPE_CONNECT_CLIENT_ID", os.getenv("STRIPE_CLIENT_ID", ""))
STRIPE_CONNECT_REDIRECT_URI = os.getenv(
    "STRIPE_REDIRECT_URI", os.getenv("STRIPE_CONNECT_REDIRECT_URI", "http://localhost:8001/stripe-app/stripe-app-callback")
)


def generate_connect_oauth_url(state_token: str) -> str:
    """Build a Stripe Connect Standard OAuth URL for merchant onboarding.

    ``state_token`` is an opaque CSRF token that will be echoed back
    in the redirect to verify the request originated from your app.

    Returns the fully-formed authorization URL.
    """
    client_id = os.getenv("STRIPE_CONNECT_CLIENT_ID", os.getenv("STRIPE_CLIENT_ID", ""))
    redirect_uri = os.getenv(
        "STRIPE_REDIRECT_URI",
        os.getenv("STRIPE_CONNECT_REDIRECT_URI", "http://localhost:8001/stripe-app/stripe-app-callback"),
    )
    base = "https://connect.stripe.com/oauth/authorize"
    params = (
        f"response_type=code"
        f"&client_id={client_id}"
        f"&scope=read_write"
        f"&redirect_uri={redirect_uri}"
        f"&state={state_token}"
    )
    url = f"{base}?{params}"
    logger.info("Generated Connect OAuth URL (state_token=%s)", state_token)
    return url


def exchange_oauth_code(code: str) -> dict[str, Any]:
    """Exchange an OAuth authorization code for connected-account credentials.

    Calls ``stripe.OAuth.token()`` and returns a dict with:
    ``stripe_user_id``, ``access_token``, ``refresh_token``.

    Raises on any Stripe error.
    """
    response = stripe.OAuth.token(grant_type="authorization_code", code=code)
    result: dict[str, Any] = {
        "stripe_user_id": response["stripe_user_id"],
        "access_token": response["access_token"],
        "refresh_token": response.get("refresh_token", ""),
    }
    logger.info("OAuth code exchanged for account %s", result["stripe_user_id"])
    return result


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


def get_account_details(stripe_account_id: str) -> dict[str, Any]:
    """Retrieve details for a connected Stripe account.

    Returns the Account object as a dict.
    """
    account = stripe.Account.retrieve(stripe_account_id)
    logger.info("Retrieved account details for %s", stripe_account_id)
    return dict(account)
