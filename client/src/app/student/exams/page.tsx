"use client";
import { useState } from "react";

interface Exam {
  id: number;
  courseCode: string;
  courseTitle: string;
  dateTime: string;
  venue: string;
  seatNo: string;
  type: "Final Exam" | "Midterm Quiz" | "In-Class Assessment";
  status: "Upcoming" | "Completed";
  grade?: string;
}

const EXAMS: Exam[] = [
  {
    id: 1,
    courseCode: "SE308.3",
    courseTitle: "Software Process Management",
    dateTime: "Dec 12, 2026 · 09:00 AM - 12:00 PM",
    venue: "Main Examination Hall A",
    seatNo: "A-042",
    type: "Final Exam",
    status: "Upcoming",
  },
  {
    id: 2,
    courseCode: "SE201.2",
    courseTitle: "Data Structures & Algorithms",
    dateTime: "Dec 14, 2026 · 01:30 PM - 04:30 PM",
    venue: "Computing Lab 04",
    seatNo: "LAB-18",
    type: "Final Exam",
    status: "Upcoming",
  },
  {
    id: 3,
    courseCode: "SE202.2",
    courseTitle: "Database Systems",
    dateTime: "Dec 18, 2026 · 09:00 AM - 11:00 AM",
    venue: "Auditorium B",
    seatNo: "AUD-09",
    type: "Final Exam",
    status: "Upcoming",
  },
  {
    id: 4,
    courseCode: "SE309.3",
    courseTitle: "Software Verification & Validation",
    dateTime: "Jul 15, 2026 · 10:00 AM - 11:30 AM",
    venue: "Online Exam Portal",
    seatNo: "N/A",
    type: "In-Class Assessment",
    status: "Completed",
    grade: "A-",
  },
];

