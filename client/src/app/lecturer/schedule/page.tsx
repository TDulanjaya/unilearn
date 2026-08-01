"use client";
import LecturerNavbar from "@/components/LecturerNavbar";

export default function LecturerSchedulePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Teaching Schedule
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Weekly lecture hours and office consultation hours.
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--outline-variant)]">
            <i className="ti ti-calendar-event text-xl text-[var(--tertiary)]"></i>
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
              Weekly Slots
            </h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 border border-[var(--outline-variant)] rounded-xl flex items-center justify-between hover:bg-[var(--surface-container-low)] transition-colors">
              <div>
                <p className="font-bold text-sm text-[var(--on-surface)]">
                  SE308.3 Software Process Management
                </p>
                <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                  Mondays · 09:00 AM - 11:00 AM · Hall 3A
                </p>
              </div>
              <span className="badge badge-accent">Lecture</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
