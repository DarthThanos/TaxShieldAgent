import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, MapPin, AlertTriangle, Bell, Check, TrendingUp, Calendar } from 'lucide-react'
import { getNexusStatus, getSummary, getAlerts, getProjections } from '../api/client'
import { colors } from '../design/tokens'
import StatCard from '../components/StatCard'
import RiskBadge from '../components/RiskBadge'
import NexusMap from '../components/NexusMap'
import { SkeletonStatCards, SkeletonTable } from '../components/Skeleton'

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
  const [projections, setProjections] = useState([])
  const [alertCount, setAlertCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [nexusData, , alertsData, projData] = await Promise.all([
        getNexusStatus(), getSummary(), getAlerts(), getProjections().catch(() => []),
      ])
      setNexus(nexusData || [])
      setAlertCount((alertsData || []).length)
      setProjections(projData || [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div>
      <div className="h-8 bg-gray-200 animate-pulse rounded w-40 mb-6" />
      <SkeletonStatCards />
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="h-5 bg-gray-200 animate-pulse rounded w-28 mb-4" />
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))' }}>
          {Array.from({ length: 51 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
      <SkeletonTable rows={6} cols={6} />
    </div>
  )
  if (error) return <div className="p-10 text-red-800">Failed to load dashboard: {error}</div>


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

      {/* Velocity projections */}
      {projections.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} color={colors.primary} />
            <h2 className="text-base font-semibold text-gray-900">Nexus Crossing Projections</h2>
            <span className="text-xs text-gray-400 ml-1">at current 30-day run rate</span>
          </div>
          <div className="flex flex-col gap-2">
            {projections.map(p => (
              <div key={p.state} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg flex-wrap">
                <div className="font-semibold text-gray-700 w-8 text-sm">{p.state}</div>
                <div className="flex-1 min-w-[120px]">
                  <div className="h-1.5 bg-gray-200 rounded-full">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(p.pct_of_threshold, 100)}%`,
                        backgroundColor: colors.risk[p.risk_level] || colors.risk.YELLOW,
                      }}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 w-12 text-right">{p.pct_of_threshold}%</div>
                {p.projected_nexus_date ? (
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                    <Calendar size={12} />
                    Crosses ~{new Date(p.projected_nexus_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    <span className="text-gray-400 font-normal ml-1">({p.days_to_nexus}d)</span>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-red-600">Threshold exceeded</div>
                )}
                <div className="text-xs text-gray-400">${p.daily_rate.toLocaleString()}/day</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Choropleth map */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">State Risk Map</h2>
        <NexusMap nexusData={nexus} onStateClick={() => navigate('/alerts')} />
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
