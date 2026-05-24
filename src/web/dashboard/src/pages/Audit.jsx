import { ClipboardList } from 'lucide-react';

export default function Audit() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <ClipboardList size={56} color="#d1d5db" style={{ marginBottom: 16 }} />
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
        Audit Log
      </h2>
      <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 400, margin: '0 auto' }}>
        A full audit trail of compliance actions, registration events, and alert resolutions
        will appear here as you use TaxShieldAgent.
      </p>
    </div>
  );
}
