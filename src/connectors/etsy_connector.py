"""
Etsy platform connector for TaxShieldAgent.

Fetches paid receipts from Etsy's Open API v3 and normalizes them into
TransactionRecords for unified nexus tracking.

Note: Etsy collects marketplace tax on behalf of sellers in many states,
but those sales STILL count toward economic nexus. All paid receipts are
included regardless of marketplace facilitator status.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

import httpx

from .base import BaseConnector, TransactionRecord

logger = logging.getLogger(__name__)

# Complete mapping of US state full names to 2-letter codes
STATE_NAME_TO_CODE: dict[str, str] = {
    "ALABAMA": "AL", "ALASKA": "AK", "ARIZONA": "AZ", "ARKANSAS": "AR",
    "CALIFORNIA": "CA", "COLORADO": "CO", "CONNECTICUT": "CT", "DELAWARE": "DE",
    "FLORIDA": "FL", "GEORGIA": "GA", "HAWAII": "HI", "IDAHO": "ID",
    "ILLINOIS": "IL", "INDIANA": "IN", "IOWA": "IA", "KANSAS": "KS",
    "KENTUCKY": "KY", "LOUISIANA": "LA", "MAINE": "ME", "MARYLAND": "MD",
    "MASSACHUSETTS": "MA", "MICHIGAN": "MI", "MINNESOTA": "MN",
    "MISSISSIPPI": "MS", "MISSOURI": "MO", "MONTANA": "MT", "NEBRASKA": "NE",
    "NEVADA": "NV", "NEW HAMPSHIRE": "NH", "NEW JERSEY": "NJ",
    "NEW MEXICO": "NM", "NEW YORK": "NY", "NORTH CAROLINA": "NC",
    "NORTH DAKOTA": "ND", "OHIO": "OH", "OKLAHOMA": "OK", "OREGON": "OR",
    "PENNSYLVANIA": "PA", "RHODE ISLAND": "RI", "SOUTH CAROLINA": "SC",
    "SOUTH DAKOTA": "SD", "TENNESSEE": "TN", "TEXAS": "TX", "UTAH": "UT",
    "VERMONT": "VT", "VIRGINIA": "VA", "WASHINGTON": "WA",
    "WEST VIRGINIA": "WV", "WISCONSIN": "WI", "WYOMING": "WY",
    "DISTRICT OF COLUMBIA": "DC",
}

# Also build a set of valid codes for quick lookup
_VALID_STATE_CODES = set(STATE_NAME_TO_CODE.values())


def normalize_state(raw: str | None) -> str | None:
    """Convert a state name or abbreviation to a 2-letter uppercase code.

    Returns None if the input does not match any US state.
    """
    if not raw:
        return None
    cleaned = raw.strip().upper()
    if cleaned in _VALID_STATE_CODES:
        return cleaned
    return STATE_NAME_TO_CODE.get(cleaned)


class EtsyConnector(BaseConnector):
    """Connector for the Etsy marketplace."""

    platform_name = "etsy"

    def __init__(self, api_key: str, access_token: str, shop_id: str) -> None:
        """
        Args:
            api_key: Etsy API key (x-api-key header).
            access_token: OAuth2 bearer token.
            shop_id: Etsy shop ID (numeric string).
        """
        self.api_key = api_key
        self.access_token = access_token
        self.shop_id = shop_id

    async def fetch_transactions(
        self, merchant_id: str, since: datetime
    ) -> list[TransactionRecord]:
        """Fetch paid receipts from Etsy since the given timestamp."""
        records: list[TransactionRecord] = []
        base_url = (
            f"https://openapi.etsy.com/v3/application/shops/{self.shop_id}/receipts"
        )
        headers = {
            "x-api-key": self.api_key,
            "Authorization": f"Bearer {self.access_token}",
        }
        params = {
            "min_created": int(since.timestamp()),
            "limit": 100,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            offset = 0
            has_more = True

            while has_more:
                params["offset"] = offset
                resp = await client.get(base_url, headers=headers, params=params)
                resp.raise_for_status()
                data = resp.json()

                results = data.get("results", [])
                if not results:
                    break

                for receipt in results:
                    # Extract state from shipping address
                    shipping_addr = receipt.get("shipping_address") or {}
                    raw_state = shipping_addr.get("state") or shipping_addr.get("province")

                    state = normalize_state(raw_state)
                    if not state:
                        continue

                    # Extract amount
                    grandtotal = receipt.get("grandtotal") or {}
                    if isinstance(grandtotal, dict) and "amount" in grandtotal:
                        divisor = grandtotal.get("divisor", 100)
                        amount = grandtotal["amount"] / divisor
                    else:
                        # Fallback: some receipt formats use a flat field
                        amount = float(receipt.get("grandtotal", 0))

                    # Parse creation timestamp
                    created_ts = receipt.get("created_timestamp") or receipt.get("create_timestamp")
                    if created_ts:
                        created_at = datetime.fromtimestamp(int(created_ts), tz=timezone.utc)
                    else:
                        created_at = datetime.now(timezone.utc)

                    receipt_id = str(receipt.get("receipt_id", ""))

                    records.append(
                        TransactionRecord(
                            tx_id=f"etsy_{receipt_id}",
                            created_at=created_at,
                            state=state,
                            amount=amount,
                            merchant_id=merchant_id,
                            platform_tx_id=receipt_id,
                            source_platform=self.platform_name,
                        )
                    )

                # Handle pagination
                count = data.get("count", 0)
                offset += len(results)
                has_more = offset < count

        logger.info(
            "Etsy: fetched %d transactions since %s",
            len(records),
            since.isoformat(),
        )
        return records
