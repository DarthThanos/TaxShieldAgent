"""
TaxShieldAgent entry point.

Two operating modes:
  --sync        One-time historical sync of the last 100 PaymentIntents
  --run-agent   Continuous nexus-monitoring loop
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import os
import sys
import time
from datetime import datetime, timezone

import stripe
from dotenv import load_dotenv, find_dotenv

from .claude_agent import ComplianceAgent
from .db import ShieldDB
from .nexus_engine import NexusEngine
from .notifier import send_alert_email

load_dotenv(find_dotenv(usecwd=True), override=True)

if _sentry_dsn := os.getenv("SENTRY_DSN"):
    try:
        import sentry_sdk
        sentry_sdk.init(dsn=_sentry_dsn, traces_sample_rate=0.2)
    except ImportError:
        pass

logger = logging.getLogger("taxshieldagent")


def _configure_logging() -> None:
    """Set up structured console logging."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )


def _extract_state_from_pi(pi: dict) -> str | None:
    """Try to extract a US state from a PaymentIntent object.

    Resolution order: shipping.address.state > metadata.state
    """
    shipping = getattr(pi, "shipping", None) or (pi.get("shipping") if isinstance(pi, dict) else None)
    if shipping:
        address = getattr(shipping, "address", None) or (shipping.get("address") if isinstance(shipping, dict) else None)
        if address:
            state = getattr(address, "state", None) or (address.get("state") if isinstance(address, dict) else None)
            if state:
                return str(state).strip().upper()

    metadata = getattr(pi, "metadata", None) or (pi.get("metadata") if isinstance(pi, dict) else None)
    if metadata:
        state = None
        if isinstance(metadata, dict):
            state = metadata.get("state") or metadata.get("shipping_state")
        else:
            state = getattr(metadata, "state", None) or getattr(metadata, "shipping_state", None)
        if state:
            return str(state).strip().upper()

    return None


def sync(db: ShieldDB) -> None:
    """Pull the last 100 PaymentIntents from Stripe and upsert them."""
    logger.info("Starting historical sync...")

    payment_intents = stripe.PaymentIntent.list(limit=100)

    synced = 0
    skipped = 0

    for pi in payment_intents.auto_paging_iter():
        state = _extract_state_from_pi(pi)
        if not state:
            skipped += 1
            continue

        created_at = datetime.fromtimestamp(pi["created"], tz=timezone.utc)
        amount = pi["amount"] / 100.0
        merchant_id = os.getenv("MERCHANT_ID", "platform")

        db.upsert_transaction(
            tx_id=pi["id"],
            created_at=created_at,
            state=state,
            amount=amount,
            merchant_id=merchant_id,
            payment_intent_id=pi["id"],
        )
        synced += 1

    print(f"Synced {synced} transactions, skipped {skipped} (no state data)")
    logger.info("Sync complete: %d synced, %d skipped", synced, skipped)


def run_agent(db: ShieldDB, nexus_engine: NexusEngine, agent: ComplianceAgent) -> None:
    """Run the continuous nexus-monitoring loop.

    Checks every ``NEXUS_CHECK_INTERVAL`` seconds (default 900 = 15 min).
    Prints AI-generated alert messages for any new CRITICAL or RED alerts.
    Shuts down gracefully on KeyboardInterrupt.
    """
    interval = int(os.getenv("NEXUS_CHECK_INTERVAL", "900"))
    merchant_id = os.getenv("MERCHANT_ID", "platform")

    logger.info(
        "Starting agent loop (merchant=%s, interval=%ds)", merchant_id, interval
    )

    try:
        while True:
            run_start = datetime.now(timezone.utc)
            logger.info("Running nexus check at %s", run_start.isoformat())

            new_alerts = nexus_engine.run_check(merchant_id)

            critical_or_red = [
                a for a in new_alerts if a["risk_level"] in ("CRITICAL", "RED")
            ]

            if critical_or_red:
                logger.warning(
                    "%d new CRITICAL/RED alert(s) detected", len(critical_or_red)
                )
                ai_messages: dict[str, str] = {}
                for alert in critical_or_red:
                    message = agent.generate_alert_message(
                        state=alert["state"],
                        total_sales=alert["total_sales"],
                        threshold=alert.get("threshold_revenue", 0),
                        pct=alert["pct_of_threshold"],
                        tx_count=alert["transaction_count"],
                    )
                    ai_messages[alert["state"]] = message
                    logger.warning(
                        "ALERT [%s] %s:\n%s",
                        alert["risk_level"],
                        alert["state"],
                        message,
                    )
                # Fetch the persisted alert records (with IDs) to check notified_at
                unnotified = db.get_open_alerts_unnotified(merchant_id)
                send_alert_email(db, merchant_id, unnotified, ai_messages)
            else:
                logger.info("No new critical alerts. %d total alerts processed.", len(new_alerts))

            logger.info(
                "Check complete. Next run in %d seconds. Summary: %d new/escalated alerts.",
                interval,
                len(new_alerts),
            )

            time.sleep(interval)

    except KeyboardInterrupt:
        logger.info("Received shutdown signal. Exiting gracefully.")


def main() -> None:
    """CLI entry point."""
    _configure_logging()

    parser = argparse.ArgumentParser(
        prog="taxshieldagent",
        description="TaxShieldAgent -- Compliance-as-a-Service for Stripe merchants",
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument(
        "--sync",
        action="store_true",
        help="One-time sync of the last 100 PaymentIntents from Stripe",
    )
    mode.add_argument(
        "--run-agent",
        action="store_true",
        help="Run the continuous nexus-monitoring agent loop",
    )
    args = parser.parse_args()

    # Stripe setup (may be empty if using multi-platform connections)
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

    db_path = os.getenv("SHIELD_DB_PATH", "data/shield.db")
    db = ShieldDB(db_path=db_path)

    try:
        if args.sync:
            # Check for multi-platform connections first
            merchant_id = os.getenv("MERCHANT_ID", "platform")
            connections = db.get_platform_connections(merchant_id)

            if connections:
                # Multi-platform sync via orchestrator
                from src.connectors.sync_orchestrator import SyncOrchestrator

                logger.info(
                    "Found %d platform connection(s), using SyncOrchestrator",
                    len(connections),
                )
                orchestrator = SyncOrchestrator(db)
                result = asyncio.run(orchestrator.sync_all_platforms(merchant_id))
                print(
                    f"Multi-platform sync complete: "
                    f"{result['platforms_synced']} platforms, "
                    f"{result['total_transactions']} transactions synced"
                )
                if result["errors"]:
                    for err in result["errors"]:
                        print(f"  ERROR [{err['platform']}]: {err['error']}")
                logger.info("Multi-platform sync result: %s", result)
            else:
                # Fallback: direct Stripe sync (original behavior)
                if not stripe.api_key:
                    logger.error("STRIPE_SECRET_KEY is not set and no platform connections found. Exiting.")
                    sys.exit(1)
                sync(db)
        elif args.run_agent:
            anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
            if not anthropic_key:
                logger.error("ANTHROPIC_API_KEY is not set. Exiting.")
                sys.exit(1)

            nexus_engine = NexusEngine(db)
            agent = ComplianceAgent(api_key=anthropic_key)
            run_agent(db, nexus_engine, agent)
    finally:
        db.close()


if __name__ == "__main__":
    main()
