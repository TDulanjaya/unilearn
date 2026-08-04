"use client";

import { useState } from "react";

interface AttendanceCourse {
  code: string;
  title: string;
  attended: number;
  total: number;
  percentage: number;
  status: "Eligible" | "Warning" | "Critical";
}

const ATTENDANCE_COURSES: AttendanceCourse[] = [
  { code: "SE308.3", title: "Software Process Mgmt", attended: 23, total: 25, percentage: 92, status: "Eligible" },
  { code: "SE202.2", title: "Database Systems", attended: 22, total: 25, percentage: 88, status: "Eligible" },
  { code: "SE309.3", title: "Verification & Validation", attended: 19, total: 25, percentage: 76, status: "Warning" },
];

export default function StudentAttendancePage() {
  const [courses, setCourses] = useState<AttendanceCourse[]>(ATTENDANCE_COURSES);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AttendanceCourse | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  const triggerSuccess = () => {
    if (selectedCourse) {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.code === selectedCourse.code) {
            const newAttended = c.attended + 1;
            const newPct = Math.round((newAttended / c.total) * 100);
            return {
              ...c,
              attended: newAttended,
              percentage: newPct,
              status: newPct >= 80 ? "Eligible" : "Warning",
            };
          }
          return c;
        })
      );
    }

    setCheckInSuccess(true);
    setTimeout(() => {
      setIsCheckInModalOpen(false);
      setCheckInSuccess(false);
      setIsScanning(false);
      setSelectedCourse(null);
    }, 1600);
  };

  const handleSimulateQrScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      triggerSuccess();
    }, 1200);
  };

  const openCheckIn = (course: AttendanceCourse) => {
    setSelectedCourse(course);
    setIsCheckInModalOpen(true);
  };

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

        <button
          onClick={() => openCheckIn(courses[0])}
          className="btn-primary text-xs !py-2.5 !px-4 shadow-md flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <i className="ti ti-qrcode text-base"></i> Scan Session QR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.code}
            className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] hover:shadow-lg transition-all space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="badge badge-accent font-bold">{course.code}</span>
              {course.status === "Eligible" ? (
                <span className="badge badge-success text-[10px]">{course.percentage}% (Eligible)</span>
              ) : (
                <span className="badge badge-warning text-[10px]">{course.percentage}% (Warning)</span>
              )}
            </div>

            <div>
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-1">
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
        ))}
      </div>

      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass w-full max-w-md rounded-3xl p-6 sm:p-8 border border-[var(--glass-border)] shadow-2xl bg-[var(--surface-container-lowest)] space-y-5 text-center">
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
              <div className="space-y-4 py-2">
                <div className="relative w-56 h-56 mx-auto rounded-3xl border-4 border-dashed border-[var(--tertiary)] bg-slate-950 flex flex-col items-center justify-center text-white overflow-hidden shadow-inner">
                  {isScanning ? (
                    <div className="space-y-3 flex flex-col items-center">
                      <i className="ti ti-scan text-4xl text-[var(--tertiary)] animate-pulse"></i>
                      <p className="text-xs text-slate-300 font-mono">Reading QR Token...</p>
                    </div>
                  ) : (
                    <div className="space-y-2 flex flex-col items-center p-4">
                      <i className="ti ti-qrcode text-5xl text-[var(--tertiary)]"></i>
                      <p className="text-[11px] text-slate-400">Point phone camera at classroom projector screen</p>
                    </div>
                  )}

                  <div className="absolute inset-x-0 h-1 bg-[var(--tertiary)] top-1/2 animate-pulse"></div>
                </div>

                <button
                  onClick={handleSimulateQrScan}
                  disabled={isScanning}
                  className="btn-primary w-full justify-center text-xs !py-2.5 shadow-md"
                >
                  <i className="ti ti-camera mr-1"></i> {isScanning ? "Scanning..." : "Simulate QR Camera Scan"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
