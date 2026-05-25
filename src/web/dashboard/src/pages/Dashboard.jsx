import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, MapPin, AlertTriangle, Bell, Check } from 'lucide-react'
import { getNexusStatus, getSummary, getAlerts } from '../api/client'
import { colors } from '../design/tokens'
import StatCard from '../components/StatCard'
import RiskBadge from '../components/RiskBadge'
import LoadingSpinner from '../components/LoadingSpinner'

const NO_SALES_TAX = ['MT', 'NH', 'OR', 'DE', 'AK']

const ALL_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

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
}

function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0)
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [nexus, setNexus] = useState([])
  const [alertCount, setAlertCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredState, setHoveredState] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [nexusData, , alertsData] = await Promise.all([getNexusStatus(), getSummary(), getAlerts()])
      setNexus(nexusData || [])
      setAlertCount((alertsData || []).length)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-10 text-red-800">Failed to load dashboard: {error}</div>

  const stateMap = {}
  nexus.forEach(s => { stateMap[s.state] = s })

  const totalSales = nexus.reduce((sum, s) => sum + (s.total_sales || 0), 0)
  const statesAtRisk = nexus.filter(s => ['YELLOW', 'RED', 'CRITICAL'].includes(s.risk_level)).length
  const sorted = [...nexus].sort((a, b) => {
    const pa = a.threshold_revenue ? a.total_sales / a.threshold_revenue : 0
    const pb = b.threshold_revenue ? b.total_sales / b.threshold_revenue : 0
    return pb - pa
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nexus Overview</h1>

      {/* Summary cards */}
      <div className="flex gap-4 flex-wrap mb-8">
        <StatCard icon={DollarSign} label="Total YTD Sales" value={formatCurrency(totalSales)} color={colors.primary} />
        <StatCard icon={MapPin} label="States Monitored" value={nexus.length} color="#0ea5e9" />
        <StatCard icon={AlertTriangle} label="States at Risk" value={statesAtRisk} color="#f59e0b" />
        <StatCard icon={Bell} label="Open Alerts" value={alertCount} color={colors.risk.RED} />
      </div>

      {/* State risk map */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">State Risk Map</h2>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))' }}>
          {ALL_STATES.map(code => {
            const data = stateMap[code]
            const isNoTax = NO_SALES_TAX.includes(code)
            let bg = '#e5e7eb', textColor = '#6b7280'
            if (isNoTax) { bg = '#dbeafe'; textColor = '#1e40af' }
            else if (data) { bg = colors.risk[data.risk_level] || '#e5e7eb'; textColor = '#fff'; if (data.risk_level === 'YELLOW') textColor = '#422006' }

            const pct = data?.threshold_revenue ? Math.round((data.total_sales / data.threshold_revenue) * 100) : 0
            const clickable = data && ['RED', 'CRITICAL', 'YELLOW'].includes(data.risk_level)

            return (
              <div
                key={code}
                onClick={() => clickable && navigate('/alerts')}
                onMouseEnter={() => setHoveredState(code)}
                onMouseLeave={() => setHoveredState(null)}
                className="relative rounded-lg py-2.5 px-1 text-center transition-transform"
                style={{
                  backgroundColor: bg,
                  cursor: clickable ? 'pointer' : 'default',
                  transform: hoveredState === code ? 'scale(1.1)' : 'scale(1)',
                  zIndex: hoveredState === code ? 10 : 1,
                }}
              >
                <div className="text-[13px] font-bold" style={{ color: textColor }}>{code}</div>
                {hoveredState === code && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap z-10 shadow-xl">
                    <div className="font-semibold">{STATE_NAMES[code]}</div>
                    {isNoTax ? <div>No sales tax</div> : data ? (
                      <>
                        <div>Sales: {formatCurrency(data.total_sales)}</div>
                        <div>Threshold: {pct}%</div>
                        <div>Risk: {data.risk_level}</div>
                      </>
                    ) : <div>No sales data</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-4 mt-4 flex-wrap text-xs text-gray-500">
          {[
            { label: 'No Data', color: '#e5e7eb' },
            { label: 'No Sales Tax', color: '#dbeafe' },
            { label: 'Green', color: colors.risk.GREEN },
            { label: 'Yellow', color: colors.risk.YELLOW },
            { label: 'Red', color: colors.risk.RED },
            { label: 'Critical', color: colors.risk.CRITICAL },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Risk table */}
      {sorted.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 overflow-x-auto">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Risk Breakdown</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                {['State', 'Total Sales', 'Threshold', '% Used', 'Risk Level', 'Action'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(s => {
                const pct = s.threshold_revenue ? Math.round((s.total_sales / s.threshold_revenue) * 100) : 0
                return (
                  <tr key={s.state} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 font-semibold">{STATE_NAMES[s.state] || s.state}</td>
                    <td className="px-3 py-2.5">{formatCurrency(s.total_sales)}</td>
                    <td className="px-3 py-2.5">{formatCurrency(s.threshold_revenue)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-[100px]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: colors.risk[s.risk_level] || colors.risk.GREEN }}
                          />
                        </div>
                        <span className="text-xs font-semibold">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><RiskBadge level={s.risk_level} /></td>
                    <td className="px-3 py-2.5">
                      {['RED', 'CRITICAL'].includes(s.risk_level) ? (
                        <button
                          onClick={() => navigate('/alerts')}
                          className="px-3.5 py-1 rounded-md border-none bg-red-500 text-white text-xs font-semibold cursor-pointer hover:bg-red-600 transition-colors"
                        >
                          FIX
                        </button>
                      ) : s.risk_level === 'YELLOW' ? (
                        <span className="text-xs font-semibold text-yellow-500">Monitor</span>
                      ) : (
                        <Check size={16} color={colors.risk.GREEN} />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
