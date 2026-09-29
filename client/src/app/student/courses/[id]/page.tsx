"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

import { CourseTab, Course, MaterialItem, Assignment, Resource } from "@/types/course";

import CourseMaterialsTab from "@/components/course/CourseMaterialsTab";
import CourseAssignmentsTab from "@/components/course/CourseAssignmentsTab";
import CourseResourcesTab from "@/components/course/CourseResourcesTab";
import CourseAiTab from "@/components/course/CourseAiTab";

function CourseHubContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const courseId = params?.id as string;
  const numericId = Number(courseId);

  const { data: offeringResponse, isLoading: isLoadingOffering, isError: isErrorOffering } = useQuery({
    queryKey: ["courseOffering", numericId],
    queryFn: () => api.get<any>(`/api/v1/course-offerings/${numericId}`),
    enabled: !isNaN(numericId) && numericId > 0,
  });

  const { data: rawMaterialsData } = useQuery({
    queryKey: ["materials", numericId],
    queryFn: () => api.get<any>(`/api/v1/materials/offering/${numericId}`),
    enabled: !isNaN(numericId) && numericId > 0,
  });

  const { data: rawAssignmentsData } = useQuery({
    queryKey: ["assignments", numericId],
    queryFn: () => api.get<any>(`/api/v1/assignments/offering/${numericId}`),
    enabled: !isNaN(numericId) && numericId > 0,
  });

  const { data: rawResourcesData } = useQuery({
    queryKey: ["personalResources", numericId],
    queryFn: () => api.get<any>(`/api/v1/personal-resources/offering/${numericId}`),
    enabled: !isNaN(numericId) && numericId > 0,
  });

  const initialTab = (searchParams.get("tab") as CourseTab) || "materials";
  const [activeTab, setActiveTab] = useState<CourseTab>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as CourseTab;
    if (tabParam && ["materials", "assignments", "resources", "ai"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  if (isLoadingOffering) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-sm font-semibold text-[var(--on-surface-variant)] animate-pulse">
          Loading course hub...
        </div>
      </div>
    );
  }

  if (isErrorOffering || !offeringResponse) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center text-3xl">
          <i className="ti ti-alert-circle"></i>
        </div>
        <h1 className="font-display font-extrabold text-2xl text-[var(--on-surface)]">
          Course not found
        </h1>
        <p className="text-sm text-[var(--on-surface-variant)] max-w-md mx-auto">
          The requested course offering could not be loaded or does not exist.
        </p>
        <div className="pt-2">
          <Link href="/student/courses" className="btn-primary text-xs inline-flex items-center gap-2">
            <i className="ti ti-arrow-left"></i> Back to My Courses
          </Link>
        </div>
      </main>
    );
  }

  const course: Course = {
    code: offeringResponse.courseCode || "—",
    title: offeringResponse.courseName || offeringResponse.courseTitle || "Course Details",
    lecturer: offeringResponse.primaryLecturerName || offeringResponse.lecturerName || "Lecturer",
    dept: offeringResponse.departmentName || "Department",
    progress: offeringResponse.progress ?? 0,
  };

  const fetchedMaterials: MaterialItem[] = rawMaterialsData?.content || (Array.isArray(rawMaterialsData) ? rawMaterialsData : [])
    ? (rawMaterialsData.content || (Array.isArray(rawMaterialsData) ? rawMaterialsData : [])).map((m: any) => ({
        id: m.materialId,
        title: m.title,
        type: (m.resourceType as any) || "PDF",
        module: "Module 1",
        date: m.uploadedAt ? new Date(m.uploadedAt).toLocaleDateString() : "Recent",
        size: m.fileSize ? `${Math.round(m.fileSize / 1024)} KB` : "Document",
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

  const fetchedResources: Resource[] = rawResourcesData?.content || (Array.isArray(rawResourcesData) ? rawResourcesData : [])
    ? (rawResourcesData.content || (Array.isArray(rawResourcesData) ? rawResourcesData : [])).map((r: any) => ({
        id: r.resourceId,
        fileName: r.fileName || r.title || "Resource File",
        uploadedAt: r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : "Today",
      }))
    : [];

  return (
    <CourseHubView
      course={course}
      numericId={numericId}
      fetchedMaterials={fetchedMaterials}
      fetchedAssignments={fetchedAssignments}
      fetchedResources={fetchedResources}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}

function CourseHubView({
  course,
  numericId,
  fetchedMaterials,
  fetchedAssignments,
  fetchedResources,
  activeTab,
  onTabChange,
}: {
  course: Course;
  numericId: number;
  fetchedMaterials: MaterialItem[];
  fetchedAssignments: Assignment[];
  fetchedResources: Resource[];
  activeTab: CourseTab;
  onTabChange: (tab: CourseTab) => void;
}) {
  const [assignments, setAssignments] = useState<Assignment[]>(fetchedAssignments);
  const [resources, setResources] = useState<Resource[]>(fetchedResources);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setAssignments(fetchedAssignments);
  }, [fetchedAssignments]);

  useEffect(() => {
    setResources(fetchedResources);
  }, [fetchedResources]);

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

  const handleDeleteResource = async (id: number) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      try {
        await api.delete(`/api/v1/personal-resources/${id}`);
        setResources((prev) => prev.filter((r) => r.id !== id));
        showToast("Personal resource deleted and removed from AI index.");
      } catch (err: any) {
        showToast("Failed to delete resource: " + (err.message || "Error"));
      }
    }
  };

  const tabs: { key: CourseTab; label: string; icon: string }[] = [
    { key: "materials", label: "Materials", icon: "ti-book" },
    { key: "assignments", label: "Assignments", icon: "ti-clipboard-check" },
    { key: "resources", label: "My Resources", icon: "ti-folder" },
    { key: "ai", label: "AI Assistant", icon: "ti-sparkles" },
  ];

  const handleTabChange = (key: CourseTab) => {
    onTabChange(key);
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
          {course.title}
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

      <div className="flex gap-2 mb-6 border-b border-[var(--outline-variant)] overflow-x-auto no-scrollbar flex-nowrap pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`tab-btn flex items-center gap-2 min-h-[44px] shrink-0 whitespace-nowrap px-4 py-2.5 ${
              activeTab === t.key ? "active" : ""
            }`}
          >
            <i className={`ti ${t.icon} text-base`}></i>
            <span className="font-semibold text-xs sm:text-sm">{t.label}</span>
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
          offeringId={numericId}
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
          resourcesCount={resources.length}
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
