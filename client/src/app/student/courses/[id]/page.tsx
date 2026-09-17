"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

import { CourseTab, Course, MaterialItem, Assignment, Resource } from "@/types/course";
import {
  COURSES,
  INITIAL_MATERIALS,
  INITIAL_ASSIGNMENTS,
  MCQ_BANKS,
  STRUCTURED_BANKS,
  INITIAL_RESOURCES,
} from "@/mock/courseData";

import CourseMaterialsTab from "@/components/course/CourseMaterialsTab";
import CourseAssignmentsTab from "@/components/course/CourseAssignmentsTab";
import CourseResourcesTab from "@/components/course/CourseResourcesTab";
import CourseAiTab from "@/components/course/CourseAiTab";

function CourseHubContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const courseId = (params.id as string) || "1";
  const numericId = Number(courseId) || 1;

  const { data: offeringResponse, isLoading: isLoadingOffering } = useQuery({
    queryKey: ["courseOffering", numericId],
    queryFn: () => api.get<any>(`/api/v1/course-offerings/${numericId}`),
    enabled: !isNaN(numericId),
  });

  const { data: rawMaterialsData } = useQuery({
    queryKey: ["materials", numericId],
    queryFn: () => api.get<any>(`/api/v1/materials/offering/${numericId}`),
    enabled: !isNaN(numericId),
  });

  const { data: rawAssignmentsData } = useQuery({
    queryKey: ["assignments", numericId],
    queryFn: () => api.get<any>(`/api/v1/assignments/offering/${numericId}`),
    enabled: !isNaN(numericId),
  });

  const { data: rawResourcesData } = useQuery({
    queryKey: ["personalResources", numericId],
    queryFn: () => api.get<any>(`/api/v1/personal-resources/offering/${numericId}`),
    enabled: !isNaN(numericId),
  });

  const defaultFallbackCourse: Course = {
    code: "SE308.3",
    title: "Course Workspace",
    lecturer: "Lecturer",
    dept: "Department",
    progress: 0,
  };

  const fallbackCourse: Course = COURSES[courseId] || COURSES["1"] || defaultFallbackCourse;

  const course: Course = offeringResponse
    ? {
        code: offeringResponse.courseCode || fallbackCourse.code || "SE308.3",
        title: offeringResponse.courseName || offeringResponse.courseTitle || fallbackCourse.title || "Course Details",
        lecturer: offeringResponse.primaryLecturerName || offeringResponse.lecturerName || fallbackCourse.lecturer || "Lecturer",
        dept: offeringResponse.departmentName || fallbackCourse.dept || "Department",
        progress: offeringResponse.progress ?? fallbackCourse.progress ?? 0,
      }
    : fallbackCourse;

  const activeCourseCode = course?.code || "SE308.3";
  const mcqBank = (activeCourseCode && MCQ_BANKS[activeCourseCode]) || MCQ_BANKS["SE308.3"] || [];
  const structuredBank = (activeCourseCode && STRUCTURED_BANKS[activeCourseCode]) || STRUCTURED_BANKS["SE308.3"] || [];

  const initialTab = (searchParams.get("tab") as CourseTab) || "materials";
  const [activeTab, setActiveTab] = useState<CourseTab>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as CourseTab;
    if (tabParam && ["materials", "assignments", "resources", "ai"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const fetchedMaterials: MaterialItem[] = rawMaterialsData?.content
    ? rawMaterialsData.content.map((m: any) => ({
        id: m.materialId,
        title: m.title,
        type: (m.resourceType as any) || "PDF",
        module: "Module 1",
        date: m.uploadedAt ? new Date(m.uploadedAt).toLocaleDateString() : "Recent",
        size: "2.5 MB",
        summary: m.title,
        linkUrl: m.fileUrl || m.linkUrl || m.externalLink,
      }))
    : [];

  const fetchedAssignments: Assignment[] = Array.isArray(rawAssignmentsData) && rawAssignmentsData.length > 0
    ? rawAssignmentsData.map((a: any) => ({
        id: a.assignmentId,
        title: a.title,
        due: a.deadline ? new Date(a.deadline).toLocaleDateString() : "TBD",
        status: "Draft",
        grade: null,
        description: a.description || "",
        maxScore: Number(a.maxScore) || 100,
        attempts: [],
      }))
    : [];

  const fetchedResources: Resource[] = rawResourcesData?.content
    ? rawResourcesData.content.map((r: any) => ({
        id: r.resourceId,
        fileName: r.fileName || r.title || "Resource File",
        uploadedAt: r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : "Today",
      }))
    : [];

  const [assignments, setAssignments] = useState<Assignment[]>(fetchedAssignments);
  const [resources, setResources] = useState<Resource[]>(fetchedResources);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (fetchedAssignments) setAssignments(fetchedAssignments);
  }, [rawAssignmentsData]);

  useEffect(() => {
    if (fetchedResources) setResources(fetchedResources);
  }, [rawResourcesData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleUpdateAssignment = (updated: Assignment) => {
    setAssignments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleAddResource = (res: Resource) => {
    setResources((prev) => [res, ...prev]);
  };

  const handleRenameResource = (id: number, newName: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, fileName: newName } : r))
    );
  };

  const handleDeleteResource = (id: number) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const tabs: { key: CourseTab; label: string; icon: string }[] = [
    { key: "materials", label: "Materials", icon: "ti-book" },
    { key: "assignments", label: "Assignments", icon: "ti-clipboard-check" },
    { key: "resources", label: "My Resources", icon: "ti-folder" },
    { key: "ai", label: "AI Assistant", icon: "ti-sparkles" },
  ];

  const handleTabChange = (key: CourseTab) => {
    setActiveTab(key);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", key);
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--surface-container-highest)] border border-[var(--tertiary)] text-[var(--on-surface)] px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <i className="ti ti-check text-[var(--tertiary)] text-lg"></i>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-[var(--on-surface-variant)] mb-4 font-medium">
        <Link href="/student/courses" className="hover:text-[var(--tertiary)] transition-colors">
          My Courses
        </Link>
        <i className="ti ti-chevron-right text-[10px]"></i>
        <span className="text-[var(--on-surface)] font-semibold">{course.code}</span>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="badge badge-accent">{course.code}</span>
          <span className="text-xs text-[var(--on-surface-variant)] font-medium">
            {course.lecturer} · {course.dept}
          </span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)]">
          {isLoadingOffering ? "Loading course..." : course.title}
        </h1>
        <div className="mt-3 max-w-sm">
          <div className="progress-track mb-1">
            <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
          </div>
          <p className="text-xs text-[var(--outline)] font-medium">
            {course.progress}% Course Completed
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-[var(--outline-variant)] overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`tab-btn flex items-center gap-1.5 ${activeTab === t.key ? "active" : ""}`}
          >
            <i className={`ti ${t.icon} text-sm`}></i>
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.split(" ").pop()}</span>
          </button>
        ))}
      </div>

      {activeTab === "materials" && (
        <CourseMaterialsTab course={course} materials={fetchedMaterials} />
      )}

      {activeTab === "assignments" && (
        <CourseAssignmentsTab
          assignments={assignments}
          onUpdateAssignment={handleUpdateAssignment}
          showToast={showToast}
        />
      )}

      {activeTab === "resources" && (
        <CourseResourcesTab
          resources={resources}
          onAddResource={handleAddResource}
          onRenameResource={handleRenameResource}
          onDeleteResource={handleDeleteResource}
          showToast={showToast}
        />
      )}

      {activeTab === "ai" && (
        <CourseAiTab
          course={course}
          offeringId={numericId}
          materialsCount={fetchedMaterials.length}
          resourcesCount={fetchedResources.length}
          mcqBank={mcqBank}
          structuredBank={structuredBank}
        />
      )}
    </main>
  );
}

export default function CourseWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[var(--on-surface-variant)]">
          Loading Course Hub...
        </div>
      }
    >
      <CourseHubContent />
    </Suspense>
  );
}
