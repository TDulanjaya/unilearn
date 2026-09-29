"use client";

import LecturerNavbar from "@/components/LecturerNavbar";
import { useQuery, useQueries } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LecturerDashboard() {
  const { user } = useAuth();

  // course offerings
  const { data: offerings, isLoading: offeringsLoading, isError: offeringsError } = useQuery({
    queryKey: ["lecturerOfferings", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/course-offerings/lecturer/${user?.userId}`),
    enabled: !!user?.userId,
  });

  // assignments
  const assignmentsList = offerings?.flatMap((o: any) => o.assignments || []) || [];

  // submissions
  const submissionsQueries = useQueries({
    queries: assignmentsList.map((asm: any) => ({
      queryKey: ["submissions", asm.assignmentId],
      queryFn: () => api.get<any[]>(`/api/v1/submissions/assignment/${asm.assignmentId}`),
    })),
  });

  // pending grading count
  const pendingGradingCount = submissionsQueries.reduce((acc: number, query: any) => {
    if (!query.data) return acc;
    const ungraded = query.data.filter((s: any) => s.score == null);
    return acc + ungraded.length;
  }, 0);

  // timetable slots
  const slotsQueries = useQueries({
    queries: (offerings || []).map((o: any) => ({
      queryKey: ["slots", o.offeringId],
      queryFn: () => api.get<any[]>(`/api/v1/timetable-slots/offering/${o.offeringId}`),
    })),
  });

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const todaySlots = slotsQueries.flatMap((q: any) => q.data || [])
    .filter((slot: any) => slot.dayOfWeek === todayName);

  // notifications
  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<any>("/api/v1/notifications/me?size=10"),
  });

  const notifications = notificationsData?.dataList || [];

  if (offeringsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-sm font-semibold text-[var(--on-surface-variant)] animate-pulse">
          Loading Lecturer Dashboard...
        </div>
      </div>
    );
  }

  if (offeringsError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)] text-red-500 font-semibold">
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  const totalStudents = offerings?.reduce((acc: number, o: any) => acc + (o.enrollments?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Lecturer Dashboard
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Welcome back, {user?.fullName || "Lecturer"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--surface-container)] text-[var(--tertiary)] flex items-center justify-center font-bold">
              <i className="ti ti-books text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Assigned Offerings</p>
              <p className="font-display font-extrabold text-2xl text-[var(--on-surface)]">{offerings?.length || 0}</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] flex items-center justify-center font-bold">
              <i className="ti ti-users text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Total Students</p>
              <p className="font-display font-extrabold text-2xl text-[var(--tertiary)]">{totalStudents}</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--warning-container)] text-[var(--on-warning-container)] flex items-center justify-center font-bold">
              <i className="ti ti-file-certificate text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Pending Grading</p>
              <p className="font-display font-extrabold text-2xl text-[var(--warning)]">{pendingGradingCount}</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center font-bold">
              <i className="ti ti-chart-line text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Today's Classes</p>
              <p className="font-display font-extrabold text-2xl text-[var(--secondary)]">{todaySlots.length}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Offerings Queue */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <i className="ti ti-school text-xl text-[var(--tertiary)]"></i>
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                Active Course Offerings
              </h3>
            </div>

            {/* Mobile Card View (< md) */}
            <div className="md:hidden divide-y divide-[var(--outline-variant)]">
              {offerings?.length === 0 ? (
                <p className="text-center py-6 text-xs text-[var(--on-surface-variant)] font-semibold">
                  No active course offerings assigned.
                </p>
              ) : (
                offerings?.map((off: any) => (
                  <div key={off.offeringId} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                    <p className="font-bold text-xs text-[var(--on-surface)]">
                      {off.courseCode} {off.courseName}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[var(--on-surface-variant)]">
                      <span>Batch: <b className="text-[var(--on-surface)]">{off.batchName}</b></span>
                      <span>Students: <b className="text-[var(--tertiary)]">{off.enrollments?.length || 0} / {off.capacity || 60}</b></span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                    <th className="pb-3 px-3 font-semibold">Course</th>
                    <th className="pb-3 px-3 font-semibold">Batch</th>
                    <th className="pb-3 px-3 font-semibold">Students</th>
                    <th className="pb-3 px-3 font-semibold">Capacity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline-variant)]">
                  {offerings?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-6 text-xs text-[var(--on-surface-variant)] font-semibold">
                        No active course offerings assigned.
                      </td>
                    </tr>
                  ) : (
                    offerings?.map((off: any) => (
                      <tr key={off.offeringId} className="table-row transition-colors hover:bg-[var(--surface-container-low)]">
                        <td className="py-3.5 px-3 font-semibold text-[var(--on-surface)]">
                          {off.courseCode} {off.courseName}
                        </td>
                        <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">{off.batchName}</td>
                        <td className="py-3.5 px-3 font-medium text-[var(--on-surface)]">
                          {off.enrollments?.length || 0}
                        </td>
                        <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">{off.capacity || 60}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity / Notification Feed */}
          <div className="card p-6 space-y-4 self-start">
            <h3 className="font-display font-bold text-base text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)]">
              Notifications & Alerts
            </h3>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--on-surface-variant)] font-semibold">
                  No new notifications.
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div key={notif.notificationId} className="p-3 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-low)] space-y-1">
                    <p className="font-bold text-xs text-[var(--on-surface)]">{notif.title}</p>
                    <p className="text-[11px] text-[var(--on-surface-variant)]">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
