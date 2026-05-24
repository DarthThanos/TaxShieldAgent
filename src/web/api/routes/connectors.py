"""
Platform connector API routes for TaxShieldAgent.

Provides endpoints for connecting, disconnecting, and syncing
transactions from multiple e-commerce and payment platforms.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel

from src.agent.db import ShieldDB
from src.connectors.amazon_csv import AmazonCSVConnector
from src.connectors.registry import (
    SUPPORTED_PLATFORMS,
    get_platform_display_name,
)
from src.connectors.shopify_connector import ShopifyConnector
from src.connectors.sync_orchestrator import SyncOrchestrator
from src.web.api.middleware.auth import get_merchant_id

router = APIRouter(prefix="/connectors", tags=["connectors"])


# -- Dependencies -----------------------------------------------------------

def get_db() -> ShieldDB:
    db_path = os.getenv("DB_PATH", "data/shield.db")
    return ShieldDB(db_path=db_path)


# -- Request models ---------------------------------------------------------

class ConnectStripeRequest(BaseModel):
    api_key: str

class ConnectShopifyRequest(BaseModel):
    shop_url: str
    code: str

class ConnectEtsyRequest(BaseModel):
    api_key: str
    access_token: str
    shop_id: str

class ConnectPayPalRequest(BaseModel):
    client_id: str
    client_secret: str

class ConnectSquareRequest(BaseModel):
    access_token: str


# -- List / info endpoints --------------------------------------------------

@router.get("/")
async def list_connected_platforms(
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> list[dict[str, Any]]:
    """List all connected platforms for the current merchant."""
    try:
        connections = db.get_platform_connections(merchant_id)
        # Strip sensitive fields before returning
        safe = []
        for c in connections:
            safe.append({
                "id": c["id"],
                "platform": c["platform"],
                "platform_merchant_id": c.get("platform_merchant_id"),
                "shop_url": c.get("shop_url"),
                "connected_at": c.get("connected_at"),
                "last_sync_at": c.get("last_sync_at"),
                "status": c.get("status"),
            })
        return safe
    finally:
        db.close()


@router.get("/supported")
async def supported_platforms() -> list[dict[str, str]]:
    """Return all supported platforms with display names and connection guidance."""
    instructions = {
        "stripe": "Provide your Stripe secret API key.",
        "shopify": "Complete Shopify OAuth flow or provide shop URL and auth code.",
        "etsy": "Provide your Etsy API key, OAuth access token, and shop ID.",
        "paypal": "Provide your PayPal client ID and client secret.",
        "square": "Provide your Square access token.",
        "amazon": "Upload a CSV export from Amazon Seller Central (Reports -> Payments -> Date Range Report).",
    }
    return [
        {
            "platform": p,
            "display_name": get_platform_display_name(p),
            "instructions": instructions.get(p, ""),
        }
        for p in SUPPORTED_PLATFORMS
    ]


# -- Sync endpoints ---------------------------------------------------------

@router.post("/sync")
async def sync_all(
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> dict[str, Any]:
    """Trigger a sync of all connected platforms for the current merchant."""
    try:
        orchestrator = SyncOrchestrator(db)
        return await orchestrator.sync_all_platforms(merchant_id)
    finally:
        db.close()


@router.post("/sync/{platform}")
async def sync_single(
    platform: str,
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> dict[str, Any]:
    """Sync a single platform for the current merchant."""
    try:
        connections = db.get_platform_connections(merchant_id)
        target = None
        for c in connections:
            if c["platform"] == platform:
                target = c
                break

        if target is None:
            raise HTTPException(
                status_code=404,
                detail=f"No active connection found for platform: {platform}",
            )

        orchestrator = SyncOrchestrator(db)
        return await orchestrator.sync_platform(
            merchant_id=merchant_id,
            platform=platform,
            connection_id=target["id"],
        )
    finally:
        db.close()


# -- Connect endpoints ------------------------------------------------------

@router.post("/connect/stripe")
async def connect_stripe(
    body: ConnectStripeRequest,
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> dict[str, str]:
    """Save a Stripe API key connection."""
    try:
        conn_id = db.add_platform_connection(
            merchant_id=merchant_id,
            platform="stripe",
            access_token=body.api_key,
        )
        return {"connection_id": conn_id, "status": "connected"}
    finally:
        db.close()


@router.post("/connect/shopify")
async def connect_shopify(
    body: ConnectShopifyRequest,
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> dict[str, str]:
    """Exchange a Shopify OAuth code and save the connection."""
    try:
        client_id = os.getenv("SHOPIFY_CLIENT_ID", "")
        client_secret = os.getenv("SHOPIFY_CLIENT_SECRET", "")

        if not client_id or not client_secret:
            raise HTTPException(
                status_code=500,
                detail="Shopify OAuth credentials not configured on server",
            )

        token_data = await ShopifyConnector.exchange_oauth_code(
            shop_url=body.shop_url,
            client_id=client_id,
            client_secret=client_secret,
            code=body.code,
        )

        access_token = token_data.get("access_token", "")

        conn_id = db.add_platform_connection(
            merchant_id=merchant_id,
            platform="shopify",
            access_token=access_token,
            shop_url=body.shop_url,
        )
        return {"connection_id": conn_id, "status": "connected"}
    finally:
        db.close()


@router.post("/connect/etsy")
async def connect_etsy(
    body: ConnectEtsyRequest,
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> dict[str, str]:
    """Save an Etsy API connection."""
    try:
        conn_id = db.add_platform_connection(
            merchant_id=merchant_id,
            platform="etsy",
            platform_merchant_id=body.api_key,
            access_token=body.access_token,
            shop_url=body.shop_id,  # store shop_id in shop_url field
        )
        return {"connection_id": conn_id, "status": "connected"}
    finally:
        db.close()


@router.post("/connect/paypal")
async def connect_paypal(
    body: ConnectPayPalRequest,
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> dict[str, str]:
    """Save a PayPal API connection."""
    try:
        conn_id = db.add_platform_connection(
            merchant_id=merchant_id,
            platform="paypal",
            platform_merchant_id=body.client_id,
            access_token=body.client_secret,
        )
        return {"connection_id": conn_id, "status": "connected"}
    finally:
        db.close()


@router.post("/connect/square")
async def connect_square(
    body: ConnectSquareRequest,
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> dict[str, str]:
    """Save a Square API connection."""
    try:
        conn_id = db.add_platform_connection(
            merchant_id=merchant_id,
            platform="square",
            access_token=body.access_token,
        )
        return {"connection_id": conn_id, "status": "connected"}
    finally:
        db.close()


@router.post("/connect/amazon/upload")
async def upload_amazon_csv(
    file: UploadFile = File(...),
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> dict[str, Any]:
    """Upload an Amazon Seller Central CSV and import transactions."""
    try:
        content = await file.read()
        csv_text = content.decode("utf-8-sig")  # Handle BOM if present

        connector = AmazonCSVConnector()
        records = connector.parse_csv(csv_text, merchant_id)

        imported = 0
        skipped = 0

        for rec in records:
            try:
                db.upsert_transaction(
                    tx_id=rec.tx_id,
                    created_at=rec.created_at,
                    state=rec.state,
                    amount=rec.amount,
                    merchant_id=rec.merchant_id,
                    payment_intent_id=rec.platform_tx_id,
                    source_platform=rec.source_platform,
                )
                imported += 1
            except Exception:
                skipped += 1

        # Ensure an Amazon platform connection exists for tracking
        connections = db.get_platform_connections(merchant_id)
        has_amazon = any(c["platform"] == "amazon" for c in connections)
        if not has_amazon:
            db.add_platform_connection(
                merchant_id=merchant_id,
                platform="amazon",
            )

        return {"imported": imported, "skipped": skipped}
    finally:
        db.close()


# -- Disconnect endpoint ----------------------------------------------------

@router.delete("/disconnect/{platform}")
async def disconnect_platform(
    platform: str,
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> dict[str, str]:
    """Disconnect a platform by setting its status to 'disconnected'."""
    try:
        connections = db.get_platform_connections(merchant_id)
        found = False
        for c in connections:
            if c["platform"] == platform:
                db.conn.execute(
                    "UPDATE connected_platforms SET status = 'disconnected' WHERE id = ?",
                    [c["id"]],
                )
                found = True

        if not found:
            raise HTTPException(
                status_code=404,
                detail=f"No active connection found for platform: {platform}",
            )

        return {"status": "disconnected", "platform": platform}
    finally:
        db.close()
