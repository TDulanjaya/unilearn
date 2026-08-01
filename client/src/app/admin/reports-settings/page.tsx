"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";

interface FacultyReportData {
  facultyName: string;
  totalStudents: number;
  avgAttendancePercent: number;
  avgGpa: number;
  passRatePercent: number;
  attendanceBars: { prev: number; curr: number }; // heights in %
  performanceBars: { pass: number; retake: number };
  enrollmentBars: { prev: number; curr: number };
}

const MOCK_REPORTS: Record<string, FacultyReportData> = {
  "All faculties": {
    facultyName: "All Faculties",
    totalStudents: 1240,
    avgAttendancePercent: 88,
    avgGpa: 3.42,
    passRatePercent: 94,
    attendanceBars: { prev: 70, curr: 88 },
    performanceBars: { pass: 85, retake: 50 },
    enrollmentBars: { prev: 60, curr: 80 },
  },
  "Computing": {
    facultyName: "Faculty of Computing",
    totalStudents: 520,
    avgAttendancePercent: 92,
    avgGpa: 3.58,
    passRatePercent: 96,
    attendanceBars: { prev: 78, curr: 92 },
    performanceBars: { pass: 92, retake: 35 },
    enrollmentBars: { prev: 65, curr: 90 },
  },
  "Business": {
    facultyName: "Faculty of Business",
    totalStudents: 380,
    avgAttendancePercent: 84,
    avgGpa: 3.25,
    passRatePercent: 91,
    attendanceBars: { prev: 65, curr: 84 },
    performanceBars: { pass: 78, retake: 55 },
    enrollmentBars: { prev: 55, curr: 72 },
  },
  "Engineering": {
    facultyName: "Faculty of Engineering",
    totalStudents: 340,
    avgAttendancePercent: 86,
    avgGpa: 3.35,
    passRatePercent: 93,
    attendanceBars: { prev: 68, curr: 86 },
    performanceBars: { pass: 82, retake: 45 },
    enrollmentBars: { prev: 58, curr: 75 },
  },
};

