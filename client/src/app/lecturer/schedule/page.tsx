"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LecturerNavbar from "@/components/LecturerNavbar";
import AttendanceQrModal, { AttendanceStatus } from "@/components/qr/AttendanceQrModal";
import { useAcademicData } from "@/context/AcademicDataContext";

interface TeachingSlot {
  id: string;
  offeringId: number;
  courseCode: string;
  courseTitle: string;
  day: string;
  time: string;
  venue: string;
  type: string;
  enrolledStudents: { id: string; name: string; indexNo: string }[];
}

function getSlotScheduleStatus(slotTimeStr: string, dayOfWeek: string) {
  const now = new Date();
  const currentDayIndex = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = dayNames[currentDayIndex];

  const dayMap: Record<string, number> = {
    sun: 0, sunday: 0, suns: 0,
    mon: 1, monday: 1, mons: 1,
    tue: 2, tuesday: 2, tues: 2,
    wed: 3, wednesday: 3, weds: 3,
    thu: 4, thursday: 4, thus: 4, thur: 4, thurs: 4,
    fri: 5, friday: 5, fris: 5,
    sat: 6, saturday: 6, sats: 6,
  };

  const cleanDay = (dayOfWeek || "").toLowerCase().trim();
  const slotDayIndex = dayMap[cleanDay] !== undefined ? dayMap[cleanDay] : -1;
  const isToday = slotDayIndex === currentDayIndex;

  const parts = slotTimeStr.split("-").map((s) => s.trim());
  const parseMinutes = (tStr: string) => {
    if (!tStr) return 0;
    const [h, m] = tStr.split(":").map(Number);
    return isNaN(h) || isNaN(m) ? 0 : h * 60 + m;
  };

  if (!isToday) {
    const isPastDay = slotDayIndex !== -1 && slotDayIndex < currentDayIndex;
    return {
      isToday: false,
      canGenerateQr: false,
      statusLabel: isPastDay ? `Completed (${dayOfWeek})` : `Scheduled (${dayOfWeek})`,
      badgeStyle: "bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]",
      reason: `QR generation is only available on ${dayOfWeek} during class.`,
    };
  }

  // It IS Today!
  const startMin = parts.length >= 2 ? parseMinutes(parts[0]) : 0;
  const endMin = parts.length >= 2 ? parseMinutes(parts[1]) : 1440;
  const currentMin = now.getHours() * 60 + now.getMinutes();

  if (currentMin > endMin + 30) {
    return {
      isToday: true,
      canGenerateQr: false,
      statusLabel: "Class Ended Today",
      badgeStyle: "bg-red-500/10 text-red-400 border border-red-500/20",
      reason: "Class duration for today has ended.",
    };
  }

  return {
    isToday: true,
    canGenerateQr: true,
    statusLabel: "Live Today",
    badgeStyle: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    reason: "",
  };
}

