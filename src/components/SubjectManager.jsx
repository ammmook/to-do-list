import { useState } from 'react';

/**
 * SubjectManager — Sidebar panel for managing saved subjects.
 *
 * WHY in the sidebar:
 * Subjects are a "setup" task, not a daily action. Placing the input
 * in the sidebar keeps it accessible but out of the main workflow area,
 * reducing visual clutter on the central task table.
 */
function SubjectManager({ savedSubjectsForTerm, onAddSubject, onDeleteSubject }) {
  const [newSubjectInputText, setNewSubjectInputText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubject = async () => {
    const trimmedSubjectName = newSubjectInputText.trim();

    // Prevent empty or duplicate subject names
    const isEmpty = trimmedSubjectName === '';
    const isDuplicate = savedSubjectsForTerm.some(
      (subject) => subject.name.toLowerCase() === trimmedSubjectName.toLowerCase()
    );

    if (isEmpty || isDuplicate) return;

    setIsAdding(true);
    try {
      await onAddSubject(trimmedSubjectName);
      setNewSubjectInputText('');
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddSubject();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subjects</h3>
      </div>

      {/* Add Subject Input */}
      <div className="px-3 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={newSubjectInputText}
            onChange={(e) => setNewSubjectInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add subject..."
            disabled={isAdding}
            className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800
                       focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100
                       placeholder-slate-400 transition-all bg-white disabled:opacity-50"
          />
          <button
            onClick={handleAddSubject}
            disabled={!newSubjectInputText.trim() || isAdding}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white
                       bg-slate-800 hover:bg-slate-700
                       disabled:opacity-30 disabled:cursor-not-allowed
                       transition-all active:scale-95 flex-shrink-0"
          >
            {isAdding ? '...' : 'Add'}
          </button>
        </div>
      </div>

      {/* Saved Subjects List */}
      <div className="divide-y divide-slate-50 max-h-[200px] overflow-y-auto">
        {savedSubjectsForTerm.length === 0 ? (
          <div className="px-4 py-5 text-center text-slate-400 text-xs">
            No subjects added yet
          </div>
        ) : (
          savedSubjectsForTerm.map((subject, index) => (
            <div
              key={subject.id}
              className="flex items-center justify-between px-4 py-2 hover:bg-slate-50/80 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium
                               flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-slate-700 text-xs font-medium truncate">{subject.name}</span>
              </div>
              <button
                onClick={() => onDeleteSubject(subject.id)}
                className="text-slate-300 hover:text-red-500 p-1 rounded-md opacity-0 group-hover:opacity-100
                           transition-all flex-shrink-0 hover:bg-red-50"
                title="Remove subject"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SubjectManager;
