"""
Shopify platform connector for TaxShieldAgent.

Fetches paid orders from Shopify's REST Admin API and normalizes them
into TransactionRecords for unified nexus tracking.
"""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from urllib.parse import urlencode

import httpx

from .base import BaseConnector, TransactionRecord

logger = logging.getLogger(__name__)

_API_VERSION = "2024-01"


class ShopifyConnector(BaseConnector):
    """Connector for Shopify e-commerce platform."""

    platform_name = "shopify"

    def __init__(self, shop_url: str, access_token: str) -> None:
        """
        Args:
            shop_url: Shopify store URL, e.g. ``mystore.myshopify.com``
            access_token: Shopify Admin API access token.
        """
        self.shop_url = shop_url.rstrip("/")
        self.access_token = access_token

    async def fetch_transactions(
        self, merchant_id: str, since: datetime
    ) -> list[TransactionRecord]:
        """Fetch paid orders from Shopify since the given timestamp."""
        records: list[TransactionRecord] = []
        params = {
            "status": "any",
            "financial_status": "paid",
            "created_at_min": since.isoformat(),
            "limit": 250,
        }
        url = (
            f"https://{self.shop_url}/admin/api/{_API_VERSION}/orders.json"
            f"?{urlencode(params)}"
        )
        headers = {
            "X-Shopify-Access-Token": self.access_token,
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            while url:
                resp = await client.get(url, headers=headers)
                resp.raise_for_status()
                data = resp.json()

                for order in data.get("orders", []):
                    shipping_addr = order.get("shipping_address") or {}
                    # province_code is the 2-letter state code for US orders
                    state = shipping_addr.get("province_code") or shipping_addr.get("province")

                    if not state:
                        continue

                    state = str(state).strip().upper()

                    # Skip non-US orders (province codes > 2 chars or non-alpha)
                    if len(state) > 2 or not state.isalpha():
                        continue

                    country = (shipping_addr.get("country_code") or "").upper()
                    if country and country != "US":
                        continue

                    try:
                        amount = float(order["total_price"])
                    except (ValueError, KeyError, TypeError):
                        logger.warning(
                            "Shopify order %s has invalid total_price, skipping",
                            order.get("id"),
                        )
                        continue

                    created_at_str = order.get("created_at", "")
                    try:
                        created_at = datetime.fromisoformat(
                            created_at_str.replace("Z", "+00:00")
                        )
                    except (ValueError, AttributeError):
                        created_at = datetime.now(timezone.utc)

                    order_id = str(order["id"])
                    records.append(
                        TransactionRecord(
                            tx_id=f"shopify_{order_id}",
                            created_at=created_at,
                            state=state,
                            amount=amount,
                            merchant_id=merchant_id,
                            platform_tx_id=order_id,
                            source_platform=self.platform_name,
                        )
                    )

                # Handle pagination via Link header
                url = self._parse_next_link(resp.headers.get("Link", ""))

        logger.info(
            "Shopify: fetched %d transactions since %s",
            len(records),
            since.isoformat(),
        )
        return records

    @staticmethod
    def _parse_next_link(link_header: str) -> str | None:
        """Extract the next page URL from a Shopify Link header."""
        if not link_header:
            return None
        # Link: <https://...>; rel="next", <https://...>; rel="previous"
        for part in link_header.split(","):
            match = re.search(r'<([^>]+)>;\s*rel="next"', part)
            if match:
                return match.group(1)
        return None

    @staticmethod
    async def get_oauth_url(
        shop_url: str,
        client_id: str,
        redirect_uri: str,
        scopes: str = "read_orders",
    ) -> str:
        """Build the Shopify OAuth authorization URL."""
        params = urlencode({
            "client_id": client_id,
            "scope": scopes,
            "redirect_uri": redirect_uri,
        })
        return f"https://{shop_url}/admin/oauth/authorize?{params}"

    @staticmethod
    async def exchange_oauth_code(
        shop_url: str,
        client_id: str,
        client_secret: str,
        code: str,
    ) -> dict:
        """Exchange an OAuth authorization code for an access token."""
        url = f"https://{shop_url}/admin/oauth/access_token"
        payload = {
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            return resp.json()
