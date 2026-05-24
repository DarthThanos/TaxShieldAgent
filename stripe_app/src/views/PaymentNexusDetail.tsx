/**
 * PaymentNexusDetail — Stripe Dashboard payment detail panel.
 *
 * Shows the nexus impact of a specific payment: origin state,
 * cumulative sales vs threshold, and risk level.
 */

import { Box, Inline, Badge, Spinner, Banner } from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "../config";

type BadgeTone = "critical" | "warning" | "info";

function riskBadgeTone(level: string): BadgeTone {
  switch (level) {
    case "CRITICAL":
    case "RED":
      return "critical";
    case "YELLOW":
      return "warning";
    default:
      return "info";
  }
}

const PaymentNexusDetail = ({
  userContext,
  environment,
}: ExtensionContextValue) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [totalSales, setTotalSales] = useState(0);
  const [threshold, setThreshold] = useState(0);
  const [pct, setPct] = useState(0);
  const [riskLevel, setRiskLevel] = useState("GREEN");

  const accountId = userContext?.account?.id ?? "";

  useEffect(() => {
    if (!accountId) return;
    (async () => {
      try {
        const resp = await fetch(`${BACKEND_URL}/stripe-app/nexus-summary`, {
          headers: { "X-Stripe-Account": accountId },
        });
        if (!resp.ok) {
          throw new Error(`Backend returned ${resp.status}`);
        }
        const data = await resp.json();
        // Show the highest-risk state as representative for this payment
        if (data.states && data.states.length > 0) {
          const top = data.states[0];
          setState(top.state);
          setTotalSales(top.total_sales ?? 0);
          setThreshold(top.threshold ?? 0);
          setPct(top.pct ?? 0);
          setRiskLevel(top.risk_level ?? "GREEN");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load nexus data");
      } finally {
        setLoading(false);
      }
    })();
  }, [accountId]);

  if (loading) return <Spinner />;

  if (error) {
    return (
      <Box css={{ padding: "medium" }}>
        <Banner
          type="critical"
          title="Could not load nexus data"
          description={error}
        />
      </Box>
    );
  }

  if (!state) {
    return (
      <Box css={{ padding: "medium" }}>
        No nexus risk detected for this payment.
      </Box>
    );
  }

  return (
    <Box css={{ padding: "medium", layout: "column", gap: "small" }}>
      <Inline css={{ fontWeight: "bold" }}>{state}</Inline>
      <Inline>
        ${totalSales.toLocaleString()} / ${threshold.toLocaleString()} ({pct.toFixed(0)}%)
      </Inline>
      <Badge type={riskBadgeTone(riskLevel)}>{riskLevel}</Badge>
    </Box>
  );
};

export default PaymentNexusDetail;
