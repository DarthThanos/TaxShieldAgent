import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plug } from 'lucide-react'
import { getTransactions } from '../api/client'
import PlatformBadge from '../components/PlatformBadge'
import LoadingSpinner from '../components/LoadingSpinner'

function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0)
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [filterState, setFilterState] = useState('all')

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setTransactions((await getTransactions()) || []) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const platforms = useMemo(() => {
    const s = new Set(); transactions.forEach(t => t.source_platform && s.add(t.source_platform)); return [...s].sort()
  }, [transactions])

  const states = useMemo(() => {
    const s = new Set(); transactions.forEach(t => t.state && s.add(t.state)); return [...s].sort()
  }, [transactions])

  const filtered = useMemo(() => transactions.filter(t =>
    (filterPlatform === 'all' || t.source_platform === filterPlatform) &&
    (filterState === 'all' || t.state === filterState)
  ), [transactions, filterPlatform, filterState])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-10 text-red-800">Failed to load transactions: {error}</div>

  if (transactions.length === 0) {
    return (
      <div className="text-center py-20 px-5">
        <Plug size={56} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No transactions yet</h2>
        <p className="text-gray-500 text-[15px]">Connect a platform to start importing transactions.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transactions</h1>

      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <select
          className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}
        >
          <option value="all">All Platforms</option>
          {platforms.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filterState} onChange={e => setFilterState(e.target.value)}
        >
          <option value="all">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-gray-400">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              {['Date', 'Transaction ID', 'Platform', 'State', 'Amount'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx, i) => (
              <tr key={tx.tx_id || i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                  {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-2.5 font-mono text-[13px]">
                  {(tx.tx_id || '').slice(0, 20)}{(tx.tx_id || '').length > 20 ? '…' : ''}
                </td>
                <td className="px-4 py-2.5"><PlatformBadge platform={tx.source_platform || 'unknown'} /></td>
                <td className="px-4 py-2.5 font-semibold">{tx.state || '-'}</td>
                <td className="px-4 py-2.5 font-semibold">{formatCurrency(tx.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
