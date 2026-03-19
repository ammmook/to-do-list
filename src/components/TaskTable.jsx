import TaskRow from './TaskRow';

function TaskTable({ tasks, onStatusChange, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-16 flex flex-col items-center gap-4 shadow-sm">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Syncing tasks...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-medium uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 w-10 text-center">#</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Deadline</th>
              <th className="px-4 py-3 text-center">Days Left</th>
              <th className="px-4 py-3 text-center">Priority</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-16 text-center">
                  <p className="text-slate-500 font-medium">No tasks found</p>
                  <p className="text-slate-400 text-xs mt-1">Create a new task to get started.</p>
                </td>
              </tr>
            ) : (
              tasks.map((task, index) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  index={index}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TaskTable;