import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, CreditCard, RefreshCw, Map, Check, ChevronRight, AlertCircle } from 'lucide-react'
import { connectStripe, syncAllPlatforms, getNexusStatus } from '../api/client'
import { colors } from '../design/tokens'

const STEPS = [
  { id: 1, icon: CreditCard, title: 'Connect Stripe', description: 'Enter your Stripe API key to start importing transactions.' },
  { id: 2, icon: RefreshCw, title: 'First Sync', description: 'We\'ll pull your recent transactions and analyse them for nexus exposure.' },
  { id: 3, icon: Map, title: 'Your Nexus Map', description: 'See which states you\'re at risk in — and take action.' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [apiKey, setApiKey] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncDone, setSyncDone] = useState(false)
  const [nexusPreview, setNexusPreview] = useState([])
  const [error, setError] = useState(null)

  const handleConnect = useCallback(async () => {
    if (!apiKey.trim()) { setError('Please enter your Stripe secret key.'); return }
    setError(null)
    try {
      await connectStripe(null, apiKey.trim())
      setStep(2)
    } catch (err) {
      setError(err.message || 'Failed to connect Stripe. Check your key and try again.')
    }
  }, [apiKey])

  const handleSync = useCallback(async () => {
    setSyncing(true); setError(null)
    try {
      await syncAllPlatforms()
      const nexus = await getNexusStatus()
      setNexusPreview((nexus || []).filter(s => s.risk_level !== 'GREEN').slice(0, 5))
      setSyncDone(true)
      setStep(3)
    } catch (err) {
      setError(err.message || 'Sync failed. Please try again.')
    } finally {
      setSyncing(false)
    }
  }, [])

  const riskColor = { CRITICAL: colors.risk.CRITICAL, RED: colors.risk.RED, YELLOW: colors.risk.YELLOW }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
            <Shield size={22} color="#fff" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">TaxShieldAgent</span>
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step > s.id ? 'bg-green-500 text-white' :
                step === s.id ? 'bg-primary text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {step > s.id ? <Check size={14} /> : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 transition-colors ${step > s.id ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {/* Step 1 — Connect Stripe */}
          {step === 1 && (
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                <CreditCard size={24} color={colors.primary} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Connect Stripe</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Enter your Stripe secret key. We only read transactions — we never write to your account.
              </p>
              <input
                type="password"
                placeholder="sk_live_..."
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setError(null) }}
                onKeyDown={e => e.key === 'Enter' && handleConnect()}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3"
              />
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <button
                onClick={handleConnect}
                disabled={!apiKey.trim()}
                className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Connect Stripe <ChevronRight size={16} />
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                Your key is stored securely and never logged.
              </p>
            </div>
          )}

          {/* Step 2 — First Sync */}
          {step === 2 && (
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                <RefreshCw size={24} color={colors.primary} className={syncing ? 'animate-spin' : ''} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Import Your Transactions</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                We'll pull your last 100 transactions from Stripe and instantly calculate your nexus exposure across all 50 states.
              </p>
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <button
                onClick={handleSync}
                disabled={syncing}
                className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Importing transactions...' : 'Start Import'}
              </button>
            </div>
          )}

          {/* Step 3 — Nexus Map */}
          {step === 3 && (
            <div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                <Map size={24} color="#16a34a" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Your Nexus Exposure</h2>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                {nexusPreview.length > 0
                  ? `You have ${nexusPreview.length} state${nexusPreview.length !== 1 ? 's' : ''} at risk. Review them in your dashboard.`
                  : 'No immediate nexus risks detected. Your dashboard will stay up to date as you grow.'}
              </p>

              {nexusPreview.length > 0 && (
                <div className="flex flex-col gap-2 mb-6">
                  {nexusPreview.map(s => (
                    <div key={s.state} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{s.state}</span>
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: riskColor[s.risk_level] || colors.risk.YELLOW }}
                      >
                        {s.risk_level} · {s.pct_of_threshold}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => navigate('/')}
                className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
              >
                Go to Dashboard <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Skip link */}
        {step < 3 && (
          <div className="text-center mt-4">
            <button onClick={() => navigate('/')} className="text-xs text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
