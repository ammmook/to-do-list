import { useState, useEffect, useCallback, useMemo } from 'react'
import LoginScreen from './components/LoginScreen'
import TermSelector from './components/TermSelector'
import StatusSummaryCards from './components/StatusBar'
import StatusChart from './components/StatusChart'
import SubjectManager from './components/SubjectManager'
import TaskTable from './components/TaskTable'
import TaskForm from './components/TaskForm'
import LoadingDots from './components/LoadingDots'
import ConfirmationModal from './components/ConfirmationModal'

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
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showLogoutMenu, setShowLogoutMenu] = useState(false)
  const [isAddingSubject, setIsAddingSubject] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [subjectToDelete, setSubjectToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleDeleteTask = (taskId) => {
    setTaskToDelete(taskId)
  }

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return
    setIsDeleting(true)
    const previousTasks = [...allTasks]
    setAllTasks(prev => prev.filter(task => task.id !== taskToDelete))
    try {
      await deleteTodoWithUserEmail(taskToDelete, userProfile.email)
    } catch (err) {
      setAllTasks(previousTasks)
      setError('Failed to delete task.')
      console.error(err)
    } finally {
      setIsDeleting(false)
      setTaskToDelete(null)
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
      return true
    } catch (err) {
      setError('Failed to save subject.')
      console.error(err)
      return false
    }
  }

  const handleMobileAddSubject = async () => {
    if (!newSubjectName.trim()) return
    setIsAddingSubject(true)
    const success = await handleAddSubject(newSubjectName.trim())
    if (success) {
      setNewSubjectName('')
      // Success! Subject is added to the list. Modal stays open as requested.
    }
    setIsAddingSubject(false)
  }

  const handleDeleteSubject = (subjectId) => {
    setSubjectToDelete(subjectId)
  }

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return
    setIsDeleting(true)
    const previousSubjects = [...allSavedSubjects]
    setAllSavedSubjects(prev => prev.filter(s => s.id !== subjectToDelete))
    try {
      await removeSubjectWithUserEmail(subjectToDelete, userProfile.email)
    } catch (err) {
      setAllSavedSubjects(previousSubjects)
      setError('Failed to remove subject.')
      console.error(err)
    } finally {
      setIsDeleting(false)
      setSubjectToDelete(null)
    }
  }

  // ─── Render Authentication Gate ────────────────────────────────
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />
  }

  // ─── Render Dashboard ──────────────────────────────────────────
  return (
    <div className="dashboard-container !flex !flex-col md:!grid md:!grid-cols-[280px_1fr] max-w-full overflow-x-hidden">
      
      {/* ═══════════ MOBILE HEADER (Visible only on small screens) ═══════════ */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-sm font-bold text-slate-900">Task Manager</h1>
        </div>
        
        <div className="flex items-center gap-2.5 relative">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-bold text-slate-900 leading-tight">{userProfile.name}</p>
            <p className="text-[9px] text-slate-500 leading-tight truncate max-w-[120px]">{userProfile.email}</p>
          </div>
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
          >
            {userProfile.picture ? (
              <img src={userProfile.picture} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-slate-400 transition-transform ${showLogoutMenu ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>

          {showLogoutMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowLogoutMenu(false)} />
              <div className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1 fade-in">
                <div className="px-3 py-2 border-b border-slate-50 sm:hidden">
                  <p className="text-[11px] font-bold text-slate-900 leading-tight truncate">{userProfile.name}</p>
                  <p className="text-[9px] text-slate-500 leading-tight truncate">{userProfile.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ═══════════ LEFT SIDEBAR ═══════════
       * Uses the semantic .dashboard-sidebar class.
       */}
      <aside className="dashboard-sidebar hidden md:flex relative border-r border-slate-200">

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
        <div className="hidden md:flex bg-slate-50 rounded-xl p-3 items-center justify-between border border-slate-100 fade-in stagger-1 hover-lift">
          <div className="flex items-center gap-3 overflow-hidden">
            {userProfile.picture ? (
              <img src={userProfile.picture} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
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

        <div className="fade-in stagger-2 hidden md:block">
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

      {/* ═══════════ MAIN CONTENT AREA ═══════════
       * Powered by .dashboard-main CSS
       */}
      <main className="dashboard-main fade-in stagger-1">

        {/* Mobile Controls (Term + Add Subject) */}
        <div className="md:hidden flex items-center justify-between gap-3 mb-2">
          <TermSelector
            selectedAcademicYear={selectedAcademicYear}
            selectedSemester={selectedSemester}
            onTermChange={handleTermChange}
            variant="compact"
          />
          <button
            onClick={() => setShowSubjectModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-700 shadow-sm active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Subject
          </button>
        </div>

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

        {/* Status Summary Cards (Fit width on mobile) */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4 fade-in stagger-2">
          <StatusSummaryCards tasks={tasksForSelectedTerm} />
        </div>

        {/* Overview (Status Chart) — Moved closer to cards on mobile */}
        <div className="md:hidden fade-in stagger-3">
          <StatusChart tasks={tasksForSelectedTerm} />
        </div>

        {/* Task Table */}
        <div className="fade-in stagger-3 w-full">
          <TaskTable
            tasks={tasksForSelectedTerm}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteTask}
            isLoading={isLoading}
          />
        </div>

        <div className="text-[10px] text-slate-300 text-center mt-6">
          Synced with Google Sheets
        </div>

      </main>

      {/* ═══════════ SUBJECT MODAL (Mobile only) ═══════════ */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm modal-overlay" onClick={() => setShowSubjectModal(false)}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl modal-content flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-900">Manage Subjects</h3>
                <button onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100 cursor-pointer button-pop">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-5">Add or remove subjects for this term.</p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Mathematics"
                  autoFocus
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
                <button 
                  onClick={handleMobileAddSubject} 
                  disabled={isAddingSubject || !newSubjectName.trim()} 
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl disabled:opacity-50 active:scale-95 transition-transform flex items-center justify-center min-w-[60px]"
                >
                  {isAddingSubject ? <LoadingDots /> : 'Add'}
                </button>
              </div>
            </div>

            {/* Subject List inside Modal */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
              <div className="divide-y divide-slate-50 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30">
                {savedSubjectsForSelectedTerm.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-400 text-xs italic">
                    No subjects added yet
                  </div>
                ) : (
                  savedSubjectsForSelectedTerm.map((subject, index) => (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between px-4 py-3 bg-white"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-slate-700 text-xs font-semibold truncate">{subject.name}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg transition-colors flex-shrink-0 active:scale-90"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/30 rounded-b-2xl">
              <button onClick={() => setShowSubjectModal(false)} className="w-full py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ TASK FORM MODAL ═══════════ */}
      {showTaskForm && (
        <TaskForm
          savedSubjectsList={savedSubjectsForSelectedTerm}
          onAdd={handleAddTask}
          onClose={() => setShowTaskForm(false)}
          isLoading={isSyncing}
        />
      )}

      {/* ═══════════ DELETE TASK CONFIRMATION ═══════════ */}
      {taskToDelete && (
        <ConfirmationModal
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          onConfirm={confirmDeleteTask}
          onCancel={() => setTaskToDelete(null)}
          isLoading={isDeleting}
        />
      )}

      {/* ═══════════ DELETE SUBJECT CONFIRMATION ═══════════ */}
      {subjectToDelete && (
        <ConfirmationModal
          title="Remove Subject"
          message="Are you sure you want to remove this subject? It will no longer be selectable for new tasks."
          onConfirm={confirmDeleteSubject}
          onCancel={() => setSubjectToDelete(null)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

export default App