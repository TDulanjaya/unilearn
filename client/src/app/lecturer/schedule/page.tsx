"use client";
import { useState } from "react";
import LecturerNavbar from "@/components/LecturerNavbar";
import { useNotifications } from "@/lib/NotificationContext";

interface TeachingSlot {
  id: string;
  courseCode: string;
  courseTitle: string;
  day: string;
  time: string;
  venue: string;
  type: string;
  enrolledStudents: { id: string; name: string; indexNo: string }[];
}

const INITIAL_SLOTS: TeachingSlot[] = [
  {
    id: "slot-1",
    courseCode: "SE308.3",
    courseTitle: "Software Process Management",
    day: "Monday",
    time: "09:00 AM - 11:00 AM",
    venue: "Hall 3A",
    type: "Lecture",
    enrolledStudents: [
      { id: "st-1", name: "Nadeesha Silva", indexNo: "SE/2023/042" },
      { id: "st-2", name: "Kasun Perera", indexNo: "SE/2023/018" },
      { id: "st-3", name: "Dilan Fernando", indexNo: "SE/2023/089" },
      { id: "st-4", name: "Ruwan Munaweera", indexNo: "SE/2023/005" },
      { id: "st-5", name: "Tharushi Wickrama", indexNo: "SE/2023/112" },
      { id: "st-6", name: "Amaya Jayawardena", indexNo: "SE/2023/076" },
      { id: "st-7", name: "Bhanuka Mendis", indexNo: "SE/2023/031" },
      { id: "st-8", name: "Sachini Ratnayake", indexNo: "SE/2023/094" },
    ],
  },
  {
    id: "slot-2",
    courseCode: "SE309.3",
    courseTitle: "Software Verification & Validation",
    day: "Wednesday",
    time: "01:00 PM - 03:00 PM",
    venue: "Lab 2B",
    type: "Practical",
    enrolledStudents: [
      { id: "st-1", name: "Nadeesha Silva", indexNo: "SE/2023/042" },
      { id: "st-2", name: "Kasun Perera", indexNo: "SE/2023/018" },
      { id: "st-3", name: "Dilan Fernando", indexNo: "SE/2023/089" },
      { id: "st-4", name: "Ruwan Munaweera", indexNo: "SE/2023/005" },
      { id: "st-5", name: "Tharushi Wickrama", indexNo: "SE/2023/112" },
      { id: "st-6", name: "Amaya Jayawardena", indexNo: "SE/2023/076" },
    ],
  },
  {
    id: "slot-3",
    courseCode: "SE308.3",
    courseTitle: "Software Process Management",
    day: "Friday",
    time: "10:00 AM - 12:00 PM",
    venue: "Hall 3A",
    type: "Tutorial",
    enrolledStudents: [
      { id: "st-1", name: "Nadeesha Silva", indexNo: "SE/2023/042" },
      { id: "st-2", name: "Kasun Perera", indexNo: "SE/2023/018" },
      { id: "st-3", name: "Dilan Fernando", indexNo: "SE/2023/089" },
      { id: "st-7", name: "Bhanuka Mendis", indexNo: "SE/2023/031" },
      { id: "st-8", name: "Sachini Ratnayake", indexNo: "SE/2023/094" },
    ],
  },
];

interface InClassExam {
  id: string;
  slotId: string;
  courseCode: string;
  title: string;
  instructions: string;
  day: string;
  time: string;
  venue: string;
  publishedAt: string;
}

type AttendanceStatus = "Present" | "Absent" | "Late";

