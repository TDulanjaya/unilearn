"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

interface ScheduledExam {
  id: string;
  courseCode: string;
  courseTitle: string;
  batch: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  supervisor: string;
}

const INITIAL_SCHEDULED_EXAMS: ScheduledExam[] = [];

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useEffect } from "react";

export default function AdminExamSchedulingPage() {
  const { data: rawExams } = useQuery({
    queryKey: ["exams"],
    queryFn: () => api.get<any>("/api/v1/exams/offering/1"),
  });

  const apiExams: ScheduledExam[] = Array.isArray(rawExams) && rawExams.length > 0
    ? rawExams.map((e: any) => ({
        id: String(e.examId),
        courseCode: e.courseCode || "SE308.3",
        courseTitle: e.title || e.courseName || "Scheduled Exam",
        batch: "CS2023-A",
        date: e.startTime ? new Date(e.startTime).toISOString().split("T")[0] : "2026-08-15",
        startTime: e.startTime ? new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "09:00",
        endTime: e.endTime ? new Date(e.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "11:00",
        venue: e.location || "Main Exam Hall A",
        supervisor: "Dr. K. Perera",
      }))
    : INITIAL_SCHEDULED_EXAMS;

  const [exams, setExams] = useState<ScheduledExam[]>(apiExams);

  useEffect(() => {
    if (rawExams) setExams(apiExams);
  }, [rawExams]);

  
  const [courseCode, setCourseCode] = useState("SE309.3");
  const [courseTitle, setCourseTitle] = useState("Software Verification & Validation");
  const [batch, setBatch] = useState("CS2023-A");
  const [date, setDate] = useState("2026-08-15");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [venue, setVenue] = useState("Main Exam Hall B");
  const [supervisor, setSupervisor] = useState("Prof. A. Fernando");

  const [conflictError, setConflictError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleScheduleExam = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    setSuccessMessage(null);

    
    const conflict = exams.find((exam) => {
      if (exam.batch !== batch || exam.date !== date) return false;
      
      return startTime < exam.endTime && exam.startTime < endTime;
    });

    if (conflict) {
      setConflictError(
        `FR-EXAM-03 Violation: Batch ${batch} already has a conflicting final exam (${conflict.courseCode} at ${conflict.startTime}-${conflict.endTime}) scheduled on ${date}.`
      );
      return;
    }

    const newExam: ScheduledExam = {
      id: `exam-${Date.now()}`,
      courseCode,
      courseTitle,
      batch,
      date,
      startTime,
      endTime,
      venue,
      supervisor,
    };

    setExams([...exams, newExam]);
    setSuccessMessage(`Final Exam for ${courseCode} (${batch}) scheduled successfully!`);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full space-y-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Institution Final Exam Scheduling
          </h1>
          <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm">
            Centralized exam timetable management across all university course offerings with automated FR-EXAM-03 conflict detection.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          
          <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
            <h3 className="font-display font-bold text-base text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)] flex items-center justify-between">
              <span>Scheduled Final Exams ({exams.length})</span>
              <span className="badge badge-accent text-[10px]">FR-EXAM-03 Guarded</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] uppercase font-semibold">
                    <th className="pb-3 px-3">Course</th>
                    <th className="pb-3 px-3">Batch</th>
                    <th className="pb-3 px-3">Date & Time</th>
                    <th className="pb-3 px-3">Venue</th>
                    <th className="pb-3 px-3">Supervisor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline-variant)]">
                  {exams.map((ex) => (
                    <tr key={ex.id} className="hover:bg-[var(--surface-container-low)]">
                      <td className="py-3 px-3 font-semibold text-[var(--on-surface)]">
                        <p>{ex.courseCode}</p>
                        <p className="text-[10px] text-[var(--on-surface-variant)] font-normal">{ex.courseTitle}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="badge badge-gray">{ex.batch}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium">
                        <p>{ex.date}</p>
                        <p className="text-[10px] text-[var(--tertiary)]">{ex.startTime} - {ex.endTime}</p>
                      </td>
                      <td className="py-3 px-3 text-[var(--on-surface-variant)]">{ex.venue}</td>
                      <td className="py-3 px-3 text-[var(--on-surface-variant)]">{ex.supervisor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          
          <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] self-start">
            <h3 className="font-display font-bold text-base text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)]">
              Schedule New Final Exam
            </h3>

            {conflictError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs flex items-start gap-2">
                <i className="ti ti-alert-triangle text-lg shrink-0"></i>
                <p className="font-semibold leading-relaxed">{conflictError}</p>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs flex items-center gap-2">
                <i className="ti ti-circle-check text-lg shrink-0"></i>
                <p className="font-semibold">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleScheduleExam} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Course Code & Title</label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="Code" className="text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" required />
                  <input type="text" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} placeholder="Title" className="col-span-2 text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Target Student Batch</label>
                <select value={batch} onChange={(e) => setBatch(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
                  <option value="CS2023-A">CS2023-A</option>
                  <option value="CS2023-B">CS2023-B</option>
                  <option value="SE2024-1">SE2024-1</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Exam Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Start Time</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">End Time</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Exam Hall / Venue</label>
                <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" required />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Supervisor / Chief Invigilator</label>
                <input type="text" value={supervisor} onChange={(e) => setSupervisor(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" required />
              </div>

              <button type="submit" className="btn-primary w-full justify-center text-xs shadow-md mt-2">
                <i className="ti ti-calendar-plus mr-1"></i> Schedule Exam Paper
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
