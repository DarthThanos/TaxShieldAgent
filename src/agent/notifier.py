"""
Email delivery for nexus alerts via SendGrid.

Idempotent: checks notified_at before sending so the same alert is never
emailed twice.  Falls back gracefully if SENDGRID_API_KEY is absent.
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .db import ShieldDB

logger = logging.getLogger(__name__)

_RISK_COLOR = {
    "CRITICAL": "#c0392b",
    "RED":      "#e74c3c",
    "YELLOW":   "#f39c12",
    "GREEN":    "#27ae60",
}

_HTML_TEMPLATE = """\
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <h2 style="color:{color}">TaxShieldAgent — {risk_level} Nexus Alert</h2>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:6px;font-weight:bold">State</td>
        <td style="padding:6px">{state}</td></tr>
    <tr style="background:#f8f9fa">
        <td style="padding:6px;font-weight:bold">Risk level</td>
        <td style="padding:6px;color:{color};font-weight:bold">{risk_level}</td></tr>
    <tr><td style="padding:6px;font-weight:bold">YTD sales</td>
        <td style="padding:6px">${total_sales:,.2f}</td></tr>
    <tr style="background:#f8f9fa">
        <td style="padding:6px;font-weight:bold">Threshold</td>
        <td style="padding:6px">${threshold:,.0f}</td></tr>
    <tr><td style="padding:6px;font-weight:bold">% of threshold</td>
        <td style="padding:6px">{pct:.1f}%</td></tr>
  </table>
  <p style="margin-top:16px;color:#555">{ai_message}</p>
  <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
  <p style="font-size:12px;color:#999">
    TaxShieldAgent monitors your US economic nexus thresholds automatically.<br>
    Log in to your dashboard to review and take action.
  </p>
</body>
</html>
"""


def send_alert_email(
    db: ShieldDB,
    merchant_id: str,
    alerts: list[dict],
    ai_messages: dict[str, str] | None = None,
) -> None:
    """Send one email per un-notified RED/CRITICAL alert.

    Args:
        db: ShieldDB instance (used to stamp notified_at).
        merchant_id: the merchant account ID.
        alerts: list of alert dicts as returned by nexus_engine.run_check().
        ai_messages: optional mapping of state -> AI-generated message.
    """
    api_key = os.getenv("SENDGRID_API_KEY", "")
    if not api_key:
        logger.warning("SENDGRID_API_KEY not set — skipping email delivery")
        return

    try:
        import sendgrid
        from sendgrid.helpers.mail import Mail, To
    except ImportError:
        logger.warning("sendgrid package not installed — skipping email delivery")
        return

    from_email = os.getenv("ALERT_FROM_EMAIL", "alerts@taxshieldagent.com")
    to_email = os.getenv("ALERT_TO_EMAIL", "")
    if not to_email:
        # Try to look up recipient from DB merchant record
        sub = db.get_subscription(merchant_id)
        to_email = (sub or {}).get("email", "")

    if not to_email:
        logger.warning("No recipient email for merchant %s — skipping", merchant_id)
        return

    sg = sendgrid.SendGridAPIClient(api_key=api_key)

    for alert in alerts:
        if alert.get("notified_at"):
            continue  # already sent

        risk = alert["risk_level"]
        state = alert["state"]
        ai_msg = (ai_messages or {}).get(state, "Review your dashboard and consider registering for sales tax.")

        html = _HTML_TEMPLATE.format(
            color=_RISK_COLOR.get(risk, "#333"),
            risk_level=risk,
            state=state,
            total_sales=float(alert.get("total_sales", 0)),
            threshold=float(alert.get("threshold_revenue", 0)),
            pct=float(alert.get("pct_of_threshold", 0)),
            ai_message=ai_msg,
        )

        message = Mail(
            from_email=from_email,
            to_emails=To(to_email),
            subject=f"[TaxShieldAgent] {risk} nexus alert — {state}",
            html_content=html,
        )

        try:
            response = sg.send(message)
            if response.status_code < 300:
                db.mark_alert_notified(alert["id"])
                logger.info("Alert email sent for %s/%s (status %s)", merchant_id, state, response.status_code)
            else:
                logger.error(
                    "SendGrid returned %s for alert %s: %s",
                    response.status_code, alert["id"], response.body,
                )
        except Exception as exc:
            logger.error("Failed to send alert email for %s/%s: %s", merchant_id, state, exc)
