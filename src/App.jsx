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

  // Load tasks on mount
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

  // Add a new task
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

  // Change status
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

  // Delete a task
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
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-6 lg:p-8">
      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between fade-in">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Top Section: Status bar + Title + Chart */}
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          {/* Left: Status bar */}
          <div className="flex flex-col gap-4">
            <StatusBar tasks={tasks} />
          </div>

          {/* Center: Title */}
          <div className="text-center flex-1 min-w-[200px]">
            <h1 className="font-title text-4xl md:text-5xl text-gray-800 mb-1">Task Manager</h1>
            <p className="text-gray-400 text-sm">Powered by Google Sheets</p>
          </div>

          {/* Right: Donut chart */}
          <div>
            <StatusChart tasks={tasks} />
          </div>
        </div>

        {/* Add Task Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white
                       bg-gradient-to-r from-pink-400 to-rose-400
                       hover:from-pink-500 hover:to-rose-500
                       shadow-sm hover:shadow-md transition-all active:scale-95
                       flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Task
          </button>
        </div>

        {/* Main content: Table + Subject List */}
        <div className="flex gap-4 items-start">
          {/* Table (main area) */}
          <div className="flex-1 min-w-0">
            <TaskTable
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          </div>

          {/* Subject sidebar */}
          <div className="w-[180px] flex-shrink-0 hidden lg:block">
            <SubjectList tasks={tasks} />
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
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
