"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";

export default function Page() {
  useInteractive();
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Admin Dashboard
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Institution-wide overview.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--surface-container)] text-[var(--tertiary)] flex items-center justify-center font-bold">
              <i className="ti ti-users text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Total Users</p>
              <p className="font-display font-extrabold text-2xl text-[var(--on-surface)]">5,412</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] flex items-center justify-center font-bold">
              <i className="ti ti-building-bank text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Faculties</p>
              <p className="font-display font-extrabold text-2xl text-[var(--tertiary)]">6</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center font-bold">
              <i className="ti ti-books text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Active Courses</p>
              <p className="font-display font-extrabold text-2xl text-[var(--secondary)]">184</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--warning-container)] text-[var(--on-warning-container)] flex items-center justify-center font-bold">
              <i className="ti ti-calendar-time text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Upcoming Finals</p>
              <p className="font-display font-extrabold text-2xl text-[var(--warning)]">12</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--surface-container)] text-[var(--on-surface-variant)] flex items-center justify-center font-bold">
              <i className="ti ti-calendar-event text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Upcoming Events</p>
              <p className="font-display font-extrabold text-2xl text-[var(--on-surface)]">7</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--outline-variant)]">
            <i className="ti ti-activity text-xl text-[var(--tertiary)]"></i>
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
              System Activity
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-container-low)] transition-colors">
              <i className="ti ti-user-plus text-[var(--tertiary)] text-lg"></i>
              <span className="text-[var(--on-surface)] font-medium">142 new students registered for Semester 2</span>
              <span className="text-xs text-[var(--outline)] font-medium ml-auto">2h ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-container-low)] transition-colors">
              <i className="ti ti-calendar-event text-[var(--tertiary)] text-lg"></i>
              <span className="text-[var(--on-surface)] font-medium">Career Fair 2026 event published</span>
              <span className="text-xs text-[var(--outline)] font-medium ml-auto">5h ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-container-low)] transition-colors">
              <i className="ti ti-file-check text-[var(--tertiary)] text-lg"></i>
              <span className="text-[var(--on-surface)] font-medium">SE314.3 course approved by HOD Wickramasinghe</span>
              <span className="text-xs text-[var(--outline)] font-medium ml-auto">Yesterday</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
