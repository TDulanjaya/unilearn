"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

import { useAuth } from "@/context/AuthContext";

interface CourseItem {
  id: string;
  code: string;
  title: string;
  lecturer: string;
  progress: number;
  assignmentsPending: number;
  status: "In progress" | "Future" | "Past";
  isStarred: boolean;
  isRemovedFromView: boolean;
}

const INITIAL_COURSES: CourseItem[] = [];

type FilterType =
  | "All (except removed from view)"
  | "In progress"
  | "Past"
  | "Removed from view";

export default function StudentCoursesPage() {
  const { user } = useAuth();

  // enrollments
  const { data: enrollmentsData } = useQuery({
    queryKey: ["studentEnrollments", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/enrollments/student/${user?.userId}`),
    enabled: !!user?.userId,
  });

  // course offerings
  const { data: offeringsData, isLoading } = useQuery({
    queryKey: ["courseOfferings"],
    queryFn: () => api.get<any>("/api/v1/course-offerings"),
  });

  const enrolledList: any[] = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : (enrollmentsData as any)?.content || (enrollmentsData as any)?.dataList || [];

  const allOfferingsList: any[] = Array.isArray(offeringsData)
    ? offeringsData
    : offeringsData?.content || offeringsData?.dataList || [];

  // Show enrolled courses or all courses
  const activeList = enrolledList.length > 0 ? enrolledList : allOfferingsList;

  const apiCourses: CourseItem[] = activeList.map((o: any, idx: number) => ({
    id: String(o.offeringId || idx + 1),
    code: o.courseCode || "—",
    title: o.courseName || o.courseTitle || "Untitled Course",
    lecturer: o.primaryLecturerName
      ? `${o.primaryLecturerName}${o.departmentName ? " · " + o.departmentName : ""}`
      : (o.lecturerName || "Lecturer"),
    progress: o.progress ?? 0,
    assignmentsPending: 0,
    status: "In progress",
    isStarred: false,
    isRemovedFromView: false,
  }));

  const [courses, setCourses] = useState<CourseItem[]>(apiCourses);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All (except removed from view)");

  useEffect(() => {
    if (activeList.length > 0) {
      setCourses(apiCourses);
    }
  }, [enrollmentsData, offeringsData]);

  const toggleRemoveFromView = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isRemovedFromView: !c.isRemovedFromView } : c))
    );
  };

  const filteredCourses = courses.filter((c) => {
    
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lecturer.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    
    switch (selectedFilter) {
      case "All (except removed from view)":
        return !c.isRemovedFromView;
      case "In progress":
        return !c.isRemovedFromView && c.status === "In progress";
      case "Past":
        return !c.isRemovedFromView && c.status === "Past";
      case "Removed from view":
        return c.isRemovedFromView;
      default:
        return true;
    }
  });

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
          My Courses
        </h1>
        <p className="text-[var(--on-surface-variant)] text-sm">
          Enrolled course modules for current semester. Click any course to access workspace, materials, assignments, and AI tutor.
        </p>
      </div>

      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] shadow-sm">
        
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider shrink-0">
            Show:
          </label>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as FilterType)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--tertiary)] outline-none transition-all"
          >
            <option value="All (except removed from view)">All (except removed from view)</option>
            <option value="In progress">In progress</option>
            <option value="Past">Past</option>
            <option value="Removed from view">Removed from view</option>
          </select>
        </div>

        
        <div className="relative flex-1 sm:max-w-xs">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] text-sm pointer-events-none z-10"></i>
          <input
            type="text"
            placeholder="Search course by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "2.25rem", paddingRight: "2.25rem" }}
            className="w-full text-xs py-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface)] placeholder-[var(--on-surface-variant)] focus:ring-2 focus:ring-[var(--tertiary)] outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] text-xs z-10"
            >
              <i className="ti ti-x"></i>
            </button>
          )}
        </div>
      </div>

      
      {filteredCourses.length === 0 ? (
        <div className="card p-12 text-center space-y-3 bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
          <i className="ti ti-books-off text-4xl text-[var(--on-surface-variant)] opacity-40"></i>
          <p className="font-bold text-sm text-[var(--on-surface)]">No matching courses found</p>
          <p className="text-xs text-[var(--on-surface-variant)]">Try adjusting your search terms or filter selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => (
            <div key={c.id} className="card p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200 bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] relative group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="badge badge-accent font-bold">{c.code}</span>

                  <div className="flex items-center gap-1.5">
                    {c.assignmentsPending > 0 ? (
                      <span className="badge badge-warning text-[10px]">{c.assignmentsPending} Pending</span>
                    ) : (
                      <span className="badge badge-success text-[10px]">Up to date</span>
                    )}

                    <button
                      onClick={(e) => toggleRemoveFromView(c.id, e)}
                      className="text-[var(--on-surface-variant)] hover:text-red-500 text-xs p-1 rounded hover:bg-[var(--surface-container-low)]"
                      title={c.isRemovedFromView ? "Restore to view" : "Remove from view"}
                    >
                      <i className={`ti ${c.isRemovedFromView ? "ti-eye" : "ti-eye-off"}`}></i>
                    </button>
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg mb-1 text-[var(--on-surface)]">
                  {c.title}
                </h3>
                <p className="text-xs text-[var(--on-surface-variant)] mb-4">
                  {c.lecturer}
                </p>

                <div className="progress-track mb-2">
                  <div className="progress-fill" style={{ width: `${c.progress}%` }}></div>
                </div>
                <p className="text-xs text-[var(--outline)] font-medium mb-4">{c.progress}% Course Completed</p>

                
                <div className="flex items-center justify-between text-xs pt-3 border-t border-[var(--outline-variant)] text-[var(--tertiary)] font-semibold">
                  <Link href={`/student/courses/${c.id}?tab=materials`} className="hover:underline flex items-center gap-1">
                    <i className="ti ti-book text-sm"></i> Materials
                  </Link>
                  <Link href={`/student/courses/${c.id}?tab=assignments`} className="hover:underline flex items-center gap-1">
                    <i className="ti ti-clipboard-check text-sm"></i> Assignments
                  </Link>
                  <Link href={`/student/courses/${c.id}?tab=ai`} className="hover:underline flex items-center gap-1">
                    <i className="ti ti-sparkles text-sm"></i> AI Tutor
                  </Link>
                </div>
              </div>

              <Link href={`/student/courses/${c.id}`} className="btn-primary text-xs mt-5 justify-center shadow-sm">
                View course workspace <i className="ti ti-arrow-right ml-1"></i>
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
