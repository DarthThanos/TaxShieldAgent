"""
Stripe platform connector for TaxShieldAgent.

Fetches completed PaymentIntents from Stripe and normalizes them into
TransactionRecords for unified nexus tracking.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

import stripe

from .base import BaseConnector, TransactionRecord

logger = logging.getLogger(__name__)


class StripeConnector(BaseConnector):
    """Connector for Stripe payment processing platform."""

    platform_name = "stripe"

    def __init__(self, api_key: str) -> None:
        self.api_key = api_key

    async def fetch_transactions(
        self, merchant_id: str, since: datetime
    ) -> list[TransactionRecord]:
        """Fetch succeeded PaymentIntents from Stripe since the given timestamp."""
        stripe.api_key = self.api_key

        records: list[TransactionRecord] = []

        payment_intents = stripe.PaymentIntent.list(
            limit=100,
            created={"gte": int(since.timestamp())},
        )

        for pi in payment_intents.auto_paging_iter():
            if pi.get("status") != "succeeded":
                continue

            # Extract state
            shipping = pi.get("shipping")
            metadata = pi.get("metadata") or {}

            shipping_dict = None
            if shipping:
                shipping_dict = {
                    "address": {
                        "state": (shipping.get("address") or {}).get("state"),
                    }
                }

            state = self.extract_state(shipping_dict, metadata)

            if not state:
                logger.warning(
                    "Stripe PaymentIntent %s has no state data, skipping",
                    pi["id"],
                )
                continue

            created_at = datetime.fromtimestamp(pi["created"], tz=timezone.utc)
            amount = self.normalize_amount(pi["amount"])

            records.append(
                TransactionRecord(
                    tx_id=f"stripe_{pi['id']}",
                    created_at=created_at,
                    state=state,
                    amount=amount,
                    merchant_id=merchant_id,
                    platform_tx_id=pi["id"],
                    source_platform=self.platform_name,
                )
            )

        logger.info(
            "Stripe: fetched %d transactions since %s",
            len(records),
            since.isoformat(),
        )
        return records
