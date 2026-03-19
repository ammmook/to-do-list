/**
 * SubjectList — Shows unique subjects extracted from the current term's tasks.
 *
 * WHY extracted from tasks instead of a config:
 * Subjects are free-text and user-defined. The sidebar reflects what
 * subjects the user has actually created tasks for, giving them an
 * at-a-glance view of their active course load for the selected term.
 */
function SubjectList({ tasks }) {
  // Extract unique, non-empty subject names from actual task data
  const uniqueSubjectNames = [...new Set(
    tasks
      .map(task => task.subject)
      .filter(subjectName => subjectName && subjectName.trim() !== '')
  )];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subjects</h3>
      </div>
      <div className="divide-y divide-slate-50">
        {uniqueSubjectNames.length === 0 ? (
          <div className="px-4 py-4 text-center text-slate-400 text-xs">
            No subjects in this term yet
          </div>
        ) : (
          uniqueSubjectNames.map((subjectName, index) => (
            <div
              key={subjectName}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50/50 transition-colors"
            >
              <span className="text-xs text-slate-400 w-5 text-right">{index + 1}</span>
              <span className="text-slate-700 font-medium text-xs truncate">{subjectName}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SubjectList;
