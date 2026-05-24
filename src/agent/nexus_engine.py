"""
Nexus detection engine.

Sits on top of ShieldDB and NEXUS_THRESHOLDS to continuously evaluate a
merchant's exposure across all US states, creating and escalating alerts
when risk levels cross actionable thresholds.
"""

from __future__ import annotations

from .db import ShieldDB


class NexusEngine:
    """Evaluates merchant sales data against state nexus thresholds."""

    def __init__(self, db: ShieldDB) -> None:
        self.db = db

    def run_check(self, merchant_id: str) -> list[dict]:
        """Run a full nexus check for a merchant.

        Compares current-year sales against every state's threshold,
        creates alerts for YELLOW/RED/CRITICAL states, and escalates
        existing alerts whose risk level has worsened.

        Returns only new or freshly-escalated alert records.
        """
        statuses = self.db.get_nexus_status(merchant_id)
        open_alerts = self.db.get_open_alerts(merchant_id)

        # Index existing open alerts by state for duplicate prevention
        alerts_by_state: dict[str, dict] = {}
        for alert in open_alerts:
            alerts_by_state[alert["state"]] = alert

        risk_rank = {"GREEN": 0, "YELLOW": 1, "RED": 2, "CRITICAL": 3}
        new_or_escalated: list[dict] = []

        for status in statuses:
            if status["risk_level"] == "GREEN":
                continue

            state = status["state"]
            existing = alerts_by_state.get(state)

            if existing is None:
                # No open alert yet — create one
                alert_id = self.db.create_alert(
                    merchant_id=merchant_id,
                    state=state,
                    risk_level=status["risk_level"],
                    total_sales=status["total_sales"],
                    tx_count=status["transaction_count"],
                    threshold_rev=status["threshold_revenue"],
                    threshold_tx=status.get("threshold_transactions"),
                )
                new_or_escalated.append({
                    "alert_id": alert_id,
                    "state": state,
                    "risk_level": status["risk_level"],
                    "total_sales": status["total_sales"],
                    "transaction_count": status["transaction_count"],
                    "pct_of_threshold": status["pct_of_threshold"],
                    "action": "created",
                })
            elif risk_rank.get(status["risk_level"], 0) > risk_rank.get(existing["risk_level"], 0):
                # Risk has escalated — resolve old alert and create a new one
                # at the higher level so the audit trail shows the progression.
                self.db.resolve_alert(existing["id"], resolved_by="system:escalation")
                alert_id = self.db.create_alert(
                    merchant_id=merchant_id,
                    state=state,
                    risk_level=status["risk_level"],
                    total_sales=status["total_sales"],
                    tx_count=status["transaction_count"],
                    threshold_rev=status["threshold_revenue"],
                    threshold_tx=status.get("threshold_transactions"),
                )
                new_or_escalated.append({
                    "alert_id": alert_id,
                    "state": state,
                    "risk_level": status["risk_level"],
                    "previous_risk_level": existing["risk_level"],
                    "total_sales": status["total_sales"],
                    "transaction_count": status["transaction_count"],
                    "pct_of_threshold": status["pct_of_threshold"],
                    "action": "escalated",
                })

        return new_or_escalated

    def get_alert_summary(self, merchant_id: str) -> dict:
        """Return a high-level summary of a merchant's nexus risk posture."""
        statuses = self.db.get_nexus_status(merchant_id)
        open_alerts = self.db.get_open_alerts(merchant_id)

        critical = sum(1 for s in statuses if s["risk_level"] == "CRITICAL")
        red = sum(1 for s in statuses if s["risk_level"] == "RED")
        yellow = sum(1 for s in statuses if s["risk_level"] == "YELLOW")
        at_risk = critical + red + yellow

        return {
            "total_states_monitored": len(statuses),
            "states_at_risk": at_risk,
            "critical_count": critical,
            "red_count": red,
            "yellow_count": yellow,
            "open_alerts": len(open_alerts),
        }
