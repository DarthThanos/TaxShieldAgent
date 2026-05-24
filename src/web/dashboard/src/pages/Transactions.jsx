import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeftRight, Plug } from 'lucide-react';
import { getTransactions } from '../api/client';
import PlatformBadge from '../components/PlatformBadge';
import LoadingSpinner from '../components/LoadingSpinner';

function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterState, setFilterState] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions();
      setTransactions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const platforms = useMemo(() => {
    const set = new Set();
    transactions.forEach(t => { if (t.source_platform) set.add(t.source_platform); });
    return Array.from(set).sort();
  }, [transactions]);

  const states = useMemo(() => {
    const set = new Set();
    transactions.forEach(t => { if (t.state) set.add(t.state); });
    return Array.from(set).sort();
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filterPlatform !== 'all' && t.source_platform !== filterPlatform) return false;
      if (filterState !== 'all' && t.state !== filterState) return false;
      return true;
    });
  }, [transactions, filterPlatform, filterState]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div style={{ padding: 40, color: '#991b1b' }}>Failed to load transactions: {error}</div>;

  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Plug size={56} color="#d1d5db" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
          No transactions yet
        </h2>
        <p style={{ color: '#6b7280', fontSize: 15 }}>
          Connect a platform to start importing transactions.
        </p>
      </div>
    );
  }

  const selectStyle = {
    padding: '6px 12px', borderRadius: 8, border: '1px solid #d1d5db',
    fontSize: 14, color: '#374151', backgroundColor: '#fff',
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 24 }}>
        Transactions
      </h1>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <select style={selectStyle} value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
          <option value="all">All Platforms</option>
          {platforms.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select style={selectStyle} value={filterState} onChange={e => setFilterState(e.target.value)}>
          <option value="all">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{ fontSize: 13, color: '#9ca3af' }}>
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
        overflowX: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              {['Date', 'Transaction ID', 'Platform', 'State', 'Amount'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '12px 16px', fontWeight: 600,
                  color: '#6b7280', fontSize: 12, textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx, i) => (
              <tr key={tx.tx_id || i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                  {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '-'}
                </td>
                <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 13 }}>
                  {(tx.tx_id || '').slice(0, 20)}{(tx.tx_id || '').length > 20 ? '...' : ''}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <PlatformBadge platform={tx.source_platform || 'unknown'} />
                </td>
                <td style={{ padding: '10px 16px', fontWeight: 600 }}>{tx.state || '-'}</td>
                <td style={{ padding: '10px 16px', fontWeight: 600 }}>{formatCurrency(tx.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
