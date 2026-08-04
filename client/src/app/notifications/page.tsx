"use client";

import { useState } from "react";
import StudentNavbar from "@/components/StudentNavbar";
import { useNotifications } from "@/lib/NotificationContext";

export default function NotificationsPage() {
  const { notifications } = useNotifications();
  const [categoryFilter, setCategoryFilter] = useState<"All" | "Course" | "System" | "Grading">("All");

  const filteredNotifications = notifications.filter((n) => {
    if (categoryFilter === "All") return true;
    if (categoryFilter === "Course") return n.title.toLowerCase().includes("assignment") || n.title.toLowerCase().includes("course") || n.title.toLowerCase().includes("quiz");
    if (categoryFilter === "Grading") return n.title.toLowerCase().includes("grade") || n.title.toLowerCase().includes("result") || n.title.toLowerCase().includes("mark");
    if (categoryFilter === "System") return n.title.toLowerCase().includes("system") || n.title.toLowerCase().includes("exam") || n.title.toLowerCase().includes("schedule");
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)] pb-12">
      <StudentNavbar />
      <main className="max-w-[1000px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Notifications Center
          </h1>
          <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm">
            Real-time course updates, exam schedules, grade posts, and system alerts.
          </p>
        </div>

        
        <div className="flex gap-2 border-b border-[var(--outline-variant)] pb-1">
          {(["All", "Course", "Grading", "System"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${categoryFilter === cat ? "bg-[var(--tertiary)] text-white shadow-sm" : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"}`}
            >
              {cat} Notifications
            </button>
          ))}
        </div>

        
        <div className="card divide-y divide-[var(--outline-variant)] shadow-md overflow-hidden bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
          {filteredNotifications.length === 0 ? (
            <p className="p-8 text-xs text-[var(--on-surface-variant)] text-center italic">No {categoryFilter.toLowerCase()} notifications found.</p>
          ) : (
            filteredNotifications.map((n) => (
              <div key={n.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-[var(--surface-container-low)] transition-colors">
                <div className={`w-10 h-10 rounded-2xl ${n.iconBg} ${n.iconColor} flex items-center justify-center shrink-0 mt-0.5 font-bold`}>
                  <i className={`ti ${n.icon} text-xl`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-[var(--on-surface)]">{n.title}</p>
                    <span className="text-[10px] text-[var(--outline)] font-mono">{n.time}</span>
                  </div>
                  <p className="text-xs text-[var(--on-surface-variant)] mt-1">{n.detail}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
