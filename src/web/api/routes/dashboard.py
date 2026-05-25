"""
Dashboard data endpoints for TaxShieldAgent.

Serves nexus status, alert summaries, and recent transaction data to
the merchant-facing dashboard.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends

from src.agent.db import ShieldDB
from src.agent.nexus_engine import NexusEngine
from src.web.api.middleware.auth import get_merchant_id

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

APP_VERSION = "0.1.0"


def get_db() -> ShieldDB:
    """Create a ShieldDB instance from environment configuration."""
    db_path = os.getenv("DB_PATH", "data/shield.db")
    return ShieldDB(db_path=db_path)


def get_engine(db: ShieldDB = Depends(get_db)) -> NexusEngine:
    """Create a NexusEngine backed by the request-scoped ShieldDB."""
    return NexusEngine(db=db)


@router.get("/nexus-status")
async def nexus_status(
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> list[dict[str, Any]]:
    """Return nexus risk status for every state the merchant has sales in."""
    try:
        return db.get_nexus_status(merchant_id)
    finally:
        db.close()


@router.get("/summary")
async def summary(
    merchant_id: str = Depends(get_merchant_id),
    engine: NexusEngine = Depends(get_engine),
) -> dict[str, Any]:
    """Return a high-level alert summary plus app metadata."""
    try:
        alert_summary = engine.get_alert_summary(merchant_id)
        alert_summary["app_version"] = APP_VERSION
        alert_summary["last_check"] = datetime.now(timezone.utc).isoformat()
        return alert_summary
    finally:
        engine.db.close()


@router.get("/projections")
async def projections(
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> list[dict[str, Any]]:
    """Return velocity-based nexus crossing date projections for at-risk states."""
    try:
        return db.get_all_nexus_projections(merchant_id)
    finally:
        db.close()


@router.get("/transactions")
async def transactions(
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> list[dict[str, Any]]:
    """Return the 50 most recent transactions for the merchant."""
    try:
        return db.get_recent_transactions(merchant_id, limit=50)
    finally:
        db.close()
