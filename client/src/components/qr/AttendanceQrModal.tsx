"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/api";

export interface Student {
  id: string;
  name: string;
  indexNo: string;
}

export interface TeachingSlotData {
  id: string;
  courseCode: string;
  courseTitle: string;
  day: string;
  time: string;
  venue: string;
  type: string;
  enrolledStudents: Student[];
}

export type AttendanceStatus = "Present" | "Absent" | "Late";

interface AttendanceQrModalProps {
  slot: TeachingSlotData;
  initialAttendance: Record<string, AttendanceStatus>;
  onClose: () => void;
  onSaveSession: (updatedAttendance: Record<string, AttendanceStatus>) => void;
}

export default function AttendanceQrModal({
  slot,
  initialAttendance,
  onClose,
  onSaveSession,
}: AttendanceQrModalProps) {
  const [token, setToken] = useState("");
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(initialAttendance);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState("");

  const fetchBackendToken = async () => {
    try {
      setTokenLoading(true);
      setTokenError("");
      const res = await api.get<{ token: string; expiresInSeconds: number }>(
        `/api/v1/attendance-sessions/${slot.id}/qr-token`
      );
      if (res && res.token) {
        setToken(res.token);
      }
    } catch {
      setTokenError("Failed to fetch secure QR token from server.");
    } finally {
      setTokenLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendToken();
    // rotate token every minute
    const rotateInterval = setInterval(fetchBackendToken, 60000);
    return () => clearInterval(rotateInterval);
  }, [slot.id]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const records = await api.get<any[]>(`/api/v1/attendance-records/session/${slot.id}`);
        setAttendance((prev) => {
          const next = { ...prev };
          records.forEach((rec: any) => {
            next[String(rec.studentId)] = "Present";
          });
          return next;
        });
      } catch (err) {
        console.error("Error polling attendance:", err);
      }
    };

    fetchAttendance();
    const checkInInterval = setInterval(fetchAttendance, 3000);

    return () => clearInterval(checkInInterval);
  }, [slot.id]);

  useEffect(() => {
    const presentCount = Object.values(attendance).filter((st) => st === "Present").length;
    setCheckedInCount(presentCount);
  }, [attendance]);

  const handleCloseSession = () => {
    onSaveSession(attendance);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--surface-container-lowest)] dark:bg-[#070f1e] text-[var(--on-surface)] flex flex-col justify-between p-4 sm:p-8 md:p-10 animate-fadeIn overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-[var(--outline-variant)]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> Live QR
              </span>
              <span className="badge badge-accent text-xs font-bold">{slot.courseCode}</span>
            </div>
            <h1 className="font-display font-extrabold text-lg sm:text-2xl text-[var(--on-surface)]">
              {slot.courseTitle}
            </h1>
            <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
              {slot.day}s · {slot.time} · Venue: {slot.venue}
            </p>
          </div>
          <button
            onClick={onClose}
            className="sm:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
            aria-label="Close"
          >
            <i className="ti ti-x text-xl"></i>
          </button>
        </div>

        <div className="flex items-center gap-3 bg-[var(--surface-container-low)] p-3 px-4 rounded-2xl border border-[var(--outline-variant)] self-start sm:self-auto">
          <i className="ti ti-users-check text-2xl text-[var(--tertiary)]"></i>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--on-surface-variant)]">
              Students Checked In
            </p>
            <p className="font-display font-extrabold text-lg sm:text-xl text-[var(--on-surface)]">
              {checkedInCount} <span className="text-xs font-normal text-[var(--outline)]">/ {slot.enrolledStudents.length} enrolled</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main QR Display */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 text-center space-y-4">
        <div className="p-4 sm:p-6 bg-white rounded-3xl shadow-2xl border-4 border-[var(--tertiary)] flex items-center justify-center transition-transform hover:scale-105 max-w-[280px] sm:max-w-none">
          {token ? (
            <QRCodeSVG value={token} size={230} className="w-[200px] h-[200px] sm:w-[260px] sm:h-[260px]" level="H" includeMargin={true} />
          ) : (
            <div className="w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] flex items-center justify-center text-slate-400 text-xs">Loading QR...</div>
          )}
        </div>
        {tokenError && (
          <p className="text-xs text-red-500 font-semibold">{tokenError}</p>
        )}
        <div className="flex flex-col sm:flex-row items-center gap-2 max-w-md">
          <p className="text-xs text-[var(--on-surface-variant)] font-semibold">
            Scan using UniLearn to mark attendance (auto-rotates every 60s).
          </p>
          <button
            type="button"
            onClick={fetchBackendToken}
            disabled={tokenLoading}
            className="min-h-[44px] px-3 rounded-lg bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--tertiary)] text-xs flex items-center gap-1.5"
            title="Refresh QR Token"
          >
            <i className={`ti ti-refresh text-xs ${tokenLoading ? "animate-spin" : ""}`}></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="pt-4 border-t border-[var(--outline-variant)] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button onClick={onClose} className="btn-secondary text-xs px-4 min-h-[44px] justify-center">
          Cancel (Discard QR Session)
        </button>
        <button onClick={handleCloseSession} className="btn-primary text-xs px-6 min-h-[44px] shadow-lg justify-center">
          <i className="ti ti-lock-check mr-1 text-sm"></i> Close & Save Attendance Session
        </button>
      </div>
    </div>
  );
}
