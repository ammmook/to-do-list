function StatusBar({ tasks }) {
  const notStarted = tasks.filter(t => t.status === 'Not Started').length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const done = tasks.filter(t => t.status === 'Done').length;

  return (
    <div className="flex gap-0 rounded-lg overflow-hidden border border-gray-200 text-sm font-medium w-fit">
      <div className="px-5 py-2 bg-red-50 border-r border-gray-200 text-center min-w-[120px]">
        <div className="text-gray-500 text-xs mb-0.5">Not Started</div>
        <div className="text-red-600 text-lg font-bold">{notStarted}</div>
      </div>
      <div className="px-5 py-2 bg-yellow-50 border-r border-gray-200 text-center min-w-[120px]">
        <div className="text-gray-500 text-xs mb-0.5">Pending</div>
        <div className="text-yellow-600 text-lg font-bold">{pending}</div>
      </div>
      <div className="px-5 py-2 bg-green-50 text-center min-w-[120px]">
        <div className="text-gray-500 text-xs mb-0.5">Done</div>
        <div className="text-green-600 text-lg font-bold">{done}</div>
      </div>
    </div>
  );
}

export default StatusBar;
