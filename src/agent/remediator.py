"""
Remediation engine for TaxShieldAgent.

Executes the "FIX" action: registers a merchant for state sales tax
collection via Stripe Tax. Requires explicit merchant confirmation.
Monetisation is via subscription — no per-action fees.
"""

from __future__ import annotations

import logging
from typing import Any

import stripe

from .db import ShieldDB

logger = logging.getLogger(__name__)


class Remediator:
    """Handles end-to-end remediation: tax registration + billing."""

    def __init__(
        self,
        stripe_secret_key: str,
        db: ShieldDB,
    ) -> None:
        self.stripe_secret_key = stripe_secret_key
        self.db = db
        stripe.api_key = stripe_secret_key

    def execute_fix(
        self,
        merchant_id: str,
        alert_id: str,
        state: str,
        user_confirmed: bool,
    ) -> dict[str, Any]:
        """Register a merchant for state sales tax collection.

        The caller MUST set ``user_confirmed=True`` to prove the merchant
        explicitly approved the action.  Without confirmation this raises
        ``PermissionError``.

        On success the alert is resolved and an audit entry is created.
        Monetisation is via Pro/Agency subscription — no per-action fee.

        Returns a result dict with ``success``, ``registration_id`` (or
        ``error``), and ``state``.
        """
        if user_confirmed is not True:
            raise PermissionError("User confirmation required")

        try:
            registration = stripe.tax.Registration.create(
                country="US",
                country_options={
                    "us": {
                        "state": state.upper(),
                        "type": "state_sales_tax",
                    },
                },
                stripe_account=merchant_id,
            )

            registration_id: str = registration["id"]

            # Audit: successful registration
            self.db.log_audit(
                merchant_id=merchant_id,
                action="tax_registration_success",
                state=state.upper(),
                amount_cents=0,
                stripe_reg_id=registration_id,
                confirmed_by="user",
            )

            # Resolve the alert
            self.db.resolve_alert(alert_id, resolved_by="remediator")

            logger.info(
                "Successfully registered merchant %s for sales tax in %s "
                "(registration_id=%s)",
                merchant_id,
                state,
                registration_id,
            )

            return {
                "success": True,
                "registration_id": registration_id,
                "state": state.upper(),
            }

        except stripe.error.StripeError as e:
            # Audit: failed registration attempt
            self.db.log_audit(
                merchant_id=merchant_id,
                action="tax_registration_failed",
                state=state.upper(),
                amount_cents=0,
                stripe_reg_id=None,
                confirmed_by="user",
            )

            logger.error(
                "Failed to register merchant %s in %s: %s",
                merchant_id,
                state,
                str(e),
            )

            return {
                "success": False,
                "error": str(e),
                "state": state.upper(),
            }

