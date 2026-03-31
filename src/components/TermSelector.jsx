import { AVAILABLE_ACADEMIC_YEARS, AVAILABLE_SEMESTERS } from '../data/academicConfig';

/**
 * TermSelector — Academic Year & Semester picker for the sidebar.
 *
 * WHY stacked layout instead of inline:
 * In the sidebar, horizontal space is limited. Stacking year and semester
 * vertically gives each control full width, making them easier to tap
 * and visually cleaner in a narrow column.
 */
function TermSelector({ selectedAcademicYear, selectedSemester, onTermChange, variant = 'default' }) {
  const selectorClassName = variant === 'compact'
    ? "bg-transparent text-xs font-bold text-slate-900 cursor-pointer focus:outline-none appearance-none pr-4"
    : "interactive-input cursor-pointer appearance-none";

  const handleYearChange = (event) => {
    const newYear = Number(event.target.value);
    onTermChange(newYear, selectedSemester);
  };

  const handleSemesterChange = (event) => {
    const newSemester = Number(event.target.value);
    onTermChange(selectedAcademicYear, newSemester);
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1 bg-slate-100/80 rounded-full px-3 py-1.5 border border-slate-200/50 shadow-sm">
        <div className="relative flex items-center">
          <select
            value={selectedAcademicYear}
            onChange={handleYearChange}
            className={selectorClassName}
          >
            {AVAILABLE_ACADEMIC_YEARS.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <div className="absolute right-0 pointer-events-none text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="w-px h-3 bg-slate-300 mx-1" />
        <div className="relative flex items-center">
          <select
            value={selectedSemester}
            onChange={handleSemesterChange}
            className={selectorClassName}
          >
            {AVAILABLE_SEMESTERS.map((sem) => (
              <option key={sem} value={sem}>Sem {sem}</option>
            ))}
          </select>
          <div className="absolute right-0 pointer-events-none text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="interactive-card hover-lift">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Academic Term
      </h3>

      <div className="space-y-3">
        <div>
          <label htmlFor="academic-year-select" className="block text-[11px] font-medium text-slate-400 mb-1">
            Year
          </label>
          <select
            id="academic-year-select"
            value={selectedAcademicYear}
            onChange={handleYearChange}
            className={selectorClassName}
          >
            {AVAILABLE_ACADEMIC_YEARS.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="semester-select" className="block text-[11px] font-medium text-slate-400 mb-1">
            Semester
          </label>
          <select
            id="semester-select"
            value={selectedSemester}
            onChange={handleSemesterChange}
            className={selectorClassName}
          >
            {AVAILABLE_SEMESTERS.map((sem) => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default TermSelector;
