"use client";

import { useState, useEffect } from "react";
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

  // 1. Fetch student enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["studentEnrollments", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/enrollments/student/${user?.userId}`),
    enabled: !!user?.userId,
  });

  // 2. Fetch student attendance records
  const { data: attendanceRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ["studentAttendance", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/attendance-records/student/${user?.userId}`),
    enabled: !!user?.userId,
  });

  const courses: AttendanceCourse[] = (enrollments || []).map((e: any) => {
    const courseRecords = attendanceRecords?.filter((r: any) => r.session?.offeringId === e.offeringId) || [];
    const presentRecords = courseRecords.filter((r: any) => r.status === "Present");
    const attended = presentRecords.length;
    const total = courseRecords.length || 25; // fallback total to 25 if no sessions marked yet
    const percentage = Math.round((attended / total) * 100);

    return {
      offeringId: e.offeringId,
      code: e.courseCode,
      title: e.courseName,
      attended,
      total,
      percentage,
      status: percentage >= 80 ? "Eligible" : percentage >= 60 ? "Warning" : "Critical",
    };
  });

  const triggerSuccess = () => {
    setCheckInSuccess(true);
    setTimeout(() => {
      setIsCheckInModalOpen(false);
      setCheckInSuccess(false);
      setIsScanning(false);
      setSessionCode("");
      setSelectedCourse(null);
    }, 1600);
  };

  const checkInMutation = useMutation({
    mutationFn: (code: string) => api.post("/api/v1/attendance-records/check-in", { sessionCode: code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentAttendance"] });
      triggerSuccess();
    },
    onError: (err: any) => {
      alert("Check-in failed: " + err.message);
      setIsScanning(false);
    }
  });

  const handleSimulateQrScan = () => {
    if (!sessionCode.trim()) {
      alert("Please paste the scanned QR session token first!");
      return;
    }
    setIsScanning(true);
    setTimeout(() => {
      checkInMutation.mutate(sessionCode.trim());
    }, 1200);
  };

  const openCheckIn = (course: AttendanceCourse) => {
    setSelectedCourse(course);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Attendance Tracking & Session Check-In
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Scan lecture room QR codes to log present status for enrolled modules.
          </p>
        </div>

        {courses.length > 0 && (
          <button
            onClick={() => openCheckIn(courses[0])}
            className="btn-primary text-xs !py-2.5 !px-4 shadow-md flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <i className="ti ti-qrcode text-base"></i> Scan Session QR
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="text-center p-6 text-xs text-[var(--on-surface-variant)] col-span-3">
            No enrolled courses found for attendance tracking.
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.code}
              className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] hover:shadow-lg transition-all space-y-4"
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
                className="btn-primary w-full text-xs justify-center !py-2 shadow-sm"
              >
                <i className="ti ti-qrcode mr-1"></i> Scan QR
              </button>
            </div>
          ))
        )}
      </div>

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
                onClick={() => setIsCheckInModalOpen(false)}
                className="p-1 rounded-xl text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]"
              >
                <i className="ti ti-x text-xl"></i>
              </button>
            </div>

            {checkInSuccess ? (
              <div className="py-6 space-y-2 text-emerald-600 dark:text-emerald-400">
                <i className="ti ti-circle-check text-5xl block animate-bounce"></i>
                <h4 className="font-display font-bold text-lg">Attendance Verified!</h4>
                <p className="text-xs text-[var(--on-surface-variant)]">Checked-in present for today's session.</p>
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
                    placeholder="e.g. SE308.3-1-172300000-ABCD"
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] font-mono"
                  />
                </div>

                <div className="relative w-48 h-48 mx-auto rounded-3xl border-4 border-dashed border-[var(--tertiary)] bg-slate-950 flex flex-col items-center justify-center text-white overflow-hidden shadow-inner">
                  {isScanning ? (
                    <div className="space-y-3 flex flex-col items-center">
                      <i className="ti ti-scan text-4xl text-[var(--tertiary)] animate-pulse"></i>
                      <p className="text-xs text-slate-300 font-mono">Reading QR Token...</p>
                    </div>
                  ) : (
                    <div className="space-y-2 flex flex-col items-center p-4 text-center">
                      <i className="ti ti-qrcode text-5xl text-[var(--tertiary)]"></i>
                      <p className="text-[10px] text-slate-400">Scan live rotating QR Code generated by lecturer</p>
                    </div>
                  )}
                  <div className="absolute inset-x-0 h-1 bg-[var(--tertiary)] top-1/2 animate-pulse"></div>
                </div>

                <button
                  onClick={handleSimulateQrScan}
                  disabled={isScanning || !sessionCode.trim()}
                  className="btn-primary w-full justify-center text-xs !py-2.5 shadow-md disabled:opacity-40"
                >
                  <i className="ti ti-camera mr-1"></i> {isScanning ? "Verifying..." : "Check-In Student"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
