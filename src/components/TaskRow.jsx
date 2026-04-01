import React, { useState } from 'react';
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
function TaskRow({ task, index, savedSubjectsList, onStatusChange, onEditTask, onDelete, isReadOnly }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    subject: task.subject,
    task: task.task,
    category: task.category,
    deadline: task.deadline || '',
    note: task.note || ''
  });

  const handleEditClick = () => {
    setIsEditing(true);
    setEditData({
      subject: task.subject,
      task: task.task,
      category: task.category,
      deadline: task.deadline || '',
      note: task.note || ''
    });
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    if (editData.subject.trim() === '' || editData.task.trim() === '') {
      alert("Subject and Task cannot be empty");
      return;
    }
    setIsEditing(false);
    await onEditTask(task.id, editData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // ─── Days Until Deadline ─────────────────────────────────────────
  const getDaysLeft = (deadline) => {
    if (!deadline) return '-';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    const differenceInDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return differenceInDays;
  };

  const isTaskDone = task.status === 'Done';
  let daysLeft = getDaysLeft(task.deadline);
  if (isTaskDone && daysLeft !== '-') {
    daysLeft = daysLeft > 0 ? daysLeft : 0;
  }

  // ─── Auto-Calculated Priority ────────────────────────────────────
  // Computed every render so it updates automatically as dates change
  const computedPriority = calculateTaskPriority(task.deadline, task.status);

  // ─── Style Configurations ────────────────────────────────────────

  const statusStyleConfig = {
    'Done': 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    'Pending': 'bg-amber-50 text-amber-700 border-amber-200/60',
    'Not Started': 'bg-rose-50 text-rose-700 border-rose-200/60',
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

  const inputClasses = "w-full text-xs px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 shadow-sm";

  return (
    <tr className="hover:bg-slate-50/80 transition-colors duration-200 group fade-in">
      <td className={`px-4 py-3 text-center text-xs ${isTaskDone ? 'line-through text-slate-400' : 'text-slate-400'}`}>{index + 1}</td>
      
      {/* Subject */}
      <td className={`px-4 py-3 font-medium ${isTaskDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
        {isEditing ? (
          <select name="subject" value={editData.subject} onChange={handleChange} className={inputClasses}>
            {savedSubjectsList && savedSubjectsList.length > 0 ? (
              savedSubjectsList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
            ) : (
              <option value={task.subject}>{task.subject}</option>
            )}
          </select>
        ) : task.subject}
      </td>
      
      {/* Task */}
      <td className={`px-4 py-3 ${isTaskDone ? 'line-through text-slate-400' : 'text-slate-600'}`}>
        {isEditing ? (
          <input type="text" name="task" value={editData.task} onChange={handleChange} className={inputClasses} />
        ) : task.task}
      </td>
      
      {/* Category */}
      <td className={`px-4 py-3 text-sm ${isTaskDone ? 'line-through text-slate-400' : 'text-slate-500'}`}>
        {isEditing ? (
          <select name="category" value={editData.category} onChange={handleChange} className={inputClasses}>
             <option value="Exam">Exam</option>
             <option value="Project">Project</option>
             <option value="Homework">Homework</option>
             <option value="Assignment">Assignment</option>
             <option value="Other">Other</option>
          </select>
        ) : task.category}
      </td>
      
      {/* Deadline */}
      <td className={`px-4 py-3 text-sm ${isTaskDone ? 'line-through text-slate-400' : 'text-slate-500'}`}>
        {isEditing ? (
          <input type="date" name="deadline" value={editData.deadline} onChange={handleChange} className={inputClasses} />
        ) : formatDate(task.deadline)}
      </td>

      {/* Days Left */}
      <td className="px-4 py-3 text-center">
        {daysLeft === '-' ? (
          <span className={`text-slate-300 ${doneStrikethroughClass}`}>-</span>
        ) : (
          <span className={`text-xs font-medium ${isTaskDone ? 'line-through text-slate-400' : getDaysLeftColorClass(daysLeft)}`}>
            {daysLeft}
          </span>
        )}
      </td>

      {/* Auto-Calculated Priority */}
      <td className="px-4 py-3 text-center">
        {computedPriority ? (
          <span className={`text-xs font-medium px-2 py-1 rounded-md ${isTaskDone ? 'line-through text-slate-400 bg-slate-50' : priorityClassName}`}>
            {computedPriority}
          </span>
        ) : (
          <span className={`text-slate-300 ${doneStrikethroughClass}`}>-</span>
        )}
      </td>

      {/* Status Dropdown */}
      <td className="px-4 py-3 text-center">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          disabled={isEditing || isReadOnly}
          className={`text-xs font-medium px-2 py-1 rounded-md border cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-slate-200
                      transition-colors ${statusClassName} ${(isEditing || isReadOnly) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <option value="Not Started">Not Started</option>
          <option value="Pending">Pending</option>
          <option value="Done">Done</option>
        </select>
      </td>

      {/* Note */}
      <td className={`px-4 py-3 text-xs max-w-[150px] truncate ${isTaskDone ? 'line-through text-slate-400' : 'text-slate-500'}`} title={task.note}>
        {isEditing ? (
          <input type="text" name="note" value={editData.note} onChange={handleChange} className={inputClasses} placeholder="Note..." />
        ) : (task.note || '-')}
      </td>

      {/* Actions (Edit / Delete) */}
      <td className="px-4 py-3 text-center min-w-[80px]">
        {isReadOnly ? (
          <span className="text-[10px] text-slate-300 italic">View Only</span>
        ) : (
          <div className="flex items-center justify-center gap-1">
            {isEditing ? (
              <>
                <button onClick={handleSaveClick} className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 p-1.5 rounded-md transition-colors" title="Save">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button onClick={handleCancelClick} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-md transition-colors" title="Cancel">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEditClick}
                  className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded-md transition-colors cursor-pointer button-pop"
                  title="Edit task"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors cursor-pointer button-pop"
                  title="Delete task"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

export default React.memo(TaskRow);