"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";

export default function Page() {
  useInteractive();
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="examiner" name="Prof. A. Fernando" sub="Chief Examiner · Computing" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Examiner Dashboard
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Exam creation, proctoring metrics, and grade moderation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--surface-container)] text-[var(--tertiary)] flex items-center justify-center font-bold">
              <i className="ti ti-file-pencil text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Upcoming Finals</p>
              <p className="font-display font-extrabold text-2xl text-[var(--on-surface)]">5</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--warning-container)] text-[var(--on-warning-container)] flex items-center justify-center font-bold">
              <i className="ti ti-clock text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Pending Manual Grading</p>
              <p className="font-display font-extrabold text-2xl text-[var(--warning)]">27</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center font-bold">
              <i className="ti ti-certificate text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Published Results</p>
              <p className="font-display font-extrabold text-2xl text-[var(--secondary)]">8</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] flex items-center justify-center font-bold">
              <i className="ti ti-database text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Question Bank Size</p>
              <p className="font-display font-extrabold text-2xl text-[var(--tertiary)]">412</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--outline-variant)]">
              <i className="ti ti-calendar-event text-xl text-[var(--tertiary)]"></i>
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                Upcoming Final Exams
              </h3>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[var(--outline-variant)]">
                <tr className="table-row transition-colors">
                  <td className="py-3 px-2 font-semibold text-[var(--on-surface)]">SE308.3 Software Process Mgmt</td>
                  <td className="py-3 px-2 text-right text-[var(--on-surface-variant)] font-medium">Dec 12</td>
                </tr>
                <tr className="table-row transition-colors">
                  <td className="py-3 px-2 font-semibold text-[var(--on-surface)]">SE201.2 Data Structures</td>
                  <td className="py-3 px-2 text-right text-[var(--on-surface-variant)] font-medium">Dec 14</td>
                </tr>
                <tr className="table-row transition-colors">
                  <td className="py-3 px-2 font-semibold text-[var(--on-surface)]">SE104.1 Discrete Mathematics</td>
                  <td className="py-3 px-2 text-right text-[var(--on-surface-variant)] font-medium">Dec 16</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--outline-variant)]">
              <i className="ti ti-checkup-list text-xl text-[var(--tertiary)]"></i>
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                Recently Published Results
              </h3>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[var(--outline-variant)]">
                <tr className="table-row transition-colors">
                  <td className="py-3 px-2 font-semibold text-[var(--on-surface)]">SE202.2 Database Systems — Mid-term</td>
                  <td className="py-3 px-2 text-right"><span className="badge badge-success">Published</span></td>
                </tr>
                <tr className="table-row transition-colors">
                  <td className="py-3 px-2 font-semibold text-[var(--on-surface)]">SE105.1 Intro to Programming</td>
                  <td className="py-3 px-2 text-right"><span className="badge badge-success">Published</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
