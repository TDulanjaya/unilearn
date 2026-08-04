"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

import { CourseTab, Assignment, Resource } from "@/types/course";
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
  const course = COURSES[courseId] || COURSES["1"];
  const mcqBank = MCQ_BANKS[course.code] || MCQ_BANKS["SE308.3"];
  const structuredBank = STRUCTURED_BANKS[course.code] || STRUCTURED_BANKS["SE308.3"];

  const initialTab = (searchParams.get("tab") as CourseTab) || "materials";
  const [activeTab, setActiveTab] = useState<CourseTab>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as CourseTab;
    if (tabParam && ["materials", "assignments", "resources", "ai"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [toastMessage, setToastMessage] = useState("");

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
        <CourseMaterialsTab course={course} materials={INITIAL_MATERIALS} />
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
        <CourseAiTab course={course} mcqBank={mcqBank} structuredBank={structuredBank} />
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
