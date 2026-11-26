import { useEffect, useMemo, useState } from 'react';

function nextMidnight(): number {
  const date = new Date();
  date.setHours(24, 0, 0, 0);
  return date.getTime();
}

export function Countdown({ label = 'Deal ends in' }: { label?: string }) {
  const target = useMemo(() => nextMidnight(), []);
  const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(Math.max(0, target - Date.now()));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  const parts = [
    { value: hours, label: 'Hrs' },
    { value: minutes, label: 'Min' },
    { value: seconds, label: 'Sec' },
  ];

  return (
    <div className="flex items-center gap-2" aria-label={`${label} ${hours} hours ${minutes} minutes`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">{label}</span>
      <div className="flex items-center gap-1.5">
        {parts.map((part) => (
          <div
            key={part.label}
            className="flex min-w-[44px] flex-col items-center rounded-md bg-[var(--brand-navy)] px-2 py-1 text-white"
          >
            <span className="text-sm font-bold tabular-nums">{String(part.value).padStart(2, '0')}</span>
            <span className="text-[9px] uppercase tracking-wide text-white/70">{part.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
