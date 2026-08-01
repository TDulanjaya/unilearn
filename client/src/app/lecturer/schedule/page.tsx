"use client";
import LecturerNavbar from "@/components/LecturerNavbar";

export default function LecturerSchedulePage() {
  return (
    <div>
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-8 py-7">
        <h1 className="font-display font-extrabold text-2xl mb-1">Teaching schedule</h1>
        <p className="text-[#666B80] text-sm mb-6">Weekly lecture hours and office consultation hours.</p>

        <div className="card p-5">
          <div className="space-y-3">
            <div className="p-4 border border-[#E7E8F0] rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">SE308.3 Software Process Management</p>
                <p className="text-xs text-[#666B80]">Mondays · 09:00 AM - 11:00 AM · Hall 3A</p>
              </div>
              <span className="badge badge-accent">Lecture</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
