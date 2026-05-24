import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { getAlerts, getAlert, confirmFix, snoozeAlert } from '../api/client';
import RiskBadge from '../components/RiskBadge';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';

const STATE_NAMES = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
  HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',
  KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',
  MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',
  MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',
  NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',
  OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
  SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',
  VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
  DC:'District of Columbia',
};

function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
}

export default function Alerts({ showToast }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [explanations, setExplanations] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState(null);
  const [fixModal, setFixModal] = useState(null);
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAlerts();
      setAlerts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = useCallback(async (alert) => {
    const id = alert.id;
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);

    if (!explanations[id]) {
      setLoadingExplanation(id);
      try {
        const detail = await getAlert(null, id);
        setExplanations(prev => ({ ...prev, [id]: detail.ai_explanation }));
      } catch {
        setExplanations(prev => ({ ...prev, [id]: 'Unable to load AI explanation.' }));
      } finally {
        setLoadingExplanation(null);
      }
    }
  }, [expanded, explanations]);

  const handleFix = useCallback(async () => {
    if (!fixModal) return;
    setProcessing(true);
    try {
      await confirmFix(null, fixModal.id, fixModal.state);
      showToast?.(`Sales tax registration initiated for ${STATE_NAMES[fixModal.state] || fixModal.state}`, 'success');
      setAlerts(prev => prev.filter(a => a.id !== fixModal.id));
      setFixModal(null);
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setProcessing(false);
    }
  }, [fixModal, showToast]);

  const handleSnooze = useCallback(async (alert) => {
    try {
      await snoozeAlert(null, alert.id, 7);
      showToast?.(`Alert snoozed for 7 days`, 'success');
      setAlerts(prev => prev.filter(a => a.id !== alert.id));
    } catch (err) {
      showToast?.(err.message, 'error');
    }
  }, [showToast]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div style={{ padding: 40, color: '#991b1b' }}>Failed to load alerts: {error}</div>;

  if (alerts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <CheckCircle size={56} color="#22c55e" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
          No open alerts
        </h2>
        <p style={{ color: '#6b7280', fontSize: 15 }}>
          Your sales tax compliance is up to date.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 24 }}>
        Alerts ({alerts.length})
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {alerts.map(alert => {
          const pct = alert.threshold_revenue
            ? Math.round((alert.total_sales / alert.threshold_revenue) * 100)
            : 0;
          const isExpanded = expanded === alert.id;

          return (
            <div
              key={alert.id}
              style={{
                backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                onClick={() => toggleExpand(alert)}
                style={{
                  padding: '16px 20px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                }}
              >
                <AlertTriangle
                  size={20}
                  color={
                    alert.risk_level === 'CRITICAL' ? '#7c3aed' :
                    alert.risk_level === 'RED' ? '#ef4444' : '#eab308'
                  }
                />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: 15 }}>
                    {STATE_NAMES[alert.state] || alert.state}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                    {formatCurrency(alert.total_sales)} of {formatCurrency(alert.threshold_revenue)} threshold
                  </div>
                </div>
                <RiskBadge level={alert.risk_level} />

                {/* Progress bar */}
                <div style={{ width: 120, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 6, backgroundColor: '#f3f4f6', borderRadius: 3 }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      backgroundColor: alert.risk_level === 'CRITICAL' ? '#7c3aed' :
                        alert.risk_level === 'RED' ? '#ef4444' : '#eab308',
                      width: `${Math.min(pct, 100)}%`,
                    }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{pct}%</span>
                </div>

                {isExpanded ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f3f4f6' }}>
                  {/* AI explanation */}
                  <div style={{
                    margin: '16px 0', padding: 16, backgroundColor: '#f9fafb',
                    borderRadius: 8, fontSize: 14, color: '#374151', lineHeight: 1.7,
                  }}>
                    {loadingExplanation === alert.id ? (
                      <span style={{ color: '#9ca3af' }}>Loading AI explanation...</span>
                    ) : (
                      explanations[alert.id] || 'Click to load explanation...'
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFixModal(alert); }}
                      style={{
                        padding: '8px 20px', borderRadius: 8, border: 'none',
                        backgroundColor: '#22c55e', color: '#fff', fontSize: 14,
                        fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      FIX — $1.00
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSnooze(alert); }}
                      style={{
                        padding: '8px 20px', borderRadius: 8, border: '1px solid #d1d5db',
                        backgroundColor: '#fff', color: '#374151', fontSize: 14,
                        fontWeight: 500, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <Clock size={14} /> Snooze 7 days
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmModal
        open={!!fixModal}
        title={`Register for Sales Tax in ${fixModal ? (STATE_NAMES[fixModal.state] || fixModal.state) : ''}?`}
        message="This will charge $1.00 to your account and initiate sales tax registration through Stripe Tax."
        confirmLabel={processing ? 'Processing...' : 'Yes, Register Me'}
        onConfirm={handleFix}
        onCancel={() => setFixModal(null)}
      />
    </div>
  );
}