export default function StudentExamsPage() {
  const [filter, setFilter] = useState<"Upcoming" | "Completed">("Upcoming");
  const [selectedExamForSlip, setSelectedExamForSlip] = useState<Exam | null>(null);

  const filteredExams = EXAMS.filter((e) => e.status === filter);

  const handleDownloadSlipFile = (exam: Exam) => {
    const slipContent = `
============================================================
           UNILEARN OFFICIAL ADMISSION SLIP
============================================================
Student Name: Nadeesha Silva
Index Number: SE-2023-042
Degree: B.Sc. (Hons) in Software Engineering

EXAM DETAILS:
Course Code : ${exam.courseCode}
Course Title: ${exam.courseTitle}
Date & Time : ${exam.dateTime}
Venue       : ${exam.venue}
Seat Number : ${exam.seatNo}

EXAMINATION RULES & GUIDELINES:
1. Present this admission slip alongside your University ID Card.
2. Arrive at the examination hall at least 15 minutes prior to start time.
3. Electronic gadgets and smart watches are strictly prohibited in the hall.
4. Verify your seat number on the door seating chart before entry.

Generated on: ${new Date().toLocaleDateString("en-US")}
============================================================
`;
    const blob = new Blob([slipContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AdmissionSlip_${exam.courseCode}_NadeeshaSilva.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
          Exams & Admission Slips
        </h1>
        <p className="text-[var(--on-surface-variant)] text-sm">
          Official examination schedule, hall allocations, and downloadable admission slips.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--outline-variant)]">
        <button
          onClick={() => setFilter("Upcoming")}
          className={`tab-btn flex items-center gap-2 ${filter === "Upcoming" ? "active" : ""}`}
        >
          <i className="ti ti-calendar-event text-sm"></i>
          <span>Upcoming Final Exams ({EXAMS.filter((e) => e.status === "Upcoming").length})</span>
        </button>
        <button
          onClick={() => setFilter("Completed")}
          className={`tab-btn flex items-center gap-2 ${filter === "Completed" ? "active" : ""}`}
        >
          <i className="ti ti-circle-check text-sm"></i>
          <span>Past Assessments ({EXAMS.filter((e) => e.status === "Completed").length})</span>
        </button>
      </div>

      {/* Exams List Card */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--outline-variant)]">
          <i className="ti ti-clipboard-check text-xl text-[var(--tertiary)]"></i>
          <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
            {filter === "Upcoming" ? "Scheduled Examinations" : "Past Assessment History"}
          </h3>
        </div>

        {/* Mobile View */}
        <div className="block sm:hidden space-y-4">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="glass p-4 rounded-xl border border-[var(--outline-variant)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge badge-accent">{exam.courseCode}</span>
                <span className="badge badge-warning text-[10px]">{exam.type}</span>
              </div>
              <div className="font-bold text-[var(--on-surface)] text-sm">
                {exam.courseTitle}
              </div>
              <div className="space-y-1.5 text-xs text-[var(--on-surface-variant)]">
                <div className="flex items-center gap-2">
                  <i className="ti ti-calendar text-[var(--tertiary)]"></i>
                  <span>{exam.dateTime}</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-[var(--on-surface)]">
                  <i className="ti ti-map-pin text-[var(--tertiary)]"></i>
                  <span>{exam.venue} (Seat: {exam.seatNo})</span>
                </div>
              </div>
              {filter === "Upcoming" ? (
                <button
                  onClick={() => setSelectedExamForSlip(exam)}
                  className="w-full btn-primary text-xs !py-2 justify-center shadow-sm"
                >
                  <i className="ti ti-ticket mr-1.5"></i> View & Download Slip
                </button>
              ) : (
                <div className="text-xs text-[var(--on-surface-variant)] flex justify-between items-center pt-2 border-t border-[var(--outline-variant)]">
                  <span>Grade Achieved:</span>
                  <span className="badge badge-success font-bold">{exam.grade}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                <th className="pb-3 px-3 font-semibold">Course Code & Name</th>
                <th className="pb-3 px-3 font-semibold">Assessment Type</th>
                <th className="pb-3 px-3 font-semibold">Date & Time</th>
                <th className="pb-3 px-3 font-semibold">Venue & Seat</th>
                <th className="pb-3 px-3 font-semibold text-right">Action / Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {filteredExams.map((exam) => (
                <tr key={exam.id} className="table-row transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="badge badge-accent text-[10px] mb-1 block w-fit">{exam.courseCode}</span>
                    <span className="font-semibold text-[var(--on-surface)] text-sm">{exam.courseTitle}</span>
                  </td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)] text-xs font-medium">
                    {exam.type}
                  </td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)] text-xs">
                    {exam.dateTime}
                  </td>
                  <td className="py-3.5 px-3 text-[var(--on-surface)] text-xs font-medium">
                    {exam.venue} <br />
                    <span className="text-[var(--tertiary)] text-[11px]">Seat: {exam.seatNo}</span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {filter === "Upcoming" ? (
                      <button
                        onClick={() => setSelectedExamForSlip(exam)}
                        className="btn-primary text-xs !py-1.5 shadow-sm"
                      >
                        <i className="ti ti-ticket mr-1"></i> Admission Slip
                      </button>
                    ) : (
                      <span className="badge badge-success text-xs font-bold">{exam.grade}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admission Slip Preview Modal */}
      {selectedExamForSlip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-6 animate-scaleIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
              <div className="flex items-center gap-2">
                <i className="ti ti-ticket text-xl text-[var(--tertiary)]"></i>
                <h3 className="font-display font-bold text-base text-[var(--on-surface)]">
                  Examination Admission Slip
                </h3>
              </div>
              <button onClick={() => setSelectedExamForSlip(null)} className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]">
                <i className="ti ti-x text-lg"></i>
              </button>
            </div>

            {/* Official Slip Content */}
            <div className="border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] rounded-xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--outline-variant)]">
                <div>
                  <h4 className="font-bold text-[var(--on-surface)] text-sm">UniLearn University</h4>
                  <p className="text-[10px] text-[var(--on-surface-variant)]">Official Hall Ticket — Semester Final Examinations</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[var(--surface-container)] flex items-center justify-center font-bold text-[var(--tertiary)]">
                  UL
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[var(--on-surface-variant)] block">Student Name:</span>
                  <span className="font-bold text-[var(--on-surface)]">Nadeesha Silva</span>
                </div>
                <div>
                  <span className="text-[var(--on-surface-variant)] block">Index Number:</span>
                  <span className="font-bold text-[var(--on-surface)]">SE-2023-042</span>
                </div>
              </div>

              <div className="bg-[var(--surface-container-low)] p-3 rounded-lg border border-[var(--outline-variant)] space-y-1.5">
                <div>
                  <span className="text-[10px] text-[var(--on-surface-variant)] block">Course Module:</span>
                  <span className="font-bold text-[var(--on-surface)] text-xs">{selectedExamForSlip.courseCode} — {selectedExamForSlip.courseTitle}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--on-surface-variant)] block">Scheduled Date & Time:</span>
                  <span className="font-semibold text-[var(--on-surface)]">{selectedExamForSlip.dateTime}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1">
                  <span>Venue: <b>{selectedExamForSlip.venue}</b></span>
                  <span>Seat No: <b className="text-[var(--tertiary)]">{selectedExamForSlip.seatNo}</b></span>
                </div>
              </div>

              {/* Barcode simulation */}
              <div className="pt-2 text-center">
                <div className="inline-block px-6 py-2 bg-black text-white font-mono tracking-[0.3em] text-[10px] rounded">
                  ||| | ||||| || ||| |||| ||||
                </div>
                <p className="text-[9px] text-[var(--on-surface-variant)] mt-1">SE-2023-042-EXAM-{selectedExamForSlip.courseCode}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--outline-variant)]">
              <button onClick={() => setSelectedExamForSlip(null)} className="btn-secondary text-xs">
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadSlipFile(selectedExamForSlip);
                  setSelectedExamForSlip(null);
                }}
                className="btn-primary text-xs shadow-md"
              >
                <i className="ti ti-download mr-1"></i> Download PDF Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
