"""
Stripe App JWT verification middleware for TaxShieldAgent.

Stripe Apps send a signed JWT with every request from the UI extension
to prove the request originates from a legitimate Stripe Dashboard session.
This module verifies those tokens and extracts merchant context.
"""

from __future__ import annotations

import base64
import json
import logging
import os

from fastapi import Header

logger = logging.getLogger(__name__)


def _is_production() -> bool:
    return os.getenv("APP_ENV", "development").lower() == "production"


def verify_stripe_app_token(token: str) -> dict | None:
    """Decode and verify a Stripe App JWT.

    In development mode the token payload is decoded without signature
    verification (a warning is logged).  In production the token MUST be
    verified against Stripe's JWKS endpoint or app secret.

    Returns the decoded payload dict (contains ``account_id``,
    ``user_id``, etc.) or ``None`` if the token is invalid.
    """
    if not token:
        return None

    try:
        parts = token.split(".")
        if len(parts) != 3:
            logger.warning("Stripe App token does not have 3 JWT parts")
            return None

        # Decode the payload (middle segment)
        payload_b64 = parts[1]
        # Add padding if necessary
        padding = 4 - len(payload_b64) % 4
        if padding != 4:
            payload_b64 += "=" * padding

        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        payload: dict = json.loads(payload_bytes)

        if _is_production():
            # TODO: Verify signature using Stripe JWKS endpoint or app secret.
            # For now, log a critical warning — this MUST be implemented before
            # going live.
            logger.critical(
                "PRODUCTION: Stripe App JWT signature verification is NOT "
                "implemented. Accepting token without verification — this is "
                "a security risk."
            )
        else:
            logger.warning(
                "DEV MODE: Accepting Stripe App JWT without signature "
                "verification (account_id=%s)",
                payload.get("account_id", "unknown"),
            )

        return payload

    except Exception:
        logger.exception("Failed to decode Stripe App JWT")
        return None


async def get_stripe_app_context(
    authorization: str | None = Header(None),
    x_stripe_account: str | None = Header(None),
) -> dict | None:
    """FastAPI dependency that extracts Stripe App context from the request.

    Resolution order:
      1. ``Authorization: Bearer <jwt>`` — verify as Stripe App JWT and
         extract ``account_id`` from the payload.
      2. ``X-Stripe-Account`` header — fall back for compatibility with
         the existing Stripe Connect auth flow.
      3. ``None`` — no Stripe App context available.
    """
    # 1. Try JWT from Authorization header
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
        if token:
            payload = verify_stripe_app_token(token)
            if payload:
                return {
                    "account_id": payload.get("account_id", ""),
                    "user_id": payload.get("user_id", ""),
                    "source": "stripe_app_jwt",
                }

    # 2. Fall back to X-Stripe-Account header (Stripe App passes this on some requests)
    if x_stripe_account and x_stripe_account.strip():
        return {
            "account_id": x_stripe_account.strip(),
            "user_id": None,
            "source": "stripe_app_header",
        }

    return None