export default function LecturerSchedulePage() {
  const { user } = useAuth();
  const { slots, isLoadingSlots } = useAcademicData();

  const [previewMode, setPreviewMode] = useState(false);
  const [, setTick] = useState(0);

  // States
  const [activeQrSession, setActiveQrSession] = useState<any | null>(null);
  const [selectedAttendanceSlot, setSelectedAttendanceSlot] = useState<TeachingSlot | null>(null);
  const [currentAttendance, setCurrentAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [savedSlotIds, setSavedSlotIds] = useState<Record<string, boolean>>({});

  // 1. Fetch lecturer offerings to match enrollments
  const { data: lecturerOfferings, isLoading: offeringsLoading } = useQuery({
    queryKey: ["lecturerOfferings", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/course-offerings/lecturer/${user?.userId}`),
    enabled: !!user?.userId,
  });

  const lecturerOfferingIds = lecturerOfferings?.map((o: any) => o.offeringId) || [];
  const lecturerSlots = slots.filter((slot) => lecturerOfferingIds.includes(slot.offeringId));

  const teachingSlots: TeachingSlot[] = lecturerSlots.map((s) => {
    const activeOffering = lecturerOfferings?.find((o: any) => o.offeringId === s.offeringId);
    const enrolledStudents = activeOffering?.enrollments?.map((e: any) => ({
      id: String(e.studentId),
      name: e.studentName || `Student #${e.studentId}`,
      indexNo: e.studentIndexNo || `SE/2023/0${e.studentId}`,
    })) || [];

    return {
      id: String(s.slotId),
      offeringId: s.offeringId,
      courseCode: s.courseCode,
      courseTitle: s.courseName,
      day: s.dayOfWeek,
      time: `${s.startTime} - ${s.endTime}`,
      venue: s.venue,
      type: s.slotType,
      enrolledStudents,
    };
  });

  // Mutations
  const startSessionMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/v1/attendance-sessions", data),
  });

  const closeSessionMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/attendance-sessions/${id}`),
  });

  const bulkMarkMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/v1/attendance-records/bulk", data),
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleGenerateQr = async (slot: TeachingSlot) => {
    try {
      const now = new Date();
      const sessionDate = now.toISOString().split("T")[0];
      const startTime = now.toTimeString().split(" ")[0];
      const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const endTime = end.toTimeString().split(" ")[0];

      const res = await startSessionMutation.mutateAsync({
        offeringId: slot.offeringId,
        sessionDate,
        startTime,
        endTime,
        markedByLecturerId: user?.userId,
      });

      setActiveQrSession({
        id: String(res.sessionId),
        courseCode: slot.courseCode,
        courseTitle: slot.courseTitle,
        day: slot.day,
        time: slot.time,
        venue: slot.venue,
        type: slot.type,
        enrolledStudents: slot.enrolledStudents,
      });
    } catch (err: any) {
      alert("Failed to start attendance session: " + err.message);
    }
  };

  const handleSaveQrAttendance = async (updatedAttendance: Record<string, AttendanceStatus>) => {
    if (!activeQrSession) return;
    try {
      const sessionId = Number(activeQrSession.id);
      const records = Object.entries(updatedAttendance).map(([studentId, status]) => ({
        studentId: Number(studentId),
        status,
      }));

      if (records.length > 0) {
        await bulkMarkMutation.mutateAsync({
          sessionId,
          records,
        });
      }

      setSavedSlotIds((prev) => ({ ...prev, [activeQrSession.id]: true }));
      setActiveQrSession(null);
      alert("Attendance session saved and closed successfully!");
    } catch (err: any) {
      alert("Failed to save QR session: " + err.message);
    }
  };

  const handleOpenAttendance = (slot: TeachingSlot) => {
    setSelectedAttendanceSlot(slot);
    const initial: Record<string, AttendanceStatus> = {};
    slot.enrolledStudents.forEach((st) => {
      initial[st.id] = "Present";
    });
    setCurrentAttendance(initial);
  };

  const handleToggleAttendanceStatus = (studentId: string, status: AttendanceStatus) => {
    setCurrentAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedAttendanceSlot) return;
    try {
      const now = new Date();
      const sessionDate = now.toISOString().split("T")[0];
      const startTime = now.toTimeString().split(" ")[0];
      const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const endTime = end.toTimeString().split(" ")[0];

      // 1. Create or retrieve active session for today
      const session = await startSessionMutation.mutateAsync({
        offeringId: selectedAttendanceSlot.offeringId,
        sessionDate,
        startTime,
        endTime,
        markedByLecturerId: user?.userId,
      });

      // 2. Bulk post student records
      const records = Object.entries(currentAttendance).map(([studentId, status]) => ({
        studentId: Number(studentId),
        status,
      }));

      await bulkMarkMutation.mutateAsync({
        sessionId: session.sessionId,
        records,
      });

      setSavedSlotIds((prev) => ({ ...prev, [selectedAttendanceSlot.id]: true }));
      setSelectedAttendanceSlot(null);
      alert("Manual roster saved successfully!");
    } catch (err: any) {
      alert("Failed to save roster: " + err.message);
    }
  };

  const now = new Date();
  const currentDayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const todaySlots = teachingSlots.filter((slot) => {
    const status = getSlotScheduleStatus(slot.time, slot.day);
    return status.isToday;
  });
  const upcomingSlots = teachingSlots.filter((slot) => {
    const status = getSlotScheduleStatus(slot.time, slot.day);
    return !status.isToday;
  });

  if (isLoadingSlots || offeringsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-sm font-semibold text-[var(--on-surface-variant)] animate-pulse">
          Loading Teaching Timetable...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)] pb-12">
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)]">
                Teaching Schedule & Attendance
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--tertiary)]/15 text-[var(--tertiary)] border border-[var(--tertiary)]/30">
                Today: {currentDayName}
              </span>
            </div>
            <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm">
              Live QR code attendance generation is active for today's classes only.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[var(--surface-container-low)] p-2.5 px-4 rounded-2xl border border-[var(--outline-variant)] self-start sm:self-auto">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[var(--on-surface)]">Preview Mode</span>
              <span className="text-[10px] text-[var(--outline)]">Override time-lock for testing</span>
            </div>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                previewMode ? "bg-[var(--tertiary)]" : "bg-[var(--outline-variant)]"
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${previewMode ? "translate-x-5" : "translate-x-0"}`}></div>
            </button>
          </div>
        </div>

        {/* 1. TODAY'S CLASSES SECTION */}
        <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--outline-variant)]">
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
              <i className="ti ti-qrcode text-emerald-400 text-xl"></i>
              Today's Classes ({todaySlots.length}) — {currentDayName}
            </h3>
          </div>

          <div className="space-y-4">
            {todaySlots.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-[var(--outline-variant)] bg-[var(--surface-container-low)]/50">
                <i className="ti ti-calendar-off text-3xl text-[var(--on-surface-variant)] mb-2 block opacity-60"></i>
                <p className="text-xs text-[var(--on-surface-variant)] font-medium">
                  No teaching slots scheduled for today ({currentDayName}).
                </p>
                <p className="text-[11px] text-[var(--outline)] mt-0.5">
                  QR attendance codes will activate automatically on scheduled class days.
                </p>
              </div>
            ) : (
              todaySlots.map((slot) => {
                const isAttendanceSaved = savedSlotIds[slot.id];
                const slotStatus = getSlotScheduleStatus(slot.time, slot.day);
                const canGenerateQr = previewMode || slotStatus.canGenerateQr;

                return (
                  <div
                    key={slot.id}
                    className="p-4 border border-emerald-500/30 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors shadow-sm"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="badge badge-accent font-bold">{slot.courseCode}</span>
                        <span className="badge badge-gray">{slot.type}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${slotStatus.badgeStyle}`}>
                          {slotStatus.statusLabel}
                        </span>
                        {isAttendanceSaved && (
                          <span className="badge badge-success text-[10px] font-bold">
                            <i className="ti ti-check"></i> Attendance Saved
                          </span>
                        )}
                      </div>

                      <p className="font-bold text-sm text-[var(--on-surface)]">{slot.courseTitle}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--on-surface-variant)] mt-0.5">
                        <span>
                          <i className="ti ti-clock text-[var(--tertiary)] mr-1"></i>
                          {slot.day} · {slot.time}
                        </span>
                        <span>
                          <i className="ti ti-map-pin text-[var(--tertiary)] mr-1"></i>
                          {slot.venue}
                        </span>
                        <span>
                          <i className="ti ti-users text-[var(--tertiary)] mr-1"></i>
                          {slot.enrolledStudents.length} Students
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleGenerateQr(slot)}
                        disabled={!canGenerateQr}
                        className="btn-primary text-xs !py-1.5 shadow-md disabled:opacity-40 flex items-center gap-1.5"
                        title={canGenerateQr ? "Open live rotating QR code for students" : slotStatus.reason}
                      >
                        <i className="ti ti-qrcode text-sm"></i> Generate QR
                      </button>

                      <button
                        onClick={() => handleOpenAttendance(slot)}
                        className="btn-secondary text-xs !py-1.5 flex items-center gap-1"
                      >
                        <i className="ti ti-user-check text-sm"></i> Manual Roster
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 2. OTHER WEEKLY SCHEDULE SECTION */}
        <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--outline-variant)]">
            <h3 className="font-display font-bold text-base text-[var(--on-surface)] flex items-center gap-2">
              <i className="ti ti-calendar-event text-[var(--tertiary)] text-lg"></i>
              Other Weekly Teaching Slots ({upcomingSlots.length})
            </h3>
            <span className="text-[11px] text-[var(--on-surface-variant)]">
              Reference view · QR generation opens on respective days
            </span>
          </div>

          <div className="space-y-3">
            {upcomingSlots.length === 0 ? (
              <p className="p-4 text-center text-xs text-[var(--on-surface-variant)] italic">
                All assigned slots are scheduled for today.
              </p>
            ) : (
              upcomingSlots.map((slot) => {
                const isAttendanceSaved = savedSlotIds[slot.id];
                const slotStatus = getSlotScheduleStatus(slot.time, slot.day);
                const canGenerateQr = previewMode;

                return (
                  <div
                    key={slot.id}
                    className="p-3.5 border border-[var(--outline-variant)] bg-[var(--surface-container-low)]/30 opacity-80 hover:opacity-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-opacity"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="badge badge-accent font-bold opacity-80">{slot.courseCode}</span>
                        <span className="badge badge-gray">{slot.type}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]">
                          {slot.day}
                        </span>
                        {isAttendanceSaved && (
                          <span className="badge badge-success text-[10px] font-bold">
                            <i className="ti ti-check"></i> Attendance Saved
                          </span>
                        )}
                      </div>

                      <p className="font-semibold text-xs text-[var(--on-surface)]">{slot.courseTitle}</p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--on-surface-variant)] mt-0.5">
                        <span>
                          <i className="ti ti-clock opacity-60 mr-1"></i>
                          {slot.day} · {slot.time}
                        </span>
                        <span>
                          <i className="ti ti-map-pin opacity-60 mr-1"></i>
                          {slot.venue}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleGenerateQr(slot)}
                        disabled={!canGenerateQr}
                        className="btn-secondary text-xs !py-1 disabled:opacity-30 flex items-center gap-1 cursor-not-allowed disabled:cursor-not-allowed"
                        title={previewMode ? "Preview Mode active" : `QR code is only available on ${slot.day}s`}
                      >
                        <i className="ti ti-lock text-xs"></i> Only on {slot.day}
                      </button>

                      <button
                        onClick={() => handleOpenAttendance(slot)}
                        className="btn-secondary text-xs !py-1 flex items-center gap-1 opacity-70 hover:opacity-100"
                        title="View enrolled students roster"
                      >
                        <i className="ti ti-users text-xs"></i> Roster
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {activeQrSession && (
        <AttendanceQrModal
          slot={activeQrSession}
          initialAttendance={
            activeQrSession.enrolledStudents.reduce((acc: any, st: any) => {
              acc[st.id] = "Absent";
              return acc;
            }, {} as Record<string, AttendanceStatus>)
          }
          onClose={() => setActiveQrSession(null)}
          onSaveSession={handleSaveQrAttendance}
        />
      )}

      {selectedAttendanceSlot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-2xl p-6 bg-[var(--surface-container-lowest)] shadow-2xl border border-[var(--outline-variant)] animate-scaleIn">
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
