import { useState, useEffect, useCallback, useMemo } from 'react'
import TermSelector from './components/TermSelector'
import StatusBar from './components/StatusBar'
import StatusChart from './components/StatusChart'
import SubjectManager from './components/SubjectManager'
import TaskTable from './components/TaskTable'
import TaskForm from './components/TaskForm'
import {
  fetchTodos, addTodo, updateTodo, deleteTodo,
  fetchSavedSubjects, saveNewSubject, removeSubject
} from './services/googleSheetsApi'
import { AVAILABLE_ACADEMIC_YEARS, AVAILABLE_SEMESTERS } from './data/academicConfig'
import './App.css'

function App() {
  // ─── Term Selection State ──────────────────────────────────────
  // Default to the latest available year and first semester
  const defaultAcademicYear = AVAILABLE_ACADEMIC_YEARS[AVAILABLE_ACADEMIC_YEARS.length - 1]
  const defaultSemester = AVAILABLE_SEMESTERS[0]

  const [selectedAcademicYear, setSelectedAcademicYear] = useState(defaultAcademicYear)
  const [selectedSemester, setSelectedSemester] = useState(defaultSemester)

  // ─── Task State ────────────────────────────────────────────────
  // allTasks holds every task from Google Sheets, regardless of term.
  // We filter it client-side based on the selected Year + Semester.
  const [allTasks, setAllTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)

  // ─── Subject State ─────────────────────────────────────────────
  // allSavedSubjects holds every subject from the "Subjects" sheet tab.
  // We filter it client-side to show only subjects for the selected term.
  const [allSavedSubjects, setAllSavedSubjects] = useState([])

  // ─── Derived Data ──────────────────────────────────────────────

  // Tasks isolated to the currently selected academic term
  const tasksForSelectedTerm = useMemo(() => {
    return allTasks.filter((task) => {
      const matchesYear = String(task.academicYear) === String(selectedAcademicYear)
      const matchesSemester = String(task.semester) === String(selectedSemester)
      return matchesYear && matchesSemester
    })
  }, [allTasks, selectedAcademicYear, selectedSemester])

  // Subjects saved for the currently selected term only
  const savedSubjectsForSelectedTerm = useMemo(() => {
    return allSavedSubjects.filter((subject) => {
      const matchesYear = String(subject.academicYear) === String(selectedAcademicYear)
      const matchesSemester = String(subject.semester) === String(selectedSemester)
      return matchesYear && matchesSemester
    })
  }, [allSavedSubjects, selectedAcademicYear, selectedSemester])

  // ─── Data Loading ──────────────────────────────────────────────
  // Load both tasks and subjects in parallel on mount
  const loadAllData = useCallback(async () => {
    try {
      setError(null)
      const [tasksData, subjectsData] = await Promise.all([
        fetchTodos(),
        fetchSavedSubjects()
      ])
      setAllTasks(tasksData)
      setAllSavedSubjects(subjectsData)
    } catch (err) {
      setError('Failed to load data. Please check your connection.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // ─── Term Event Handler ────────────────────────────────────────

  const handleTermChange = (newYear, newSemester) => {
    setSelectedAcademicYear(newYear)
    setSelectedSemester(newSemester)
  }

  // ─── Task Event Handlers ───────────────────────────────────────

  const handleAddTask = async (formData) => {
    setIsSyncing(true)
    try {
      // Attach the currently selected term so the task is scoped correctly
      const taskDataWithTerm = {
        ...formData,
        academicYear: selectedAcademicYear,
        semester: selectedSemester,
      }
      const newTask = await addTodo(taskDataWithTerm)
      setAllTasks(previousTasks => [newTask, ...previousTasks])
    } catch (err) {
      setError('Failed to add task.')
      console.error(err)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    const previousTasks = [...allTasks]
    // Optimistic update: apply the change immediately for a responsive UI
    setAllTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
    try {
      await updateTodo(taskId, { status: newStatus })
    } catch (err) {
      // Revert to the previous state if the API call fails
      setAllTasks(previousTasks)
      setError('Failed to update status.')
      console.error(err)
    }
  }

  const handleDeleteTask = async (taskId) => {
    const previousTasks = [...allTasks]
    setAllTasks(prev => prev.filter(task => task.id !== taskId))
    try {
      await deleteTodo(taskId)
    } catch (err) {
      setAllTasks(previousTasks)
      setError('Failed to delete task.')
      console.error(err)
    }
  }

  // ─── Subject Event Handlers ────────────────────────────────────

  const handleAddSubject = async (subjectName) => {
    try {
      const savedSubject = await saveNewSubject(
        subjectName,
        selectedAcademicYear,
        selectedSemester
      )
      setAllSavedSubjects(previousSubjects => [...previousSubjects, savedSubject])
    } catch (err) {
      setError('Failed to save subject.')
      console.error(err)
    }
  }

  const handleDeleteSubject = async (subjectId) => {
    const previousSubjects = [...allSavedSubjects]
    setAllSavedSubjects(prev => prev.filter(s => s.id !== subjectId))
    try {
      await removeSubject(subjectId)
    } catch (err) {
      setAllSavedSubjects(previousSubjects)
      setError('Failed to remove subject.')
      console.error(err)
    }
  }

  // ─── Render ────────────────────────────────────────────────────
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
        {/* Header: Title + Term selector + Status + New Task button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-1">Tasks</h1>
            <p className="text-slate-500 text-sm">Manage your academic priorities seamlessly.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <TermSelector
              selectedAcademicYear={selectedAcademicYear}
              selectedSemester={selectedSemester}
              onTermChange={handleTermChange}
            />
            <StatusBar tasks={tasksForSelectedTerm} />
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

        {/* Main content: Table + Sidebar */}
        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0">
            <TaskTable
              tasks={tasksForSelectedTerm}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
              isLoading={isLoading}
            />
          </div>
          <div className="w-[220px] flex-shrink-0 hidden lg:block">
            <SubjectManager
              savedSubjectsForTerm={savedSubjectsForSelectedTerm}
              onAddSubject={handleAddSubject}
              onDeleteSubject={handleDeleteSubject}
            />
            <div className="mt-6">
              <StatusChart tasks={tasksForSelectedTerm} />
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <TaskForm
          savedSubjectsList={savedSubjectsForSelectedTerm}
          onAdd={handleAddTask}
          onClose={() => setShowForm(false)}
          isLoading={isSyncing}
        />
      )}
    </div>
  )
}

export default App