"use client";
import LecturerNavbar from "@/components/LecturerNavbar";

export default function LecturerAnalyticsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Course Analytics
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Student performance metrics, grade distribution, and engagement.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--outline-variant)]">
              <i className="ti ti-chart-bar text-xl text-[var(--tertiary)]"></i>
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                Grade Distribution
              </h3>
            </div>
            <div className="flex items-end gap-4 h-48 pt-4">
              <div className="flex-1 bg-[var(--primary)] rounded-t-lg shadow-sm" style={{ height: "80%" }}></div>
              <div className="flex-1 bg-[var(--tertiary)] rounded-t-lg shadow-sm" style={{ height: "60%" }}></div>
              <div className="flex-1 bg-[var(--surface-container)] rounded-t-lg border border-[var(--outline-variant)]" style={{ height: "40%" }}></div>
              <div className="flex-1 bg-[var(--surface-container-low)] rounded-t-lg border border-[var(--outline-variant)]" style={{ height: "20%" }}></div>
            </div>
            <div className="flex justify-between text-xs text-[var(--on-surface-variant)] font-semibold mt-3 pt-2 border-t border-[var(--outline-variant)]">
              <span>Grade A</span>
              <span>Grade B</span>
              <span>Grade C</span>
              <span>Grade D</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
