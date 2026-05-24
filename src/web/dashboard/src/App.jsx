import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Bell, Plug, ArrowLeftRight,
  ClipboardList, RefreshCw, Menu, X,
} from 'lucide-react';
import { getAlerts, syncAllPlatforms, getHealth } from './api/client';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Platforms from './pages/Platforms';
import Transactions from './pages/Transactions';
import Audit from './pages/Audit';

const MERCHANT_ID = import.meta.env.VITE_DEV_MERCHANT_ID || 'platform';

function AppContent() {
  const location = useLocation();
  const [alertCount, setAlertCount] = useState(0);
  const [lastSync, setLastSync] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [backendOnline, setBackendOnline] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast({ message: '', type: 'success' });
  }, []);

  // Track window resize for responsive
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Load alert count
  useEffect(() => {
    getAlerts()
      .then(data => setAlertCount((data || []).length))
      .catch(() => {});
  }, [location.pathname]);

  // Check backend health
  useEffect(() => {
    getHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      await syncAllPlatforms();
      setLastSync(new Date().toLocaleTimeString());
      showToast('All platforms synced successfully');
      const alerts = await getAlerts();
      setAlertCount((alerts || []).length);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSyncing(false);
    }
  }, [showToast]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/alerts', icon: Bell, label: 'Alerts', badge: alertCount },
    { path: '/platforms', icon: Plug, label: 'Platforms' },
    { path: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { path: '/audit', icon: ClipboardList, label: 'Audit Log' },
  ];

  const navLinkStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 16px', borderRadius: 8, textDecoration: 'none',
    fontSize: 14, fontWeight: 500, transition: 'background-color 0.15s',
    backgroundColor: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
    color: isActive ? '#818cf8' : '#94a3b8',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 260, backgroundColor: '#1a1f2e', color: '#fff',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        ...(isMobile
          ? {
              position: 'fixed', top: 0, bottom: 0,
              left: sidebarOpen ? 0 : -260,
              zIndex: 50, transition: 'left 0.2s',
            }
          : {
              position: 'sticky', top: 0, height: '100vh',
            }
        ),
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 20px', display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>TaxShield</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Agent</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => navLinkStyle(isActive)}
            >
              <item.icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  backgroundColor: '#ef4444', color: '#fff',
                  fontSize: 11, fontWeight: 700, padding: '1px 7px',
                  borderRadius: 9999, minWidth: 18, textAlign: 'center',
                }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Backend status */}
        <div style={{
          padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)',
          fontSize: 12, color: '#64748b',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: backendOnline ? '#22c55e' : '#ef4444',
            }} />
            Backend {backendOnline ? 'Online' : 'Offline'}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb',
          padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16,
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          {/* Hamburger (mobile) */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              }}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}

          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Merchant: </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>
              {MERCHANT_ID}
            </span>
          </div>

          {lastSync && !isMobile && (
            <span style={{ fontSize: 12, color: '#9ca3af' }}>
              Last sync: {lastSync}
            </span>
          )}

          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 8, border: 'none',
              backgroundColor: '#6366f1', color: '#fff', fontSize: 13,
              fontWeight: 600, cursor: 'pointer', opacity: syncing ? 0.7 : 1,
            }}
          >
            <RefreshCw size={14} style={{
              animation: syncing ? 'spin 1s linear infinite' : 'none',
            }} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: isMobile ? '16px' : '24px 24px 48px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts showToast={showToast} />} />
            <Route path="/platforms" element={<Platforms showToast={showToast} />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/audit" element={<Audit />} />
          </Routes>
        </main>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
