"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();

  // enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["studentEnrollments", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/enrollments/student/${user?.userId}`),
    enabled: !!user?.userId,
  });

  const enrollmentList = enrollments || [];

  // grades and gpa
  const gradebookQueries = useQueries({
    queries: enrollmentList.map((e: any) => ({
      queryKey: ["gradebook", user?.userId, e.offeringId],
      queryFn: () => api.get<any[]>(`/api/v1/gradebook/student/${user?.userId}/offering/${e.offeringId}`),
    })),
  });

  const allEntries = gradebookQueries.flatMap((q: any) => q.data || []);
  const averageScore = allEntries.length > 0 
    ? allEntries.reduce((acc: number, e: any) => acc + Number(e.score || 0), 0) / allEntries.length 
    : 0;
  const currentGpa = averageScore > 0 ? (averageScore / 25).toFixed(2) : "0.00";

  // attendance
  const { data: attendanceRecords } = useQuery({
    queryKey: ["studentAttendance", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/attendance-records/student/${user?.userId}`),
    enabled: !!user?.userId,
  });

  // late also counts as attended
  const presentRecords = attendanceRecords?.filter((r: any) =>
    ["present", "late"].includes(String(r.status || "").toLowerCase())
  ) || [];
  const attendanceRate = attendanceRecords && attendanceRecords.length > 0 
    ? Math.round((presentRecords.length / attendanceRecords.length) * 100) 
    : 0;

  // assignments
  const assignmentQueries = useQueries({
    queries: enrollmentList.map((e: any) => ({
      queryKey: ["assignments", e.offeringId],
      queryFn: () => api.get<any[]>(`/api/v1/assignments/offering/${e.offeringId}`),
    })),
  });

  const allAssignments = assignmentQueries.flatMap((q: any) => q.data || []);

  // submissions
  const { data: studentSubmissions } = useQuery({
    queryKey: ["studentSubmissions", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/submissions/student/${user?.userId}`),
    enabled: !!user?.userId,
  });

  const submittedAssignmentIds = studentSubmissions?.map((s: any) => s.assignmentId) || [];
  const pendingAssignments = allAssignments.filter((asm: any) => !submittedAssignmentIds.includes(asm.assignmentId));

  // scheduled exams
  const examQueries = useQueries({
    queries: enrollmentList.map((e: any) => ({
      queryKey: ["exams", e.offeringId],
      queryFn: () => api.get<any[]>(`/api/v1/exams/offering/${e.offeringId}`),
    })),
  });

  const enrolledExams = examQueries.flatMap((q: any) => q.data || []);

  if (enrollmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-sm font-semibold text-[var(--on-surface-variant)] animate-pulse">
          Loading Student Portal...
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
          Welcome back, {user?.fullName || "Student"}!
        </h1>
        <p className="text-[var(--on-surface-variant)] text-sm">
          UniLearn Student Portal · Active Enrolled Modules
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-2xl bg-[var(--surface-container)] text-[var(--tertiary)] flex items-center justify-center font-bold">
            <i className="ti ti-book text-xl"></i>
          </div>
          <div>
            <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Enrolled Courses</p>
            <p className="font-display font-extrabold text-2xl text-[var(--on-surface)]">{enrollmentList.length}</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-2xl bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] flex items-center justify-center font-bold">
            <i className="ti ti-award text-xl"></i>
          </div>
          <div>
            <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Current GPA</p>
            <p className="font-display font-extrabold text-2xl text-[var(--tertiary)]">{currentGpa}</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-2xl bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center font-bold">
            <i className="ti ti-checkup-list text-xl"></i>
          </div>
          <div>
            <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Overall Attendance</p>
            <p className="font-display font-extrabold text-2xl text-[var(--secondary)]">{attendanceRate}%</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-2xl bg-[var(--warning-container)] text-[var(--on-warning-container)] flex items-center justify-center font-bold">
            <i className="ti ti-clock text-xl"></i>
          </div>
          <div>
            <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Pending Submissions</p>
            <p className="font-display font-extrabold text-2xl text-[var(--warning)]">{pendingAssignments.length}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enrolled Offerings List */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <i className="ti ti-books text-xl text-[var(--tertiary)]"></i>
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">Enrolled Courses</h3>
          </div>
          <div className="space-y-3">
            {enrollmentList.length === 0 ? (
              <div className="text-center p-6 text-xs text-[var(--on-surface-variant)]">
                You are not enrolled in any courses.
              </div>
            ) : (
              enrollmentList.map((e: any) => (
                <div key={e.enrollmentId} className="flex items-center justify-between p-3.5 border border-[var(--outline-variant)] rounded-xl hover:bg-[var(--surface-container-low)] transition-colors">
                  <div>
                    <p className="font-semibold text-sm text-[var(--on-surface)]">
                      {e.courseCode} {e.courseName}
                    </p>
                    <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                      Batch: {e.batchName || "N/A"} · Status: {e.status}
                    </p>
                  </div>
                  <span className="badge badge-accent">Active</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Deadlines and Exams */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <i className="ti ti-calendar-event text-xl text-[var(--tertiary)]"></i>
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">Upcoming Deadlines & Exams</h3>
          </div>
          <div className="space-y-3 text-sm">
            {pendingAssignments.length === 0 && enrolledExams.length === 0 ? (
              <div className="text-center p-6 text-xs text-[var(--on-surface-variant)]">
                No upcoming deadlines or scheduled exams.
              </div>
            ) : (
              <>
                {pendingAssignments.map((asm: any) => (
                  <div key={asm.assignmentId} className="flex items-center justify-between p-3.5 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-low)]">
                    <div>
                      <p className="font-semibold text-xs text-[var(--on-surface)]">{asm.title}</p>
                      <p className="text-[10px] text-[var(--outline)] mt-0.5">Max Score: {asm.maxScore} points</p>
                    </div>
                    <span className="badge badge-danger">Not Submitted</span>
                  </div>
                ))}

                {enrolledExams.map((ex: any) => (
                  <div key={ex.examId} className="flex items-center justify-between p-3.5 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-low)]">
                    <div>
                      <p className="font-semibold text-xs text-[var(--on-surface)]">{ex.title}</p>
                      <p className="text-[10px] text-[var(--outline)] mt-0.5">Duration: {ex.durationMinutes} mins</p>
                    </div>
                    <span className="badge badge-accent">Scheduled Exam</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
