export default function StatRing({ value=0, label="Score" }) {
  const r = 48, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (1 - pct / 100) * c;
  return (
    <div className="flex items-center gap-3">
      <svg width="120" height="120" viewBox="0 0 120 120" className="drop-shadow">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="url(#g)" strokeWidth="10" strokeDasharray={c} strokeDashoffset={dash} strokeLinecap="round" transform="rotate(-90 60 60)" />
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-current font-bold text-[22px]">{pct}%</text>
      </svg>
      <div className="text-sm opacity-70">{label}</div>
    </div>
  );
}
