"""
Base connector interface for TaxShieldAgent.

All platform connectors (Stripe, Shopify, Etsy, PayPal, Square, Amazon)
implement this abstract base class. Shared utilities for state extraction
and amount normalization live here.
"""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime

from src.agent.db import ShieldDB

logger = logging.getLogger(__name__)


@dataclass
class TransactionRecord:
    """Normalized transaction from any platform."""

    tx_id: str
    created_at: datetime
    state: str
    amount: float
    merchant_id: str
    platform_tx_id: str
    source_platform: str


class BaseConnector(ABC):
    """Abstract base class that every platform connector must implement."""

    platform_name: str = ""

    @abstractmethod
    async def fetch_transactions(
        self, merchant_id: str, since: datetime
    ) -> list[TransactionRecord]:
        """Fetch transactions from the platform since the given timestamp."""
        ...

    def extract_state(
        self,
        shipping_data: dict | None,
        metadata: dict | None,
    ) -> str | None:
        """Shared utility to extract a US state code from shipping or metadata.

        Resolution order:
          1. shipping_data["address"]["state"]
          2. metadata["state"]
          3. metadata["shipping_state"]

        Returns a 2-letter uppercase state code, or None.
        """
        if shipping_data:
            address = shipping_data.get("address") or {}
            state = address.get("state")
            if state:
                return str(state).strip().upper()

        if metadata:
            state = metadata.get("state") or metadata.get("shipping_state")
            if state:
                return str(state).strip().upper()

        return None

    def normalize_amount(self, amount_cents: int) -> float:
        """Convert an amount in cents to dollars."""
        return amount_cents / 100.0

    async def sync_to_db(
        self, db: ShieldDB, merchant_id: str, since: datetime
    ) -> dict:
        """Fetch transactions from the platform and upsert them into the DB.

        Returns a summary dict: {"synced": int, "skipped": int, "platform": str}
        """
        records = await self.fetch_transactions(merchant_id, since)

        synced = 0
        skipped = 0

        for rec in records:
            try:
                db.upsert_transaction(
                    tx_id=rec.tx_id,
                    created_at=rec.created_at,
                    state=rec.state,
                    amount=rec.amount,
                    merchant_id=rec.merchant_id,
                    payment_intent_id=rec.platform_tx_id,
                    source_platform=rec.source_platform,
                )
                synced += 1
            except Exception:
                logger.exception(
                    "Failed to upsert transaction %s from %s",
                    rec.tx_id,
                    self.platform_name,
                )
                skipped += 1

        logger.info(
            "%s sync complete: %d synced, %d skipped",
            self.platform_name,
            synced,
            skipped,
        )

        return {
            "synced": synced,
            "skipped": skipped,
            "platform": self.platform_name,
        }
