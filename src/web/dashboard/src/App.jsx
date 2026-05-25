import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import {
  Shield, LayoutDashboard, Bell, Plug, ArrowLeftRight,
  ClipboardList, RefreshCw, Menu, X,
} from 'lucide-react'
import { getAlerts, syncAllPlatforms, getHealth } from './api/client'
import Toast from './components/Toast'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import Platforms from './pages/Platforms'
import Transactions from './pages/Transactions'
import Audit from './pages/Audit'
import Onboarding from './pages/Onboarding'

const MERCHANT_ID = import.meta.env.VITE_DEV_MERCHANT_ID || 'platform'

function AppContent() {
  const location = useLocation()
  const [alertCount, setAlertCount] = useState(0)
  const [lastSync, setLastSync] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const [backendOnline, setBackendOnline] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), [])
  const clearToast = useCallback(() => setToast({ message: '', type: 'success' }), [])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    getAlerts().then(d => setAlertCount((d || []).length)).catch(() => {})
  }, [location.pathname])

  useEffect(() => {
    getHealth().then(() => setBackendOnline(true)).catch(() => setBackendOnline(false))
  }, [])

  const handleSync = useCallback(async () => {
    setSyncing(true)
    try {
      await syncAllPlatforms()
      setLastSync(new Date().toLocaleTimeString())
      showToast('All platforms synced successfully')
      const alerts = await getAlerts()
      setAlertCount((alerts || []).length)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSyncing(false)
    }
  }, [showToast])

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/alerts', icon: Bell, label: 'Alerts', badge: alertCount },
    { path: '/platforms', icon: Plug, label: 'Platforms' },
    { path: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { path: '/audit', icon: ClipboardList, label: 'Audit Log' },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-40" />
      )}

      {/* Sidebar */}
      <aside
        className="w-64 bg-sidebar text-white flex flex-col flex-shrink-0 scrollbar-thin"
        style={isMobile
          ? { position: 'fixed', top: 0, bottom: 0, left: sidebarOpen ? 0 : -256, zIndex: 50, transition: 'left 0.2s' }
          : { position: 'sticky', top: 0, height: '100vh' }
        }
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3 border-b border-white/[0.08]">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
            <Shield size={20} color="#fff" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight">TaxShield</div>
            <div className="text-[11px] text-slate-500 font-medium">Agent</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg no-underline text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary/15 text-primary-light' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-[11px] font-bold px-1.5 py-px rounded-full min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Backend status */}
        <div className="px-5 py-4 border-t border-white/[0.08] text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            Backend {backendOnline ? 'Online' : 'Offline'}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 sticky top-0 z-30">
          {isMobile && (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="bg-transparent border-none cursor-pointer p-1">
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
          <div className="flex-1">
            <span className="text-[13px] text-gray-500">Merchant: </span>
            <span className="text-[13px] font-semibold text-gray-700 font-mono">{MERCHANT_ID}</span>
          </div>
          {lastSync && !isMobile && (
            <span className="text-xs text-gray-400">Last sync: {lastSync}</span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg border-none bg-primary text-white text-[13px] font-semibold cursor-pointer hover:bg-indigo-600 transition-colors ${syncing ? 'opacity-70' : ''}`}
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </header>

        <main className={`flex-1 ${isMobile ? 'p-4' : 'p-6 pb-12'}`}>
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
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  )
}
