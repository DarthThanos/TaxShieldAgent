"""
Stripe webhook ingestion for TaxShieldAgent.

Receives Stripe webhook events, parses payment data, writes transactions
to DuckDB, and triggers nexus checks on new payments.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import stripe

from .db import ShieldDB
from .nexus_engine import NexusEngine

logger = logging.getLogger(__name__)


def parse_payment_intent(event: dict[str, Any]) -> dict[str, Any] | None:
    """Extract a normalised transaction record from a payment_intent.succeeded event.

    Returns None (and logs a warning) if the customer's state cannot be
    determined -- stateless transactions are not stored because nexus
    detection requires a destination state.
    """
    obj: dict[str, Any] = event["data"]["object"]

    tx_id: str = obj["id"]
    created_at: datetime = datetime.fromtimestamp(obj["created"], tz=timezone.utc)
    amount: float = obj["amount"] / 100.0
    merchant_id: str = event.get("account", "platform")

    # Resolve state: shipping address > metadata.state > metadata.shipping_state
    state: str | None = None

    shipping = obj.get("shipping")
    if shipping and isinstance(shipping, dict):
        address = shipping.get("address")
        if address and isinstance(address, dict):
            state = address.get("state")

    if not state:
        metadata = obj.get("metadata") or {}
        state = metadata.get("state") or metadata.get("shipping_state")

    if not state:
        logger.warning(
            "Skipping transaction %s for merchant %s: no state found in "
            "shipping address or metadata",
            tx_id,
            merchant_id,
        )
        return None

    return {
        "tx_id": tx_id,
        "payment_intent_id": tx_id,
        "created_at": created_at,
        "amount": amount,
        "merchant_id": merchant_id,
        "state": state.strip().upper(),
    }


def verify_stripe_signature(payload: bytes, sig_header: str, secret: str) -> bool:
    """Verify a Stripe webhook signature.

    Returns True if the signature is valid, False otherwise.  Never raises.
    """
    try:
        stripe.WebhookSignature.verify_header(
            payload=payload.decode("utf-8"),
            header=sig_header,
            secret=secret,
        )
        return True
    except Exception:
        logger.warning("Stripe webhook signature verification failed")
        return False


class WebhookProcessor:
    """Receives raw Stripe webhook payloads, verifies them, and routes
    supported event types to the appropriate handler."""

    def __init__(
        self,
        db: ShieldDB,
        nexus_engine: NexusEngine,
        webhook_secret: str,
    ) -> None:
        self.db = db
        self.nexus_engine = nexus_engine
        self.webhook_secret = webhook_secret

    def process_event(self, payload: bytes, sig_header: str) -> dict[str, Any]:
        """Verify, parse, and dispatch a single webhook event.

        Returns a dict with keys ``status``, ``processed``, and ``event_type``.
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, self.webhook_secret,
            )
        except stripe.SignatureVerificationError:
            logger.error("Webhook rejected: invalid signature")
            return {"status": "error", "processed": False, "event_type": "unknown"}
        except Exception:
            logger.error("Failed to parse webhook payload")
            return {"status": "error", "processed": False, "event_type": "unknown"}

        event_type: str = event.type or "unknown"
        event_id: str = event.id or ""

        if event_id and self.db.is_webhook_event_processed(event_id):
            logger.info("Skipping duplicate webhook event %s (%s)", event_id, event_type)
            return {"status": "ok", "processed": False, "event_type": event_type, "duplicate": True}

        if event_type == "payment_intent.succeeded":
            self._handle_payment_intent_succeeded(event)
            if event_id:
                self.db.mark_webhook_event_processed(event_id, event_type)
            return {"status": "ok", "processed": True, "event_type": event_type}

        if event_id:
            self.db.mark_webhook_event_processed(event_id, event_type)
        logger.info("Ignoring unhandled event type: %s", event_type)
        return {"status": "ok", "processed": False, "event_type": event_type}

    def _handle_payment_intent_succeeded(self, event: Any) -> None:
        """Parse the payment, upsert to DB, and run a nexus check."""
        # Convert StripeObject to plain dict for downstream processing
        event_dict: dict[str, Any] = event.to_dict() if hasattr(event, "to_dict") else dict(event)
        tx = parse_payment_intent(event_dict)
        if tx is None:
            return

        self.db.upsert_transaction(
            tx_id=tx["tx_id"],
            created_at=tx["created_at"],
            state=tx["state"],
            amount=tx["amount"],
            merchant_id=tx["merchant_id"],
            payment_intent_id=tx["payment_intent_id"],
        )
        logger.info(
            "Upserted transaction %s: $%.2f -> %s (merchant %s)",
            tx["tx_id"],
            tx["amount"],
            tx["state"],
            tx["merchant_id"],
        )

        # Run nexus check and log any new/escalated alerts
        new_alerts = self.nexus_engine.run_check(tx["merchant_id"])
        for alert in new_alerts:
            logger.warning(
                "NEXUS ALERT [%s] %s in %s: %.1f%% of threshold "
                "(sales=$%.2f, tx_count=%d) -- action=%s",
                alert["risk_level"],
                tx["merchant_id"],
                alert["state"],
                alert["pct_of_threshold"],
                alert["total_sales"],
                alert["transaction_count"],
                alert["action"],
            )
