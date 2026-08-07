"use client";

import Sidebar from "@/components/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function HodDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch HOD's own assignments to determine department
  const { data: assignments } = useQuery({
    queryKey: ["hodAssignments", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/hod-dean-assignments/user/${user?.userId}`),
    enabled: !!user?.userId,
  });

  const activeAssignment = assignments?.find((a: any) => a.active);
  const departmentId = activeAssignment?.departmentId;
  const departmentName = activeAssignment?.departmentName || "Software Engineering";

  // 2. Fetch lecturers of HOD's department
  const { data: lecturersData, isLoading: lecturersLoading } = useQuery({
    queryKey: ["departmentLecturers", departmentId],
    queryFn: () => api.get<any>(`/api/v1/lecturers/department/${departmentId}`),
    enabled: !!departmentId,
  });

  // 3. Fetch departmental KPIs
  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ["hodKpi"],
    queryFn: () => api.get<any>("/api/v1/reports/dashboard"),
  });

  // 4. Fetch all course offerings
  const { data: allOfferings, isLoading: offeringsLoading } = useQuery({
    queryKey: ["courseOfferings"],
    queryFn: () => api.get<any[]>("/api/v1/course-offerings"),
  });

  // Update lecturer assignment mutation
  const updateMutation = useMutation({
    mutationFn: (data: { offeringId: number; courseId: number; batchId: number; semesterId: number; primaryLecturerId: number; capacity?: number }) =>
      api.put(`/api/v1/course-offerings/${data.offeringId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseOfferings"] });
    },
  });

  if (lecturersLoading || kpiLoading || offeringsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-sm font-semibold text-[var(--on-surface-variant)] animate-pulse">
          Loading HOD Dashboard...
        </div>
      </div>
    );
  }

  const deptLecturers = lecturersData?.dataList || [];
  const departmentOfferings = allOfferings?.filter((o: any) =>
    deptLecturers.some((l: any) => l.lecturerId === o.primaryLecturerId)
  ) || [];

  const handleLecturerChange = async (offering: any, newLecturerId: string) => {
    try {
      await updateMutation.mutateAsync({
        offeringId: offering.offeringId,
        courseId: offering.courseId,
        batchId: offering.batchId,
        semesterId: offering.semesterId,
        primaryLecturerId: Number(newLecturerId),
        capacity: offering.capacity || 60,
      });
    } catch (err: any) {
      alert("Failed to update assignment: " + err.message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar 
        role="hod" 
        name={user?.fullName || "HOD Dean"} 
        sub={`HOD · ${departmentName}`} 
      />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full space-y-8">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            HOD Departmental Executive Dashboard
          </h1>
          <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm">
            Overview of department KPIs, academic staff assignments, and course offering approval queues.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
            <div className="w-11 h-11 rounded-2xl bg-[var(--tertiary-container)] text-[var(--tertiary)] flex items-center justify-center font-bold">
              <i className="ti ti-certificate text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Average Department Pass Rate</p>
              <p className="font-display font-extrabold text-2xl text-[var(--on-surface)]">
                {kpiData?.averageExamPassRate != null ? Math.round(kpiData.averageExamPassRate * 100) : 94}%
              </p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <i className="ti ti-user-check text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Overall Attendance Rate</p>
              <p className="font-display font-extrabold text-2xl text-emerald-600">
                {kpiData?.averageAttendanceRate != null ? Math.round(kpiData.averageAttendanceRate * 100) : 88.5}%
              </p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <i className="ti ti-chart-arrows-vertical text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Active Offerings</p>
              <p className="font-display font-extrabold text-2xl text-blue-600">{departmentOfferings.length}</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <i className="ti ti-clock text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Department Lecturers</p>
              <p className="font-display font-extrabold text-2xl text-amber-600">{deptLecturers.length}</p>
            </div>
          </div>
        </div>

        {/* Offerings list */}
        <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
            <div>
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
                <i className="ti ti-checkbox text-[var(--tertiary)]"></i> Department Course Offerings
              </h3>
              <p className="text-xs text-[var(--on-surface-variant)]">
                Review active course offerings and update leading academic lecturers.
              </p>
            </div>
            <span className="badge badge-accent font-bold">{departmentOfferings.length} Offerings</span>
          </div>

          <div className="space-y-3">
            {departmentOfferings.length === 0 ? (
              <div className="text-center p-6 text-xs text-[var(--on-surface-variant)] font-semibold">
                No course offerings found for this department.
              </div>
            ) : (
              departmentOfferings.map((off: any) => (
                <div
                  key={off.offeringId}
                  className="p-4 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-low)] flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[var(--surface-container-lowest)] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-accent">{off.courseCode}</span>
                      <span className="text-xs text-[var(--on-surface-variant)]">
                        {off.semesterLabel || off.semesterName || "Semester"} · {off.batchName}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-[var(--on-surface)] truncate">{off.courseName}</p>
                    <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                      Capacity: {off.capacity || 60} Students
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-semibold text-[var(--on-surface-variant)]">Lecturer:</label>
                      <select
                        value={off.primaryLecturerId || ""}
                        onChange={(e) => handleLecturerChange(off, e.target.value)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
                      >
                        <option value="">Unassigned</option>
                        {deptLecturers.map((lec: any) => (
                          <option key={lec.lecturerId} value={lec.lecturerId}>
                            {lec.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
