import { useState, useEffect, useCallback } from 'react'
import {
  CreditCard, ShoppingBag, Palette, Wallet, Square as SquareIcon,
  Package, Plug, PlugZap, Upload, RefreshCw, X,
} from 'lucide-react'
import {
  getConnectedPlatforms, getSupportedPlatforms, syncAllPlatforms,
  connectStripe, connectShopify, connectEtsy, connectPayPal,
  connectSquare, uploadAmazonCSV, disconnectPlatform,
} from '../api/client'
import { colors } from '../design/tokens'
import { SkeletonBlock } from '../components/Skeleton'

const PLATFORM_ICONS = {
  stripe: CreditCard, shopify: ShoppingBag, etsy: Palette,
  paypal: Wallet, square: SquareIcon, amazon: Package,
}

export default function Platforms({ showToast }) {
  const [supported, setSupported] = useState([])
  const [connected, setConnected] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [connectForm, setConnectForm] = useState(null)
  const [formData, setFormData] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [sup, con] = await Promise.all([getSupportedPlatforms(), getConnectedPlatforms()])
      setSupported(sup || []); setConnected(con || [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const connectedMap = {}
  connected.forEach(c => { if (c.status !== 'disconnected') connectedMap[c.platform] = c })

  const handleSync = useCallback(async () => {
    setSyncing(true)
    try { await syncAllPlatforms(); showToast?.('All platforms synced successfully', 'success'); load() }
    catch (err) { showToast?.(err.message, 'error') }
    finally { setSyncing(false) }
  }, [load, showToast])

  const handleDisconnect = useCallback(async (platform) => {
    try { await disconnectPlatform(null, platform); showToast?.(`${platform} disconnected`, 'success'); load() }
    catch (err) { showToast?.(err.message, 'error') }
  }, [load, showToast])

  const handleConnect = useCallback(async (platform) => {
    setSubmitting(true)
    try {
      switch (platform) {
        case 'stripe':  await connectStripe(null, formData.api_key); break
        case 'shopify': await connectShopify(null, formData.shop_url, formData.code); break
        case 'etsy':    await connectEtsy(null, formData.api_key, formData.access_token, formData.shop_id); break
        case 'paypal':  await connectPayPal(null, formData.client_id, formData.client_secret); break
        case 'square':  await connectSquare(null, formData.access_token); break
        case 'amazon':  if (formData.file) await uploadAmazonCSV(null, formData.file); break
      }
      showToast?.(`${platform} connected successfully`, 'success')
      setConnectForm(null); setFormData({}); load()
    } catch (err) { showToast?.(err.message, 'error') }
    finally { setSubmitting(false) }
  }, [formData, load, showToast])

  if (loading) return (
    <div>
      <div className="h-7 bg-gray-200 animate-pulse rounded w-28 mb-6" />
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <SkeletonBlock className="w-11 h-11 rounded-xl" />
              <div className="flex-1">
                <SkeletonBlock className="h-4 w-24 mb-1.5" />
                <SkeletonBlock className="h-3 w-16" />
              </div>
            </div>
            <SkeletonBlock className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
  if (error) return <div className="p-10 text-red-800">Failed to load platforms: {error}</div>

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'

  const renderConnectForm = (platform) => {
    const forms = {
      stripe: <input className={inputCls} placeholder="Stripe Secret API Key (sk_...)" value={formData.api_key || ''}
        onChange={e => setFormData(d => ({ ...d, api_key: e.target.value }))} />,
      shopify: <>
        <input className={inputCls} placeholder="Shop URL (mystore.myshopify.com)" value={formData.shop_url || ''}
          onChange={e => setFormData(d => ({ ...d, shop_url: e.target.value }))} />
        <input className={inputCls} placeholder="OAuth Code" value={formData.code || ''}
          onChange={e => setFormData(d => ({ ...d, code: e.target.value }))} />
      </>,
      etsy: <>
        <input className={inputCls} placeholder="API Key" value={formData.api_key || ''}
          onChange={e => setFormData(d => ({ ...d, api_key: e.target.value }))} />
        <input className={inputCls} placeholder="Access Token" value={formData.access_token || ''}
          onChange={e => setFormData(d => ({ ...d, access_token: e.target.value }))} />
        <input className={inputCls} placeholder="Shop ID" value={formData.shop_id || ''}
          onChange={e => setFormData(d => ({ ...d, shop_id: e.target.value }))} />
      </>,
      paypal: <>
        <input className={inputCls} placeholder="Client ID" value={formData.client_id || ''}
          onChange={e => setFormData(d => ({ ...d, client_id: e.target.value }))} />
        <input type="password" className={inputCls} placeholder="Client Secret" value={formData.client_secret || ''}
          onChange={e => setFormData(d => ({ ...d, client_secret: e.target.value }))} />
      </>,
      square: <input className={inputCls} placeholder="Access Token" value={formData.access_token || ''}
        onChange={e => setFormData(d => ({ ...d, access_token: e.target.value }))} />,
      amazon: <label className="block border-2 border-dashed border-gray-300 rounded-lg px-5 py-3 text-center text-sm text-gray-500 cursor-pointer hover:border-primary transition-colors">
        {formData.file ? formData.file.name : 'Click to select CSV file'}
        <input type="file" accept=".csv" className="hidden"
          onChange={e => setFormData(d => ({ ...d, file: e.target.files[0] }))} />
      </label>,
    }
    return forms[platform] ? <div className="flex flex-col gap-2.5">{forms[platform]}</div> : null
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Platforms</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg border-none bg-primary text-white text-sm font-semibold cursor-pointer hover:bg-indigo-600 transition-colors ${syncing ? 'opacity-70' : ''}`}
        >
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync All Platforms'}
        </button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {supported.map(p => {
          const Icon = PLATFORM_ICONS[p.platform] || Plug
          const tok = colors.platform[p.platform] || { brand: '#6b7280', bg: '#f3f4f6', text: '#374151' }
          const conn = connectedMap[p.platform]
          const isConnected = !!conn
          const isFormOpen = connectForm === p.platform

          return (
            <div key={p.platform} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: tok.brand + '18' }}>
                  <Icon size={22} color={tok.brand} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-base text-gray-900">{p.display_name}</div>
                  <div className={`text-xs font-semibold ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </div>
                </div>
                {isConnected && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
              </div>

              {isConnected && conn.last_sync_at && (
                <div className="text-[13px] text-gray-500">
                  Last sync: {new Date(conn.last_sync_at).toLocaleString()}
                </div>
              )}

              {!isConnected && !isFormOpen && (
                <div className="text-[13px] text-gray-400 leading-relaxed">{p.instructions}</div>
              )}

              {isFormOpen && (
                <div className="flex flex-col gap-3">
                  {renderConnectForm(p.platform)}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConnect(p.platform)}
                      disabled={submitting}
                      className={`flex-1 py-2 rounded-lg border-none text-white text-sm font-semibold cursor-pointer transition-colors ${submitting ? 'opacity-70' : ''}`}
                      style={{ backgroundColor: tok.brand }}
                    >
                      {submitting ? 'Connecting...' : 'Connect'}
                    </button>
                    <button
                      onClick={() => { setConnectForm(null); setFormData({}) }}
                      className="px-3 py-2 rounded-lg border border-gray-300 bg-white cursor-pointer hover:bg-gray-50"
                    >
                      <X size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              )}

              {!isFormOpen && (
                isConnected
                  ? <button
                      onClick={() => handleDisconnect(p.platform)}
                      className="py-2 px-4 rounded-lg border border-red-200 bg-white text-red-500 text-sm font-medium cursor-pointer hover:bg-red-50 transition-colors"
                    >
                      Disconnect
                    </button>
                  : <button
                      onClick={() => { setConnectForm(p.platform); setFormData({}) }}
                      className="py-2 px-4 rounded-lg border-none text-sm font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                      style={{ backgroundColor: tok.brand + '18', color: tok.brand }}
                    >
                      <PlugZap size={14} /> Connect
                    </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
