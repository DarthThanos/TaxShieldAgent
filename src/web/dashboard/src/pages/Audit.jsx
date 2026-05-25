import { useState, useEffect, useCallback } from 'react'
import { ClipboardList, Download } from 'lucide-react'
import { getAuditLog, downloadCompliancePDF } from '../api/client'
import { SkeletonTable } from '../components/Skeleton'

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleString()
}

export default function Audit() {
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setLog((await getAuditLog()) || []) }
    catch { setLog([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    try { await downloadCompliancePDF() }
    catch (err) { console.error('PDF export failed:', err) }
    finally { setDownloading(false) }
  }, [])

  if (loading) return (
    <div>
      <div className="h-7 bg-gray-200 animate-pulse rounded w-28 mb-6" />
      <SkeletonTable rows={5} cols={5} />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors ${downloading ? 'opacity-60' : ''}`}
        >
          <Download size={15} />
          {downloading ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      {log.length === 0 ? (
        <div className="text-center py-20 px-5">
          <ClipboardList size={56} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Audit Log</h2>
          <p className="text-gray-500 text-[15px] max-w-sm mx-auto">
            A full audit trail of compliance actions, registration events, and alert
            resolutions will appear here as you use TaxShieldAgent.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                {['Action', 'State', 'Amount', 'Confirmed By', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {log.map(row => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-800">
                    {(row.action || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </td>
                  <td className="px-4 py-2.5 font-semibold">{row.state || '—'}</td>
                  <td className="px-4 py-2.5">{row.amount_cents ? `$${(row.amount_cents / 100).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-2.5 text-gray-500">{row.confirmed_by || '—'}</td>
                  <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{formatDate(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
