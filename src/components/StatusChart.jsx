function StatusChart({ tasks }) {
  const total = tasks.length || 1;
  const done = tasks.filter(t => t.status === 'Done').length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const notStarted = tasks.filter(t => t.status === 'Not Started').length;

  const donePercent = (done / total) * 100;
  const pendingPercent = (pending / total) * 100;
  const notStartedPercent = (notStarted / total) * 100;

  // SVG donut chart
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  const doneOffset = 0;
  const doneDash = (donePercent / 100) * circumference;

  const pendingOffset = doneDash;
  const pendingDash = (pendingPercent / 100) * circumference;

  const notStartedOffset = pendingOffset + pendingDash;
  const notStartedDash = (notStartedPercent / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="14" />
          
          {/* Done segment - green */}
          {done > 0 && (
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="#86efac"
              strokeWidth="14"
              strokeDasharray={`${doneDash} ${circumference - doneDash}`}
              strokeDashoffset={-doneOffset}
              transform="rotate(-90 60 60)"
              className="transition-all duration-500"
            />
          )}
          
          {/* Pending segment - yellow */}
          {pending > 0 && (
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="#fde68a"
              strokeWidth="14"
              strokeDasharray={`${pendingDash} ${circumference - pendingDash}`}
              strokeDashoffset={-pendingOffset}
              transform="rotate(-90 60 60)"
              className="transition-all duration-500"
            />
          )}
          
          {/* Not Started segment - red/pink */}
          {notStarted > 0 && (
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="#fda4af"
              strokeWidth="14"
              strokeDasharray={`${notStartedDash} ${circumference - notStartedDash}`}
              strokeDashoffset={-notStartedOffset}
              transform="rotate(-90 60 60)"
              className="transition-all duration-500"
            />
          )}

          {/* Center text */}
          <text x="60" y="56" textAnchor="middle" className="text-xs fill-gray-400">Status</text>
          <text x="60" y="72" textAnchor="middle" className="text-sm font-semibold fill-gray-600">{total === 1 && tasks.length === 0 ? 0 : total}</text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-300 inline-block"></span>
          <span className="text-gray-500">Done <b className="text-gray-700">{donePercent.toFixed(1)}%</b></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-200 inline-block"></span>
          <span className="text-gray-500">Pending <b className="text-gray-700">{pendingPercent.toFixed(1)}%</b></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-300 inline-block"></span>
          <span className="text-gray-500">Not Started <b className="text-gray-700">{notStartedPercent.toFixed(1)}%</b></span>
        </div>
      </div>
    </div>
  );
}

export default StatusChart;
