"""
Square platform connector for TaxShieldAgent.

Fetches completed orders from Square's Orders API and normalizes them
into TransactionRecords for unified nexus tracking.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

import httpx

from .base import BaseConnector, TransactionRecord

logger = logging.getLogger(__name__)

_SANDBOX_BASE = "https://connect.squareupsandbox.com"
_PRODUCTION_BASE = "https://connect.squareup.com"


class SquareConnector(BaseConnector):
    """Connector for Square payment / POS platform."""

    platform_name = "square"

    def __init__(
        self,
        access_token: str,
        environment: str = "sandbox",
    ) -> None:
        self.access_token = access_token
        self.environment = environment
        self._base_url = (
            _SANDBOX_BASE if environment == "sandbox" else _PRODUCTION_BASE
        )

    async def fetch_transactions(
        self, merchant_id: str, since: datetime
    ) -> list[TransactionRecord]:
        """Fetch completed orders from Square since the given timestamp."""
        records: list[TransactionRecord] = []
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "Square-Version": "2024-01-18",
        }

        cursor: str | None = None

        async with httpx.AsyncClient(timeout=30.0) as client:
            while True:
                body: dict = {
                    "query": {
                        "filter": {
                            "date_time_filter": {
                                "created_at": {
                                    "start_at": since.isoformat(),
                                }
                            },
                            "state_filter": {
                                "states": ["COMPLETED"],
                            },
                        },
                    },
                    "limit": 500,
                }
                if cursor:
                    body["cursor"] = cursor

                resp = await client.post(
                    f"{self._base_url}/v2/orders/search",
                    headers=headers,
                    json=body,
                )
                resp.raise_for_status()
                data = resp.json()

                orders = data.get("orders", [])
                if not orders:
                    break

                for order in orders:
                    state = self._extract_state_from_order(order)
                    if not state:
                        continue

                    # Extract amount from total_money (cents)
                    total_money = order.get("total_money", {})
                    amount_cents = total_money.get("amount", 0)
                    amount = self.normalize_amount(amount_cents)

                    # Parse creation timestamp
                    created_str = order.get("created_at", "")
                    try:
                        created_at = datetime.fromisoformat(
                            created_str.replace("Z", "+00:00")
                        )
                    except (ValueError, AttributeError):
                        created_at = datetime.now(timezone.utc)

                    order_id = order.get("id", "")

                    records.append(
                        TransactionRecord(
                            tx_id=f"square_{order_id}",
                            created_at=created_at,
                            state=state,
                            amount=amount,
                            merchant_id=merchant_id,
                            platform_tx_id=order_id,
                            source_platform=self.platform_name,
                        )
                    )

                # Handle cursor-based pagination
                cursor = data.get("cursor")
                if not cursor:
                    break

        logger.info(
            "Square: fetched %d transactions since %s",
            len(records),
            since.isoformat(),
        )
        return records

    @staticmethod
    def _extract_state_from_order(order: dict) -> str | None:
        """Extract a US state code from a Square order's fulfillment data.

        Checks shipment details first, then pickup details.
        """
        fulfillments = order.get("fulfillments") or []
        for fulfillment in fulfillments:
            # Shipment
            shipment = fulfillment.get("shipment_details") or {}
            recipient = shipment.get("recipient") or {}
            address = recipient.get("address") or {}
            state = address.get("administrative_district_level_1")
            if state:
                return str(state).strip().upper()

            # Pickup / in-person
            pickup = fulfillment.get("pickup_details") or {}
            pickup_recipient = pickup.get("recipient") or {}
            pickup_address = pickup_recipient.get("address") or {}
            state = pickup_address.get("administrative_district_level_1")
            if state:
                return str(state).strip().upper()

        return None
