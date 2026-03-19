function TodoFilter({ filter, onFilterChange, counts, onClearCompleted }) {
  const filters = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'active', label: 'Active', count: counts.active },
    { key: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        {filters.map(({ key, label, count }) => (
          <button
            key={key}
            id={`filter-${key}`}
            onClick={() => onFilterChange(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                         ${filter === key
                           ? 'bg-violet-500/20 text-violet-300 shadow-sm'
                           : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'}`}
          >
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-md
                           ${filter === key
                             ? 'bg-violet-500/30 text-violet-200'
                             : 'bg-white/5 text-white/30'}`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {counts.completed > 0 && (
        <button
          id="clear-completed-btn"
          onClick={onClearCompleted}
          className="px-4 py-2 rounded-lg text-sm font-medium text-rose-400/70
                     hover:text-rose-400 hover:bg-rose-400/10 transition-all duration-200"
        >
          Clear completed
        </button>
      )}
    </div>
  );
}

export default TodoFilter;
