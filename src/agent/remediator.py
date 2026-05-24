"""
Remediation engine for TaxShieldAgent.

Executes the "FIX" action: registers a merchant for state sales tax
collection via Stripe Tax and charges the $1 platform fee.
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
        platform_account_id: str,
        db: ShieldDB,
    ) -> None:
        self.stripe_secret_key = stripe_secret_key
        self.platform_account_id = platform_account_id
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
        The $1 platform fee is NOT charged here -- it is collected separately
        via ``charge_fix_fee()`` on the merchant's next PaymentIntent using
        ``application_fee_amount``.

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

    # BILLING: Called separately after a successful fix.
    # The $1 platform fee is collected as an application_fee_amount on the
    # merchant's next PaymentIntent rather than as a standalone charge.
    def charge_fix_fee(
        self,
        merchant_id: str,
        payment_intent_id: str,
    ) -> bool:
        """Attach the $1 platform fee to a PaymentIntent on the connected account.

        Returns True on success, False on error.  Result is logged to audit_log
        either way.
        """
        try:
            stripe.PaymentIntent.modify(
                payment_intent_id,
                application_fee_amount=100,  # $1.00 in cents
                stripe_account=merchant_id,
            )

            self.db.log_audit(
                merchant_id=merchant_id,
                action="fix_fee_charged",
                state="",
                amount_cents=100,
                stripe_reg_id=None,
                confirmed_by="system",
            )

            logger.info(
                "Charged $1 fix fee on PaymentIntent %s for merchant %s",
                payment_intent_id,
                merchant_id,
            )
            return True

        except stripe.error.StripeError as e:
            self.db.log_audit(
                merchant_id=merchant_id,
                action="fix_fee_failed",
                state="",
                amount_cents=100,
                stripe_reg_id=None,
                confirmed_by="system",
            )

            logger.error(
                "Failed to charge fix fee on PaymentIntent %s for merchant %s: %s",
                payment_intent_id,
                merchant_id,
                str(e),
            )
            return False
