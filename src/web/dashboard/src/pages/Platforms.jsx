import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, ShoppingBag, Palette, Wallet, Square as SquareIcon,
  Package, Plug, PlugZap, Upload, RefreshCw, X,
} from 'lucide-react';
import {
  getConnectedPlatforms, getSupportedPlatforms, syncAllPlatforms,
  connectStripe, connectShopify, connectEtsy, connectPayPal,
  connectSquare, uploadAmazonCSV, disconnectPlatform,
} from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

const PLATFORM_ICONS = {
  stripe: CreditCard,
  shopify: ShoppingBag,
  etsy: Palette,
  paypal: Wallet,
  square: SquareIcon,
  amazon: Package,
};

const PLATFORM_COLORS = {
  stripe: '#6d28d9',
  shopify: '#16a34a',
  etsy: '#ea580c',
  paypal: '#2563eb',
  square: '#0d9488',
  amazon: '#ca8a04',
};

export default function Platforms({ showToast }) {
  const [supported, setSupported] = useState([]);
  const [connected, setConnected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connectForm, setConnectForm] = useState(null); // platform name
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sup, con] = await Promise.all([
        getSupportedPlatforms(),
        getConnectedPlatforms(),
      ]);
      setSupported(sup || []);
      setConnected(con || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const connectedMap = {};
  connected.forEach(c => { if (c.status !== 'disconnected') connectedMap[c.platform] = c; });

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      await syncAllPlatforms();
      showToast?.('All platforms synced successfully', 'success');
      load();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setSyncing(false);
    }
  }, [load, showToast]);

  const handleDisconnect = useCallback(async (platform) => {
    try {
      await disconnectPlatform(null, platform);
      showToast?.(`${platform} disconnected`, 'success');
      load();
    } catch (err) {
      showToast?.(err.message, 'error');
    }
  }, [load, showToast]);

  const handleConnect = useCallback(async (platform) => {
    setSubmitting(true);
    try {
      switch (platform) {
        case 'stripe':
          await connectStripe(null, formData.api_key);
          break;
        case 'shopify':
          await connectShopify(null, formData.shop_url, formData.code);
          break;
        case 'etsy':
          await connectEtsy(null, formData.api_key, formData.access_token, formData.shop_id);
          break;
        case 'paypal':
          await connectPayPal(null, formData.client_id, formData.client_secret);
          break;
        case 'square':
          await connectSquare(null, formData.access_token);
          break;
        case 'amazon':
          if (formData.file) {
            await uploadAmazonCSV(null, formData.file);
          }
          break;
      }
      showToast?.(`${platform} connected successfully`, 'success');
      setConnectForm(null);
      setFormData({});
      load();
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }, [formData, load, showToast]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div style={{ padding: 40, color: '#991b1b' }}>Failed to load platforms: {error}</div>;

  const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box',
  };

  const renderConnectForm = (platform) => {
    const forms = {
      stripe: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input style={inputStyle} placeholder="Stripe Secret API Key (sk_...)" value={formData.api_key || ''}
            onChange={e => setFormData(d => ({ ...d, api_key: e.target.value }))} />
        </div>
      ),
      shopify: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input style={inputStyle} placeholder="Shop URL (mystore.myshopify.com)" value={formData.shop_url || ''}
            onChange={e => setFormData(d => ({ ...d, shop_url: e.target.value }))} />
          <input style={inputStyle} placeholder="OAuth Code" value={formData.code || ''}
            onChange={e => setFormData(d => ({ ...d, code: e.target.value }))} />
        </div>
      ),
      etsy: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input style={inputStyle} placeholder="API Key" value={formData.api_key || ''}
            onChange={e => setFormData(d => ({ ...d, api_key: e.target.value }))} />
          <input style={inputStyle} placeholder="Access Token" value={formData.access_token || ''}
            onChange={e => setFormData(d => ({ ...d, access_token: e.target.value }))} />
          <input style={inputStyle} placeholder="Shop ID" value={formData.shop_id || ''}
            onChange={e => setFormData(d => ({ ...d, shop_id: e.target.value }))} />
        </div>
      ),
      paypal: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input style={inputStyle} placeholder="Client ID" value={formData.client_id || ''}
            onChange={e => setFormData(d => ({ ...d, client_id: e.target.value }))} />
          <input style={inputStyle} placeholder="Client Secret" value={formData.client_secret || ''}
            onChange={e => setFormData(d => ({ ...d, client_secret: e.target.value }))} type="password" />
        </div>
      ),
      square: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input style={inputStyle} placeholder="Access Token" value={formData.access_token || ''}
            onChange={e => setFormData(d => ({ ...d, access_token: e.target.value }))} />
        </div>
      ),
      amazon: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{
            padding: '12px 20px', border: '2px dashed #d1d5db', borderRadius: 8,
            textAlign: 'center', cursor: 'pointer', fontSize: 14, color: '#6b7280',
          }}>
            {formData.file ? formData.file.name : 'Click to select CSV file'}
            <input type="file" accept=".csv" style={{ display: 'none' }}
              onChange={e => setFormData(d => ({ ...d, file: e.target.files[0] }))} />
          </label>
        </div>
      ),
    };
    return forms[platform] || null;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Platforms</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            backgroundColor: '#6366f1', color: '#fff', fontSize: 14,
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            opacity: syncing ? 0.7 : 1,
          }}
        >
          <RefreshCw size={16} className={syncing ? 'spinning' : ''} />
          {syncing ? 'Syncing...' : 'Sync All Platforms'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {supported.map(p => {
          const Icon = PLATFORM_ICONS[p.platform] || Plug;
          const color = PLATFORM_COLORS[p.platform] || '#6b7280';
          const conn = connectedMap[p.platform];
          const isConnected = !!conn;
          const isFormOpen = connectForm === p.platform;

          return (
            <div key={p.platform} style={{
              backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
              padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  backgroundColor: color + '15',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={22} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, color: '#111827' }}>
                    {p.display_name}
                  </div>
                  <div style={{
                    fontSize: 12, fontWeight: 600,
                    color: isConnected ? '#16a34a' : '#9ca3af',
                  }}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </div>
                </div>
                {isConnected && (
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    backgroundColor: '#22c55e',
                  }} />
                )}
              </div>

              {/* Connected info */}
              {isConnected && conn.last_sync_at && (
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  Last sync: {new Date(conn.last_sync_at).toLocaleString()}
                </div>
              )}

              {/* Instructions */}
              {!isConnected && !isFormOpen && (
                <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>
                  {p.instructions}
                </div>
              )}

              {/* Connect form */}
              {isFormOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {renderConnectForm(p.platform)}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleConnect(p.platform)}
                      disabled={submitting}
                      style={{
                        flex: 1, padding: '8px 16px', borderRadius: 8, border: 'none',
                        backgroundColor: color, color: '#fff', fontSize: 14,
                        fontWeight: 600, cursor: 'pointer', opacity: submitting ? 0.7 : 1,
                      }}
                    >
                      {submitting ? 'Connecting...' : 'Connect'}
                    </button>
                    <button
                      onClick={() => { setConnectForm(null); setFormData({}); }}
                      style={{
                        padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db',
                        backgroundColor: '#fff', cursor: 'pointer',
                      }}
                    >
                      <X size={16} color="#6b7280" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action button */}
              {!isFormOpen && (
                isConnected ? (
                  <button
                    onClick={() => handleDisconnect(p.platform)}
                    style={{
                      padding: '8px 16px', borderRadius: 8, border: '1px solid #fecaca',
                      backgroundColor: '#fff', color: '#ef4444', fontSize: 14,
                      fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => { setConnectForm(p.platform); setFormData({}); }}
                    style={{
                      padding: '8px 16px', borderRadius: 8, border: 'none',
                      backgroundColor: color + '15', color: color, fontSize: 14,
                      fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <PlugZap size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Connect
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
