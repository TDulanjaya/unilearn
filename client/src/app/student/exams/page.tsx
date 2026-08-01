"use client";

const EXAMS = [
  {
    course: "SE308.3 Software Process Mgmt",
    dateTime: "Dec 12, 09:00 AM",
    venue: "Main Hall A",
  },
  {
    course: "SE201.2 Data Structures",
    dateTime: "Dec 14, 01:30 PM",
    venue: "Lab 04",
  },
];

export default function StudentExamsPage() {
  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
          Exams & Assessments
        </h1>
        <p className="text-[var(--on-surface-variant)] text-sm">
          Upcoming final exams, quizzes, and hall admission slips.
        </p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <i className="ti ti-clipboard-check text-xl text-[var(--tertiary)]"></i>
          <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
            Examination Schedule
          </h3>
        </div>

        <div className="block sm:hidden space-y-4">
          {EXAMS.map((exam, idx) => (
            <div key={idx} className="glass p-4 rounded-xl border border-[var(--outline-variant)] space-y-3">
              <div className="font-bold text-[var(--on-surface)]">
                {exam.course}
              </div>
              <div className="space-y-1.5 text-xs text-[var(--on-surface-variant)]">
                <div className="flex items-center gap-2">
                  <i className="ti ti-calendar text-[var(--tertiary)]"></i>
                  <span>{exam.dateTime}</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-[var(--on-surface)]">
                  <i className="ti ti-map-pin text-[var(--tertiary)]"></i>
                  <span>{exam.venue}</span>
                </div>
              </div>
              <button className="w-full btn-secondary text-xs !py-2 justify-center shadow-sm mt-2">
                <i className="ti ti-download mr-1.5"></i> Download Slip
              </button>
            </div>
          ))}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                <th className="pb-3 px-3 font-semibold">Course</th>
                <th className="pb-3 px-3 font-semibold">Date & Time</th>
                <th className="pb-3 px-3 font-semibold">Venue</th>
                <th className="pb-3 px-3 font-semibold">Admission Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {EXAMS.map((exam, idx) => (
                <tr key={idx} className="table-row transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-[var(--on-surface)]">
                    {exam.course}
                  </td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">
                    {exam.dateTime}
                  </td>
                  <td className="py-3.5 px-3 text-[var(--on-surface)] font-medium">
                    {exam.venue}
                  </td>
                  <td className="py-3.5 px-3">
                    <button className="btn-secondary text-xs !py-1">
                      <i className="ti ti-download"></i> Download Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
