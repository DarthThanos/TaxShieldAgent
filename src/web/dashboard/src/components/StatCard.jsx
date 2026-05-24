export default function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 12, padding: '20px 24px',
      border: '1px solid #e5e7eb', flex: '1 1 200px', minWidth: 180,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        {Icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            backgroundColor: (color || '#6366f1') + '15',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={18} color={color || '#6366f1'} />
          </div>
        )}
        <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{value}</div>
    </div>
  );
}
