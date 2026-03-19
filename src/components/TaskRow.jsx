function TaskRow({ task, index, onStatusChange, onDelete }) {
  // Calculate days left
  const getDaysLeft = (deadline) => {
    if (!deadline) return '-';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    const diff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysLeft = getDaysLeft(task.deadline);
  const pastelClass = `row-pastel-${index % 6}`;

  const statusClass = task.status === 'Done' ? 'status-done' :
                      task.status === 'Pending' ? 'status-pending' : 'status-not-started';

  const priorityClass = task.priority === 'High' ? 'priority-high' :
                        task.priority === 'Medium' ? 'priority-medium' : 'priority-low';

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatCreatedAt = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
             d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <tr className={`${pastelClass} border-b border-gray-100 hover:brightness-95 transition-all text-sm slide-in`}>
      <td className="px-3 py-2.5 text-center text-gray-400 text-xs">{index + 1}</td>
      <td className="px-3 py-2.5 font-medium text-gray-700">{task.subject}</td>
      <td className="px-3 py-2.5 text-gray-600">{task.task}</td>
      <td className="px-3 py-2.5 text-gray-500">{task.category}</td>
      <td className="px-3 py-2.5 text-gray-500 text-xs">{formatDate(task.deadline)}</td>
      <td className="px-3 py-2.5 text-center">
        {daysLeft === '-' ? (
          <span className="text-gray-300">-</span>
        ) : (
          <span className={`text-xs font-medium ${daysLeft < 0 ? 'text-red-500' : daysLeft <= 3 ? 'text-orange-500' : 'text-gray-500'}`}>
            {daysLeft}
          </span>
        )}
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className={`${priorityClass} text-xs font-medium px-2.5 py-1 rounded-full`}>
          {task.priority}
        </span>
      </td>
      <td className="px-3 py-2.5 text-center">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className={`${statusClass} text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none`}
        >
          <option value="Not Started">Not Started</option>
          <option value="Pending">Pending</option>
          <option value="Done">Done</option>
        </select>
      </td>
      <td className="px-3 py-2.5 text-gray-500 text-xs max-w-[150px] truncate" title={task.note}>
        {task.note || '-'}
      </td>
      <td className="px-3 py-2.5 text-gray-400 text-xs whitespace-nowrap">{formatCreatedAt(task.createdAt)}</td>
      <td className="px-3 py-2.5 text-center">
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-300 hover:text-red-400 transition-colors p-1"
          title="Delete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </td>
    </tr>
  );
}

export default TaskRow;
