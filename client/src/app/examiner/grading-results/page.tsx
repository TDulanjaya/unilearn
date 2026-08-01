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
            Grading & Results
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            SE308.3 — Software Process Management, Mid-term exam
          </p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-[var(--outline-variant)]" data-tabgroup="gres">
          <span className="tab-btn active" data-tab="grade">Manual grading</span>
          <span className="tab-btn" data-tab="pub">Publish results</span>
          <span className="tab-btn" data-tab="sheet">Result sheets</span>
        </div>

        <div id="gres-grade" data-tabpanel="gres">
          <div className="card p-6 max-w-2xl">
            <p className="text-xs text-[var(--tertiary)] font-bold uppercase tracking-wider mb-2">
              Question 7 of 20 · Essay · 10 marks
            </p>
            <p className="text-base font-semibold mb-4 text-[var(--on-surface)]">
              Explain the V-model of software development and its key phases.
            </p>
            <div className="border border-[var(--outline-variant)] rounded-xl p-4 text-sm text-[var(--on-surface-variant)] bg-[var(--surface-container-low)] mb-4 leading-relaxed">
              Student answer: &quot;The V-model is a sequential development model where each development phase has a corresponding testing phase...&quot;
            </div>
            <div className="flex items-center gap-3 mb-5">
              <input type="number" placeholder="Marks" className="w-28" />
              <span className="text-sm text-[var(--outline)] font-medium">/ 10</span>
            </div>
            <div className="flex justify-between">
              <button className="btn-secondary">Previous</button>
              <button className="btn-primary shadow-md">Save & next</button>
            </div>
          </div>
        </div>

        <div id="gres-pub" data-tabpanel="gres" className="hidden">
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-6 mb-5 pb-4 border-b border-[var(--outline-variant)] text-sm text-[var(--on-surface)] font-medium">
              <span>Average: <b className="text-[var(--tertiary)]">68%</b></span>
              <span>Pass rate: <b className="text-[var(--secondary)]">82%</b></span>
              <span>Total students: <b>61</b></span>
            </div>
            <div className="overflow-x-auto mb-5">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                    <th className="pb-3 px-3 font-semibold">Student</th>
                    <th className="pb-3 px-3 font-semibold">Score</th>
                    <th className="pb-3 px-3 font-semibold">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline-variant)]">
                  <tr className="table-row transition-colors">
                    <td className="py-3 px-3 font-semibold text-[var(--on-surface)]">Nadeesha Silva</td>
                    <td className="py-3 px-3 text-[var(--on-surface-variant)] font-medium">76%</td>
                    <td className="py-3 px-3"><span className="badge badge-accent">B+</span></td>
                  </tr>
                  <tr className="table-row transition-colors">
                    <td className="py-3 px-3 font-semibold text-[var(--on-surface)]">Ishara Fonseka</td>
                    <td className="py-3 px-3 text-[var(--on-surface-variant)] font-medium">61%</td>
                    <td className="py-3 px-3"><span className="badge badge-gray">C+</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button className="btn-primary shadow-md">Publish results</button>
          </div>
        </div>

        <div id="gres-sheet" data-tabpanel="gres" className="hidden">
          <div className="card p-6 max-w-xl">
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
              Generate Result Sheets
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <select><option>SE308.3 Software Process Mgmt</option></select>
              <select><option>Batch CS2023-A</option></select>
            </div>
            <div className="border border-[var(--outline-variant)] rounded-xl p-4 mb-5 text-sm text-[var(--on-surface-variant)] bg-[var(--surface-container-low)]">
              Preview: result sheet for 61 students, including score, grade, and rank.
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary">
                <i className="ti ti-file-type-pdf text-base"></i> Export PDF
              </button>
              <button className="btn-secondary">
                <i className="ti ti-file-spreadsheet text-base"></i> Export Excel
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
