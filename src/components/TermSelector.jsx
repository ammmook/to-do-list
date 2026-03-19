import { AVAILABLE_ACADEMIC_YEARS, AVAILABLE_SEMESTERS } from '../data/academicConfig';

/**
 * TermSelector — Academic Year & Semester picker for the sidebar.
 *
 * WHY stacked layout instead of inline:
 * In the sidebar, horizontal space is limited. Stacking year and semester
 * vertically gives each control full width, making them easier to tap
 * and visually cleaner in a narrow column.
 */
function TermSelector({ selectedAcademicYear, selectedSemester, onTermChange }) {
  const selectorClassName =
    'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 ' +
    'focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 ' +
    'bg-white transition-all cursor-pointer appearance-none';

  const handleYearChange = (event) => {
    const newYear = Number(event.target.value);
    onTermChange(newYear, selectedSemester);
  };

  const handleSemesterChange = (event) => {
    const newSemester = Number(event.target.value);
    onTermChange(selectedAcademicYear, newSemester);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
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
