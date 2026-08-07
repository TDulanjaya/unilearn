"use client";

import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Page() {
  useInteractive();
  const { user } = useAuth();

  const { data: kpiData, isLoading: kpiLoading, isError: kpiError } = useQuery({
    queryKey: ["adminKpi"],
    queryFn: () => api.get<any>("/api/v1/reports/dashboard"),
  });

  const { data: facultiesData, isLoading: facultiesLoading, isError: facultiesError } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => api.get<any>("/api/v1/faculties?size=100"),
  });

  const { data: auditLogsData, isLoading: auditLogsLoading } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => api.get<any>("/api/v1/audit-logs?size=15"),
  });

  if (kpiLoading || facultiesLoading || auditLogsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-sm font-semibold text-[var(--on-surface-variant)] animate-pulse">
          Loading Admin Dashboard...
        </div>
      </div>
    );
  }

  if (kpiError || facultiesError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)] text-red-500 font-semibold">
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  const totalUsers = (kpiData?.totalStudents || 0) + (kpiData?.totalLecturers || 0);
  const totalFaculties = facultiesData?.dataCount || facultiesData?.dataList?.length || 0;
  const auditLogs = auditLogsData?.dataList || [];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar 
        role="admin" 
        name={user?.fullName || "System Admin"} 
        sub="Staff Admin · Institution-wide" 
      />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Admin Dashboard
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Institution-wide overview.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--surface-container)] text-[var(--tertiary)] flex items-center justify-center font-bold">
              <i className="ti ti-users text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Total Users</p>
              <p className="font-display font-extrabold text-2xl text-[var(--on-surface)]">{totalUsers}</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] flex items-center justify-center font-bold">
              <i className="ti ti-building-bank text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Faculties</p>
              <p className="font-display font-extrabold text-2xl text-[var(--tertiary)]">{totalFaculties}</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center font-bold">
              <i className="ti ti-books text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Active Courses</p>
              <p className="font-display font-extrabold text-2xl text-[var(--secondary)]">{kpiData?.totalCourses || 0}</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--warning-container)] text-[var(--on-warning-container)] flex items-center justify-center font-bold">
              <i className="ti ti-calendar-time text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Active Offerings</p>
              <p className="font-display font-extrabold text-2xl text-[var(--warning)]">{kpiData?.totalActiveOfferings || 0}</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--surface-container)] text-[var(--on-surface-variant)] flex items-center justify-center font-bold">
              <i className="ti ti-calendar-event text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Total Enrollments</p>
              <p className="font-display font-extrabold text-2xl text-[var(--on-surface)]">{kpiData?.totalEnrollments || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--outline-variant)]">
            <i className="ti ti-activity text-xl text-[var(--tertiary)]"></i>
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
              System Activity
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            {auditLogs.length === 0 ? (
              <div className="text-center p-6 text-xs text-[var(--on-surface-variant)] font-semibold">
                No recent system activity logs found.
              </div>
            ) : (
              auditLogs.map((log: any) => (
                <div 
                  key={log.logId} 
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-container-low)] transition-colors"
                >
                  <i className="ti ti-user-plus text-[var(--tertiary)] text-lg"></i>
                  <span className="text-[var(--on-surface)] font-medium">
                    <strong className="text-[var(--primary)]">{log.userName || `User #${log.userId}`}</strong> {log.action} {log.details ? `(${log.details})` : ""}
                  </span>
                  <span className="text-xs text-[var(--outline)] font-medium ml-auto">
                    {new Date(log.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
