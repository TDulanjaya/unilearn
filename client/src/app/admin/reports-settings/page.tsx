"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DataTable from "@/components/DataTable";
import { useInteractive } from "@/lib/useInteractive";

interface AuditLogRecord {
  id: string;
  timestamp: string;
  userEmail: string;
  actionType: "Grade Updated" | "User Created" | "Exam Scheduled" | "Offering Approved" | "Role Assigned";
  entity: string;
  ipAddress: string;
}

const INITIAL_AUDIT_LOGS: AuditLogRecord[] = [
  { id: "aud-1", timestamp: "2026-08-04 10:42 AM", userEmail: "k.perera@uni.edu", actionType: "Grade Updated", entity: "Submission #4821", ipAddress: "192.168.1.45" },
  { id: "aud-2", timestamp: "2026-08-04 09:15 AM", userEmail: "r.jaya@uni.edu", actionType: "User Created", entity: "User #5412 (Nadeesha Silva)", ipAddress: "192.168.1.12" },
  { id: "aud-3", timestamp: "2026-08-03 04:30 PM", userEmail: "a.fernando@uni.edu", actionType: "Exam Scheduled", entity: "SE308.3 Final Exam", ipAddress: "192.168.1.88" },
  { id: "aud-4", timestamp: "2026-08-03 02:10 PM", userEmail: "s.wick@uni.edu", actionType: "Offering Approved", entity: "SE401.3 Offering", ipAddress: "192.168.1.04" },
  { id: "aud-5", timestamp: "2026-08-02 11:20 AM", userEmail: "r.jaya@uni.edu", actionType: "Role Assigned", entity: "User #1029 -> Lecturer", ipAddress: "192.168.1.12" },
];

const ACTION_TYPES = ["All Actions", "Grade Updated", "User Created", "Exam Scheduled", "Offering Approved", "Role Assigned"];

interface FacultyReportData {
  facultyName: string;
  totalStudents: number;
  avgAttendancePercent: number;
  avgGpa: number;
  passRatePercent: number;
  attendanceBars: { prev: number; curr: number };
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
};

export default function Page() {
  useInteractive();

  const [selectedFaculty, setSelectedFaculty] = useState("All faculties");
  const report = MOCK_REPORTS[selectedFaculty] || MOCK_REPORTS["All faculties"];

  
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [emailFilter, setEmailFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredLogs = INITIAL_AUDIT_LOGS.filter((log) => {
    const matchesAction = actionFilter === "All Actions" || log.actionType === actionFilter;
    const matchesEmail = !emailFilter.trim() || log.userEmail.toLowerCase().includes(emailFilter.toLowerCase());
    return matchesAction && matchesEmail;
  });

  const auditColumns = [
    {
      header: "Timestamp",
      accessor: (row: AuditLogRecord) => (
        <span className="font-mono text-xs text-[var(--on-surface-variant)]">{row.timestamp}</span>
      ),
    },
    {
      header: "User Email",
      accessor: (row: AuditLogRecord) => (
        <span className="font-bold text-xs text-[var(--on-surface)]">{row.userEmail}</span>
      ),
    },
    {
      header: "Action Type",
      accessor: (row: AuditLogRecord) => (
        <span className="badge badge-accent text-[11px] font-bold">{row.actionType}</span>
      ),
    },
    {
      header: "Affected Entity",
      accessor: (row: AuditLogRecord) => (
        <span className="text-xs text-[var(--on-surface-variant)] font-semibold">{row.entity}</span>
      ),
    },
    {
      header: "IP Address",
      accessor: (row: AuditLogRecord) => (
        <span className="font-mono text-[10px] text-[var(--outline)]">{row.ipAddress}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full space-y-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Reports & System Audit Log
          </h1>
          <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm">
            Institution analytics, financial statements, and filterable system audit trail.
          </p>
        </div>

        <div className="flex gap-2 border-b border-[var(--outline-variant)] overflow-x-auto" data-tabgroup="rs">
          <span className="tab-btn active" data-tab="rep">Reports</span>
          <span className="tab-btn" data-tab="fin">Finance</span>
          <span className="tab-btn" data-tab="set">Settings</span>
          <span className="tab-btn" data-tab="aud">Audit log</span>
        </div>

        
        <div id="rs-rep" data-tabpanel="rs">
          <div className="card p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">
                Filter by Faculty:
              </label>
              <select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)} className="w-52 font-semibold">
                <option>All faculties</option>
                <option>Computing</option>
              </select>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-[var(--on-surface-variant)]">
              <span>Scope: <b className="text-[var(--on-surface)]">{report.facultyName}</b></span>
              <span>Enrolled: <b className="text-[var(--tertiary)]">{report.totalStudents} Students</b></span>
            </div>
          </div>

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
          </div>
        </div>

        
        <div id="rs-set" data-tabpanel="rs" className="hidden">
          <div className="card p-6">
            <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-4 pb-2 border-b border-[var(--outline-variant)]">
              Notification & Security Settings
            </h3>
            <div className="space-y-3 text-sm font-medium text-[var(--on-surface)]">
              <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--outline-variant)]">
                <span>System Security Audit Logs</span>
                <input type="checkbox" defaultChecked />
              </label>
            </div>
          </div>
        </div>

        
        <div id="rs-aud" data-tabpanel="rs" className="hidden space-y-4">
          <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[var(--outline-variant)]">
              <div>
                <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
                  <i className="ti ti-shield-check text-[var(--tertiary)]"></i> System Audit Log & Security Trail
                </h3>
                <p className="text-xs text-[var(--on-surface-variant)]">Filterable log of all user security actions, grade overrides, and scheduling modifications.</p>
              </div>
            </div>

            
            <div className="grid sm:grid-cols-4 gap-3 p-3.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)]">
              <div>
                <label className="block text-[10px] font-bold text-[var(--on-surface-variant)] uppercase mb-1">Action Type</label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full text-xs font-semibold p-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                >
                  {ACTION_TYPES.map((act) => (
                    <option key={act} value={act}>{act}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--on-surface-variant)] uppercase mb-1">User Email Filter</label>
                <input
                  type="text"
                  placeholder="e.g. k.perera@uni.edu"
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--on-surface-variant)] uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--on-surface-variant)] uppercase mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                />
              </div>
            </div>

            <DataTable data={filteredLogs} columns={auditColumns} searchPlaceholder="Search audit logs..." pageSize={10} />
          </div>
        </div>
      </main>
    </div>
  );
}
