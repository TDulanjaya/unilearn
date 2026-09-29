"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface AttendanceCourse {
  offeringId: number;
  code: string;
  title: string;
  attended: number;
  total: number;
  percentage: number;
  status: "Eligible" | "Warning" | "Critical";
}

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AttendanceCourse | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [sessionCode, setSessionCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["studentEnrollments", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/enrollments/student/${user?.userId}`),
    enabled: !!user?.userId,
  });

  // attendance records
  const { data: attendanceRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ["studentAttendance", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/attendance-records/student/${user?.userId}`),
    enabled: !!user?.userId,
  });

  const courses: AttendanceCourse[] = (enrollments || []).map((e: any) => {
    const courseRecords =
      attendanceRecords?.filter(
        (r: any) =>
          r.offeringId === e.offeringId ||
          r.session?.offeringId === e.offeringId ||
          r.courseCode === e.courseCode
      ) || [];
    const presentRecords = courseRecords.filter((r: any) => r.status === "Present");
    const attended = presentRecords.length;
    const total = courseRecords.length > 0 ? courseRecords.length : 1;
    const percentage = courseRecords.length > 0 ? Math.round((attended / total) * 100) : 0;

    return {
      offeringId: e.offeringId,
      code: e.courseCode || "—",
      title: e.courseName || "Course Workspace",
      attended,
      total,
      percentage,
      status: percentage >= 80 ? "Eligible" : percentage >= 60 ? "Warning" : "Critical",
    };
  });

  const triggerSuccess = () => {
    setCheckInSuccess(true);
    setToastMessage("Attendance verified successfully!");
    setTimeout(() => {
      setIsCheckInModalOpen(false);
      setCheckInSuccess(false);
      setIsScanning(false);
      setSessionCode("");
      setSelectedCourse(null);
      setErrorMessage(null);
    }, 1600);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const checkInMutation = useMutation({
    mutationFn: (code: string) => api.post("/api/v1/attendance-records/check-in", { sessionCode: code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentAttendance"] });
      triggerSuccess();
    },
    onError: (err: any) => {
      setErrorMessage(err.message || "Attendance check-in failed. Please verify the QR token.");
      setIsScanning(false);
    },
  });

  const handleCheckIn = () => {
    if (!sessionCode.trim()) {
      setErrorMessage("Please enter or paste the scanned QR session token.");
      return;
    }
    setErrorMessage(null);
    setIsScanning(true);
    checkInMutation.mutate(sessionCode.trim());
  };

  const openCheckIn = (course: AttendanceCourse) => {
    setSelectedCourse(course);
    setErrorMessage(null);
    setIsCheckInModalOpen(true);
  };

  if (enrollmentsLoading || recordsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-sm font-semibold text-[var(--on-surface-variant)] animate-pulse">
          Loading Attendance Tracking...
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--surface-container-highest)] border border-[var(--tertiary)] text-[var(--on-surface)] px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <i className="ti ti-check text-[var(--tertiary)] text-lg"></i>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Attendance Tracking & Session Check-In
          </h1>
          <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm">
            Scan lecture room QR codes or enter session tokens to log your presence.
          </p>
        </div>

        {courses.length > 0 && (
          <button
            onClick={() => openCheckIn(courses[0])}
            className="btn-primary text-sm sm:text-xs !py-3 sm:!py-2.5 !px-5 shadow-lg flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto min-h-[48px] rounded-xl font-bold"
          >
            <i className="ti ti-qrcode text-lg"></i> Scan QR / Enter Code
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {courses.length === 0 ? (
          <div className="text-center p-6 text-xs text-[var(--on-surface-variant)] col-span-full">
            No enrolled courses found for attendance tracking.
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.code + course.offeringId}
              className="card p-5 sm:p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] hover:shadow-lg transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-accent font-bold">{course.code}</span>
                <span className={`badge ${course.status === "Eligible" ? "badge-success" : "badge-warning"} text-[10px]`}>
                  {course.percentage}% ({course.status})
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-1 truncate">
                  {course.title}
                </h3>
                <p className="text-xs text-[var(--on-surface-variant)]">
                  {course.attended} / {course.total} Sessions Attended
                </p>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill transition-all duration-500"
                  style={{ width: `${course.percentage}%` }}
                ></div>
              </div>

              <button
                onClick={() => openCheckIn(course)}
                className="btn-primary w-full text-xs justify-center !py-2.5 shadow-sm min-h-[44px]"
              >
                <i className="ti ti-qrcode mr-1"></i> Scan QR / Enter Code
              </button>
            </div>
          ))
        )}
      </div>

      {attendanceRecords && attendanceRecords.length > 0 && (
        <div className="card p-4 sm:p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-display font-bold text-base text-[var(--on-surface)] flex items-center gap-2">
              <i className="ti ti-history text-[var(--tertiary)]"></i>
              Attendance Log & Verification History
            </h3>
            <span className="badge badge-outline text-xs self-start sm:self-auto">
              {attendanceRecords.length} Record{attendanceRecords.length > 1 ? "s" : ""} Logged
            </span>
          </div>

          {/* Mobile Card View (< md) */}
          <div className="md:hidden divide-y divide-[var(--outline-variant)]">
            {attendanceRecords.map((rec: any) => (
              <div key={rec.recordId} className="py-3 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--on-surface)]">
                    {rec.courseCode || "Course"} · {rec.courseName || ""}
                  </span>
                  <span className={`badge ${rec.status === "Present" ? "badge-success" : "badge-warning"} text-[10px]`}>
                    {rec.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--on-surface-variant)]">
                  <span>{rec.sessionDate || (rec.markedAt ? new Date(rec.markedAt).toLocaleDateString() : "Today")}</span>
                  <span className="font-mono text-[11px] text-[var(--tertiary)]">
                    {rec.markedAt ? new Date(rec.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[var(--on-surface-variant)]/70">
                  Session #{rec.sessionId}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Session Date</th>
                  <th className="py-2.5 px-3">Course / Module</th>
                  <th className="py-2.5 px-3">Session ID</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Verified At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-variant)]">
                {attendanceRecords.map((rec: any) => (
                  <tr key={rec.recordId} className="hover:bg-[var(--surface-container-high)]/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-[var(--on-surface)]">
                      {rec.sessionDate || (rec.markedAt ? new Date(rec.markedAt).toLocaleDateString() : "Today")}
                    </td>
                    <td className="py-3 px-3 text-[var(--on-surface)]">
                      <span className="font-bold mr-1">{rec.courseCode || "—"}</span>
                      <span className="text-[var(--on-surface-variant)]">{rec.courseName || "—"}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--on-surface-variant)]">
                      #{rec.sessionId}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`badge ${rec.status === "Present" ? "badge-success" : "badge-warning"} text-[10px]`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[var(--on-surface-variant)] font-mono text-[11px]">
                      {rec.markedAt ? new Date(rec.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass w-full max-w-md rounded-3xl p-6 sm:p-8 border border-[var(--glass-border)] shadow-2xl bg-[var(--surface-container-lowest)] space-y-5 text-center animate-scaleIn">
            <div className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-3">
              <div className="text-left">
                <h3 className="font-display font-bold text-base text-[var(--on-surface)]">
                  Session Attendance Check-In
                </h3>
                {selectedCourse && (
                  <p className="text-xs text-[var(--on-surface-variant)]">{selectedCourse.code} · {selectedCourse.title}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setIsCheckInModalOpen(false);
                  setErrorMessage(null);
                }}
                className="p-1 rounded-xl text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]"
              >
                <i className="ti ti-x text-xl"></i>
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-left flex items-start gap-2">
                <i className="ti ti-alert-triangle text-base shrink-0 mt-0.5"></i>
                <span>{errorMessage}</span>
              </div>
            )}

            {checkInSuccess ? (
              <div className="py-6 space-y-2 text-emerald-600 dark:text-emerald-400">
                <i className="ti ti-circle-check text-5xl block animate-bounce"></i>
                <h4 className="font-display font-bold text-lg">Attendance Verified!</h4>
                <p className="text-xs text-[var(--on-surface-variant)]">Checked-in present for today&apos;s session.</p>
              </div>
            ) : (
              <div className="space-y-4 py-2 text-left">
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                    Paste Scanned QR Session Token
                  </label>
                  <input
                    type="text"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value)}
                    placeholder="Enter or paste session QR token from lecturer..."
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] font-mono"
                  />
                </div>

                <div className="relative w-48 h-48 mx-auto rounded-3xl border-4 border-dashed border-[var(--tertiary)] bg-slate-950 flex flex-col items-center justify-center text-white overflow-hidden shadow-inner">
                  {isScanning ? (
                    <div className="space-y-3 flex flex-col items-center">
                      <i className="ti ti-scan text-4xl text-[var(--tertiary)] animate-pulse"></i>
                      <p className="text-xs text-slate-300 font-mono">Verifying Attendance...</p>
                    </div>
                  ) : (
                    <div className="space-y-2 flex flex-col items-center p-4 text-center">
                      <i className="ti ti-qrcode text-5xl text-[var(--tertiary)]"></i>
                      <p className="text-[10px] text-slate-400">Live rotating QR token generated by course lecturer</p>
                    </div>
                  )}
                  <div className="absolute inset-x-0 h-1 bg-[var(--tertiary)] top-1/2 animate-pulse"></div>
                </div>

                <button
                  onClick={handleCheckIn}
                  disabled={isScanning || !sessionCode.trim()}
                  className="btn-primary w-full justify-center text-xs !py-2.5 shadow-md disabled:opacity-40"
                >
                  <i className="ti ti-qrcode mr-1"></i> {isScanning ? "Verifying..." : "Check-In Attendance"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
