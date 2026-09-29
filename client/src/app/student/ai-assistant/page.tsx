"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const GRADIENTS = [
  "from-[#0d1c2e] to-[#006a61]",
  "from-[#0d1c2e] to-[#0090a9]",
  "from-[#006a61] to-[#4cd7f6]",
  "from-[#0d1c2e] to-[#2563eb]",
  "from-[#1e1b4b] to-[#7c3aed]",
];

export default function AiAssistantPage() {
  const { user } = useAuth();

  const { data: enrollments, isLoading, isError, refetch } = useQuery({
    queryKey: ["studentEnrollments", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/enrollments/student/${user?.userId}`),
    enabled: !!user?.userId,
  });

  const enrolledList = enrollments || [];

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
          AI Study Assistant
        </h1>
        <p className="text-[var(--on-surface-variant)] text-sm">
          Select an enrolled course to open its dedicated AI assistant with practice quizzes, structured Q&A, and lecture-grounded chat.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-sm font-semibold text-[var(--on-surface-variant)] animate-pulse">
            Loading your enrolled courses...
          </div>
        </div>
      )}

      {isError && (
        <div className="card p-8 text-center space-y-4 border border-red-500/20 bg-red-500/5 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto text-2xl">
            <i className="ti ti-alert-triangle"></i>
          </div>
          <h3 className="font-display font-bold text-base text-[var(--on-surface)]">
            Failed to Load Courses
          </h3>
          <p className="text-xs text-[var(--on-surface-variant)]">
            Could not fetch your active module enrollments from the server.
          </p>
          <button onClick={() => refetch()} className="btn-primary text-xs !py-2 !px-4 mx-auto">
            <i className="ti ti-rotate mr-1"></i> Try Again
          </button>
        </div>
      )}

      {!isLoading && !isError && enrolledList.length === 0 && (
        <div className="card p-12 text-center space-y-3 border border-dashed border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] max-w-md mx-auto">
          <i className="ti ti-books-off text-4xl text-[var(--on-surface-variant)] opacity-40"></i>
          <h3 className="font-display font-bold text-base text-[var(--on-surface)]">
            No Active Enrollments
          </h3>
          <p className="text-xs text-[var(--on-surface-variant)]">
            You are not currently enrolled in any course offerings.
          </p>
          <Link href="/student/courses" className="btn-secondary text-xs !py-2 !px-4 mx-auto inline-flex items-center gap-1.5">
            <i className="ti ti-book"></i> View Courses
          </Link>
        </div>
      )}

      {!isLoading && !isError && enrolledList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {enrolledList.map((enrollment: any, idx: number) => {
            const gradient = GRADIENTS[idx % GRADIENTS.length];
            const offeringId = enrollment.offeringId;
            const code = enrollment.courseCode || "—";
            const title = enrollment.courseName || enrollment.courseTitle || "Course Workspace";
            const lecturer = enrollment.primaryLecturerName || enrollment.lecturerName || "Assigned Lecturer";

            return (
              <Link
                key={offeringId || idx}
                href={`/student/courses/${offeringId}?tab=ai`}
                className="card p-6 flex flex-col items-center text-center hover:shadow-xl transition-all duration-200 group"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}
                >
                  <i className="ti ti-sparkles text-2xl text-white"></i>
                </div>
                <span className="badge badge-accent mb-2 font-bold">{code}</span>
                <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-1 line-clamp-2">
                  {title}
                </h3>
                <p className="text-xs text-[var(--on-surface-variant)] mb-4">{lecturer}</p>
                <span className="btn-primary text-xs shadow-sm group-hover:shadow-md transition-shadow inline-flex items-center gap-1.5">
                  <i className="ti ti-sparkles text-sm"></i> Open AI Assistant
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
