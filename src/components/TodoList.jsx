import TodoItem from './TodoItem';

function TodoList({ todos, onToggle, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-10 h-10 border-3 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-white/30 text-sm">Loading your todos...</p>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="text-6xl mb-2">✨</div>
        <p className="text-white/40 text-lg font-medium">No todos here</p>
        <p className="text-white/20 text-sm">Add a task above to get started!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {todos.map((todo, index) => (
        <div key={todo.id} style={{ animationDelay: `${index * 50}ms` }}>
          <TodoItem
            todo={todo}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}

export default TodoList;
