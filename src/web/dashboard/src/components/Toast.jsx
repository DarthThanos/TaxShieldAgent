import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const isError = type === 'error';

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 20px', borderRadius: 10,
      backgroundColor: isError ? '#fef2f2' : '#f0fdf4',
      border: `1px solid ${isError ? '#fecaca' : '#bbf7d0'}`,
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      fontSize: 14, color: isError ? '#991b1b' : '#166534',
      fontWeight: 500,
    }}>
      {isError ? <XCircle size={18} /> : <CheckCircle size={18} />}
      <span>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'inherit', padding: 2, marginLeft: 4,
      }}>
        <X size={14} />
      </button>
    </div>
  );
}
