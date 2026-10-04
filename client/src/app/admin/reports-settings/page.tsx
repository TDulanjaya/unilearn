"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DataTable from "@/components/DataTable";
import { useInteractive } from "@/lib/useInteractive";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface AuditLogRecord {
  id: string;
  timestamp: string;
  createdAt: string | null;
  userEmail: string;
  actionType: string;
  entity: string;
  ipAddress: string;
}

const INITIAL_AUDIT_LOGS: AuditLogRecord[] = [];

export default function Page() {
  useInteractive();
  const { user } = useAuth();
  const [selectedFaculty, setSelectedFaculty] = useState("All faculties");
  const [selectedAction, setSelectedAction] = useState("All Actions");
  const [auditSearch, setAuditSearch] = useState("");
  const [reportRange, setReportRange] = useState("Last 30 Days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // newest first (server default)
  const { data: auditLogsData, isError: auditError, error: auditErrorObj } = useQuery({
    queryKey: ["auditLogs", "reports"],
    queryFn: () => api.get<any>("/api/v1/audit-logs?size=200"),
  });

  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ["adminDashboardKpis"],
    queryFn: () => api.get<any>("/api/v1/reports/dashboard"),
  });

  const { data: facultiesData } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => api.get<any>("/api/v1/faculties?size=100"),
  });

  const facultiesList: Array<{ facultyId: number; name: string }> =
    facultiesData?.dataList || facultiesData?.content || (Array.isArray(facultiesData) ? facultiesData : []);

  // fields from AuditLogResponse on the server
  const auditLogs: AuditLogRecord[] = auditLogsData?.dataList
    ? auditLogsData.dataList.map((log: any) => ({
        id: String(log.logId),
        timestamp: log.createdAt ? new Date(log.createdAt).toLocaleString() : "—",
        createdAt: log.createdAt || null,
        userEmail: log.userEmail || log.userName || (log.userId ? `User #${log.userId}` : "System"),
        actionType: String(log.action || "—"),
        entity: log.entityType ? `${log.entityType}${log.entityId != null ? ` #${log.entityId}` : ""}` : "—",
        // the server does not store IP addresses
        ipAddress: "—",
      }))
    : INITIAL_AUDIT_LOGS;

  const availableActionTypes = [
    "All Actions",
    ...Array.from(new Set(auditLogs.map((l) => l.actionType).filter(Boolean))),
  ];

  const totalStudents = kpiData?.totalStudents ?? 0;
  // rates come as 0-100, "No data" when nothing is recorded yet
  const avgAttendance = kpiData?.averageAttendanceRate != null && kpiData?.attendanceRecordCount
    ? `${Math.round(kpiData.averageAttendanceRate)}%`
    : "No data";
  const avgPassRate = kpiData?.averageExamPassRate != null && kpiData?.examResultCount
    ? `${Math.round(kpiData.averageExamPassRate)}%`
    : "No data";
  const totalCourses = kpiData?.totalCourses ?? 0;

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = selectedAction === "All Actions" || log.actionType === selectedAction;
    const matchesSearch =
      log.userEmail.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.entity.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actionType.toLowerCase().includes(auditSearch.toLowerCase());
    // compare only the date part (yyyy-mm-dd)
    const day = log.createdAt ? log.createdAt.slice(0, 10) : "";
    const matchesStart = !startDate || (day !== "" && day >= startDate);
    const matchesEnd = !endDate || (day !== "" && day <= endDate);
    return matchesAction && matchesSearch && matchesStart && matchesEnd;
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
      <Sidebar role="admin" name={user?.fullName || "Staff Admin"} sub={user?.email || "Institution-wide"} />
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
                <option value="All faculties">All faculties</option>
                {facultiesList.map((f) => (
                  <option key={f.facultyId} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-[var(--on-surface-variant)]">
              <span>Scope: <b className="text-[var(--on-surface)]">{selectedFaculty}</b></span>
              <span>Enrolled: <b className="text-[var(--tertiary)]">{totalStudents} Students</b></span>
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-4 mb-6">
            <div className="card p-4 text-center">
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-1">Avg Attendance</p>
              <p className="font-display font-extrabold text-2xl text-[var(--tertiary)]">
                {kpiLoading ? "..." : avgAttendance}
              </p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-1">Pass Rate</p>
              <p className="font-display font-extrabold text-2xl text-[var(--secondary)]">
                {kpiLoading ? "..." : avgPassRate}
              </p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-1">Active Courses</p>
              <p className="font-display font-extrabold text-2xl text-[var(--secondary)]">
                {kpiLoading ? "..." : totalCourses}
              </p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-1">Total Enrolled</p>
              <p className="font-display font-extrabold text-2xl text-[var(--on-surface)]">
                {kpiLoading ? "..." : totalStudents}
              </p>
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
                  {availableActionTypes.map((act) => (
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

            {auditError && (
              <p className="text-xs font-semibold text-red-500">
                Failed to load audit logs: {(auditErrorObj as Error)?.message || "unknown error"}
              </p>
            )}

            <DataTable data={filteredLogs} columns={auditColumns} searchPlaceholder="Search audit logs..." pageSize={10} />
          </div>
        </div>
      </main>
    </div>
  );
}
