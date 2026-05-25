import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null

  const isError = type === 'error'
  return (
    <div className={`fixed bottom-6 right-6 z-[2000] flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium shadow-xl border ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
      {isError ? <XCircle size={18} /> : <CheckCircle size={18} />}
      <span>{message}</span>
      <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-inherit p-0.5 ml-1 hover:opacity-70">
        <X size={14} />
      </button>
    </div>
  )
}
