"use client";
import StudentNavbar from "@/components/StudentNavbar";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <StudentNavbar />
      <main className="max-w-[1000px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Notifications
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Course updates, exam schedules, and system alerts.
          </p>
        </div>

        <div className="card divide-y divide-[var(--outline-variant)] shadow-md overflow-hidden">
          <div className="p-4 sm:p-5 flex items-start gap-4 hover:bg-[var(--surface-container-low)] transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[var(--surface-container)] text-[var(--tertiary)] flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <i className="ti ti-file-text text-xl"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[var(--on-surface)]">New Assignment Posted: SE308.3</p>
              <p className="text-xs text-[var(--on-surface-variant)] mt-1">Assignment 2: Test Case Design is due on Dec 18, 2025.</p>
              <span className="text-[11px] text-[var(--outline)] mt-1.5 font-medium block">10 mins ago</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex items-start gap-4 hover:bg-[var(--surface-container-low)] transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[var(--warning-container)] text-[var(--on-warning-container)] flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <i className="ti ti-calendar text-xl"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[var(--on-surface)]">Exam Scheduled: SE308.3 Software Process Mgmt</p>
              <p className="text-xs text-[var(--on-surface-variant)] mt-1">Final exam scheduled for Dec 12, 2025 at Main Hall A.</p>
              <span className="text-[11px] text-[var(--outline)] mt-1.5 font-medium block">2 hours ago</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex items-start gap-4 hover:bg-[var(--surface-container-low)] transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <i className="ti ti-certificate text-xl"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[var(--on-surface)]">Grade Published: SE202.2 Mid-term Exam</p>
              <p className="text-xs text-[var(--on-surface-variant)] mt-1">You received 84% (Grade A-) in SE202.2 Database Systems.</p>
              <span className="text-[11px] text-[var(--outline)] mt-1.5 font-medium block">Yesterday</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
