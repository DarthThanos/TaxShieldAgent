/**
 * NexusOverview — Main Stripe Dashboard panel for TaxShieldAgent.
 *
 * Displays nexus risk summary across all connected platforms and
 * provides one-click state tax registration for $1 per state.
 */

import {
  Box,
  Inline,
  Badge,
  Button,
  Icon,
  List,
  ListItem,
  Spinner,
  Banner,
} from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import { useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "../config";

interface NexusState {
  state: string;
  risk_level: string;
  total_sales: number;
  threshold: number;
  pct: number;
  alert_id: string | null;
}

interface NexusStatusResponse {
  at_risk_count: number;
  critical_count: number;
  states: NexusState[];
}

type BadgeTone = "critical" | "warning" | "info";

function riskBadgeTone(level: string): BadgeTone {
  switch (level) {
    case "CRITICAL":
      return "critical";
    case "RED":
      return "critical";
    case "YELLOW":
      return "warning";
    default:
      return "info";
  }
}

const NexusOverview = ({
  userContext,
  environment,
}: ExtensionContextValue) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<NexusStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingState, setConfirmingState] = useState<string | null>(null);
  const [fixingState, setFixingState] = useState<string | null>(null);
  const [fixedStates, setFixedStates] = useState<Set<string>>(new Set());

  const accountId = userContext?.account?.id ?? "";

  const fetchNexusStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${BACKEND_URL}/stripe-app/nexus-summary`, {
        headers: { "X-Stripe-Account": accountId },
      });
      if (!resp.ok) {
        throw new Error(`Backend returned ${resp.status}`);
      }
      const json: NexusStatusResponse = await resp.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load nexus status");
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (accountId) {
      fetchNexusStatus();
    }
  }, [accountId, fetchNexusStatus]);

  const handleConfirmFix = async (state: NexusState) => {
    if (!state.alert_id) return;
    setFixingState(state.state);
    try {
      const resp = await fetch(
        `${BACKEND_URL}/alerts/${state.alert_id}/confirm-fix`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Stripe-Account": accountId,
          },
          body: JSON.stringify({
            user_confirmed: true,
            state: state.state,
          }),
        }
      );
      if (!resp.ok) {
        throw new Error(`Fix failed with status ${resp.status}`);
      }
      setFixedStates((prev) => new Set(prev).add(state.state));
    } catch (err: any) {
      setError(`Fix failed for ${state.state}: ${err.message}`);
    } finally {
      setFixingState(null);
      setConfirmingState(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box css={{ padding: "large", layout: "column", alignX: "center" }}>
        <Spinner />
        <Box css={{ marginTop: "medium" }}>
          Loading nexus status...
        </Box>
      </Box>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <Box css={{ padding: "large" }}>
        <Banner
          type="critical"
          title="Connection Error"
          description={error}
          actions={
            <Button onPress={fetchNexusStatus}>Retry</Button>
          }
        />
      </Box>
    );
  }

  const atRiskStates = data?.states ?? [];
  const hasRisks = atRiskStates.length > 0;

  return (
    <Box css={{ padding: "large", layout: "column", gap: "medium" }}>
      {/* Summary banner */}
      {!hasRisks ? (
        <Banner
          type="default"
          title="All Clear"
          description="No nexus risks detected across your connected platforms."
        />
      ) : (
        <Banner
          type="critical"
          title={`${data!.at_risk_count} state${data!.at_risk_count !== 1 ? "s" : ""} at risk`}
          description={
            data!.critical_count > 0
              ? `${data!.critical_count} require immediate action — you may already owe sales tax.`
              : "Review the states below and register before you cross a threshold."
          }
        />
      )}

      {/* Error banner (non-fatal) */}
      {error && data && (
        <Banner type="warning" title="Warning" description={error} />
      )}

      {/* At-risk state list */}
      {hasRisks && (
        <List>
          {atRiskStates.map((s) => {
            const isFixed = fixedStates.has(s.state);
            const isConfirming = confirmingState === s.state;
            const isFixing = fixingState === s.state;

            return (
              <ListItem
                key={s.state}
                id={s.state}
                title={<Inline>{s.state}</Inline>}
                secondaryTitle={
                  <Inline>
                    ${s.total_sales.toLocaleString()} / $
                    {s.threshold.toLocaleString()} ({s.pct.toFixed(0)}%)
                  </Inline>
                }
                value={
                  <Inline css={{ layout: "row", gap: "small", alignY: "center" }}>
                    <Badge type={riskBadgeTone(s.risk_level)}>
                      {s.risk_level}
                    </Badge>

                    {isFixed ? (
                      <Badge type="info">Registered</Badge>
                    ) : isConfirming ? (
                      <Inline css={{ layout: "column", gap: "xsmall" }}>
                        <Box>
                          Register for sales tax in {s.state}? $1 fee applies.
                        </Box>
                        <Inline css={{ layout: "row", gap: "xsmall" }}>
                          <Button
                            type="primary"
                            onPress={() => handleConfirmFix(s)}
                            disabled={isFixing}
                          >
                            {isFixing ? "Processing..." : "Confirm"}
                          </Button>
                          <Button
                            onPress={() => setConfirmingState(null)}
                            disabled={isFixing}
                          >
                            Cancel
                          </Button>
                        </Inline>
                      </Inline>
                    ) : (
                      <Button
                        type="primary"
                        onPress={() => setConfirmingState(s.state)}
                        disabled={!s.alert_id}
                      >
                        FIX — $1
                      </Button>
                    )}
                  </Inline>
                }
              />
            );
          })}
        </List>
      )}

      {/* Connect more platforms */}
      <Box css={{ marginTop: "medium" }}>
        <Button
          type="secondary"
          href={`${BACKEND_URL}/dashboard`}
        >
          Connect More Platforms
        </Button>
      </Box>
    </Box>
  );
};

export default NexusOverview;
