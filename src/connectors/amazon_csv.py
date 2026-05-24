"""
Amazon CSV import connector for TaxShieldAgent.

Amazon's SP-API rate limit (1 req/min) makes real-time sync impractical.
This connector parses CSV exports from Amazon Seller Central instead.

How to download the CSV from Amazon Seller Central:
  1. Log in to Seller Central.
  2. Navigate to Reports -> Payments -> Date Range Reports.
  3. Click "Generate Report" for the desired date range.
  4. Select "Transaction" report type.
  5. Download the CSV once the report is ready.
  6. Upload the CSV via the /connectors/connect/amazon/upload endpoint.

Alternatively, use the "All Orders" report:
  1. Navigate to Reports -> Fulfillment -> All Orders.
  2. Request and download the report.

Both CSV formats are supported by this connector.
"""

from __future__ import annotations

import csv
import io
import logging
from collections import defaultdict
from datetime import datetime, timezone

from .base import BaseConnector, TransactionRecord
from .etsy_connector import STATE_NAME_TO_CODE, normalize_state

logger = logging.getLogger(__name__)


class AmazonCSVConnector(BaseConnector):
    """Connector for Amazon via CSV import from Seller Central reports."""

    platform_name = "amazon"

    def __init__(self) -> None:
        # No credentials needed; works from uploaded CSV files
        pass

    def parse_csv(
        self, csv_content: str, merchant_id: str
    ) -> list[TransactionRecord]:
        """Parse an Amazon Date Range Report or All Orders Report CSV.

        Supports two CSV formats:

        **Date Range Report** columns include:
          order-id, purchase-date, ship-state, item-price, item-tax, shipping-price

        **All Orders Report** columns include:
          amazon-order-id, purchase-date, ship-state, item-price

        Transactions are grouped by order ID: item-price + shipping-price
        are summed per order to produce a single TransactionRecord per order.

        Returns a list of TransactionRecords for US orders only.
        """
        reader = csv.DictReader(io.StringIO(csv_content), delimiter="\t")

        # Detect format by checking field names
        fieldnames = reader.fieldnames or []

        # Normalize fieldnames (Amazon CSVs may use tabs or commas)
        if len(fieldnames) <= 1 and fieldnames:
            # Might be comma-separated, retry
            reader = csv.DictReader(io.StringIO(csv_content))
            fieldnames = reader.fieldnames or []

        # Determine which column names to use
        order_id_col = "order-id" if "order-id" in fieldnames else "amazon-order-id"
        date_col = "purchase-date"
        state_col = "ship-state"
        price_col = "item-price"
        shipping_col = "shipping-price"

        # Aggregate amounts by order ID
        order_data: dict[str, dict] = defaultdict(
            lambda: {"amount": 0.0, "state": None, "date": None}
        )

        for row in reader:
            order_id = (row.get(order_id_col) or "").strip()
            if not order_id:
                continue

            # Extract and normalize state
            raw_state = (row.get(state_col) or "").strip()
            state = normalize_state(raw_state)
            if not state:
                # Skip international / unresolvable orders
                continue

            # Parse amount
            item_price = self._parse_amount(row.get(price_col, "0"))
            shipping_price = self._parse_amount(row.get(shipping_col, "0"))
            total = item_price + shipping_price

            entry = order_data[order_id]
            entry["amount"] += total
            if entry["state"] is None:
                entry["state"] = state
            if entry["date"] is None:
                entry["date"] = row.get(date_col, "")

        # Convert aggregated orders to TransactionRecords
        records: list[TransactionRecord] = []
        for order_id, info in order_data.items():
            state = info["state"]
            if not state:
                continue

            # Parse date
            date_str = info["date"] or ""
            try:
                created_at = datetime.fromisoformat(
                    date_str.replace("Z", "+00:00")
                )
            except (ValueError, AttributeError):
                try:
                    # Amazon sometimes uses formats like "2024-01-15T12:30:00+00:00"
                    created_at = datetime.strptime(
                        date_str[:19], "%Y-%m-%dT%H:%M:%S"
                    ).replace(tzinfo=timezone.utc)
                except (ValueError, AttributeError):
                    created_at = datetime.now(timezone.utc)

            records.append(
                TransactionRecord(
                    tx_id=f"amazon_{order_id}",
                    created_at=created_at,
                    state=state,
                    amount=round(info["amount"], 2),
                    merchant_id=merchant_id,
                    platform_tx_id=order_id,
                    source_platform=self.platform_name,
                )
            )

        logger.info("Amazon CSV: parsed %d orders from CSV", len(records))
        return records

    async def fetch_transactions(
        self, merchant_id: str, since: datetime
    ) -> list[TransactionRecord]:
        """Not supported for Amazon -- use parse_csv() instead."""
        raise NotImplementedError(
            "Use parse_csv() for Amazon. Native API sync coming in Phase 2."
        )

    @staticmethod
    def _parse_amount(value: str) -> float:
        """Safely parse a dollar amount string to float."""
        if not value:
            return 0.0
        try:
            # Strip currency symbols, commas, whitespace
            cleaned = value.strip().replace(",", "").replace("$", "")
            return float(cleaned)
        except (ValueError, TypeError):
            return 0.0
