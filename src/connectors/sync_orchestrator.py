"""
Sync orchestrator for TaxShieldAgent.

Coordinates syncing transactions from all connected platforms into the
unified DuckDB store, then updates last-sync timestamps.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from src.agent.db import ShieldDB

from .registry import get_connector

logger = logging.getLogger(__name__)

# Default lookback when a platform has never been synced
_DEFAULT_LOOKBACK_DAYS = 365


class SyncOrchestrator:
    """Orchestrates transaction syncing across all connected platforms."""

    def __init__(self, db: ShieldDB) -> None:
        self.db = db

    async def sync_all_platforms(self, merchant_id: str) -> dict:
        """Sync transactions from every active platform connection.

        Returns:
            {
                "platforms_synced": int,
                "total_transactions": int,
                "errors": [{"platform": str, "error": str}, ...],
                "details": [{"platform": str, "synced": int, "skipped": int}, ...],
            }
        """
        connections = self.db.get_platform_connections(merchant_id)

        platforms_synced = 0
        total_transactions = 0
        errors: list[dict] = []
        details: list[dict] = []

        for conn in connections:
            platform = conn["platform"]
            connection_id = conn["id"]

            try:
                result = await self.sync_platform(
                    merchant_id=merchant_id,
                    platform=platform,
                    connection_id=connection_id,
                )
                platforms_synced += 1
                total_transactions += result.get("synced", 0)
                details.append(result)
            except Exception as exc:
                logger.exception(
                    "Failed to sync platform %s for merchant %s",
                    platform,
                    merchant_id,
                )
                errors.append({
                    "platform": platform,
                    "error": str(exc),
                })

        return {
            "platforms_synced": platforms_synced,
            "total_transactions": total_transactions,
            "errors": errors,
            "details": details,
        }

    async def sync_platform(
        self,
        merchant_id: str,
        platform: str,
        connection_id: str,
    ) -> dict:
        """Sync a single platform connection.

        Looks up the connection details, instantiates the appropriate
        connector, runs the sync, and updates last_sync_at.
        """
        # Get connection details
        connections = self.db.get_platform_connections(merchant_id)
        conn_data = None
        for c in connections:
            if c["id"] == connection_id:
                conn_data = c
                break

        if conn_data is None:
            raise ValueError(
                f"Connection {connection_id} not found for merchant {merchant_id}"
            )

        # Determine sync start time
        last_sync = conn_data.get("last_sync_at")
        if last_sync and isinstance(last_sync, datetime):
            since = last_sync
        else:
            since = datetime.now(timezone.utc) - timedelta(days=_DEFAULT_LOOKBACK_DAYS)

        # Build connector kwargs from connection data
        kwargs = self._build_connector_kwargs(conn_data)

        connector = get_connector(platform, **kwargs)

        # Run sync
        result = await connector.sync_to_db(self.db, merchant_id, since)

        # Update last_sync_at
        now = datetime.now(timezone.utc)
        self.db.update_platform_sync(connection_id, now)

        logger.info(
            "Synced %s for merchant %s: %d synced, %d skipped",
            platform,
            merchant_id,
            result["synced"],
            result["skipped"],
        )

        return result

    @staticmethod
    def _build_connector_kwargs(conn_data: dict) -> dict:
        """Build the constructor keyword arguments for a connector from
        stored connection data."""
        platform = conn_data["platform"]
        kwargs: dict = {}

        if platform == "stripe":
            kwargs["api_key"] = conn_data.get("access_token", "")

        elif platform == "shopify":
            kwargs["shop_url"] = conn_data.get("shop_url", "")
            kwargs["access_token"] = conn_data.get("access_token", "")

        elif platform == "etsy":
            kwargs["api_key"] = conn_data.get("platform_merchant_id", "")
            kwargs["access_token"] = conn_data.get("access_token", "")
            kwargs["shop_id"] = conn_data.get("shop_url", "")  # shop_id stored in shop_url field

        elif platform == "paypal":
            # client_id stored in platform_merchant_id, client_secret in access_token
            kwargs["client_id"] = conn_data.get("platform_merchant_id", "")
            kwargs["client_secret"] = conn_data.get("access_token", "")

        elif platform == "square":
            kwargs["access_token"] = conn_data.get("access_token", "")

        elif platform == "amazon":
            pass  # No credentials needed

        return kwargs
