"""
Stripe Connect authentication middleware for TaxShieldAgent.

Extracts the merchant identity from incoming requests using the
``X-Stripe-Account`` header (Stripe Connect standard), an ``Authorization``
bearer token, or a development-mode fallback.
"""

from __future__ import annotations

import os

from fastapi import Header, HTTPException


def _is_production() -> bool:
    return os.getenv("APP_ENV", "development").lower() == "production"


async def get_merchant_id(
    x_stripe_account: str | None = Header(None),
    authorization: str | None = Header(None),
) -> str:
    """FastAPI dependency that resolves the current merchant ID.

    Resolution order:
      1. ``X-Stripe-Account`` header (preferred -- Stripe Connect standard)
      2. ``Authorization: Bearer <token>`` -- in dev mode the token itself is
         used as the merchant ID (convenient for local testing).
      3. In production: reject with 401.
         In development: fall back to ``DEV_MERCHANT_ID`` env var (default
         ``"platform"``).
    """
    # 1. Stripe Connect header
    if x_stripe_account and x_stripe_account.strip():
        return x_stripe_account.strip()

    # 2. Bearer token
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
        if token:
            if _is_production():
                # In production you would validate the token against a real
                # auth provider.  For now we reject bearer tokens in prod
                # because only Stripe Connect headers are trusted.
                raise HTTPException(
                    status_code=401,
                    detail="Bearer token auth is not supported in production; "
                    "use X-Stripe-Account header",
                )
            # Dev mode: treat the token as the merchant ID for convenience
            return token

    # 3. Fallback
    if _is_production():
        raise HTTPException(
            status_code=401,
            detail="Missing Stripe account header",
        )

    return os.getenv("DEV_MERCHANT_ID", "platform")
