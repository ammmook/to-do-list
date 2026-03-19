import { useState, useEffect, useCallback } from 'react'
import TodoInput from './components/TodoInput'
import TodoList from './components/TodoList'
import TodoFilter from './components/TodoFilter'
import { fetchTodos, addTodo, updateTodo, deleteTodo } from './services/googleSheetsApi'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)

  // Load todos on mount
  const loadTodos = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchTodos()
      setTodos(data)
    } catch (err) {
      setError('Failed to load todos. Please check your connection.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  // Add a new todo
  const handleAdd = async (text) => {
    setIsSyncing(true)
    try {
      const newTodo = await addTodo(text)
      setTodos(prev => [newTodo, ...prev])
    } catch (err) {
      setError('Failed to add todo.')
      console.error(err)
    } finally {
      setIsSyncing(false)
    }
  }

  // Toggle todo completion
  const handleToggle = async (id, completed) => {
    // Optimistic update
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed } : t))
    try {
      await updateTodo(id, { completed })
    } catch (err) {
      // Revert on error
      setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t))
      setError('Failed to update todo.')
      console.error(err)
    }
  }

  // Edit todo text
  const handleEdit = async (id, text) => {
    const oldTodo = todos.find(t => t.id === id)
    // Optimistic update
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text } : t))
    try {
      await updateTodo(id, { text })
    } catch (err) {
      // Revert on error
      setTodos(prev => prev.map(t => t.id === id ? { ...t, text: oldTodo.text } : t))
      setError('Failed to edit todo.')
      console.error(err)
    }
  }

  // Delete a todo
  const handleDelete = async (id) => {
    const oldTodos = [...todos]
    setTodos(prev => prev.filter(t => t.id !== id))
    try {
      await deleteTodo(id)
    } catch (err) {
      setTodos(oldTodos)
      setError('Failed to delete todo.')
      console.error(err)
    }
  }

  // Clear all completed
  const handleClearCompleted = async () => {
    const completedTodos = todos.filter(t => t.completed)
    const oldTodos = [...todos]
    setTodos(prev => prev.filter(t => !t.completed))
    try {
      await Promise.all(completedTodos.map(t => deleteTodo(t.id)))
    } catch (err) {
      setTodos(oldTodos)
      setError('Failed to clear completed todos.')
      console.error(err)
    }
  }

  // Filter todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const counts = {
    all: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-violet-300 text-xs font-medium tracking-wider uppercase">
              {isSyncing ? 'Syncing...' : 'Synced with Google Sheets'}
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-violet-200 to-indigo-200 bg-clip-text text-transparent mb-3 tracking-tight">
            To-Do List
          </h1>
          <p className="text-white/30 text-base">
            Organize your tasks, powered by Google Sheets
          </p>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 px-5 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-3 fade-in">
            <p className="text-rose-300 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-rose-400/60 hover:text-rose-400 transition-colors flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20">
          <TodoInput onAdd={handleAdd} isLoading={isSyncing} />

          {!isLoading && todos.length > 0 && (
            <TodoFilter
              filter={filter}
              onFilterChange={setFilter}
              counts={counts}
              onClearCompleted={handleClearCompleted}
            />
          )}

          <TodoList
            todos={filteredTodos}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-white/15 text-xs">
          <p>Double-click a task to edit · Data stored in Google Sheets</p>
        </footer>
      </div>
    </div>
  )
}

export default App
