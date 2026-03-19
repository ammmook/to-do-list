import { AVAILABLE_ACADEMIC_YEARS, AVAILABLE_SEMESTERS } from '../data/academicConfig';

/**
 * TermSelector — Academic Year & Semester picker.
 *
 * WHY separate component:
 * This selector controls which "slice" of data the user sees.
 * Isolating it makes it reusable and keeps App.jsx focused on orchestration.
 */
function TermSelector({ selectedAcademicYear, selectedSemester, onTermChange }) {
  const selectorClassName =
    'px-3 py-1.5 rounded-md border border-slate-300 text-sm text-slate-900 ' +
    'focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 ' +
    'bg-white transition-all cursor-pointer';

  const handleYearChange = (event) => {
    const newYear = Number(event.target.value);
    onTermChange(newYear, selectedSemester);
  };

  const handleSemesterChange = (event) => {
    const newSemester = Number(event.target.value);
    onTermChange(selectedAcademicYear, newSemester);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <label htmlFor="academic-year-select" className="text-xs font-medium text-slate-500 uppercase tracking-wide">
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

      <div className="flex items-center gap-1.5">
        <label htmlFor="semester-select" className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Semester
        </label>
        <select
          id="semester-select"
          value={selectedSemester}
          onChange={handleSemesterChange}
          className={selectorClassName}
        >
          {AVAILABLE_SEMESTERS.map((sem) => (
            <option key={sem} value={sem}>{sem}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default TermSelector;
