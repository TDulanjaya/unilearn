"use client";
import LecturerNavbar from "@/components/LecturerNavbar";

export default function LecturerGradingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Assignment Grading
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Review student submissions and assign marks.
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--outline-variant)]">
            <i className="ti ti-[#certificate] text-xl text-[var(--tertiary)] ti-certificate"></i>
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
              Submissions List
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                  <th className="pb-3 px-3 font-semibold">Student</th>
                  <th className="pb-3 px-3 font-semibold">Assignment</th>
                  <th className="pb-3 px-3 font-semibold">Submitted</th>
                  <th className="pb-3 px-3 font-semibold">Marks</th>
                  <th className="pb-3 px-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-variant)]">
                <tr className="table-row transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-[var(--on-surface)]">Nadeesha Silva</td>
                  <td className="py-3.5 px-3 text-[var(--on-surface)]">Assignment 1 - SDLC Analysis</td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">Aug 14, 10:20 AM</td>
                  <td className="py-3.5 px-3 font-bold text-[var(--tertiary)]">88 / 100</td>
                  <td className="py-3.5 px-3"><button className="btn-secondary text-xs !py-1">Edit Grade</button></td>
                </tr>
                <tr className="table-row transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-[var(--on-surface)]">Ishara Fonseka</td>
                  <td className="py-3.5 px-3 text-[var(--on-surface)]">Assignment 1 - SDLC Analysis</td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">Aug 14, 11:45 AM</td>
                  <td className="py-3.5 px-3 text-[var(--warning)] font-bold">Pending</td>
                  <td className="py-3.5 px-3"><button className="btn-primary text-xs !py-1">Grade Now</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
