"use client";
import LecturerNavbar from "@/components/LecturerNavbar";

export default function LecturerCoursesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Course Management
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Manage syllabus, upload lecture notes, assignments, and materials.
          </p>
        </div>

        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-[var(--outline-variant)]">
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
              SE308.3 — Software Process Management
            </h3>
            <button className="btn-primary text-xs shadow-sm">
              <i className="ti ti-plus"></i> Upload Material
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 border border-[var(--outline-variant)] rounded-xl hover:bg-[var(--surface-container-low)] transition-colors text-sm">
              <div className="flex items-center gap-3">
                <i className="ti ti-file-pdf text-[var(--tertiary)] text-2xl"></i>
                <div>
                  <p className="font-semibold text-[var(--on-surface)]">
                    Lecture 01 - Introduction to Agile & Scrum.pdf
                  </p>
                  <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                    Uploaded Aug 12, 2025 · 2.4 MB
                  </p>
                </div>
              </div>
              <button className="btn-secondary text-xs !py-1">Manage</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
