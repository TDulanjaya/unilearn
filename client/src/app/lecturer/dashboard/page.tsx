"use client";
import LecturerNavbar from "@/components/LecturerNavbar";

export default function LecturerDashboard() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Lecturer Dashboard
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Welcome back, Dr. K. Perera · Department of Software Engineering
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--surface-container)] text-[var(--tertiary)] flex items-center justify-center font-bold">
              <i className="ti ti-books text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Assigned Courses</p>
              <p className="font-display font-extrabold text-2xl text-[var(--on-surface)]">3</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] flex items-center justify-center font-bold">
              <i className="ti ti-users text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Total Students</p>
              <p className="font-display font-extrabold text-2xl text-[var(--tertiary)]">142</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--warning-container)] text-[var(--on-warning-container)] flex items-center justify-center font-bold">
              <i className="ti ti-file-certificate text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Pending Grading</p>
              <p className="font-display font-extrabold text-2xl text-[var(--warning)]">18</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center font-bold">
              <i className="ti ti-chart-line text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Avg Attendance</p>
              <p className="font-display font-extrabold text-2xl text-[var(--secondary)]">89%</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <i className="ti ti-school text-xl text-[var(--tertiary)]"></i>
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
              Active Course Offerings
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                  <th className="pb-3 px-3 font-semibold">Course</th>
                  <th className="pb-3 px-3 font-semibold">Batch</th>
                  <th className="pb-3 px-3 font-semibold">Students</th>
                  <th className="pb-3 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-variant)]">
                <tr className="table-row transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-[var(--on-surface)]">
                    SE308.3 Software Process Management
                  </td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">CS2023-A</td>
                  <td className="py-3.5 px-3 font-medium text-[var(--on-surface)]">61</td>
                  <td className="py-3.5 px-3">
                    <span className="badge badge-success">In Progress</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
