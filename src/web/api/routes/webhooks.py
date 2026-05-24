"""
Stripe webhook receiver for TaxShieldAgent.

Accepts raw Stripe webhook payloads, verifies their signatures, and
delegates processing to the WebhookProcessor agent layer.
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Header, HTTPException, Request

from src.agent.db import ShieldDB
from src.agent.nexus_engine import NexusEngine
from src.agent.webhook_handler import WebhookProcessor

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/stripe")
async def receive_stripe_webhook(
    request: Request,
    stripe_signature: str = Header(..., alias="stripe-signature"),
) -> dict:
    """Receive and process a Stripe webhook event.

    The request body MUST be read as raw bytes -- Stripe's signature
    verification depends on the exact byte sequence, so parsing JSON
    first would break verification.
    """
    payload: bytes = await request.body()
    timestamp = datetime.now(timezone.utc).isoformat()

    logger.info("Webhook received at %s (payload_size=%d bytes)", timestamp, len(payload))

    db_path = os.getenv("DB_PATH", "data/shield.db")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    db = ShieldDB(db_path=db_path)
    try:
        engine = NexusEngine(db=db)
        processor = WebhookProcessor(
            db=db,
            nexus_engine=engine,
            webhook_secret=webhook_secret,
        )

        result = processor.process_event(payload, stripe_signature)

        if result["status"] == "error":
            logger.warning(
                "Webhook processing failed at %s: %s",
                timestamp,
                result,
            )
            raise HTTPException(status_code=400, detail="Webhook signature verification failed")

        logger.info(
            "Webhook processed at %s: event_type=%s processed=%s",
            timestamp,
            result.get("event_type", "unknown"),
            result.get("processed", False),
        )

        return {"received": True}
    finally:
        db.close()
