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
            Exam Workspace
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Manage the question bank, build exams, and schedule final exams.
          </p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-[var(--outline-variant)]" data-tabgroup="ew">
          <span className="tab-btn active" data-tab="qb">Question bank</span>
          <span className="tab-btn" data-tab="build">Build exam</span>
          <span className="tab-btn" data-tab="sched">Schedule</span>
        </div>

        <div id="ew-qb" data-tabpanel="ew">
          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="card p-6">
              <div className="flex flex-wrap items-center gap-3 mb-5 pb-4 border-b border-[var(--outline-variant)]">
                <select className="w-40"><option>All courses</option></select>
                <select className="w-32"><option>Difficulty</option></select>
                <input type="text" placeholder="Search questions" className="flex-1" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                      <th className="pb-3 px-3 font-semibold">Question</th>
                      <th className="pb-3 px-3 font-semibold">Type</th>
                      <th className="pb-3 px-3 font-semibold">Marks</th>
                      <th className="pb-3 px-3 font-semibold">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--outline-variant)]">
                    <tr className="table-row transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-[var(--on-surface)]">What is the primary goal of black-box testing?</td>
                      <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">MCQ</td>
                      <td className="py-3.5 px-3 text-[var(--on-surface)] font-medium">2</td>
                      <td className="py-3.5 px-3"><span className="badge badge-accent">Medium</span></td>
                    </tr>
                    <tr className="table-row transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-[var(--on-surface)]">Explain the V-model of software development.</td>
                      <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">Essay</td>
                      <td className="py-3.5 px-3 text-[var(--on-surface)] font-medium">10</td>
                      <td className="py-3.5 px-3"><span className="badge badge-warning">Hard</span></td>
                    </tr>
                    <tr className="table-row transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-[var(--on-surface)]">Define code coverage.</td>
                      <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">Short answer</td>
                      <td className="py-3.5 px-3 text-[var(--on-surface)] font-medium">3</td>
                      <td className="py-3.5 px-3"><span className="badge badge-success">Easy</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Add / Edit Question
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                    Question Type
                  </label>
                  <select><option>MCQ</option><option>Essay</option><option>Short answer</option></select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                    Question Text
                  </label>
                  <textarea rows={2} placeholder="Question text"></textarea>
                </div>
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 text-sm text-[var(--on-surface)]">
                    <input type="radio" name="opt" defaultChecked /> Verify code correctness
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[var(--on-surface)]">
                    <input type="radio" name="opt" /> Measure performance
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Marks" />
                  <input type="text" placeholder="Topic tag" />
                </div>
                <button className="btn-primary w-full justify-center shadow-md">
                  Save question
                </button>
              </div>
            </div>
          </div>
        </div>

        <div id="ew-build" data-tabpanel="ew" className="hidden">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Question Bank
              </h3>
              <div className="space-y-2.5">
                <label className="flex items-center gap-3 border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  <input type="checkbox" defaultChecked /> Black-box testing goal (2 marks)
                </label>
                <label className="flex items-center gap-3 border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  <input type="checkbox" defaultChecked /> V-model explanation (10 marks)
                </label>
                <label className="flex items-center gap-3 border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  <input type="checkbox" /> Code coverage definition (3 marks)
                </label>
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Assembled Exam — 2 questions, 12 marks
              </h3>
              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-3 border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm text-[var(--on-surface)] bg-[var(--surface-container-low)]">
                  <i className="ti ti-grip-vertical text-[var(--outline)]"></i> Black-box testing goal — 2 marks
                </div>
                <div className="flex items-center gap-3 border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm text-[var(--on-surface)] bg-[var(--surface-container-low)]">
                  <i className="ti ti-grip-vertical text-[var(--outline)]"></i> V-model explanation — 10 marks
                </div>
              </div>
              <input type="number" placeholder="Timer (minutes)" className="mb-4" />
              <button className="btn-primary w-full justify-center shadow-md">Save exam draft</button>
            </div>
          </div>
        </div>

        <div id="ew-sched" data-tabpanel="ew" className="hidden">
          <div className="card p-6 max-w-xl">
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
              Schedule Final Exam
            </h3>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <select><option>SE308.3 Software Process Mgmt</option></select>
                <select><option>Batch CS2023-A</option></select>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input type="date" />
                <input type="time" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Venue" />
                <input type="number" placeholder="Duration (min)" />
              </div>
              <div className="flex items-center gap-2 bg-[var(--warning-container)] text-[var(--on-warning-container)] text-sm rounded-xl px-4 py-3 border border-[var(--outline-variant)] font-medium">
                <i className="ti ti-alert-triangle text-base"></i> No conflicts detected for this batch.
              </div>
              <button className="btn-primary shadow-md">Schedule final exam</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
