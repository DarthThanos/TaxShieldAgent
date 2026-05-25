import { ClipboardList } from 'lucide-react'

export default function Audit() {
  return (
    <div className="text-center py-20 px-5">
      <ClipboardList size={56} className="text-gray-300 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Audit Log</h2>
      <p className="text-gray-500 text-[15px] max-w-sm mx-auto">
        A full audit trail of compliance actions, registration events, and alert
        resolutions will appear here as you use TaxShieldAgent.
      </p>
    </div>
  )
}
