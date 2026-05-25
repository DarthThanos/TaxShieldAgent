"""
Audit log endpoints for TaxShieldAgent.

Provides the compliance audit trail and PDF receipt export.
"""

from __future__ import annotations

import io
import os
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from src.agent.db import ShieldDB
from src.web.api.middleware.auth import get_merchant_id

router = APIRouter(prefix="/audit", tags=["audit"])


def get_db() -> ShieldDB:
    db_path = os.getenv("DB_PATH", "data/shield.db")
    return ShieldDB(db_path=db_path)


@router.get("/")
async def list_audit_log(
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> list[dict[str, Any]]:
    """Return all audit log entries for the merchant."""
    try:
        result = db.conn.execute(
            """
            SELECT id, merchant_id, action, state, amount_cents,
                   stripe_registration_id, created_at, confirmed_by
            FROM audit_log
            WHERE merchant_id = ?
            ORDER BY created_at DESC
            """,
            [merchant_id],
        )
        cols = [d[0] for d in result.description]
        return [dict(zip(cols, row)) for row in result.fetchall()]
    finally:
        db.close()


@router.get("/export-pdf")
async def export_pdf(
    merchant_id: str = Depends(get_merchant_id),
    db: ShieldDB = Depends(get_db),
) -> StreamingResponse:
    """Generate and stream a compliance receipt PDF for the merchant."""
    try:
        # Fetch data
        audit_rows_result = db.conn.execute(
            """
            SELECT action, state, amount_cents, stripe_registration_id,
                   created_at, confirmed_by
            FROM audit_log
            WHERE merchant_id = ?
            ORDER BY created_at DESC
            """,
            [merchant_id],
        )
        audit_cols = [d[0] for d in audit_rows_result.description]
        audit_rows = [dict(zip(audit_cols, r)) for r in audit_rows_result.fetchall()]

        alerts_result = db.conn.execute(
            """
            SELECT state, risk_level, total_sales, threshold_revenue,
                   created_at, status
            FROM nexus_alerts
            WHERE merchant_id = ?
            ORDER BY created_at DESC
            LIMIT 50
            """,
            [merchant_id],
        )
        alert_cols = [d[0] for d in alerts_result.description]
        alerts = [dict(zip(alert_cols, r)) for r in alerts_result.fetchall()]

        pdf_bytes = _build_pdf(merchant_id, audit_rows, alerts)
        filename = f"taxshield_compliance_{merchant_id}_{datetime.now(timezone.utc).strftime('%Y%m%d')}.pdf"

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    finally:
        db.close()


def _build_pdf(merchant_id: str, audit_rows: list[dict], alerts: list[dict]) -> bytes:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
    )

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    styles = getSampleStyleSheet()
    brand = colors.HexColor("#6366f1")
    gray = colors.HexColor("#6b7280")
    red = colors.HexColor("#ef4444")

    title_style = ParagraphStyle("title", parent=styles["Title"], textColor=brand, fontSize=20, spaceAfter=4)
    sub_style = ParagraphStyle("sub", parent=styles["Normal"], textColor=gray, fontSize=10, spaceAfter=2)
    section_style = ParagraphStyle("section", parent=styles["Heading2"], textColor=brand, fontSize=13, spaceBefore=16, spaceAfter=6)
    body_style = ParagraphStyle("body", parent=styles["Normal"], fontSize=10, spaceAfter=4)
    disclaimer_style = ParagraphStyle("disclaimer", parent=styles["Normal"], textColor=gray, fontSize=8, spaceAfter=2)

    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    story = []

    # Header
    story.append(Paragraph("TaxShieldAgent", title_style))
    story.append(Paragraph("Compliance Receipt", styles["Heading2"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph(f"Merchant: {merchant_id}", sub_style))
    story.append(Paragraph(f"Generated: {generated_at}", sub_style))
    story.append(HRFlowable(width="100%", thickness=1, color=brand, spaceAfter=12))

    # Alert summary
    story.append(Paragraph("Nexus Alert History", section_style))
    if alerts:
        tbl_data = [["State", "Risk Level", "Sales", "Threshold", "Status", "Date"]]
        for a in alerts:
            date_str = ""
            if a.get("created_at"):
                try:
                    date_str = str(a["created_at"])[:10]
                except Exception:
                    pass
            tbl_data.append([
                a.get("state", ""),
                a.get("risk_level", ""),
                f"${float(a.get('total_sales', 0)):,.0f}",
                f"${float(a.get('threshold_revenue', 0)):,.0f}",
                (a.get("status") or "").capitalize(),
                date_str,
            ])
        tbl = Table(tbl_data, colWidths=[0.7*inch, 1.0*inch, 1.1*inch, 1.1*inch, 0.9*inch, 1.0*inch])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), brand),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e5e7eb")),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(tbl)
    else:
        story.append(Paragraph("No alerts on record.", body_style))

    # Audit log
    story.append(Paragraph("Compliance Actions", section_style))
    if audit_rows:
        tbl_data = [["Action", "State", "Amount", "Confirmed By", "Date"]]
        for row in audit_rows:
            amount = f"${row.get('amount_cents', 0) / 100:.2f}" if row.get("amount_cents") else "—"
            date_str = str(row.get("created_at", ""))[:10]
            tbl_data.append([
                (row.get("action") or "").replace("_", " ").title(),
                row.get("state", ""),
                amount,
                row.get("confirmed_by", ""),
                date_str,
            ])
        tbl = Table(tbl_data, colWidths=[1.5*inch, 0.7*inch, 1.0*inch, 1.5*inch, 1.1*inch])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), brand),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e5e7eb")),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(tbl)
    else:
        story.append(Paragraph("No compliance actions recorded yet.", body_style))

    # Footer disclaimer
    story.append(Spacer(1, 24))
    story.append(HRFlowable(width="100%", thickness=0.5, color=gray, spaceAfter=8))
    story.append(Paragraph(
        "This document is generated by TaxShieldAgent for informational purposes only. "
        "It does not constitute legal or tax advice. Consult a qualified tax professional "
        "for compliance guidance specific to your business.",
        disclaimer_style,
    ))
    story.append(Paragraph(f"TaxShieldAgent · {generated_at}", disclaimer_style))

    doc.build(story)
    return buf.getvalue()
