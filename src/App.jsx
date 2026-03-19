import { useState, useEffect, useCallback } from 'react'
import StatusBar from './components/StatusBar'
import StatusChart from './components/StatusChart'
import SubjectList from './components/SubjectList'
import TaskTable from './components/TaskTable'
import TaskForm from './components/TaskForm'
import { fetchTodos, addTodo, updateTodo, deleteTodo } from './services/googleSheetsApi'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const loadTasks = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchTodos()
      setTasks(data)
    } catch (err) {
      setError('Failed to load tasks. Please check your connection.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const handleAdd = async (formData) => {
    setIsSyncing(true)
    try {
      const newTask = await addTodo(formData)
      setTasks(prev => [newTask, ...prev])
    } catch (err) {
      setError('Failed to add task.')
      console.error(err)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleStatusChange = async (id, status) => {
    const oldTasks = [...tasks]
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    try {
      await updateTodo(id, { status })
    } catch (err) {
      setTasks(oldTasks)
      setError('Failed to update status.')
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    const oldTasks = [...tasks]
    setTasks(prev => prev.filter(t => t.id !== id))
    try {
      await deleteTodo(id)
    } catch (err) {
      setTasks(oldTasks)
      setError('Failed to delete task.')
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {error && (
        <div className="max-w-7xl mx-auto mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-100 flex items-center justify-between fade-in">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-3 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-1">Tasks</h1>
            <p className="text-slate-500 text-sm">Manage your daily priorities seamlessly.</p>
          </div>

          <div className="flex items-center gap-4">
            <StatusBar tasks={tasks} />
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-md text-sm font-medium text-white
                         bg-slate-900 hover:bg-slate-800 
                         shadow-sm transition-all duration-200 active:scale-[0.98]
                         flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Task
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0">
            <TaskTable
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          </div>
          <div className="w-[220px] flex-shrink-0 hidden lg:block">
            <SubjectList tasks={tasks} />
            <div className="mt-6">
              <StatusChart tasks={tasks} />
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <TaskForm
          onAdd={handleAdd}
          onClose={() => setShowForm(false)}
          isLoading={isSyncing}
        />
      )}
    </div>
  )
}

export default App