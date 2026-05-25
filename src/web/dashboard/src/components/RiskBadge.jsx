import { riskBadge } from '../design/tokens';

export default function RiskBadge({ level }) {
  const s = riskBadge[level] || riskBadge.GREEN;
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}
