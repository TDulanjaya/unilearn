"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface ScheduledExam {
  id: string;
  courseCode: string;
  courseTitle: string;
  batchId: number | null;
  batch: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  scheduledBy: string;
  status: string;
}

export default function AdminExamSchedulingPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: rawExams, isLoading: examsLoading, isError: examsError, error: examsErrorObj } = useQuery({
    queryKey: ["exams"],
    queryFn: () => api.get<any[]>("/api/v1/exams"),
  });

  const { data: rawOfferings } = useQuery({
    queryKey: ["courseOfferings"],
    queryFn: () => api.get<any[]>("/api/v1/course-offerings"),
  });

  const offerings = Array.isArray(rawOfferings) ? rawOfferings : [];

  // the exam response has no batch, so take it from the exam's offering
  const exams: ScheduledExam[] = Array.isArray(rawExams)
    ? rawExams.map((e: any) => {
        const off = offerings.find((o: any) => o.offeringId === e.offeringId);
        return {
          id: String(e.examId),
          courseCode: e.courseCode || "—",
          courseTitle: off?.courseName || (e.courseCode ? `${e.courseCode} Exam` : "Scheduled Exam"),
          batchId: off?.batchId ?? null,
          batch: off?.batchName || "—",
          date: e.examDate ? String(e.examDate) : "—",
          startTime: e.startTime ? String(e.startTime).substring(0, 5) : "—",
          endTime: e.endTime ? String(e.endTime).substring(0, 5) : "—",
          venue: e.venue || "TBD",
          scheduledBy: e.scheduledByName || "—",
          status: e.status || "",
        };
      })
    : [];

  const [selectedOfferingId, setSelectedOfferingId] = useState<string>("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [venue, setVenue] = useState("");

  const [conflictError, setConflictError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const scheduleMutation = useMutation({
    mutationFn: (body: any) => api.post("/api/v1/exams/final", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      setSuccessMessage("Final Exam scheduled successfully!");
      setSelectedOfferingId("");
      setDate("");
      setVenue("");
    },
    onError: (err: any) => {
      setConflictError(err?.message || "Failed to schedule exam. Check parameters.");
    },
  });

  const handleScheduleExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    setSuccessMessage(null);

    if (!selectedOfferingId) {
      setConflictError("Please select a course offering.");
      return;
    }

    if (endTime <= startTime) {
      setConflictError("End time must be after the start time.");
      return;
    }

    const selectedOffering = offerings.find((o) => String(o.offeringId) === selectedOfferingId);
    const targetBatchId = selectedOffering?.batchId ?? null;

    // quick check here, the server checks again
    const conflict = exams.find((exam) => {
      if (targetBatchId != null && exam.batchId === targetBatchId && exam.date === date && exam.status !== "cancelled") {
        return startTime < exam.endTime && exam.startTime < endTime;
      }
      return false;
    });

    if (conflict) {
      setConflictError(
        `FR-EXAM-03 Violation: Batch ${selectedOffering?.batchName || ""} already has a conflicting exam (${conflict.courseCode} at ${conflict.startTime}-${conflict.endTime}) scheduled on ${date}.`
      );
      return;
    }

    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const durationMinutes = (eh * 60 + em) - (sh * 60 + sm);

    try {
      await scheduleMutation.mutateAsync({
        offeringId: Number(selectedOfferingId),
        examDate: date,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        venue: venue || "Main Examination Hall",
        durationMinutes: durationMinutes > 0 ? durationMinutes : 120,
        scheduledById: user?.userId || 1,
      });
    } catch {
      // Handled in onError
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="admin" name={user?.fullName || "Staff Admin"} sub={user?.email || "Institution-wide"} />
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
          
          <div className="card p-4 sm:p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
            <h3 className="font-display font-bold text-base text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)] flex items-center justify-between">
              <span>Scheduled Final Exams ({exams.length})</span>
              <span className="badge badge-accent text-[10px]">FR-EXAM-03 Guarded</span>
            </h3>

            {/* Mobile Card View (< md) */}
            <div className="md:hidden divide-y divide-[var(--outline-variant)]">
              {examsLoading ? (
                <p className="py-8 text-center text-xs text-[var(--on-surface-variant)] animate-pulse">
                  Loading scheduled exams...
                </p>
              ) : examsError ? (
                <p className="py-8 text-center text-xs text-red-500 font-semibold">
                  Failed to load exams: {(examsErrorObj as Error)?.message || "unknown error"}
                </p>
              ) : exams.length === 0 ? (
                <p className="py-8 text-center text-xs text-[var(--on-surface-variant)]">
                  No final exams scheduled yet.
                </p>
              ) : (
                exams.map((ex) => (
                  <div key={ex.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-[var(--on-surface)]">{ex.courseCode}</span>
                      <span className="badge badge-gray text-[10px]">{ex.batch}</span>
                    </div>
                    <p className="text-xs text-[var(--on-surface-variant)]">{ex.courseTitle}</p>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-mono text-[var(--on-surface)]">{ex.date}</span>
                      <span className="font-mono text-[11px] text-[var(--tertiary)]">{ex.startTime} - {ex.endTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--on-surface-variant)]">
                      <span>Venue: <b>{ex.venue}</b></span>
                      <span>Scheduled by: <b>{ex.scheduledBy}</b></span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] uppercase font-semibold">
                    <th className="pb-3 px-3">Course</th>
                    <th className="pb-3 px-3">Batch</th>
                    <th className="pb-3 px-3">Date & Time</th>
                    <th className="pb-3 px-3">Venue</th>
                    <th className="pb-3 px-3">Scheduled By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline-variant)]">
                  {examsLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[var(--on-surface-variant)] animate-pulse">
                        Loading scheduled exams...
                      </td>
                    </tr>
                  ) : examsError ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-red-500 font-semibold">
                        Failed to load exams: {(examsErrorObj as Error)?.message || "unknown error"}
                      </td>
                    </tr>
                  ) : exams.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[var(--on-surface-variant)]">
                        No final exams scheduled yet.
                      </td>
                    </tr>
                  ) : (
                    exams.map((ex) => (
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
                        <td className="py-3 px-3 text-[var(--on-surface-variant)]">{ex.scheduledBy}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form */}
          <div className="card p-4 sm:p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] self-start">
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
                <label className="block text-xs font-semibold mb-1">Course Offering &amp; Batch</label>
                <select
                  value={selectedOfferingId}
                  onChange={(e) => setSelectedOfferingId(e.target.value)}
                  className="w-full text-xs min-h-[44px] p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
                  required
                >
                  <option value="">-- Select Course Offering --</option>
                  {offerings.map((o: any) => (
                    <option key={o.offeringId} value={o.offeringId}>
                      {o.courseCode} - {o.courseName} ({o.batchName || "Batch"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Exam Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full text-xs min-h-[44px] p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Start Time</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full text-xs min-h-[44px] p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">End Time</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full text-xs min-h-[44px] p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Exam Hall / Venue</label>
                <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Hall A" className="w-full text-xs min-h-[44px] p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" required />
              </div>

              <button type="submit" disabled={scheduleMutation.isPending} className="btn-primary w-full justify-center text-xs min-h-[44px] shadow-md mt-2">
                <i className="ti ti-calendar-plus mr-1"></i> {scheduleMutation.isPending ? "Scheduling..." : "Schedule Exam Paper"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
