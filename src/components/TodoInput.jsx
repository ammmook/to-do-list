import { useState } from 'react';

function TodoInput({ onAdd, isLoading }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onAdd(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-3 mb-8">
      <div className="relative flex-1">
        <input
          id="todo-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
          disabled={isLoading}
          className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10
                     text-white placeholder-white/30 text-base
                     focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20
                     backdrop-blur-sm transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      <button
        id="add-todo-btn"
        type="submit"
        disabled={!text.trim() || isLoading}
        className="px-6 py-4 rounded-2xl font-semibold text-white text-base
                   bg-gradient-to-r from-violet-600 to-indigo-600
                   hover:from-violet-500 hover:to-indigo-500
                   active:scale-95 transition-all duration-200
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                   shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40
                   flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add
      </button>
    </form>
  );
}

export default TodoInput;
