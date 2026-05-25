"""
Nexus threshold and escalation boundary tests.

TX threshold: $500,000 revenue, no transaction count.
CO threshold: $100,000 revenue OR 200 transactions.
MT (Montana) has no sales tax — must be ignored.
"""

from __future__ import annotations

from datetime import datetime, timezone

import pytest

from src.agent.db import ShieldDB
from src.agent.nexus_engine import NexusEngine


def _tx(db: ShieldDB, state: str, amount: float, count: int = 1, year: int = 2026) -> None:
    """Insert `count` transactions in `state` summing to `amount`."""
    per_tx = amount / count if count else amount
    for i in range(count):
        db.upsert_transaction(
            tx_id=f"{state}-{year}-{i}",
            created_at=datetime(year, 6, 1, tzinfo=timezone.utc),
            state=state,
            amount=per_tx,
            merchant_id="test_merchant",
            payment_intent_id=f"pi_{state}_{year}_{i}",
        )


# ---------------------------------------------------------------------------
# Revenue threshold tests (TX: $500k)
# ---------------------------------------------------------------------------

def test_green_below_75pct(db: ShieldDB) -> None:
    _tx(db, "TX", 374_000.00)  # 74.8% of $500k
    statuses = db.get_nexus_status("test_merchant")
    tx = next((s for s in statuses if s["state"] == "TX"), None)
    assert tx is not None
    assert tx["risk_level"] == "GREEN"


def test_yellow_at_75pct(db: ShieldDB) -> None:
    _tx(db, "TX", 375_000.00)  # 75% of $500k
    statuses = db.get_nexus_status("test_merchant")
    tx = next(s for s in statuses if s["state"] == "TX")
    assert tx["risk_level"] == "YELLOW"


def test_red_at_90pct(db: ShieldDB) -> None:
    _tx(db, "TX", 450_000.00)  # 90% of $500k
    statuses = db.get_nexus_status("test_merchant")
    tx = next(s for s in statuses if s["state"] == "TX")
    assert tx["risk_level"] == "RED"


def test_critical_at_100pct(db: ShieldDB) -> None:
    _tx(db, "TX", 500_000.00)  # 100% of $500k
    statuses = db.get_nexus_status("test_merchant")
    tx = next(s for s in statuses if s["state"] == "TX")
    assert tx["risk_level"] == "CRITICAL"


# ---------------------------------------------------------------------------
# Transaction-count threshold wins over revenue (CO: $100k OR 200 tx)
# ---------------------------------------------------------------------------

def test_tx_count_worse_than_revenue(db: ShieldDB) -> None:
    # 201 transactions but only $1,000 revenue (1% of $100k threshold)
    # CO transaction threshold is 200 — 201/200 = 100.5% → CRITICAL
    _tx(db, "CO", 1_000.00, count=201)
    statuses = db.get_nexus_status("test_merchant")
    co = next(s for s in statuses if s["state"] == "CO")
    assert co["risk_level"] == "CRITICAL"


# ---------------------------------------------------------------------------
# No-sales-tax states must be ignored
# ---------------------------------------------------------------------------

def test_no_tax_state_ignored(db: ShieldDB) -> None:
    # Montana has no sales tax — should never appear in nexus results
    _tx(db, "MT", 500_000.00, count=999)
    statuses = db.get_nexus_status("test_merchant")
    states = [s["state"] for s in statuses]
    assert "MT" not in states


# ---------------------------------------------------------------------------
# Year rollover — prior-year data must not count
# ---------------------------------------------------------------------------

def test_year_rollover(db: ShieldDB) -> None:
    # Insert 2025 sales above TX threshold — must not appear in 2026 check
    _tx(db, "TX", 500_000.00, year=2025)
    statuses = db.get_nexus_status("test_merchant", year=2026)
    tx = next((s for s in statuses if s["state"] == "TX"), None)
    assert tx is None


# ---------------------------------------------------------------------------
# Escalation dedup — same risk level must not create a second open alert
# ---------------------------------------------------------------------------

def test_escalation_no_dupe(db: ShieldDB) -> None:
    _tx(db, "TX", 400_000.00)  # 80% → YELLOW
    engine = NexusEngine(db)

    alerts_first = engine.run_check("test_merchant")
    assert len(alerts_first) == 1
    assert alerts_first[0]["risk_level"] == "YELLOW"

    # Run again at the same percentage — still YELLOW, no new alert
    alerts_second = engine.run_check("test_merchant")
    assert len(alerts_second) == 0

    open_alerts = db.get_open_alerts("test_merchant")
    assert len(open_alerts) == 1
