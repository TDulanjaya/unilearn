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

  const generateNewToken = () => {
    const randomHex = Math.random().toString(36).slice(2, 8).toUpperCase();
    const newToken = `${slot.courseCode}-${slot.id}-${Date.now()}-${randomHex}`;
    setToken(newToken);
  };

  useEffect(() => {
    generateNewToken();
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
    <div className="fixed inset-0 z-50 bg-[var(--surface-container-lowest)] dark:bg-[#070f1e] text-[var(--on-surface)] flex flex-col justify-between p-6 sm:p-10 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--outline-variant)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> QR Attendance Live
            </span>
            <span className="badge badge-accent text-xs font-bold">{slot.courseCode}</span>
          </div>
          <h1 className="font-display font-extrabold text-xl sm:text-2xl text-[var(--on-surface)]">
            {slot.courseTitle}
          </h1>
          <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
            {slot.day}s · {slot.time} · Venue: {slot.venue}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[var(--surface-container-low)] p-3 px-5 rounded-2xl border border-[var(--outline-variant)] self-start sm:self-auto">
          <i className="ti ti-users-check text-2xl text-[var(--tertiary)]"></i>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--on-surface-variant)]">
              Students Checked In
            </p>
            <p className="font-display font-extrabold text-xl text-[var(--on-surface)]">
              {checkedInCount} <span className="text-xs font-normal text-[var(--outline)]">/ {slot.enrolledStudents.length} enrolled</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-6 text-center space-y-4">
        <div className="p-6 bg-white rounded-3xl shadow-2xl border-4 border-[var(--tertiary)] flex items-center justify-center transition-transform hover:scale-105">
          {token ? (
            <QRCodeSVG value={token} size={280} level="H" includeMargin={true} />
          ) : (
            <div className="w-[280px] h-[280px] flex items-center justify-center text-slate-400">Loading QR...</div>
          )}
        </div>
        <p className="text-xs text-[var(--on-surface-variant)] font-semibold">
          Scan using UniLearn Mobile App to mark attendance for this session.
        </p>
      </div>

      
      <div className="pt-4 border-t border-[var(--outline-variant)] flex items-center justify-between">
        <button onClick={onClose} className="btn-secondary text-xs px-4 py-2">
          Cancel (Discard QR Session)
        </button>
        <button onClick={handleCloseSession} className="btn-primary text-xs px-6 py-2.5 shadow-lg">
          <i className="ti ti-lock-check mr-1 text-sm"></i> Close & Save Attendance Session
        </button>
      </div>
    </div>
  );
}