export default function LecturerSchedulePage() {
  const { addNotification } = useNotifications();

  const [inClassExams, setInClassExams] = useState<InClassExam[]>([]);
  const [selectedExamSlot, setSelectedExamSlot] = useState<TeachingSlot | null>(null);
  const [examTitle, setExamTitle] = useState("");
  const [examInstructions, setExamInstructions] = useState("");

  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, Record<string, AttendanceStatus>>>({});
  const [selectedAttendanceSlot, setSelectedAttendanceSlot] = useState<TeachingSlot | null>(null);
  const [currentAttendance, setCurrentAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [savedSlotIds, setSavedSlotIds] = useState<Record<string, boolean>>({});

  // Exam Scheduling Modal Handlers
  const handleOpenExamModal = (slot: TeachingSlot) => {
    setSelectedExamSlot(slot);
    setExamTitle(`Mid-Semester Quiz — ${slot.courseCode}`);
    setExamInstructions("Closed book test. Bring student ID cards and basic stationary.");
  };

  const handlePublishExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamSlot || !examTitle.trim()) return;

    const newExam: InClassExam = {
      id: "exam-" + Date.now(),
      slotId: selectedExamSlot.id,
      courseCode: selectedExamSlot.courseCode,
      title: examTitle.trim(),
      instructions: examInstructions.trim(),
      day: selectedExamSlot.day,
      time: selectedExamSlot.time,
      venue: selectedExamSlot.venue,
      publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setInClassExams((prev) => [newExam, ...prev]);

    // Push auto-notification per FR-EXAM-04
    addNotification({
      icon: "ti-file-pencil",
      iconBg: "bg-[var(--warning-container)]",
      iconColor: "text-[var(--on-warning-container)]",
      title: `In-Class Exam Scheduled: ${selectedExamSlot.courseCode}`,
      detail: `${examTitle.trim()} scheduled for ${selectedExamSlot.day}s (${selectedExamSlot.time}) at ${selectedExamSlot.venue}.`,
      time: "Just now",
    });

    setSelectedExamSlot(null);
    setExamTitle("");
    setExamInstructions("");
  };

  // Attendance Handlers
  const handleOpenAttendance = (slot: TeachingSlot) => {
    setSelectedAttendanceSlot(slot);
    const existing = attendanceRecords[slot.id];
    if (existing) {
      setCurrentAttendance(existing);
    } else {
      const initial: Record<string, AttendanceStatus> = {};
      slot.enrolledStudents.forEach((st) => {
        initial[st.id] = "Present";
      });
      setCurrentAttendance(initial);
    }
  };

  const handleToggleAttendanceStatus = (studentId: string, status: AttendanceStatus) => {
    setCurrentAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = () => {
    if (!selectedAttendanceSlot) return;
    setAttendanceRecords((prev) => ({
      ...prev,
      [selectedAttendanceSlot.id]: currentAttendance,
    }));
    setSavedSlotIds((prev) => ({ ...prev, [selectedAttendanceSlot.id]: true }));
    setSelectedAttendanceSlot(null);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Teaching Schedule
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Weekly lecture slots, in-class exam publishing, and session attendance marking.
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--outline-variant)]">
            <i className="ti ti-calendar-event text-xl text-[var(--tertiary)]"></i>
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
              Weekly Teaching Slots
            </h3>
          </div>

          <div className="space-y-4">
            {INITIAL_SLOTS.map((slot) => {
              const examCount = inClassExams.filter((e) => e.slotId === slot.id).length;
              const isAttendanceSaved = savedSlotIds[slot.id];

              return (
                <div
                  key={slot.id}
                  className="p-4 border border-[var(--outline-variant)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-container-low)] transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-accent">{slot.courseCode}</span>
                      <span className="badge badge-gray">{slot.type}</span>
                      {isAttendanceSaved && (
                        <span className="badge badge-success text-[10px]">
                          <i className="ti ti-check"></i> Attendance Marked
                        </span>
                      )}
                      {examCount > 0 && (
                        <span className="badge badge-warning text-[10px]">
                          <i className="ti ti-file-pencil"></i> {examCount} In-Class Exam
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-sm text-[var(--on-surface)]">
                      {slot.courseTitle}
                    </p>
                    <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                      <i className="ti ti-clock text-xs text-[var(--tertiary)] mr-1"></i>
                      {slot.day}s · {slot.time} · <i className="ti ti-map-pin text-xs text-[var(--tertiary)] ml-1 mr-0.5"></i>{slot.venue}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenAttendance(slot)}
                      className="btn-secondary text-xs !py-1.5"
                    >
                      <i className="ti ti-user-check text-sm"></i> Attendance
                    </button>
                    <button
                      onClick={() => handleOpenExamModal(slot)}
                      className="btn-primary text-xs !py-1.5 shadow-sm"
                    >
                      <i className="ti ti-plus text-sm"></i> Schedule Exam
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Published In-Class Exams Overview */}
        {inClassExams.length > 0 && (
          <div className="card p-6 mt-6">
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)] flex items-center gap-2">
              <i className="ti ti-file-pencil text-[var(--tertiary)]"></i> Published In-Class Exams
            </h3>
            <div className="space-y-3">
              {inClassExams.map((exam) => (
                <div key={exam.id} className="p-3.5 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-low)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-accent">{exam.courseCode}</span>
                      <p className="font-bold text-sm text-[var(--on-surface)]">{exam.title}</p>
                    </div>
                    <p className="text-xs text-[var(--on-surface-variant)]">
                      Slot: {exam.day} ({exam.time}) @ {exam.venue} • {exam.instructions}
                    </p>
                  </div>
                  <span className="text-[11px] text-[var(--outline)] shrink-0 font-medium">Published {exam.publishedAt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal: Schedule In-Class Exam */}
      {selectedExamSlot && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6 bg-[var(--surface-container-lowest)] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--outline-variant)]">
              <div className="flex items-center gap-2">
                <i className="ti ti-file-pencil text-xl text-[var(--tertiary)]"></i>
                <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                  Schedule In-Class Exam
                </h3>
              </div>
              <button
                onClick={() => setSelectedExamSlot(null)}
                className="text-[var(--outline)] hover:text-[var(--on-surface)]"
              >
                <i className="ti ti-x text-xl"></i>
              </button>
            </div>

            <form onSubmit={handlePublishExam} className="space-y-4">
              <div className="p-3 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-xs space-y-1">
                <p className="font-bold text-[var(--on-surface)]">
                  Course: {selectedExamSlot.courseCode} {selectedExamSlot.courseTitle}
                </p>
                <p className="text-[var(--on-surface-variant)]">
                  Auto-filled Slot: <span className="font-semibold text-[var(--tertiary)]">{selectedExamSlot.day}s ({selectedExamSlot.time}) @ {selectedExamSlot.venue}</span>
                </p>
                <p className="text-[11px] text-[var(--outline)] italic">
                  Note per FR-EXAM-01: Auto-filled slot requires no separate administrative approval.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                  Exam Title
                </label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Evaluation Quiz"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                  Instructions & Guidelines
                </label>
                <textarea
                  rows={3}
                  value={examInstructions}
                  onChange={(e) => setExamInstructions(e.target.value)}
                  placeholder="e.g. Closed-book quiz. Calculator allowed."
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--outline-variant)]">
                <button
                  type="button"
                  onClick={() => setSelectedExamSlot(null)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs shadow-md">
                  <i className="ti ti-send text-sm"></i> Publish & Notify Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Mark Attendance Roster */}
      {selectedAttendanceSlot && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-2xl p-6 bg-[var(--surface-container-lowest)] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--outline-variant)]">
              <div>
                <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                  Session Attendance Roster
                </h3>
                <p className="text-xs text-[var(--on-surface-variant)]">
                  {selectedAttendanceSlot.courseCode} · {selectedAttendanceSlot.day} ({selectedAttendanceSlot.time})
                </p>
              </div>
              <button
                onClick={() => setSelectedAttendanceSlot(null)}
                className="text-[var(--outline)] hover:text-[var(--on-surface)]"
              >
                <i className="ti ti-x text-xl"></i>
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-2.5 mb-5 pr-1">
              {selectedAttendanceSlot.enrolledStudents.map((student) => {
                const status = currentAttendance[student.id] || "Present";
                return (
                  <div
                    key={student.id}
                    className="p-3 border border-[var(--outline-variant)] rounded-xl flex items-center justify-between gap-3 bg-[var(--surface-container-low)]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--on-surface)] truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-[var(--on-surface-variant)]">{student.indexNo}</p>
                    </div>

                    <div className="flex items-center gap-1 bg-[var(--surface-container-lowest)] p-1 rounded-xl border border-[var(--outline-variant)] shrink-0">
                      {(["Present", "Absent", "Late"] as AttendanceStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleToggleAttendanceStatus(student.id, st)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                            status === st
                              ? st === "Present"
                                ? "bg-[var(--secondary-container)] text-[var(--on-secondary-container)]"
                                : st === "Absent"
                                ? "bg-[var(--error-container)] text-[var(--on-error-container)]"
                                : "bg-[var(--warning-container)] text-[var(--on-warning-container)]"
                              : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--outline-variant)]">
              <span className="text-xs text-[var(--on-surface-variant)] font-medium">
                Enrolled: {selectedAttendanceSlot.enrolledStudents.length} students
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAttendanceSlot(null)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="btn-primary text-xs shadow-md"
                >
                  <i className="ti ti-check text-sm"></i> Save Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
