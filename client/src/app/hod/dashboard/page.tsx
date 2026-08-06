"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

interface CourseOfferingApproval {
  id: string;
  courseCode: string;
  courseTitle: string;
  semester: string;
  batch: string;
  assignedLecturer: string;
  credits: number;
  status: "Pending" | "Approved" | "Rejected";
}

const INITIAL_OFFERINGS: CourseOfferingApproval[] = [];

const LECTURERS = ["Dr. K. Perera", "Prof. A. Fernando", "Dr. M. Rathnayake", "Dr. S. Wickramasinghe", "Unassigned"];

export default function HodDashboard() {
  const [offerings, setOfferings] = useState<CourseOfferingApproval[]>(INITIAL_OFFERINGS);

  const handleLecturerChange = (id: string, lecturer: string) => {
    setOfferings((prev) =>
      prev.map((o) => (o.id === id ? { ...o, assignedLecturer: lecturer } : o))
    );
  };

  const handleStatusChange = (id: string, status: "Approved" | "Rejected") => {
    setOfferings((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  const pendingCount = offerings.filter((o) => o.status === "Pending").length;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="hod" name="Dr. S. Wickramasinghe" sub="HOD · Software Engineering" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full space-y-8">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            HOD Departmental Executive Dashboard
          </h1>
          <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm">
            Overview of department KPIs, academic staff assignments, and course offering approval queues.
          </p>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
            <div className="w-11 h-11 rounded-2xl bg-[var(--tertiary-container)] text-[var(--tertiary)] flex items-center justify-center font-bold">
              <i className="ti ti-[#certificate] text-xl ti-certificate"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Average Department GPA</p>
              <p className="font-display font-extrabold text-2xl text-[var(--on-surface)]">3.42 <span className="text-xs text-emerald-500 font-normal">/ 4.0</span></p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <i className="ti ti-user-check text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Overall Attendance Rate</p>
              <p className="font-display font-extrabold text-2xl text-emerald-600">88.5%</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <i className="ti ti-chart-arrows-vertical text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Semester Pass Rate</p>
              <p className="font-display font-extrabold text-2xl text-blue-600">94.2%</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <i className="ti ti-clock text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Pending Offering Approvals</p>
              <p className="font-display font-extrabold text-2xl text-amber-600">{pendingCount}</p>
            </div>
          </div>
        </div>

        
        <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
            <div>
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
                <i className="ti ti-[#checkbox] text-[var(--tertiary)] ti-checkbox"></i> Course Offering Approval Queue
              </h3>
              <p className="text-xs text-[var(--on-surface-variant)]">
                Review proposed course syllabus offerings and assign leading academic lecturers.
              </p>
            </div>
            <span className="badge badge-accent font-bold">{pendingCount} Pending</span>
          </div>

          <div className="space-y-3">
            {offerings.map((off) => (
              <div
                key={off.id}
                className="p-4 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-low)] flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[var(--surface-container-lowest)] transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-accent">{off.courseCode}</span>
                    <span className="text-xs text-[var(--on-surface-variant)]">{off.semester} · {off.batch}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${off.status === "Pending" ? "bg-amber-500/10 text-amber-600" : off.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
                      {off.status}
                    </span>
                  </div>
                  <p className="font-bold text-sm text-[var(--on-surface)] truncate">{off.courseTitle}</p>
                  <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">Credits: {off.credits} Academic Units</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-semibold text-[var(--on-surface-variant)]">Lecturer:</label>
                    <select
                      value={off.assignedLecturer}
                      onChange={(e) => handleLecturerChange(off.id, e.target.value)}
                      disabled={off.status !== "Pending"}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] disabled:opacity-50"
                    >
                      {LECTURERS.map((lec) => (
                        <option key={lec} value={lec}>{lec}</option>
                      ))}
                    </select>
                  </div>

                  
                  {off.status === "Pending" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusChange(off.id, "Approved")}
                        className="btn-primary text-xs !py-1.5 shadow-sm"
                      >
                        <i className="ti ti-check"></i> Approve Offering
                      </button>
                      <button
                        onClick={() => handleStatusChange(off.id, "Rejected")}
                        className="btn-secondary text-xs !py-1.5 text-red-500"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setOfferings(prev => prev.map(o => o.id === off.id ? { ...o, status: "Pending" } : o))}
                      className="btn-secondary text-xs !py-1.5"
                    >
                      Reopen Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
