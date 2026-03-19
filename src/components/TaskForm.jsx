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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="modal-content bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-800 font-title">Add New Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Subject *</label>
            <input
              type="text"
              value={form.subject}
              onChange={e => handleChange('subject', e.target.value)}
              placeholder="e.g. Math, Java 2, Database..."
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800
                         focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100
                         placeholder-gray-300 transition-all"
            />
          </div>

          {/* Task */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Task *</label>
            <input
              type="text"
              value={form.task}
              onChange={e => handleChange('task', e.target.value)}
              placeholder="e.g. Study for midterm, Submit homework..."
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800
                         focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100
                         placeholder-gray-300 transition-all"
            />
          </div>

          {/* Row: Category + Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800
                           focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100
                           bg-white transition-all"
              >
                <option value="Exam">Exam</option>
                <option value="Project">Project</option>
                <option value="Homework">Homework</option>
                <option value="Assignment">Assignment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => handleChange('deadline', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800
                           focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100
                           transition-all"
              />
            </div>
          </div>

          {/* Row: Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={e => handleChange('priority', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800
                           focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100
                           bg-white transition-all"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800
                           focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100
                           bg-white transition-all"
              >
                <option value="Not Started">Not Started</option>
                <option value="Pending">Pending</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Note</label>
            <textarea
              value={form.note}
              onChange={e => handleChange('note', e.target.value)}
              placeholder="Optional notes..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800
                         focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100
                         placeholder-gray-300 transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.subject.trim() || !form.task.trim() || isLoading}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white
                         bg-gradient-to-r from-pink-400 to-rose-400
                         hover:from-pink-500 hover:to-rose-500
                         disabled:opacity-40 disabled:cursor-not-allowed
                         shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              {isLoading ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
