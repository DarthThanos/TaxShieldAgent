import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, MapPin, AlertTriangle, Bell, Check } from 'lucide-react';
import { getNexusStatus, getSummary, getAlerts } from '../api/client';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';

// States with no general sales tax
const NO_SALES_TAX = ['MT', 'NH', 'OR', 'DE', 'AK'];

// All 50 states + DC
const ALL_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

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

const RISK_COLORS = {
  GREEN: '#22c55e',
  YELLOW: '#eab308',
  RED: '#ef4444',
  CRITICAL: '#7c3aed',
};

function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [nexus, setNexus] = useState([]);
  const [summary, setSummary] = useState(null);
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nexusData, summaryData, alertsData] = await Promise.all([
        getNexusStatus(),
        getSummary(),
        getAlerts(),
      ]);
      setNexus(nexusData || []);
      setSummary(summaryData || {});
      setAlertCount((alertsData || []).length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div style={{ padding: 40, color: '#991b1b' }}>Failed to load dashboard: {error}</div>;

  // Build lookup from nexus data
  const stateMap = {};
  (nexus || []).forEach(s => { stateMap[s.state] = s; });

  const totalSales = nexus.reduce((sum, s) => sum + (s.total_sales || 0), 0);
  const statesMonitored = nexus.length;
  const statesAtRisk = nexus.filter(s => ['YELLOW', 'RED', 'CRITICAL'].includes(s.risk_level)).length;

  // Sort by pct descending for the table
  const sorted = [...nexus].sort((a, b) => {
    const pctA = a.threshold_revenue ? (a.total_sales / a.threshold_revenue) : 0;
    const pctB = b.threshold_revenue ? (b.total_sales / b.threshold_revenue) : 0;
    return pctB - pctA;
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 24 }}>
        Nexus Overview
      </h1>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard icon={DollarSign} label="Total YTD Sales" value={formatCurrency(totalSales)} color="#6366f1" />
        <StatCard icon={MapPin} label="States Monitored" value={statesMonitored} color="#0ea5e9" />
        <StatCard icon={AlertTriangle} label="States at Risk" value={statesAtRisk} color="#f59e0b" />
        <StatCard icon={Bell} label="Open Alerts" value={alertCount} color="#ef4444" />
      </div>

      {/* State grid map */}
      <div style={{
        backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
        padding: 24, marginBottom: 32,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 16 }}>
          State Risk Map
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: 6 }}>
          {ALL_STATES.map(code => {
            const data = stateMap[code];
            const isNoTax = NO_SALES_TAX.includes(code);
            let bg = '#e5e7eb'; // no data
            let textColor = '#6b7280';

            if (isNoTax) {
              bg = '#dbeafe';
              textColor = '#1e40af';
            } else if (data) {
              bg = RISK_COLORS[data.risk_level] || '#e5e7eb';
              textColor = '#fff';
              if (data.risk_level === 'YELLOW') textColor = '#422006';
            }

            const pct = data && data.threshold_revenue
              ? Math.round((data.total_sales / data.threshold_revenue) * 100)
              : 0;

            return (
              <div
                key={code}
                onClick={() => {
                  if (data && ['RED', 'CRITICAL', 'YELLOW'].includes(data.risk_level)) {
                    navigate('/alerts');
                  }
                }}
                onMouseEnter={() => setHoveredState(code)}
                onMouseLeave={() => setHoveredState(null)}
                style={{
                  position: 'relative',
                  backgroundColor: bg,
                  borderRadius: 8,
                  padding: '10px 4px',
                  textAlign: 'center',
                  cursor: data && data.risk_level !== 'GREEN' ? 'pointer' : 'default',
                  transition: 'transform 0.15s',
                  transform: hoveredState === code ? 'scale(1.1)' : 'scale(1)',
                  zIndex: hoveredState === code ? 10 : 1,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: textColor }}>{code}</div>
                {/* Tooltip */}
                {hoveredState === code && (
                  <div style={{
                    position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: '#1f2937', color: '#fff', padding: '8px 12px', borderRadius: 8,
                    fontSize: 12, whiteSpace: 'nowrap', zIndex: 100, marginBottom: 6,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}>
                    <div style={{ fontWeight: 600 }}>{STATE_NAMES[code]}</div>
                    {isNoTax ? (
                      <div>No sales tax</div>
                    ) : data ? (
                      <>
                        <div>Sales: {formatCurrency(data.total_sales)}</div>
                        <div>Threshold: {pct}%</div>
                        <div>Risk: {data.risk_level}</div>
                      </>
                    ) : (
                      <div>No sales data</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap', fontSize: 12, color: '#6b7280' }}>
          {[
            { label: 'No Data', color: '#e5e7eb' },
            { label: 'No Sales Tax', color: '#dbeafe' },
            { label: 'Green', color: '#22c55e' },
            { label: 'Yellow', color: '#eab308' },
            { label: 'Red', color: '#ef4444' },
            { label: 'Critical', color: '#7c3aed' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Risk table */}
      {sorted.length > 0 && (
        <div style={{
          backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
          padding: 24, overflowX: 'auto',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 16 }}>
            Risk Breakdown
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                {['State', 'Total Sales', 'Threshold', '% Used', 'Risk Level', 'Action'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(s => {
                const pct = s.threshold_revenue ? Math.round((s.total_sales / s.threshold_revenue) * 100) : 0;
                return (
                  <tr key={s.state} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                      {STATE_NAMES[s.state] || s.state}
                    </td>
                    <td style={{ padding: '10px 12px' }}>{formatCurrency(s.total_sales)}</td>
                    <td style={{ padding: '10px 12px' }}>{formatCurrency(s.threshold_revenue)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, maxWidth: 100 }}>
                          <div style={{
                            height: '100%', borderRadius: 3,
                            backgroundColor: RISK_COLORS[s.risk_level] || '#22c55e',
                            width: `${Math.min(pct, 100)}%`,
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <RiskBadge level={s.risk_level} />
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {['RED', 'CRITICAL'].includes(s.risk_level) ? (
                        <button
                          onClick={() => navigate('/alerts')}
                          style={{
                            padding: '4px 14px', borderRadius: 6, border: 'none',
                            backgroundColor: '#ef4444', color: '#fff', fontSize: 12,
                            fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          FIX
                        </button>
                      ) : s.risk_level === 'YELLOW' ? (
                        <span style={{ fontSize: 12, color: '#eab308', fontWeight: 600 }}>Monitor</span>
                      ) : (
                        <Check size={16} color="#22c55e" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
