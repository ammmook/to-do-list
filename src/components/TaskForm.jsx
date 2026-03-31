import { useState } from 'react';
import LoadingDots from './LoadingDots';

/**
 * TaskForm — Modal form for creating a new task.
 *
 * The Subject field is a DROPDOWN populated ONLY with subjects that
 * the user previously saved via the SubjectManager sidebar.
 * This ensures a clean two-step flow: add subjects first, then create tasks.
 *
 * Priority is auto-calculated from the deadline on the client side,
 * so it does NOT appear as a form field.
 *
 * @param {Array}    savedSubjectsList - Subjects saved for the current term
 * @param {Function} onAdd             - Callback with form data
 * @param {Function} onClose           - Close modal callback
 * @param {boolean}  isLoading         - Disables form during sync
 */
function TaskForm({ savedSubjectsList, onAdd, onClose, isLoading }) {
  const hasNoSavedSubjects = savedSubjectsList.length === 0;
  const defaultSelectedSubject = hasNoSavedSubjects ? '' : savedSubjectsList[0].name;

  const [selectedSubjectForTask, setSelectedSubjectForTask] = useState(defaultSelectedSubject);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Exam');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('Not Started');
  const [newTaskNote, setNewTaskNote] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isSubjectValid = selectedSubjectForTask.trim() !== '';
    const isTaskValid = newTaskDescription.trim() !== '';

    if (isSubjectValid && isTaskValid && !isLoading) {
      const formData = {
        subject: selectedSubjectForTask,
        task: newTaskDescription.trim(),
        category: newTaskCategory,
        deadline: newTaskDeadline,
        status: newTaskStatus,
        note: newTaskNote.trim(),
      };
      await onAdd(formData);
      onClose();
    }
  };

  const isSubmitDisabled =
    !selectedSubjectForTask.trim() ||
    !newTaskDescription.trim() ||
    isLoading ||
    hasNoSavedSubjects;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay bg-slate-900/30 backdrop-blur-sm" onClick={onClose}>
      <div className="modal-content bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 border border-slate-100" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Create Task</h2>
            <p className="text-sm text-slate-500">Fill in the details for your new task.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100 cursor-pointer button-pop">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Warn if no subjects exist yet — user needs to add subjects first */}
        {hasNoSavedSubjects && (
          <div className="mb-4 px-3 py-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-xs leading-relaxed">
            <strong>No subjects saved yet.</strong> Please add subjects in the sidebar first before creating a task.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Subject — dropdown from savedSubjectsList */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSubjectForTask}
              onChange={e => setSelectedSubjectForTask(e.target.value)}
              disabled={hasNoSavedSubjects}
              className="interactive-input cursor-pointer"
            >
              {hasNoSavedSubjects && (
                <option value="">— Add subjects in the sidebar first —</option>
              )}
              {savedSubjectsList.map((subject) => (
                <option key={subject.id} value={subject.name}>{subject.name}</option>
              ))}
            </select>
          </div>

          {/* Task description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Task <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newTaskDescription}
              onChange={e => setNewTaskDescription(e.target.value)}
              placeholder="e.g. Complete chapter 4 assignment"
              required
              className="interactive-input"
            />
          </div>

          {/* Category + Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <select
                value={newTaskCategory}
                onChange={e => setNewTaskCategory(e.target.value)}
                className="interactive-input cursor-pointer"
              >
                <option value="Exam">Exam</option>
                <option value="Project">Project</option>
                <option value="Homework">Homework</option>
                <option value="Assignment">Assignment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Deadline</label>
              <input
                type="date"
                value={newTaskDeadline}
                onChange={e => setNewTaskDeadline(e.target.value)}
                className="interactive-input cursor-pointer"
              />
            </div>
          </div>

          {/* Status only — Priority is auto-calculated, not user-selectable */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select
                value={newTaskStatus}
                onChange={e => setNewTaskStatus(e.target.value)}
                className="interactive-input cursor-pointer"
              >
                <option value="Not Started">Not Started</option>
                <option value="Pending">Pending</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <p className="text-xs text-slate-400 italic">
                Priority is auto-calculated from the deadline.
              </p>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Note</label>
            <textarea
              value={newTaskNote}
              onChange={e => setNewTaskNote(e.target.value)}
              placeholder="Add any extra details here..."
              rows={2}
              className="interactive-input resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="interactive-button interactive-button-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="interactive-button min-w-[100px]"
            >
              {isLoading ? <LoadingDots /> : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
