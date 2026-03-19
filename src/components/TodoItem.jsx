import { useState } from 'react';

function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveEdit = () => {
    if (editText.trim() && editText.trim() !== todo.text) {
      onEdit(todo.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') handleCancelEdit();
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(todo.id), 300);
  };

  return (
    <div
      className={`group flex items-center gap-4 px-5 py-4 rounded-2xl
                   bg-white/[0.03] border border-white/[0.06]
                   hover:bg-white/[0.06] hover:border-white/10
                   transition-all duration-300 todo-item-enter
                   ${isDeleting ? 'todo-item-exit' : ''}
                   ${todo.completed ? 'opacity-60' : ''}`}
    >
      {/* Checkbox */}
      <button
        id={`toggle-${todo.id}`}
        onClick={() => onToggle(todo.id, !todo.completed)}
        className={`relative flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all duration-300 
                     flex items-center justify-center
                     ${todo.completed
                       ? 'bg-gradient-to-br from-violet-500 to-indigo-500 border-violet-500 shadow-lg shadow-violet-500/30'
                       : 'border-white/20 hover:border-violet-400/60'}`}
      >
        {todo.completed && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-white check-animation"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Text / Edit Input */}
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 px-3 py-1.5 rounded-lg bg-white/10 border border-violet-500/30
                       text-white text-base focus:outline-none focus:border-violet-500/60
                       focus:ring-1 focus:ring-violet-500/20"
          />
          <button
            onClick={handleSaveEdit}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-400
                       bg-emerald-400/10 hover:bg-emerald-400/20 transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleCancelEdit}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/50
                       hover:text-white/80 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <span
          onDoubleClick={() => { if (!todo.completed) setIsEditing(true); }}
          className={`flex-1 text-left text-base cursor-default select-none transition-all duration-300
                       ${todo.completed ? 'line-through text-white/30' : 'text-white/90'}`}
          title={todo.completed ? '' : 'Double-click to edit'}
        >
          {todo.text}
        </span>
      )}

      {/* Action Buttons */}
      {!isEditing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!todo.completed && (
            <button
              id={`edit-${todo.id}`}
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg text-white/30 hover:text-violet-400 hover:bg-violet-400/10 transition-all"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          )}
          <button
            id={`delete-${todo.id}`}
            onClick={handleDelete}
            className="p-2 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default TodoItem;
