export default function ConfirmModal({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 12, padding: 32,
        maxWidth: 440, width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
      }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 600, color: '#111827' }}>
          {title}
        </h3>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 20px', borderRadius: 8, border: '1px solid #d1d5db',
              backgroundColor: '#fff', color: '#374151', fontSize: 14,
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            {cancelLabel || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              backgroundColor: danger ? '#ef4444' : '#6366f1',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
