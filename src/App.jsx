import { useState, useEffect, useCallback, useMemo } from 'react'
import LoginScreen from './components/LoginScreen'
import TermSelector from './components/TermSelector'
import StatusSummaryCards from './components/StatusBar'
import StatusChart from './components/StatusChart'
import SubjectManager from './components/SubjectManager'
import TaskTable from './components/TaskTable'
import TaskForm from './components/TaskForm'

import {
  fetchTodosForUser, addTodoWithUserEmail, updateTodoWithUserEmail, deleteTodoWithUserEmail,
  fetchSavedSubjectsForUser, saveNewSubjectWithUserEmail, removeSubjectWithUserEmail
} from './services/googleSheetsApi'

import {
  isAuthenticated, saveAccessToken, saveUserProfile, getUserProfile, clearAuth
} from './services/authService'

import { AVAILABLE_ACADEMIC_YEARS, AVAILABLE_SEMESTERS } from './data/academicConfig'
import './App.css'

function App() {
  // ─── Auth State ────────────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated())
  const [userProfile, setUserProfile] = useState(getUserProfile())

  // ─── Term Selection State ──────────────────────────────────────
  const defaultAcademicYear = AVAILABLE_ACADEMIC_YEARS[AVAILABLE_ACADEMIC_YEARS.length - 1]
  const defaultSemester = AVAILABLE_SEMESTERS[0]
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(defaultAcademicYear)
  const [selectedSemester, setSelectedSemester] = useState(defaultSemester)

  // ─── Data State ────────────────────────────────────────────────
  const [allTasks, setAllTasks] = useState([])
  const [allSavedSubjects, setAllSavedSubjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState(null)

  // ─── UI State ──────────────────────────────────────────────────
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // ─── Derived Data ──────────────────────────────────────────────
  const tasksForSelectedTerm = useMemo(() => {
    return allTasks.filter((task) => {
      const matchesYear = String(task.academicYear) === String(selectedAcademicYear)
      const matchesSemester = String(task.semester) === String(selectedSemester)
      return matchesYear && matchesSemester
    })
  }, [allTasks, selectedAcademicYear, selectedSemester])

  const savedSubjectsForSelectedTerm = useMemo(() => {
    return allSavedSubjects.filter((subject) => {
      const matchesYear = String(subject.academicYear) === String(selectedAcademicYear)
      const matchesSemester = String(subject.semester) === String(selectedSemester)
      return matchesYear && matchesSemester
    })
  }, [allSavedSubjects, selectedAcademicYear, selectedSemester])

  // ─── Data Loading ──────────────────────────────────────────────
  const loadAllData = useCallback(async () => {
    if (!isLoggedIn || !userProfile.email) return;

    setIsLoading(true);
    try {
      setError(null)
      // Secure Data Handling: Only fetch data bound to the logged-in email
      const [tasksData, subjectsData] = await Promise.all([
        fetchTodosForUser(userProfile.email),
        fetchSavedSubjectsForUser(userProfile.email)
      ])
      setAllTasks(tasksData)
      setAllSavedSubjects(subjectsData)
    } catch (err) {
      setError('Failed to load data. Please check your connection.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, userProfile.email])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // ─── Auth Handlers ─────────────────────────────────────────────
  const handleLoginSuccess = (credential) => {
    saveAccessToken(credential);
    const profile = saveUserProfile(credential);
    setUserProfile(profile);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    clearAuth();
    setIsLoggedIn(false);
    setAllTasks([]);
    setAllSavedSubjects([]);
    setUserProfile({ name: 'User', email: '', picture: '' });
  };

  // ─── Term Handler ──────────────────────────────────────────────
  const handleTermChange = (newYear, newSemester) => {
    setSelectedAcademicYear(newYear)
    setSelectedSemester(newSemester)
  }

  // ─── Task Handlers ─────────────────────────────────────────────
  const handleAddTask = async (formData) => {
    setIsSyncing(true)
    try {
      const taskDataWithTerm = {
        ...formData,
        academicYear: selectedAcademicYear,
        semester: selectedSemester,
      }
      // Secure Data Handling: Append user email on save
      const newTask = await addTodoWithUserEmail(taskDataWithTerm, userProfile.email)
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
    setAllTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
    try {
      await updateTodoWithUserEmail(taskId, { status: newStatus }, userProfile.email)
    } catch (err) {
      setAllTasks(previousTasks)
      setError('Failed to update status.')
      console.error(err)
    }
  }

  const handleDeleteTask = async (taskId) => {
    const previousTasks = [...allTasks]
    setAllTasks(prev => prev.filter(task => task.id !== taskId))
    try {
      await deleteTodoWithUserEmail(taskId, userProfile.email)
    } catch (err) {
      setAllTasks(previousTasks)
      setError('Failed to delete task.')
      console.error(err)
    }
  }

  // ─── Subject Handlers ──────────────────────────────────────────
  const handleAddSubject = async (subjectName) => {
    try {
      // Secure Data Handling: Append user email on save
      const savedSubject = await saveNewSubjectWithUserEmail(
        subjectName,
        selectedAcademicYear,
        selectedSemester,
        userProfile.email
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
      await removeSubjectWithUserEmail(subjectId, userProfile.email)
    } catch (err) {
      setAllSavedSubjects(previousSubjects)
      setError('Failed to remove subject.')
      console.error(err)
    }
  }

  // ─── Render Authentication Gate ────────────────────────────────
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />
  }

  // ─── Render Dashboard ──────────────────────────────────────────
  return (
    <div className="dashboard-container font-sans">
      
      {/* ═══════════ MOBILE HEADER (Visible only on small screens) ═══════════ */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm cursor-pointer" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">Task Manager</h1>
            <p className="text-[10px] text-slate-500">Academic Dashboard</p>
          </div>
        </div>
        
        {/* Mobile Menu Toggle & User Avatar */}
        <div className="flex items-center gap-3">
          {userProfile.picture ? (
            <img src={userProfile.picture} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
          )}
          <button 
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors button-pop"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* ═══════════ LEFT SIDEBAR ═══════════
       * Uses the semantic .dashboard-sidebar class.
       */}
      <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'flex absolute z-10 w-full shadow-md' : 'hidden md:flex relative'}`}>

        {/* Desktop Branding (Hidden on mobile via header) */}
        <div className="hidden md:block mb-1 fade-in">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Task Manager</h1>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100 fade-in stagger-1 hover-lift">
          <div className="flex items-center gap-3 overflow-hidden">
            {userProfile.picture ? (
              <img src={userProfile.picture} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 flex-shrink-0 hidden md:block" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold hidden md:flex">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{userProfile.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{userProfile.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors flex-shrink-0 button-pop cursor-pointer"
            title="Sign Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        <div className="fade-in stagger-2">
          {/* Term Selector */}
          <TermSelector
            selectedAcademicYear={selectedAcademicYear}
            selectedSemester={selectedSemester}
            onTermChange={handleTermChange}
          />
        </div>

        <div className="fade-in stagger-3">
          {/* Subject Manager */}
          <SubjectManager
            savedSubjectsForTerm={savedSubjectsForSelectedTerm}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        </div>

        {/* Status Chart (Hidden on mobile sidebar to save vertical space, shown in main content instead) */}
        <div className="hidden md:block">
          <StatusChart tasks={tasksForSelectedTerm} />
        </div>

        <div className="flex-1 hidden md:block" />
        <div className="text-[10px] text-slate-300 text-center pb-1 hidden md:block">
          Synced with Google Sheets
        </div>
      </aside>

      {/* Overlay to catch clicks and close mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 z-[5] md:hidden backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ═══════════ MAIN CONTENT AREA ═══════════
       * Powered by .dashboard-main CSS
       */}
      <main className="dashboard-main fade-in stagger-1">

        {/* Error Banner */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between fade-in hover-lift">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 ml-3 transition-colors p-1 rounded-md hover:bg-red-100 button-pop cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Main Header — Title + Action button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-in">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Year {selectedAcademicYear} · Semester {selectedSemester}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {tasksForSelectedTerm.length} task{tasksForSelectedTerm.length !== 1 ? 's' : ''} in this term
            </p>
          </div>

          <button
            onClick={() => setShowTaskForm(true)}
            className="w-full sm:w-auto interactive-button fade-in hover-lift"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Task
          </button>
        </div>

        {/* Status Summary Cards (Stacks on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 fade-in stagger-2">
          <StatusSummaryCards tasks={tasksForSelectedTerm} />
        </div>

        {/* Task Table */}
        <div className="fade-in stagger-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover-lift flex-1 min-h-[400px]">
          <TaskTable
            tasks={tasksForSelectedTerm}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteTask}
            isLoading={isLoading}
          />
        </div>

        {/* Mobile-only Status Chart */}
        <div className="md:hidden">
          <StatusChart tasks={tasksForSelectedTerm} />
          <div className="text-[10px] text-slate-300 text-center mt-6">
            Synced with Google Sheets
          </div>
        </div>

      </main>

      {/* ═══════════ TASK FORM MODAL ═══════════ */}
      {showTaskForm && (
        <TaskForm
          savedSubjectsList={savedSubjectsForSelectedTerm}
          onAdd={handleAddTask}
          onClose={() => setShowTaskForm(false)}
          isLoading={isSyncing}
        />
      )}
    </div>
  )
}

export default App