export default function Page() {
  useInteractive();

  const [selectedFaculty, setSelectedFaculty] = useState("All faculties");
  const report = MOCK_REPORTS[selectedFaculty] || MOCK_REPORTS["All faculties"];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Reports & Settings
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Institution reports, finance, settings, announcements and audit log.
          </p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-[var(--outline-variant)] overflow-x-auto" data-tabgroup="rs">
          <span className="tab-btn active" data-tab="rep">Reports</span>
          <span className="tab-btn" data-tab="fin">Finance</span>
          <span className="tab-btn" data-tab="set">Settings</span>
          <span className="tab-btn" data-tab="ann">Announcements</span>
          <span className="tab-btn" data-tab="aud">Audit log</span>
        </div>

        {/* Reports Tab (FR-REP-01) */}
        <div id="rs-rep" data-tabpanel="rs">
          {/* Faculty Filter Bar */}
          <div className="card p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">
                Filter by Faculty:
              </label>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-52 font-semibold"
              >
                <option>All faculties</option>
                <option>Computing</option>
                <option>Business</option>
                <option>Engineering</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-[var(--on-surface-variant)]">
              <span>Scope: <b className="text-[var(--on-surface)]">{report.facultyName}</b></span>
              <span>Enrolled: <b className="text-[var(--tertiary)]">{report.totalStudents} Students</b></span>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid sm:grid-cols-4 gap-4 mb-6">
            <div className="card p-4 text-center">
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-1">Avg Attendance</p>
              <p className="font-display font-extrabold text-2xl text-[var(--tertiary)]">{report.avgAttendancePercent}%</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-1">Avg GPA</p>
              <p className="font-display font-extrabold text-2xl text-[var(--secondary)]">{report.avgGpa}</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-1">Pass Rate</p>
              <p className="font-display font-extrabold text-2xl text-[var(--secondary)]">{report.passRatePercent}%</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-1">Total Enrolled</p>
              <p className="font-display font-extrabold text-2xl text-[var(--on-surface)]">{report.totalStudents}</p>
            </div>
          </div>

          {/* Interactive Dynamic Charts */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-sm text-[var(--on-surface)]">Attendance Trend</h3>
                <span className="text-xs font-bold text-[var(--tertiary)]">{report.avgAttendancePercent}% avg</span>
              </div>
              <div className="flex items-end gap-3 h-32 pt-2 border-b border-[var(--outline-variant)] pb-2">
                <div
                  className="flex-1 bg-[var(--surface-container)] rounded-t-lg border border-[var(--outline-variant)] flex items-center justify-center text-[10px] font-bold text-[var(--on-surface-variant)] transition-all duration-300"
                  style={{ height: `${report.attendanceBars.prev}%` }}
                >
                  {report.attendanceBars.prev}%
                </div>
                <div
                  className="flex-1 bg-[var(--tertiary)] rounded-t-lg shadow-sm flex items-center justify-center text-[10px] font-bold text-white transition-all duration-300"
                  style={{ height: `${report.attendanceBars.curr}%` }}
                >
                  {report.attendanceBars.curr}%
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-[var(--on-surface-variant)] font-semibold mt-2">
                <span>Prev Semester</span>
                <span>Current Semester</span>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-sm text-[var(--on-surface)]">Performance Distribution</h3>
                <span className="text-xs font-bold text-[var(--secondary)]">{report.passRatePercent}% pass</span>
              </div>
              <div className="flex items-end gap-3 h-32 pt-2 border-b border-[var(--outline-variant)] pb-2">
                <div
                  className="flex-1 bg-[var(--secondary-container)] rounded-t-lg border border-[var(--outline-variant)] flex items-center justify-center text-[10px] font-bold text-[var(--on-secondary-container)] transition-all duration-300"
                  style={{ height: `${report.performanceBars.pass}%` }}
                >
                  {report.performanceBars.pass}% Pass
                </div>
                <div
                  className="flex-1 bg-[var(--warning-container)] rounded-t-lg border border-[var(--outline-variant)] flex items-center justify-center text-[10px] font-bold text-[var(--on-warning-container)] transition-all duration-300"
                  style={{ height: `${report.performanceBars.retake}%` }}
                >
                  {report.performanceBars.retake}% Retake
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-[var(--on-surface-variant)] font-semibold mt-2">
                <span>Passing Grade</span>
                <span>Requires Retake</span>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-sm text-[var(--on-surface)]">Enrollment Growth</h3>
                <span className="text-xs font-bold text-[var(--on-surface)]">{report.totalStudents}</span>
              </div>
              <div className="flex items-end gap-3 h-32 pt-2 border-b border-[var(--outline-variant)] pb-2">
                <div
                  className="flex-1 bg-[var(--surface-container)] rounded-t-lg border border-[var(--outline-variant)] flex items-center justify-center text-[10px] font-bold text-[var(--on-surface-variant)] transition-all duration-300"
                  style={{ height: `${report.enrollmentBars.prev}%` }}
                >
                  {report.enrollmentBars.prev}%
                </div>
                <div
                  className="flex-1 bg-[var(--tertiary)] rounded-t-lg shadow-sm flex items-center justify-center text-[10px] font-bold text-white transition-all duration-300"
                  style={{ height: `${report.enrollmentBars.curr}%` }}
                >
                  {report.enrollmentBars.curr}%
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-[var(--on-surface-variant)] font-semibold mt-2">
                <span>2025 Intake</span>
                <span>2026 Intake</span>
              </div>
            </div>
          </div>
        </div>

        <div id="rs-fin" data-tabpanel="rs" className="hidden">
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center font-bold">
                <i className="ti ti-cash text-xl"></i>
              </div>
              <div>
                <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Total Collected</p>
                <p className="font-display font-extrabold text-2xl text-[var(--secondary)]">LKR 42.1M</p>
              </div>
            </div>

            <div className="card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[var(--warning-container)] text-[var(--on-warning-container)] flex items-center justify-center font-bold">
                <i className="ti ti-clock text-xl"></i>
              </div>
              <div>
                <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Total Pending</p>
                <p className="font-display font-extrabold text-2xl text-[var(--warning)]">LKR 3.4M</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                    <th className="pb-3 px-3 font-semibold">Student</th>
                    <th className="pb-3 px-3 font-semibold">Status</th>
                    <th className="pb-3 px-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline-variant)]">
                  <tr className="table-row transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-[var(--on-surface)]">Nadeesha Silva</td>
                    <td className="py-3.5 px-3"><span className="badge badge-warning">Pending</span></td>
                    <td className="py-3.5 px-3">
                      <button className="text-[var(--tertiary)] text-xs font-bold hover:underline">
                        Generate Invoice
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="rs-set" data-tabpanel="rs" className="hidden">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-4 pb-2 border-b border-[var(--outline-variant)]">
                Academic Calendar
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" />
                <input type="date" />
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-4 pb-2 border-b border-[var(--outline-variant)]">
                Notification Settings
              </h3>
              <div className="space-y-3 text-sm text-[var(--on-surface)] font-medium">
                <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--outline-variant)] hover:bg-[var(--surface-container-low)]">
                  <span>Exam scheduling alerts</span>
                  <input type="checkbox" defaultChecked />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--outline-variant)] hover:bg-[var(--surface-container-low)]">
                  <span>Grade posted alerts</span>
                  <input type="checkbox" defaultChecked />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div id="rs-ann" data-tabpanel="rs" className="hidden">
          <div className="card p-6 max-w-2xl">
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
              Institution-wide Announcement
            </h3>
            <div className="space-y-4">
              <input type="text" placeholder="Title" />
              <textarea rows={4} placeholder="Message"></textarea>
              <button className="btn-primary shadow-md">Publish institution-wide</button>
            </div>
          </div>
        </div>

        <div id="rs-aud" data-tabpanel="rs" className="hidden">
          <div className="card p-6">
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
              System Audit Log
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                    <th className="pb-3 px-3 font-semibold">Time</th>
                    <th className="pb-3 px-3 font-semibold">User</th>
                    <th className="pb-3 px-3 font-semibold">Action</th>
                    <th className="pb-3 px-3 font-semibold">Entity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline-variant)]">
                  <tr className="table-row transition-colors">
                    <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">10:42 AM</td>
                    <td className="py-3.5 px-3 font-semibold text-[var(--on-surface)]">Dr. K. Perera</td>
                    <td className="py-3.5 px-3 text-[var(--on-surface)]">Grade updated</td>
                    <td className="py-3.5 px-3 text-[var(--on-surface-variant)] font-mono text-xs">Submission #4821</td>
                  </tr>
                  <tr className="table-row transition-colors">
                    <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">9:15 AM</td>
                    <td className="py-3.5 px-3 font-semibold text-[var(--on-surface)]">R. Jayawardena</td>
                    <td className="py-3.5 px-3 text-[var(--on-surface)]">User created</td>
                    <td className="py-3.5 px-3 text-[var(--on-surface-variant)] font-mono text-xs">User #5412</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
