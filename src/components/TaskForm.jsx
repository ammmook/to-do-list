import { useState } from 'react';

function TaskForm({ onAdd, onClose, isLoading }) {
  const [form, setForm] = useState({
    subject: '',
    task: '',
    category: 'Exam',
    deadline: '',
    priority: 'Medium',
    status: 'Not Started',
    note: '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.subject.trim() && form.task.trim() && !isLoading) {
      onAdd(form);
      onClose();
    }
  };

  // Utility class for inputs to keep code clean and uniform
  const inputClassName = "w-full px-3 py-2 rounded-md border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 placeholder-slate-400 transition-all bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay bg-slate-900/30 backdrop-blur-sm" onClick={onClose}>
      <div className="modal-content bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 border border-slate-100" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Create Task</h2>
            <p className="text-sm text-slate-500">Fill in the details for your new task.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.subject}
              onChange={e => handleChange('subject', e.target.value)}
              placeholder="e.g. Database Systems"
              required
              className={inputClassName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Task <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.task}
              onChange={e => handleChange('task', e.target.value)}
              placeholder="e.g. Complete chapter 4 assignment"
              required
              className={inputClassName}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <select value={form.category} onChange={e => handleChange('category', e.target.value)} className={inputClassName}>
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
                value={form.deadline}
                onChange={e => handleChange('deadline', e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => handleChange('priority', e.target.value)} className={inputClassName}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select value={form.status} onChange={e => handleChange('status', e.target.value)} className={inputClassName}>
                <option value="Not Started">Not Started</option>
                <option value="Pending">Pending</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Note</label>
            <textarea
              value={form.note}
              onChange={e => handleChange('note', e.target.value)}
              placeholder="Add any extra details here..."
              rows={2}
              className={`${inputClassName} resize-none`}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.subject.trim() || !form.task.trim() || isLoading}
              className="px-4 py-2 rounded-md text-sm font-medium text-white
                         bg-slate-900 hover:bg-slate-800
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-sm transition-all duration-200 active:scale-[0.98]"
            >
              {isLoading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;