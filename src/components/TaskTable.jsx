import TaskRow from './TaskRow';

function TaskTable({ tasks, onStatusChange, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-pink-200 border-t-pink-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header text-white text-xs font-semibold">
              <th className="px-3 py-2.5 text-center w-10">#</th>
              <th className="px-3 py-2.5 text-left">Subject</th>
              <th className="px-3 py-2.5 text-left">Task</th>
              <th className="px-3 py-2.5 text-left">Category</th>
              <th className="px-3 py-2.5 text-left">Deadline</th>
              <th className="px-3 py-2.5 text-center">Days Left</th>
              <th className="px-3 py-2.5 text-center">Priority</th>
              <th className="px-3 py-2.5 text-center">Status</th>
              <th className="px-3 py-2.5 text-left">Note</th>
              <th className="px-3 py-2.5 text-left">Created at</th>
              <th className="px-3 py-2.5 text-center w-10"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-3 py-12 text-center">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-gray-400 font-medium">No tasks yet</p>
                  <p className="text-gray-300 text-xs mt-1">Click "Add Task" to get started!</p>
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
