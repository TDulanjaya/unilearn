"use client";

import { useState } from "react";

interface ScheduleSlot {
  day: string;
  code: string;
  title: string;
  type: string;
  time: string;
  venue: string;
  lecturer: string;
}

const SCHEDULE: ScheduleSlot[] = [
  { day: "Monday", code: "SE308.3", title: "Software Process Mgmt", type: "Lecture", time: "09:00 AM - 11:00 AM", venue: "Main Hall A", lecturer: "Dr. K. Perera" },
  { day: "Tuesday", code: "SE202.2", title: "Database Systems Lab", type: "Lab", time: "11:00 AM - 01:00 PM", venue: "Computing Lab B", lecturer: "Dr. M. Rathnayake" },
  { day: "Wednesday", code: "SE309.3", title: "Software Verification", type: "Lecture", time: "10:00 AM - 12:00 PM", venue: "Hall 2B", lecturer: "Prof. A. Fernando" },
  { day: "Thursday", code: "SE104.1", title: "OOP Tutorial", type: "Tutorial", time: "02:00 PM - 04:00 PM", venue: "Room 102", lecturer: "Dr. K. Perera" },
  { day: "Friday", code: "SE399", title: "Project Review", type: "Discussion", time: "01:00 PM - 03:00 PM", venue: "Discussion Room 4", lecturer: "Prof. A. Fernando" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function StudentTimetablePage() {
  const [viewMode, setViewMode] = useState<"Weekly" | "Daily">("Weekly");
  const [selectedDay, setSelectedDay] = useState("Monday");

  
  const handleExportIcs = () => {
    let icsString = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//UniLearn//Student Timetable//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:UniLearn Semester Timetable",
    ];

    SCHEDULE.forEach((slot, idx) => {
      icsString.push(
        "BEGIN:VEVENT",
        `UID:unilearn-slot-${idx}@uni.edu`,
        `SUMMARY:${slot.code} - ${slot.title} (${slot.type})`,
        `DESCRIPTION:Lecturer: ${slot.lecturer} | Venue: ${slot.venue}`,
        `LOCATION:${slot.venue}`,
        `STATUS:CONFIRMED`,
        "END:VEVENT"
      );
    });

    icsString.push("END:VCALENDAR");

    const blob = new Blob([icsString.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "UniLearn_Semester_Timetable.ics";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Class Timetable & Schedule
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Semester 2 lecture, tutorial, and laboratory session timings.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          
          <div className="flex items-center gap-1 p-1 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-2xl">
            {(["Weekly", "Daily"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === mode
                    ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-sm"
                    : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                }`}
              >
                {mode} View
              </button>
            ))}
          </div>

          
          <button
            onClick={handleExportIcs}
            className="btn-outline text-xs !py-2.5 !px-4 flex items-center gap-1.5"
            title="Export calendar to iCal format"
          >
            <i className="ti ti-calendar-export text-base"></i> Export .ics
          </button>
        </div>
      </div>

      
      {viewMode === "Weekly" ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {DAYS.map((day) => {
            const daySlot = SCHEDULE.find((s) => s.day === day);
            return (
              <div
                key={day}
                className="card p-5 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] flex flex-col justify-between space-y-3"
              >
                <div className="border-b border-[var(--outline-variant)] pb-2">
                  <span className="font-display font-bold text-sm text-[var(--on-surface)]">{day}</span>
                </div>

                {daySlot ? (
                  <div className="space-y-2 text-xs">
                    <span className="badge badge-accent font-bold">{daySlot.code}</span>
                    <h4 className="font-semibold text-[var(--on-surface)]">{daySlot.title}</h4>
                    <p className="text-[11px] text-[var(--on-surface-variant)]">{daySlot.time}</p>
                    <p className="text-[11px] text-[var(--outline)]">Venue: {daySlot.venue}</p>
                    <p className="text-[10px] text-[var(--tertiary)] font-medium">{daySlot.lecturer}</p>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--outline)] italic py-4">No scheduled classes</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        
        <div className="space-y-4">
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedDay === day
                    ? "bg-[var(--tertiary)] text-white shadow-sm"
                    : "bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          
          {SCHEDULE.filter((s) => s.day === selectedDay).map((slot, idx) => (
            <div
              key={idx}
              className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] flex items-center justify-center font-bold">
                  <i className="ti ti-clock text-2xl"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-accent font-bold">{slot.code}</span>
                    <span className="badge bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]">{slot.type}</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-[var(--on-surface)]">{slot.title}</h3>
                  <p className="text-xs text-[var(--on-surface-variant)]">Instructor: {slot.lecturer}</p>
                </div>
              </div>

              <div className="text-right text-xs space-y-1 sm:border-l sm:border-[var(--outline-variant)] sm:pl-6">
                <p className="font-mono font-bold text-sm text-[var(--tertiary)]">{slot.time}</p>
                <p className="text-[var(--on-surface-variant)]">Venue: {slot.venue}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
