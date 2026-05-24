const RISK_STYLES = {
  GREEN: { bg: '#dcfce7', color: '#166534', label: 'Green' },
  YELLOW: { bg: '#fef9c3', color: '#854d0e', label: 'Yellow' },
  RED: { bg: '#fee2e2', color: '#991b1b', label: 'Red' },
  CRITICAL: { bg: '#ede9fe', color: '#5b21b6', label: 'Critical' },
};

export default function RiskBadge({ level }) {
  const style = RISK_STYLES[level] || RISK_STYLES.GREEN;
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
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
      }}
    >
      {style.label}
    </span>
  );
}
