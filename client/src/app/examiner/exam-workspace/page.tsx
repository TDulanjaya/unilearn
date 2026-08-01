"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";

interface MockFinalExam {
  id: string;
  courseCode: string;
  courseTitle: string;
  batchName: string;
  date: string;
  startTime: string; // e.g. "09:00"
  durationMinutes: number; // e.g. 120 (so ends 11:00)
}

const EXISTING_EXAMS: MockFinalExam[] = [
  {
    id: "ex-1",
    courseCode: "SE308.3",
    courseTitle: "Software Process Management",
    batchName: "Batch CS2023-A",
    date: "2026-08-20",
    startTime: "09:00",
    durationMinutes: 120, // 09:00 - 11:00
  },
  {
    id: "ex-2",
    courseCode: "SE202.2",
    courseTitle: "Database Systems",
    batchName: "Batch CS2023-A",
    date: "2026-08-22",
    startTime: "13:00",
    durationMinutes: 180, // 13:00 - 16:00
  },
  {
    id: "ex-3",
    courseCode: "SE309.3",
    courseTitle: "Software Verification & Validation",
    batchName: "Batch CS2023-B",
    date: "2026-08-20",
    startTime: "09:00",
    durationMinutes: 120, // 09:00 - 11:00
  },
];

export default function Page() {
  useInteractive();

  // Controlled form state for Schedule tab (FR-EXAM-03 conflict checking)
  const [selectedCourse, setSelectedCourse] = useState("SE308.3 Software Process Mgmt");
  const [selectedBatch, setSelectedBatch] = useState("Batch CS2023-A");
  const [examDate, setExamDate] = useState("2026-08-20");
  const [examTime, setExamTime] = useState("10:00");
  const [examVenue, setExamVenue] = useState("Main Hall A");
  const [duration, setDuration] = useState("120");

  // Conflict detection logic
  const checkConflict = () => {
    if (!examDate || !examTime || !duration) return null;

    const [newStartHour, newStartMin] = examTime.split(":").map(Number);
    const newStartTotal = newStartHour * 60 + newStartMin;
    const newEndTotal = newStartTotal + Number(duration);

    for (const existing of EXISTING_EXAMS) {
      if (existing.batchName === selectedBatch && existing.date === examDate) {
        const [exStartHour, exStartMin] = existing.startTime.split(":").map(Number);
        const exStartTotal = exStartHour * 60 + exStartMin;
        const exEndTotal = exStartTotal + existing.durationMinutes;

        // Overlap check: start1 < end2 AND start2 < end1
        if (newStartTotal < exEndTotal && exStartTotal < newEndTotal) {
          return existing;
        }
      }
    }
    return null;
  };

  const conflict = checkConflict();

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
          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Schedule Final Exam
              </h3>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Course Offering</label>
                    <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                      <option>SE308.3 Software Process Mgmt</option>
                      <option>SE202.2 Database Systems</option>
                      <option>SE309.3 Software Verification & Validation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Target Batch</label>
                    <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
                      <option>Batch CS2023-A</option>
                      <option>Batch CS2023-B</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Date</label>
                    <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Start Time</label>
                    <input type="time" value={examTime} onChange={(e) => setExamTime(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Duration (mins)</label>
                    <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration (min)" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Venue</label>
                  <input type="text" value={examVenue} onChange={(e) => setExamVenue(e.target.value)} placeholder="Venue" />
                </div>

                {/* FR-EXAM-03 Conflict Feedback */}
                {conflict ? (
                  <div className="flex items-start gap-2 bg-[var(--error-container)] text-[var(--on-error-container)] text-xs rounded-xl p-3 border border-[var(--outline-variant)] font-semibold">
                    <i className="ti ti-alert-triangle text-base shrink-0 mt-0.5"></i>
                    <div>
                      <p className="font-bold">Conflict Detected for {selectedBatch}!</p>
                      <p className="font-normal mt-0.5">
                        Overlaps with <span className="font-bold">{conflict.courseCode} ({conflict.courseTitle})</span> scheduled on {conflict.date} from {conflict.startTime} to {
                          (() => {
                            const [h, m] = conflict.startTime.split(":").map(Number);
                            const total = h * 60 + m + conflict.durationMinutes;
                            const eh = String(Math.floor(total / 60)).padStart(2, '0');
                            const em = String(total % 60).padStart(2, '0');
                            return `${eh}:${em}`;
                          })()
                        }.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-[var(--secondary-container)] text-[var(--on-secondary-container)] text-xs rounded-xl p-3 border border-[var(--outline-variant)] font-semibold">
                    <i className="ti ti-circle-check text-base shrink-0"></i>
                    <span>No scheduling conflicts detected for {selectedBatch} on {examDate} at {examTime}.</span>
                  </div>
                )}

                <button disabled={!!conflict} className={`btn-primary shadow-md w-full justify-center ${conflict ? "opacity-50 cursor-not-allowed" : ""}`}>
                  Schedule final exam
                </button>
              </div>
            </div>

            {/* List of existing scheduled final exams */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-4 pb-2 border-b border-[var(--outline-variant)]">
                Existing Scheduled Final Exams
              </h3>
              <div className="space-y-3 text-xs">
                {EXISTING_EXAMS.map((ex) => (
                  <div key={ex.id} className="p-3 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-low)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="badge badge-accent">{ex.courseCode}</span>
                      <span className="font-semibold text-[var(--tertiary)]">{ex.batchName}</span>
                    </div>
                    <p className="font-bold text-[var(--on-surface)]">{ex.courseTitle}</p>
                    <p className="text-[var(--on-surface-variant)] mt-1">
                      <i className="ti ti-calendar mr-1 text-[var(--tertiary)]"></i>{ex.date} · {ex.startTime} ({ex.durationMinutes} mins)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
