import { calculateTaskPriority } from '../data/taskPriority';

/**
 * TaskRow — A single row in the task table.
 *
 * Priority is computed live from the deadline and status every render,
 * so it always reflects the current date (no stale data).
 *
 * When a task's status is "Done", the subject and task text get a
 * strikethrough decoration as a clear visual indicator of completion.
 */
function TaskRow({ task, index, onStatusChange, onDelete }) {
  // ─── Days Until Deadline ─────────────────────────────────────────
  const getDaysLeft = (deadline) => {
    if (!deadline) return '-';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    const differenceInDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return differenceInDays;
  };

  const daysLeft = getDaysLeft(task.deadline);

  // ─── Auto-Calculated Priority ────────────────────────────────────
  // Computed every render so it updates automatically as dates change
  const computedPriority = calculateTaskPriority(task.deadline, task.status);

  const isTaskDone = task.status === 'Done';

  // ─── Style Configurations ────────────────────────────────────────

  const statusStyleConfig = {
    'Done': 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    'Pending': 'bg-amber-50 text-amber-700 border-amber-200/60',
    'Not Started': 'bg-slate-100 text-slate-600 border-slate-200',
  };
  const statusClassName = statusStyleConfig[task.status] || statusStyleConfig['Not Started'];

  const priorityStyleConfig = {
    'High': 'text-red-600 bg-red-50',
    'Medium': 'text-orange-600 bg-orange-50',
    'Low': 'text-slate-500 bg-slate-100',
  };
  const priorityClassName = priorityStyleConfig[computedPriority] || '';

  // ─── Date Formatting ────────────────────────────────────────────

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // ─── Strikethrough class for completed tasks ─────────────────────
  const doneStrikethroughClass = isTaskDone ? 'line-through text-slate-400' : '';

  // ─── Days Left Color Logic ───────────────────────────────────────
  const getDaysLeftColorClass = (days) => {
    if (days === '-') return '';
    if (days < 0) return 'text-red-500';
    if (days <= 3) return 'text-amber-600';
    return 'text-slate-500';
  };

  return (
    <tr className="hover:bg-slate-50/80 transition-colors duration-200 group fade-in">
      <td className="px-4 py-3 text-center text-slate-400 text-xs">{index + 1}</td>
      <td className={`px-4 py-3 font-medium text-slate-900 ${doneStrikethroughClass}`}>{task.subject}</td>
      <td className={`px-4 py-3 text-slate-600 ${doneStrikethroughClass}`}>{task.task}</td>
      <td className="px-4 py-3 text-slate-500 text-sm">{task.category}</td>
      <td className="px-4 py-3 text-slate-500 text-sm">{formatDate(task.deadline)}</td>

      {/* Days Left */}
      <td className="px-4 py-3 text-center">
        {daysLeft === '-' ? (
          <span className="text-slate-300">-</span>
        ) : (
          <span className={`text-xs font-medium ${getDaysLeftColorClass(daysLeft)}`}>
            {daysLeft}
          </span>
        )}
      </td>

      {/* Auto-Calculated Priority */}
      <td className="px-4 py-3 text-center">
        {computedPriority ? (
          <span className={`text-xs font-medium px-2 py-1 rounded-md ${priorityClassName}`}>
            {computedPriority}
          </span>
        ) : (
          <span className="text-slate-300">-</span>
        )}
      </td>

      {/* Status Dropdown */}
      <td className="px-4 py-3 text-center">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className={`text-xs font-medium px-2 py-1 rounded-md border cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-slate-200
                      transition-colors ${statusClassName}`}
        >
          <option value="Not Started">Not Started</option>
          <option value="Pending">Pending</option>
          <option value="Done">Done</option>
        </select>
      </td>

      {/* Note */}
      <td className="px-4 py-3 text-slate-500 text-xs max-w-[150px] truncate" title={task.note}>
        {task.note || '-'}
      </td>

      {/* Delete (visible on hover) */}
      <td className="px-4 py-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => onDelete(task.id)}
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors cursor-pointer button-pop"
          title="Delete task"
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