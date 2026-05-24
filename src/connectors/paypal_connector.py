"""
PayPal platform connector for TaxShieldAgent.

Fetches completed sale transactions from PayPal's Reporting API and
normalizes them into TransactionRecords for unified nexus tracking.
"""

from __future__ import annotations

import logging
import time
from datetime import datetime, timedelta, timezone

import httpx

from .base import BaseConnector, TransactionRecord

logger = logging.getLogger(__name__)

_SANDBOX_BASE = "https://api-m.sandbox.paypal.com"
_PRODUCTION_BASE = "https://api-m.paypal.com"

# PayPal event code for a completed sale
_COMPLETED_SALE_CODE = "T0006"

# PayPal Reporting API only allows 31-day date-range windows
_MAX_WINDOW_DAYS = 31


class PayPalConnector(BaseConnector):
    """Connector for PayPal payment platform."""

    platform_name = "paypal"

    def __init__(
        self,
        client_id: str,
        client_secret: str,
        use_sandbox: bool = True,
    ) -> None:
        self.client_id = client_id
        self.client_secret = client_secret
        self.use_sandbox = use_sandbox
        self._base_url = _SANDBOX_BASE if use_sandbox else _PRODUCTION_BASE
        self._cached_token: str | None = None
        self._token_expires_at: float = 0.0

    async def _get_access_token(self) -> str:
        """Obtain an OAuth2 access token from PayPal, caching until expiry."""
        now = time.time()
        if self._cached_token and now < self._token_expires_at:
            return self._cached_token

        url = f"{self._base_url}/v1/oauth2/token"

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                url,
                data={"grant_type": "client_credentials"},
                auth=(self.client_id, self.client_secret),
                headers={"Accept": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()

        self._cached_token = data["access_token"]
        # Expire a minute early for safety
        self._token_expires_at = now + data.get("expires_in", 3600) - 60
        return self._cached_token

    async def fetch_transactions(
        self, merchant_id: str, since: datetime
    ) -> list[TransactionRecord]:
        """Fetch completed sale transactions from PayPal since the given timestamp.

        The PayPal Reporting API only allows 31-day windows, so this method
        loops through date ranges from ``since`` to now in 31-day chunks.
        """
        records: list[TransactionRecord] = []
        token = await self._get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        window_start = since
        now = datetime.now(timezone.utc)

        async with httpx.AsyncClient(timeout=30.0) as client:
            while window_start < now:
                window_end = min(
                    window_start + timedelta(days=_MAX_WINDOW_DAYS), now
                )

                page = 1
                total_pages = 1

                while page <= total_pages:
                    params = {
                        "start_date": window_start.strftime("%Y-%m-%dT%H:%M:%S-0000"),
                        "end_date": window_end.strftime("%Y-%m-%dT%H:%M:%S-0000"),
                        "fields": "all",
                        "page_size": 500,
                        "page": page,
                    }

                    resp = await client.get(
                        f"{self._base_url}/v1/reporting/transactions",
                        headers=headers,
                        params=params,
                    )
                    resp.raise_for_status()
                    data = resp.json()

                    total_pages = data.get("total_pages", 1)

                    for tx in data.get("transaction_details", []):
                        tx_info = tx.get("transaction_info", {})
                        payer_info = tx.get("payer_info", {})
                        shipping_info = tx_info.get("shipping_info", {})

                        # Only include completed sales
                        event_code = tx_info.get("transaction_event_code", "")
                        if event_code != _COMPLETED_SALE_CODE:
                            continue

                        # Extract state: try shipping, then payer address
                        state = None
                        shipping_addr = shipping_info.get("address", {})
                        if shipping_addr:
                            state = shipping_addr.get("state")

                        if not state:
                            payer_addr = payer_info.get("address", {})
                            if payer_addr:
                                state = payer_addr.get("state")

                        if not state:
                            continue

                        state = str(state).strip().upper()

                        # Extract amount
                        tx_amount = tx_info.get("transaction_amount", {})
                        try:
                            amount = float(tx_amount.get("value", "0"))
                        except (ValueError, TypeError):
                            continue

                        # Skip refunds / negative amounts
                        if amount <= 0:
                            continue

                        # Parse date
                        tx_date_str = tx_info.get("transaction_updated_date") or tx_info.get(
                            "transaction_initiation_date", ""
                        )
                        try:
                            created_at = datetime.fromisoformat(
                                tx_date_str.replace("Z", "+00:00")
                            )
                        except (ValueError, AttributeError):
                            created_at = datetime.now(timezone.utc)

                        tx_id_raw = tx_info.get("transaction_id", "")

                        records.append(
                            TransactionRecord(
                                tx_id=f"paypal_{tx_id_raw}",
                                created_at=created_at,
                                state=state,
                                amount=amount,
                                merchant_id=merchant_id,
                                platform_tx_id=tx_id_raw,
                                source_platform=self.platform_name,
                            )
                        )

                    page += 1

                window_start = window_end

        logger.info(
            "PayPal: fetched %d transactions since %s",
            len(records),
            since.isoformat(),
        )
        return records
