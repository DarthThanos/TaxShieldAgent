"""
DuckDB-backed data layer for TaxShieldAgent.

Replaces KDB-X with an embedded, zero-config database. All merchant
transactions, nexus alerts, and audit records live in a single .db file.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import duckdb

from .nexus_data import NEXUS_THRESHOLDS, is_nexus_state


class ShieldDB:
    """Manages all persistent state for TaxShieldAgent via DuckDB."""

    def __init__(self, db_path: str = "data/shield.db") -> None:
        path = Path(db_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = duckdb.connect(str(path))
        self.initialize_schema()

    # -- Context manager --------------------------------------------------

    def __enter__(self) -> ShieldDB:
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        self.close()

    # -- Schema -----------------------------------------------------------

    def initialize_schema(self) -> None:
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                tx_id           VARCHAR PRIMARY KEY,
                created_at      TIMESTAMP,
                state           VARCHAR,
                amount          DECIMAL(12, 2),
                merchant_id     VARCHAR,
                payment_intent_id VARCHAR,
                source_platform VARCHAR DEFAULT 'stripe'
            )
        """)
        # Migrate: add source_platform column if missing (existing DBs)
        try:
            self.conn.execute(
                "ALTER TABLE transactions ADD COLUMN source_platform VARCHAR DEFAULT 'stripe'"
            )
        except duckdb.CatalogException:
            pass  # column already exists

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS connected_platforms (
                id                  VARCHAR PRIMARY KEY,
                merchant_id         VARCHAR NOT NULL,
                platform            VARCHAR NOT NULL,
                platform_merchant_id VARCHAR,
                access_token        VARCHAR,
                refresh_token       VARCHAR,
                shop_url            VARCHAR,
                connected_at        TIMESTAMP,
                last_sync_at        TIMESTAMP,
                status              VARCHAR DEFAULT 'active'
            )
        """)
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS nexus_alerts (
                id                    VARCHAR PRIMARY KEY,
                merchant_id           VARCHAR,
                state                 VARCHAR,
                risk_level            VARCHAR,
                total_sales           DECIMAL(12, 2),
                transaction_count     INTEGER,
                threshold_revenue     DECIMAL(12, 2),
                threshold_transactions INTEGER,
                created_at            TIMESTAMP,
                status                VARCHAR DEFAULT 'open',
                resolved_at           TIMESTAMP,
                notified_at           TIMESTAMP
            )
        """)
        # Migrate: add notified_at column if missing (existing DBs)
        try:
            self.conn.execute(
                "ALTER TABLE nexus_alerts ADD COLUMN notified_at TIMESTAMP"
            )
        except duckdb.CatalogException:
            pass  # column already exists
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS audit_log (
                id                      VARCHAR PRIMARY KEY,
                merchant_id             VARCHAR,
                action                  VARCHAR,
                state                   VARCHAR,
                amount_cents            INTEGER,
                stripe_registration_id  VARCHAR,
                created_at              TIMESTAMP,
                confirmed_by            VARCHAR
            )
        """)
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS processed_webhook_events (
                event_id    VARCHAR PRIMARY KEY,
                event_type  VARCHAR,
                processed_at TIMESTAMP
            )
        """)
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS merchant_subscriptions (
                id                      VARCHAR PRIMARY KEY,
                merchant_id             VARCHAR UNIQUE,
                tier                    VARCHAR DEFAULT 'free',
                stripe_subscription_id  VARCHAR,
                status                  VARCHAR DEFAULT 'active',
                created_at              TIMESTAMP,
                updated_at              TIMESTAMP
            )
        """)

    # -- Transactions -----------------------------------------------------

    def upsert_transaction(
        self,
        tx_id: str,
        created_at: datetime,
        state: str,
        amount: float,
        merchant_id: str,
        payment_intent_id: str,
        source_platform: str = "stripe",
    ) -> None:
        self.conn.execute(
            """
            INSERT OR REPLACE INTO transactions
                (tx_id, created_at, state, amount, merchant_id, payment_intent_id, source_platform)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            [tx_id, created_at, state.upper(), amount, merchant_id, payment_intent_id, source_platform],
        )

    def get_recent_transactions(self, merchant_id: str, limit: int = 50) -> list[dict]:
        result = self.conn.execute(
            """
            SELECT tx_id, created_at, state, amount, merchant_id, payment_intent_id
            FROM transactions
            WHERE merchant_id = ?
            ORDER BY created_at DESC
            LIMIT ?
            """,
            [merchant_id, limit],
        )
        cols = [desc[0] for desc in result.description]
        return [dict(zip(cols, row)) for row in result.fetchall()]

    # -- Nexus status -----------------------------------------------------

    def get_nexus_status(self, merchant_id: str, year: int | None = None) -> list[dict]:
        if year is None:
            year = datetime.now(timezone.utc).year

        result = self.conn.execute(
            """
            SELECT
                state,
                SUM(amount)  AS total_sales,
                COUNT(*)     AS transaction_count
            FROM transactions
            WHERE merchant_id = ?
              AND EXTRACT(YEAR FROM created_at) = ?
            GROUP BY state
            ORDER BY total_sales DESC
            """,
            [merchant_id, year],
        )

        cols = [desc[0] for desc in result.description]
        rows = [dict(zip(cols, row)) for row in result.fetchall()]

        statuses: list[dict] = []
        for row in rows:
            sc = row["state"]
            if not is_nexus_state(sc):
                continue

            threshold = NEXUS_THRESHOLDS[sc]
            rev_threshold = threshold.revenue_threshold
            total = float(row["total_sales"])
            tx_count = int(row["transaction_count"])

            # Percentage of revenue threshold (primary metric)
            pct = (total / rev_threshold * 100) if rev_threshold > 0 else 100.0

            # Also check transaction threshold if the state has one
            tx_threshold = threshold.transaction_threshold
            tx_pct = 0.0
            if tx_threshold is not None and tx_threshold > 0:
                tx_pct = tx_count / tx_threshold * 100

            # Risk is the worse of the two metrics
            effective_pct = max(pct, tx_pct)

            if effective_pct >= 100:
                risk = "CRITICAL"
            elif effective_pct >= 90:
                risk = "RED"
            elif effective_pct >= 75:
                risk = "YELLOW"
            else:
                risk = "GREEN"

            statuses.append({
                "state": sc,
                "total_sales": total,
                "transaction_count": tx_count,
                "risk_level": risk,
                "threshold_revenue": rev_threshold,
                "threshold_transactions": tx_threshold,
                "pct_of_threshold": round(effective_pct, 1),
            })

        return statuses

    # -- Platform connections -----------------------------------------------

    def add_platform_connection(
        self,
        merchant_id: str,
        platform: str,
        platform_merchant_id: str | None = None,
        access_token: str | None = None,
        refresh_token: str | None = None,
        shop_url: str | None = None,
    ) -> str:
        conn_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        self.conn.execute(
            """
            INSERT INTO connected_platforms
                (id, merchant_id, platform, platform_merchant_id,
                 access_token, refresh_token, shop_url, connected_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
            """,
            [conn_id, merchant_id, platform, platform_merchant_id,
             access_token, refresh_token, shop_url, now],
        )
        return conn_id

    def get_platform_connections(self, merchant_id: str) -> list[dict]:
        result = self.conn.execute(
            """
            SELECT id, merchant_id, platform, platform_merchant_id,
                   access_token, refresh_token, shop_url,
                   connected_at, last_sync_at, status
            FROM connected_platforms
            WHERE merchant_id = ? AND status = 'active'
            ORDER BY connected_at DESC
            """,
            [merchant_id],
        )
        cols = [desc[0] for desc in result.description]
        return [dict(zip(cols, row)) for row in result.fetchall()]

    def update_platform_sync(self, connection_id: str, last_sync_at: datetime) -> None:
        self.conn.execute(
            "UPDATE connected_platforms SET last_sync_at = ? WHERE id = ?",
            [last_sync_at, connection_id],
        )

    def get_nexus_status_by_platform(
        self, merchant_id: str, year: int | None = None
    ) -> list[dict]:
        """Same as get_nexus_status but includes source_platform breakdown per state."""
        if year is None:
            year = datetime.now(timezone.utc).year

        # First get the per-state, per-platform breakdown
        platform_result = self.conn.execute(
            """
            SELECT
                state,
                source_platform,
                SUM(amount)  AS total_sales,
                COUNT(*)     AS transaction_count
            FROM transactions
            WHERE merchant_id = ?
              AND EXTRACT(YEAR FROM created_at) = ?
            GROUP BY state, source_platform
            ORDER BY state, total_sales DESC
            """,
            [merchant_id, year],
        )
        platform_cols = [desc[0] for desc in platform_result.description]
        platform_rows = [dict(zip(platform_cols, row)) for row in platform_result.fetchall()]

        # Build platform breakdown map: state -> list of {platform, sales, count}
        platform_map: dict[str, list[dict]] = {}
        for row in platform_rows:
            sc = row["state"]
            if sc not in platform_map:
                platform_map[sc] = []
            platform_map[sc].append({
                "platform": row["source_platform"],
                "total_sales": float(row["total_sales"]),
                "transaction_count": int(row["transaction_count"]),
            })

        # Get the standard nexus status and enrich with platform breakdown
        statuses = self.get_nexus_status(merchant_id, year)
        for status in statuses:
            status["platform_breakdown"] = platform_map.get(status["state"], [])

        return statuses

    # -- Alerts -----------------------------------------------------------

    def get_open_alerts(self, merchant_id: str) -> list[dict]:
        result = self.conn.execute(
            """
            SELECT *
            FROM nexus_alerts
            WHERE merchant_id = ? AND status = 'open'
            ORDER BY created_at DESC
            """,
            [merchant_id],
        )
        cols = [desc[0] for desc in result.description]
        return [dict(zip(cols, row)) for row in result.fetchall()]

    def create_alert(
        self,
        merchant_id: str,
        state: str,
        risk_level: str,
        total_sales: float,
        tx_count: int,
        threshold_rev: float,
        threshold_tx: int | None,
    ) -> str:
        alert_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        self.conn.execute(
            """
            INSERT INTO nexus_alerts
                (id, merchant_id, state, risk_level, total_sales,
                 transaction_count, threshold_revenue, threshold_transactions,
                 created_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
            """,
            [
                alert_id, merchant_id, state.upper(), risk_level,
                total_sales, tx_count, threshold_rev, threshold_tx, now,
            ],
        )
        return alert_id

    def resolve_alert(self, alert_id: str, resolved_by: str) -> None:
        now = datetime.now(timezone.utc)
        self.conn.execute(
            """
            UPDATE nexus_alerts
            SET status = 'resolved', resolved_at = ?
            WHERE id = ?
            """,
            [now, alert_id],
        )
        # Also log the resolution in the audit trail
        self.log_audit(
            merchant_id="",  # populated by caller if needed
            action="resolve_alert",
            state="",
            amount_cents=0,
            stripe_reg_id=None,
            confirmed_by=resolved_by,
        )

    # -- Webhook event dedup ----------------------------------------------

    def is_webhook_event_processed(self, event_id: str) -> bool:
        """Return True if this Stripe event_id was already handled."""
        row = self.conn.execute(
            "SELECT 1 FROM processed_webhook_events WHERE event_id = ?",
            [event_id],
        ).fetchone()
        return row is not None

    def mark_webhook_event_processed(self, event_id: str, event_type: str) -> None:
        """Record a Stripe event_id as processed (idempotency guard)."""
        now = datetime.now(timezone.utc)
        self.conn.execute(
            """
            INSERT OR IGNORE INTO processed_webhook_events
                (event_id, event_type, processed_at)
            VALUES (?, ?, ?)
            """,
            [event_id, event_type, now],
        )

    def mark_alert_notified(self, alert_id: str) -> None:
        """Stamp notified_at so the same alert is never emailed twice."""
        now = datetime.now(timezone.utc)
        self.conn.execute(
            "UPDATE nexus_alerts SET notified_at = ? WHERE id = ?",
            [now, alert_id],
        )

    def get_open_alerts_unnotified(self, merchant_id: str) -> list[dict]:
        """Return open alerts that have not yet been emailed."""
        result = self.conn.execute(
            """
            SELECT *
            FROM nexus_alerts
            WHERE merchant_id = ? AND status = 'open' AND notified_at IS NULL
            ORDER BY created_at DESC
            """,
            [merchant_id],
        )
        cols = [desc[0] for desc in result.description]
        return [dict(zip(cols, row)) for row in result.fetchall()]

    # -- Audit log --------------------------------------------------------

    def log_audit(
        self,
        merchant_id: str,
        action: str,
        state: str,
        amount_cents: int,
        stripe_reg_id: str | None,
        confirmed_by: str,
    ) -> str:
        log_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        self.conn.execute(
            """
            INSERT INTO audit_log
                (id, merchant_id, action, state, amount_cents,
                 stripe_registration_id, created_at, confirmed_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [log_id, merchant_id, action, state, amount_cents, stripe_reg_id, now, confirmed_by],
        )
        return log_id

    # -- Subscriptions ----------------------------------------------------

    def upsert_subscription(
        self,
        merchant_id: str,
        tier: str,
        stripe_subscription_id: str,
    ) -> None:
        """Insert or update the merchant's subscription record."""
        now = datetime.now(timezone.utc)
        sub_id = str(uuid.uuid4())
        self.conn.execute(
            """
            INSERT INTO merchant_subscriptions
                (id, merchant_id, tier, stripe_subscription_id, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'active', ?, ?)
            ON CONFLICT (merchant_id) DO UPDATE SET
                tier = EXCLUDED.tier,
                stripe_subscription_id = EXCLUDED.stripe_subscription_id,
                status = 'active',
                updated_at = EXCLUDED.updated_at
            """,
            [sub_id, merchant_id, tier.lower(), stripe_subscription_id, now, now],
        )

    def get_subscription(self, merchant_id: str) -> dict | None:
        """Return the merchant's subscription record, or None if not found."""
        result = self.conn.execute(
            """
            SELECT id, merchant_id, tier, stripe_subscription_id, status,
                   created_at, updated_at
            FROM merchant_subscriptions
            WHERE merchant_id = ?
            """,
            [merchant_id],
        )
        cols = [desc[0] for desc in result.description]
        row = result.fetchone()
        if row is None:
            return None
        return dict(zip(cols, row))

    def cancel_subscription(
        self,
        merchant_id: str,
        stripe_subscription_id: str,
    ) -> None:
        """Mark a subscription as cancelling (stays active until period end)."""
        now = datetime.now(timezone.utc)
        self.conn.execute(
            """
            UPDATE merchant_subscriptions
            SET status = 'cancelling', updated_at = ?
            WHERE merchant_id = ? AND stripe_subscription_id = ?
            """,
            [now, merchant_id, stripe_subscription_id],
        )

    # -- Lifecycle --------------------------------------------------------

    def close(self) -> None:
        self.conn.close()
