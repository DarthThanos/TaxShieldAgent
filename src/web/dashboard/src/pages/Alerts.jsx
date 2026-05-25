import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { getAlerts, getAlert, confirmFix, snoozeAlert } from '../api/client'
import { colors } from '../design/tokens'
import RiskBadge from '../components/RiskBadge'
import ConfirmModal from '../components/ConfirmModal'
import LoadingSpinner from '../components/LoadingSpinner'

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
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0)
}

export default function Alerts({ showToast }) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [explanations, setExplanations] = useState({})
  const [loadingExplanation, setLoadingExplanation] = useState(null)
  const [fixModal, setFixModal] = useState(null)
  const [processing, setProcessing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setAlerts((await getAlerts()) || []) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleExpand = useCallback(async (alert) => {
    const id = alert.id
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!explanations[id]) {
      setLoadingExplanation(id)
      try {
        const detail = await getAlert(null, id)
        setExplanations(prev => ({ ...prev, [id]: detail.ai_explanation }))
      } catch {
        setExplanations(prev => ({ ...prev, [id]: 'Unable to load AI explanation.' }))
      } finally {
        setLoadingExplanation(null)
      }
    }
  }, [expanded, explanations])

  const handleFix = useCallback(async () => {
    if (!fixModal) return
    setProcessing(true)
    try {
      await confirmFix(null, fixModal.id, fixModal.state)
      showToast?.(`Sales tax registration initiated for ${STATE_NAMES[fixModal.state] || fixModal.state}`, 'success')
      setAlerts(prev => prev.filter(a => a.id !== fixModal.id))
      setFixModal(null)
    } catch (err) {
      showToast?.(err.message, 'error')
    } finally {
      setProcessing(false)
    }
  }, [fixModal, showToast])

  const handleSnooze = useCallback(async (alert) => {
    try {
      await snoozeAlert(null, alert.id, 7)
      showToast?.('Alert snoozed for 7 days', 'success')
      setAlerts(prev => prev.filter(a => a.id !== alert.id))
    } catch (err) {
      showToast?.(err.message, 'error')
    }
  }, [showToast])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-10 text-red-800">Failed to load alerts: {error}</div>

  if (alerts.length === 0) {
    return (
      <div className="text-center py-20 px-5">
        <CheckCircle size={56} className="mx-auto mb-4" color={colors.risk.GREEN} />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No open alerts</h2>
        <p className="text-gray-500 text-[15px]">Your sales tax compliance is up to date.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Alerts ({alerts.length})</h1>

      <div className="flex flex-col gap-3">
        {alerts.map(alert => {
          const pct = alert.threshold_revenue
            ? Math.round((alert.total_sales / alert.threshold_revenue) * 100)
            : 0
          const isExpanded = expanded === alert.id
          const riskColor = colors.risk[alert.risk_level] || colors.risk.YELLOW

          return (
            <div key={alert.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                onClick={() => toggleExpand(alert)}
                className="px-5 py-4 cursor-pointer flex items-center gap-4 flex-wrap hover:bg-gray-50 transition-colors"
              >
                <AlertTriangle size={20} color={riskColor} />

                <div className="flex-1 min-w-[200px]">
                  <div className="font-semibold text-gray-900 text-[15px]">
                    {STATE_NAMES[alert.state] || alert.state}
                  </div>
                  <div className="text-[13px] text-gray-500 mt-0.5">
                    {formatCurrency(alert.total_sales)} of {formatCurrency(alert.threshold_revenue)} threshold
                  </div>
                </div>

                <RiskBadge level={alert.risk_level} />

                <div className="w-28 flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: riskColor }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{pct}%</span>
                </div>

                {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <div className="my-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 leading-relaxed">
                    {loadingExplanation === alert.id
                      ? <span className="text-gray-400">Loading AI explanation...</span>
                      : explanations[alert.id] || 'Click to load explanation...'}
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      onClick={e => { e.stopPropagation(); setFixModal(alert) }}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-lg border-none bg-green-500 text-white text-sm font-semibold cursor-pointer hover:bg-green-600 transition-colors"
                    >
                      FIX — $1.00
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleSnooze(alert) }}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Clock size={14} /> Snooze 7 days
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
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
  )
}
