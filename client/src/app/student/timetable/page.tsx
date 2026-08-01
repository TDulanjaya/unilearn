"use client";
import { useState } from "react";

const DAYS = [
  { key: "Monday", label: "Mon" },
  { key: "Tuesday", label: "Tue" },
  { key: "Wednesday", label: "Wed" },
  { key: "Thursday", label: "Thu" },
  { key: "Friday", label: "Fri" },
];

const SCHEDULE = [
  {
    day: "Monday",
    code: "SE308.3",
    title: "Software Process Mgmt",
    type: "Lecture",
    time: "09:00 - 11:00",
    venue: "Hall 3A",
    theme: "lecture",
  },
  {
    day: "Tuesday",
    code: "SE202.2",
    title: "Database Systems Lab",
    type: "Lab",
    time: "11:00 - 13:00",
    venue: "Lab B",
    theme: "lab",
  },
  {
    day: "Wednesday",
    code: "SE309.3",
    title: "Software Verification",
    type: "Lecture",
    time: "10:00 - 12:00",
    venue: "Hall 2B",
    theme: "lecture",
  },
  {
    day: "Thursday",
    code: "SE104.1",
    title: "OOP Tutorial",
    type: "Tutorial",
    time: "14:00 - 16:00",
    venue: "Room 102",
    theme: "lab",
  },
  {
    day: "Friday",
    code: "SE399",
    title: "Project Review",
    type: "Discussion",
    time: "13:00 - 15:00",
    venue: "Discussion Rm",
    theme: "review",
  },
];

export default function StudentTimetablePage() {
  const [selectedDay, setSelectedDay] = useState("Monday");

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case "lecture":
        return {
          bg: "bg-[var(--surface-container)]",
          text: "text-[var(--tertiary)]",
          border: "border-[var(--outline-variant)]",
        };
      case "review":
        return {
          bg: "bg-[var(--secondary-container)]",
          text: "text-[var(--secondary)]",
          border: "border-[var(--outline-variant)]",
        };
      default:
        return {
          bg: "bg-[var(--surface-container-low)]",
          text: "text-[var(--on-surface)]",
          border: "border-[var(--outline-variant)]",
        };
    }
  };

  const getActiveSlotForDay = (day: string) => {
    return SCHEDULE.find((s) => s.day === day);
  };

  const activeSlot = getActiveSlotForDay(selectedDay);

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
          Weekly Timetable
        </h1>
        <p className="text-[var(--on-surface-variant)] text-sm">
          Semester 2 weekly lecture and lab schedule.
        </p>
      </div>

      <div className="sm:hidden space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-[var(--outline-variant)]">
          {DAYS.map((d) => {
            const isActive = selectedDay === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setSelectedDay(d.key)}
                className={`flex-1 text-center py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[var(--tertiary)] text-[var(--on-tertiary)] shadow-md"
                    : "bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)]"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        <div className="pt-2">
          {activeSlot ? (
            <div
              className={`p-6 rounded-2xl border ${getThemeClasses(activeSlot.theme).border} ${getThemeClasses(activeSlot.theme).bg} shadow-md space-y-3`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-extrabold tracking-wider uppercase opacity-75">
                  {activeSlot.code}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    activeSlot.theme === "lecture"
                      ? "bg-[var(--tertiary)]/10 text-[var(--tertiary)]"
                      : activeSlot.theme === "review"
                      ? "bg-[var(--secondary)]/10 text-[var(--secondary)]"
                      : "bg-[var(--on-surface)]/10 text-[var(--on-surface)]"
                  }`}
                >
                  {activeSlot.type}
                </span>
              </div>
              <h3 className={`font-display font-bold text-lg ${getThemeClasses(activeSlot.theme).text}`}>
                {activeSlot.title}
              </h3>
              <div className="space-y-1.5 pt-2 text-xs text-[var(--on-surface-variant)]">
                <div className="flex items-center gap-2">
                  <i className="ti ti-clock text-[var(--tertiary)]"></i>
                  <span>{activeSlot.time}</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-[var(--on-surface)]">
                  <i className="ti ti-map-pin text-[var(--tertiary)]"></i>
                  <span>{activeSlot.venue}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center text-sm text-[var(--on-surface-variant)]">
              No classes scheduled for {selectedDay}.
            </div>
          )}
        </div>
      </div>

      <div className="hidden sm:block lg:hidden card p-6 overflow-x-auto">
        <div className="grid grid-cols-5 gap-4 min-w-[720px]">
          {DAYS.map((d) => {
            const slot = getActiveSlotForDay(d.key);
            return (
              <div key={d.key} className="space-y-3">
                <div className="text-center font-display font-bold text-sm text-[var(--on-surface)] border-b border-[var(--outline-variant)] pb-3">
                  {d.key}
                </div>
                {slot ? (
                  <div
                    className={`p-4 rounded-xl border ${getThemeClasses(slot.theme).border} ${getThemeClasses(slot.theme).bg} shadow-sm hover:shadow-md transition-shadow h-36 flex flex-col justify-between`}
                  >
                    <div>
                      <p className={`font-bold text-sm leading-tight mb-1 ${getThemeClasses(slot.theme).text}`}>
                        {slot.code} {slot.type}
                      </p>
                      <p className="text-[var(--on-surface-variant)] text-xs font-medium">
                        {slot.time}
                      </p>
                    </div>
                    <p className="text-[10px] text-[var(--outline)] font-semibold uppercase tracking-wider">
                      {slot.venue}
                    </p>
                  </div>
                ) : (
                  <div className="h-36 rounded-xl border border-dashed border-[var(--outline-variant)] flex items-center justify-center text-[10px] text-[var(--outline)]">
                    Empty
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="hidden lg:block card p-6">
        <div className="grid grid-cols-5 gap-4 text-center font-display font-bold text-sm border-b border-[var(--outline-variant)] pb-4 mb-4 text-[var(--on-surface)]">
          <div>Monday</div>
          <div>Tuesday</div>
          <div>Wednesday</div>
          <div>Thursday</div>
          <div>Friday</div>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {DAYS.map((d) => {
            const slot = getActiveSlotForDay(d.key);
            return (
              <div key={d.key}>
                {slot ? (
                  <div
                    className={`p-4 rounded-xl border ${getThemeClasses(slot.theme).border} ${getThemeClasses(slot.theme).bg} shadow-sm hover:shadow-md transition-shadow h-36 flex flex-col justify-between`}
                  >
                    <div>
                      <p className={`font-bold text-sm leading-tight mb-1 ${getThemeClasses(slot.theme).text}`}>
                        {slot.code} {slot.type}
                      </p>
                      <p className="text-[var(--on-surface-variant)] text-xs font-medium">
                        {slot.time}
                      </p>
                    </div>
                    <p className="text-[10px] text-[var(--outline)] font-semibold uppercase tracking-wider">
                      {slot.venue}
                    </p>
                  </div>
                ) : (
                  <div className="h-36 rounded-xl border border-dashed border-[var(--outline-variant)] flex items-center justify-center text-[10px] text-[var(--outline)]">
                    No Class
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
