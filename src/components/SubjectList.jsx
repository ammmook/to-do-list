function SubjectList({ tasks }) {
  // Get unique subjects
  const subjects = [...new Set(tasks.map(t => t.subject).filter(Boolean))];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="table-header">
            <th className="px-3 py-2 text-left text-white font-semibold text-xs">#</th>
            <th className="px-3 py-2 text-left text-white font-semibold text-xs">Subject</th>
          </tr>
        </thead>
        <tbody>
          {subjects.length === 0 ? (
            <tr>
              <td colSpan={2} className="px-3 py-4 text-center text-gray-400 text-xs">No subjects yet</td>
            </tr>
          ) : (
            subjects.map((subject, i) => (
              <tr key={subject} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="px-3 py-2 text-gray-400 text-xs">{i + 1}</td>
                <td className="px-3 py-2 text-gray-700 font-medium text-xs">{subject}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SubjectList;
