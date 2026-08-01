"use client";
import LecturerNavbar from "@/components/LecturerNavbar";

export default function LecturerCoursesPage() {
  return (
    <div>
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-8 py-7">
        <h1 className="font-display font-extrabold text-2xl mb-1">Course management</h1>
        <p className="text-[#666B80] text-sm mb-6">Manage syllabus, upload lecture notes, assignments, and materials.</p>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base">SE308.3 — Software Process Management</h3>
            <button className="btn-primary text-xs"><i className="ti ti-plus"></i> Upload Material</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-[#E7E8F0] rounded-xl text-sm">
              <div className="flex items-center gap-3">
                <i className="ti ti-file-pdf text-accent text-xl"></i>
                <div>
                  <p className="font-semibold">Lecture 01 - Introduction to Agile & Scrum.pdf</p>
                  <p className="text-xs text-[#666B80]">Uploaded Aug 12, 2025 · 2.4 MB</p>
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
