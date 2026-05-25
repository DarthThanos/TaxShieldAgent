// Centralized API client for TaxShieldAgent backend

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const merchantId = import.meta.env.VITE_DEV_MERCHANT_ID || 'platform';
  const url = `${BASE_URL}${path}`;

  const headers = {
    'X-Stripe-Account': merchantId,
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      message = body.detail || body.message || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return res.json();
}

// Dashboard
export function getHealth() {
  return request('/health');
}

export function getNexusStatus(merchantId) {
  return request('/dashboard/nexus-status');
}

export function getSummary(merchantId) {
  return request('/dashboard/summary');
}

export function getTransactions(merchantId) {
  return request('/dashboard/transactions');
}

export function getProjections() {
  return request('/dashboard/projections');
}

// Alerts
export function getAlerts(merchantId) {
  return request('/alerts');
}

export function getAlert(merchantId, alertId) {
  return request(`/alerts/${alertId}`);
}

export function confirmFix(merchantId, alertId, state) {
  return request(`/alerts/${alertId}/confirm-fix`, {
    method: 'POST',
    body: JSON.stringify({ user_confirmed: true, state }),
  });
}

export function snoozeAlert(merchantId, alertId, days) {
  return request(`/alerts/${alertId}/snooze`, {
    method: 'POST',
    body: JSON.stringify({ days }),
  });
}

export function explainNexus(merchantId, state) {
  return request(`/alerts/explain-nexus/${state}`);
}

export function getExposureEstimate(state) {
  return request(`/alerts/exposure/${state}`);
}

// Connectors
export function getConnectedPlatforms(merchantId) {
  return request('/connectors');
}

export function getSupportedPlatforms() {
  return request('/connectors/supported');
}

export function syncAllPlatforms(merchantId) {
  return request('/connectors/sync', { method: 'POST' });
}

export function connectStripe(merchantId, apiKey) {
  return request('/connectors/connect/stripe', {
    method: 'POST',
    body: JSON.stringify({ api_key: apiKey }),
  });
}

export function connectShopify(merchantId, shopUrl, code) {
  return request('/connectors/connect/shopify', {
    method: 'POST',
    body: JSON.stringify({ shop_url: shopUrl, code }),
  });
}

export function connectEtsy(merchantId, apiKey, accessToken, shopId) {
  return request('/connectors/connect/etsy', {
    method: 'POST',
    body: JSON.stringify({ api_key: apiKey, access_token: accessToken, shop_id: shopId }),
  });
}

export function connectPayPal(merchantId, clientId, clientSecret) {
  return request('/connectors/connect/paypal', {
    method: 'POST',
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
  });
}

export function connectSquare(merchantId, accessToken) {
  return request('/connectors/connect/square', {
    method: 'POST',
    body: JSON.stringify({ access_token: accessToken }),
  });
}

export function uploadAmazonCSV(merchantId, file) {
  const formData = new FormData();
  formData.append('file', file);
  return request('/connectors/connect/amazon/upload', {
    method: 'POST',
    body: formData,
    headers: {}, // let browser set Content-Type for multipart
  });
}

export function disconnectPlatform(merchantId, platform) {
  return request(`/connectors/disconnect/${platform}`, { method: 'DELETE' });
}

// Audit
export function getAuditLog() {
  return request('/audit/');
}

export async function downloadCompliancePDF() {
  const merchantId = import.meta.env.VITE_DEV_MERCHANT_ID || 'platform'
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const res = await fetch(`${BASE_URL}/audit/export-pdf`, {
    headers: { 'X-Stripe-Account': merchantId },
  })
  if (!res.ok) throw new Error(`PDF export failed: ${res.status}`)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `taxshield_compliance_${new Date().toISOString().slice(0,10)}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
