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

const INITIAL_AUDIT_LOGS: AuditLogRecord[] = [];

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

const MOCK_REPORTS: Record<string, FacultyReportData> = {};

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Page() {
  useInteractive();
  const [selectedFaculty, setSelectedFaculty] = useState("All faculties");
  const [selectedAction, setSelectedAction] = useState("All Actions");
  const [auditSearch, setAuditSearch] = useState("");
  const [reportRange, setReportRange] = useState("Last 30 Days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: auditLogsData } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => api.get<any>("/api/v1/audit-logs"),
  });

  const auditLogs: AuditLogRecord[] = auditLogsData?.dataList || auditLogsData?.content
    ? (auditLogsData.dataList || auditLogsData.content).map((log: any) => ({
        id: String(log.logId || log.id),
        timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : "Recent",
        userEmail: log.userEmail || log.performedByName || "admin@uni.edu",
        actionType: (log.actionType as any) || "Role Assigned",
        entity: log.entityName || log.details || "System Entity",
        ipAddress: log.ipAddress || "127.0.0.1",
      }))
    : INITIAL_AUDIT_LOGS;

  const defaultReport: FacultyReportData = {
    facultyName: selectedFaculty || "All Faculties",
    totalStudents: 0,
    avgAttendancePercent: 0,
    avgGpa: 0,
    passRatePercent: 0,
    attendanceBars: { prev: 0, curr: 0 },
    performanceBars: { pass: 0, retake: 0 },
    enrollmentBars: { prev: 0, curr: 0 },
  };

  const report = MOCK_REPORTS[selectedFaculty] || MOCK_REPORTS["All faculties"] || defaultReport;

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = selectedAction === "All Actions" || log.actionType === selectedAction;
    const matchesSearch =
      log.userEmail.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.entity.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actionType.toLowerCase().includes(auditSearch.toLowerCase());
    return matchesAction && matchesSearch;
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
            Institution analytics and filterable system audit trail.
          </p>
        </div>

        <div className="flex gap-2 border-b border-[var(--outline-variant)] overflow-x-auto" data-tabgroup="rs">
          <span className="tab-btn active" data-tab="rep">Reports</span>
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
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
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
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
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
