export default function StudentRecordsPage() {
  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Academic Records
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Official transcripts, semester GPAs, and credit achievements.
          </p>
        </div>

        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-[var(--outline-variant)]">
            <div className="flex items-center gap-2">
              <i className="ti ti-certificate text-xl text-[var(--tertiary)]"></i>
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                Semester Transcript — Year 2 Semester 1
              </h3>
            </div>
            <button className="btn-secondary text-xs !py-1.5 shadow-sm">
              <i className="ti ti-file-text"></i> Download Official Transcript
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                  <th className="pb-3 px-3 font-semibold">Course Code</th>
                  <th className="pb-3 px-3 font-semibold">Course Name</th>
                  <th className="pb-3 px-3 font-semibold">Credits</th>
                  <th className="pb-3 px-3 font-semibold">Grade</th>
                  <th className="pb-3 px-3 font-semibold">Grade Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-variant)]">
                <tr className="table-row transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-[var(--on-surface)]">SE201.2</td>
                  <td className="py-3.5 px-3 text-[var(--on-surface)]">Data Structures & Algorithms</td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">4</td>
                  <td className="py-3.5 px-3"><span className="badge badge-success">A</span></td>
                  <td className="py-3.5 px-3 font-medium text-[var(--on-surface)]">4.00</td>
                </tr>
                <tr className="table-row transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-[var(--on-surface)]">SE202.2</td>
                  <td className="py-3.5 px-3 text-[var(--on-surface)]">Database Systems</td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">4</td>
                  <td className="py-3.5 px-3"><span className="badge badge-success">A-</span></td>
                  <td className="py-3.5 px-3 font-medium text-[var(--on-surface)]">3.70</td>
                </tr>
                <tr className="table-row transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-[var(--on-surface)]">SE203.2</td>
                  <td className="py-3.5 px-3 text-[var(--on-surface)]">Web Technologies</td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">3</td>
                  <td className="py-3.5 px-3"><span className="badge badge-success">B+</span></td>
                  <td className="py-3.5 px-3 font-medium text-[var(--on-surface)]">3.30</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
  );
}
