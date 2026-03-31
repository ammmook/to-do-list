/**
 * StatusSummaryCards — Three metric cards showing task status counts.
 *
 * WHY cards instead of a compact bar:
 * Cards with generous padding and a subtle background give each status
 * its own visual weight, making the dashboard scannable at a glance.
 * The total task count provides context without a separate element.
 */
function StatusSummaryCards({ tasks }) {
  const totalTaskCount = tasks.length;
  const notStartedCount = tasks.filter(t => t.status === 'Not Started').length;
  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const doneCount = tasks.filter(t => t.status === 'Done').length;

  const cardData = [
    {
      label: 'Not Started',
      count: notStartedCount,
      dotColor: 'bg-rose-400',
      textColor: 'text-rose-600',
    },
    {
      label: 'Pending',
      count: pendingCount,
      dotColor: 'bg-amber-400',
      textColor: 'text-amber-600',
    },
    {
      label: 'Done',
      count: doneCount,
      dotColor: 'bg-emerald-400',
      textColor: 'text-emerald-600',
    },
  ];

  return (
    <>
      {cardData.map((card) => (
        <div
          key={card.label}
          className="interactive-card hover-lift flex-shrink min-w-0"
        >
          <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${card.dotColor}`} />
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{card.label}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className={`text-xl sm:text-2xl font-bold ${card.textColor}`}>{card.count}</span>
            <span className="text-[10px] sm:text-xs text-slate-400">/ {totalTaskCount}</span>
          </div>
        </div>
      ))}
    </>
  );
}

export default StatusSummaryCards;
