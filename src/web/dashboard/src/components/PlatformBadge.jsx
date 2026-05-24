const PLATFORM_COLORS = {
  stripe: { bg: '#ede9fe', color: '#6d28d9' },
  shopify: { bg: '#dcfce7', color: '#166534' },
  etsy: { bg: '#ffedd5', color: '#9a3412' },
  paypal: { bg: '#dbeafe', color: '#1e40af' },
  square: { bg: '#ccfbf1', color: '#0f766e' },
  amazon: { bg: '#fef9c3', color: '#854d0e' },
};

export default function PlatformBadge({ platform }) {
  const name = (platform || '').toLowerCase();
  const style = PLATFORM_COLORS[name] || { bg: '#f3f4f6', color: '#374151' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
        textTransform: 'capitalize',
      }}
    >
      {platform}
    </span>
  );
}
