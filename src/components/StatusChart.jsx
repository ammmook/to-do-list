/**
 * StatusChart — Lightweight donut chart showing task status distribution.
 *
 * WHY SVG donut instead of a chart library:
 * The donut only shows 3 segments, so a full chart library is overkill.
 * Raw SVG keeps the bundle tiny and gives full control over styling.
 */
function StatusChart({ tasks }) {
  const totalTaskCount = tasks.length;
  const emptyState = totalTaskCount === 0;

  const doneCount = tasks.filter(t => t.status === 'Done').length;
  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const notStartedCount = tasks.filter(t => t.status === 'Not Started').length;

  // Use 1 as denominator for empty state to avoid division by zero
  const divisor = emptyState ? 1 : totalTaskCount;

  const donePercent = (doneCount / divisor) * 100;
  const pendingPercent = (pendingCount / divisor) * 100;
  const notStartedPercent = (notStartedCount / divisor) * 100;

  // SVG donut calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  const doneDash = (donePercent / 100) * circumference;
  const pendingDash = (pendingPercent / 100) * circumference;
  const notStartedDash = (notStartedPercent / 100) * circumference;

  const doneOffset = 0;
  const pendingOffset = doneDash;
  const notStartedOffset = pendingOffset + pendingDash;

  const legendItems = [
    { label: 'Done', percent: donePercent, colorClass: 'bg-emerald-400' },
    { label: 'Pending', percent: pendingPercent, colorClass: 'bg-amber-300' },
    { label: 'Not Started', percent: notStartedPercent, colorClass: 'bg-rose-300' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 shadow-sm">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 sm:mb-4">Overview</h3>

      <div className="flex flex-row sm:flex-col items-center justify-around sm:justify-center gap-2 sm:gap-4">
        {/* Donut Chart */}
        <div className="relative shrink-0">
          <svg viewBox="0 0 100 100" className="w-[84px] h-[84px] sm:w-[110px] sm:h-[110px]">
            {/* Background ring */}
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />

            {/* Done segment — green */}
            {doneCount > 0 && (
              <circle
                cx="50" cy="50" r={radius}
                fill="none"
                stroke="#6ee7b7"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${doneDash} ${circumference - doneDash}`}
                strokeDashoffset={-doneOffset}
                transform="rotate(-90 50 50)"
                className="transition-all duration-500"
              />
            )}

            {/* Pending segment — yellow */}
            {pendingCount > 0 && (
              <circle
                cx="50" cy="50" r={radius}
                fill="none"
                stroke="#fcd34d"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${pendingDash} ${circumference - pendingDash}`}
                strokeDashoffset={-pendingOffset}
                transform="rotate(-90 50 50)"
                className="transition-all duration-500"
              />
            )}

            {/* Not Started segment — rose */}
            {notStartedCount > 0 && (
              <circle
                cx="50" cy="50" r={radius}
                fill="none"
                stroke="#fda4af"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${notStartedDash} ${circumference - notStartedDash}`}
                strokeDashoffset={-notStartedOffset}
                transform="rotate(-90 50 50)"
                className="transition-all duration-500"
              />
            )}

            {/* Center text */}
            <text x="50" y="46" textAnchor="middle" className="text-[10px] fill-slate-400">Total</text>
            <text x="50" y="60" textAnchor="middle" className="text-sm font-bold fill-slate-700">
              {totalTaskCount}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-1.5 w-full max-w-[120px] sm:max-w-none">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${item.colorClass}`} />
                <span className="text-slate-500">{item.label}</span>
              </div>
              <span className="text-slate-700 font-semibold">{item.percent.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StatusChart;
