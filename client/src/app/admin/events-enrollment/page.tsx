"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

interface BatchItem {
  batchId: number;
  name: string;
  departmentId?: number;
  departmentName?: string;
  academicYearId?: number;
  academicYearLabel?: string;
  academicYearName?: string;
  enrollmentYear?: number;
}

interface CourseOfferingItem {
  offeringId: number;
  courseId: number;
  courseCode?: string;
  courseTitle?: string;
  courseName?: string;
  batchId: number;
  batchName?: string;
  semesterId: number;
  semesterName?: string;
  primaryLecturerId?: number;
  lecturerName?: string;
  capacity?: number;
  enrolledCount?: number;
}

interface StudentItem {
  studentId: number;
  studentNo: string;
  fullName: string;
  email: string;
  departmentName?: string;
  batchName?: string;
  status?: string;
}

interface EventItem {
  id: number;
  title: string;
  description: string;
  venue: string;
  eventDate: string;
  rawDate?: string;
  capacity?: number;
  posterUrl?: string;
}

interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  postedAt: string;
}

export default function EventsEnrollmentPage() {
  const queryClient = useQueryClient();
  const currentUser = getUser();

  // Active tab navigation
  const [activeTab, setActiveTab] = useState<"wizard" | "events" | "announcements">("wizard");

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Wizard state
  const [enrollStep, setEnrollStep] = useState<1 | 2 | 3>(1);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [selectedOfferingIds, setSelectedOfferingIds] = useState<number[]>([]);
  const [batchSearch, setBatchSearch] = useState("");
  const [offeringSearch, setOfferingSearch] = useState("");
  const [enrollResult, setEnrollResult] = useState<{
    totalOfferings?: number;
    totalStudents?: number;
    newlyEnrolled?: number;
    alreadyEnrolled?: number;
    skippedCapacity?: number;
    message?: string;
    perOffering?: Array<{
      offeringId: number;
      courseLabel?: string;
      totalStudents?: number;
      newlyEnrolled?: number;
      alreadyEnrolled?: number;
      skippedCapacity?: number;
      message?: string;
    }>;
  } | null>(null);

  // Fetch batches
  const { data: rawBatches, isLoading: batchesLoading } = useQuery({
    queryKey: ["batches"],
    queryFn: () => api.get<any>("/api/v1/batches"),
  });

  const batches: BatchItem[] = (
    Array.isArray(rawBatches)
      ? rawBatches
      : rawBatches?.content || rawBatches?.dataList || []
  ).map((b: any) => ({
    batchId: b.batchId,
    name: b.name || `Batch #${b.batchId}`,
    departmentId: b.departmentId,
    departmentName: b.departmentName || "Software Engineering",
    academicYearId: b.academicYearId,
    academicYearLabel: b.academicYearLabel || b.academicYearName || "2026",
    enrollmentYear: b.enrollmentYear,
  }));

  // Fetch course offerings
  const { data: rawOfferings, isLoading: offeringsLoading } = useQuery({
    queryKey: ["courseOfferings"],
    queryFn: () => api.get<any>("/api/v1/course-offerings"),
  });

  const offerings: CourseOfferingItem[] = (
    Array.isArray(rawOfferings)
      ? rawOfferings
      : rawOfferings?.content || rawOfferings?.dataList || []
  ).map((co: any) => ({
    offeringId: co.offeringId,
    courseId: co.courseId || co.course?.courseId,
    courseCode: co.courseCode || co.course?.code || `CRS-${co.courseId}`,
    courseTitle: co.courseTitle || co.courseName || co.course?.title || co.course?.name || "Course Module",
    batchId: co.batchId || co.batch?.batchId,
    batchName: co.batchName || co.batch?.name,
    semesterId: co.semesterId || co.semester?.semesterId,
    semesterName: co.semesterName || (co.semesterId ? `Semester ${co.semesterId}` : "Semester 1"),
    primaryLecturerId: co.primaryLecturerId || co.lecturer?.lecturerId,
    lecturerName: co.lecturerName || co.primaryLecturerName || co.lecturer?.fullName || "Assigned Lecturer",
    capacity: co.capacity || 50,
    enrolledCount: co.enrolledCount || 0,
  }));

  // Fetch students for the selected batch
  const { data: rawStudents, isLoading: studentsLoading } = useQuery({
    queryKey: ["batchStudents", selectedBatchId],
    queryFn: () => api.get<any>(`/api/v1/batches/${selectedBatchId}/students`),
    enabled: !!selectedBatchId,
  });

  const selectedBatchStudents: StudentItem[] = (
    Array.isArray(rawStudents)
      ? rawStudents
      : rawStudents?.content || rawStudents?.dataList || []
  ).map((s: any) => ({
    studentId: s.studentId,
    studentNo: s.studentNo || `STU-${s.studentId}`,
    fullName: s.fullName || s.user?.fullName || "Student",
    email: s.email || s.user?.email || "student@uni.edu",
    departmentName: s.departmentName,
    batchName: s.batchName,
    status: s.status || "ACTIVE",
  }));

  const selectedBatch = batches.find((b) => b.batchId === selectedBatchId);
  const selectedOfferings = offerings.filter((o) => selectedOfferingIds.includes(o.offeringId));

  // Toggle selection for an offering
  const toggleOfferingSelection = (offeringId: number) => {
    setSelectedOfferingIds((prev) =>
      prev.includes(offeringId) ? prev.filter((id) => id !== offeringId) : [...prev, offeringId]
    );
  };

  // Select all filtered offerings
  const selectAllFilteredOfferings = () => {
    setSelectedOfferingIds((prev) => {
      const ids = filteredOfferings.map((o) => o.offeringId);
      const merged = new Set([...prev, ...ids]);
      return Array.from(merged);
    });
  };

  // Clear selections
  const clearOfferingSelection = () => setSelectedOfferingIds([]);

  // Bulk enrollment mutation
  const bulkEnrollMutation = useMutation({
    mutationFn: ({ batchId, offeringIds }: { batchId: number; offeringIds: number[] }) =>
      api.post<any>(`/api/v1/enrollments/batch/${batchId}`, { offeringIds }),
    onSuccess: (data) => {
      setEnrollResult(data);
      queryClient.invalidateQueries({ queryKey: ["courseOfferings"] });
      queryClient.invalidateQueries({ queryKey: ["batchStudents"] });
      showToast(data.message || "Bulk enrollment executed successfully!");
    },
    onError: (err: any) => {
      showToast(err.message || "Bulk enrollment failed", "error");
    },
  });

  const handleExecuteBulkEnroll = () => {
    if (!selectedBatchId || selectedOfferingIds.length === 0) return;
    bulkEnrollMutation.mutate({ batchId: selectedBatchId, offeringIds: selectedOfferingIds });
  };

  // Events query
  const { data: rawEvents } = useQuery({
    queryKey: ["upcomingEvents"],
    queryFn: () => api.get<any>("/api/v1/events/upcoming"),
  });

  const eventsList: EventItem[] = (
    Array.isArray(rawEvents)
      ? rawEvents
      : rawEvents?.content || rawEvents?.dataList || []
  ).map((e: any) => ({
    id: e.eventId,
    title: e.title || "Campus Event",
    description: e.description || "",
    venue: e.venue || "Main Auditorium",
    eventDate: e.eventDate ? new Date(e.eventDate).toLocaleString() : "Upcoming",
    rawDate: e.eventDate,
    capacity: e.capacity,
    posterUrl: e.posterUrl,
  }));

  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [existingPosterUrl, setExistingPosterUrl] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventCapacity, setEventCapacity] = useState<string>("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);

  const formatForDateTimeInput = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleStartEdit = (ev: EventItem) => {
    setEditingEventId(ev.id);
    setEventTitle(ev.title);
    setEventDesc(ev.description || "");
    setEventVenue(ev.venue || "Main Auditorium");
    setEventCapacity(ev.capacity ? String(ev.capacity) : "");
    setEventDate(formatForDateTimeInput(ev.rawDate));
    setExistingPosterUrl(ev.posterUrl || null);
    if (ev.posterUrl) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const fullUrl =
        ev.posterUrl.startsWith("http") && !ev.posterUrl.includes("gateway.storjshare.io")
          ? ev.posterUrl
          : `${apiBase.replace(/\/+$/, "")}/${
              ev.posterUrl.includes("gateway.storjshare.io")
                ? "api/v1/files/download/events_" + ev.posterUrl.substring(ev.posterUrl.lastIndexOf("/") + 1)
                : ev.posterUrl.replace(/^\/+/, "")
            }`;
      setPosterPreview(fullUrl);
    } else {
      setPosterPreview(null);
    }
    setPosterFile(null);
    document.getElementById("event-form-card")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
    setEventTitle("");
    setEventDesc("");
    setEventDate("");
    setEventVenue("");
    setEventCapacity("");
    setPosterFile(null);
    setPosterPreview(null);
    setExistingPosterUrl(null);
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, WEBP)", "error");
      return;
    }
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const handleRemovePoster = () => {
    setPosterFile(null);
    setPosterPreview(null);
    setExistingPosterUrl(null);
  };

  const createEventMutation = useMutation({
    mutationFn: (body: any) => api.post("/api/v1/events", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upcomingEvents"] });
      handleCancelEdit();
      showToast("Event & Poster published successfully!");
    },
    onError: (err: any) => showToast(err.message || "Failed to publish event", "error"),
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => api.put(`/api/v1/events/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upcomingEvents"] });
      handleCancelEdit();
      showToast("Event updated successfully!");
    },
    onError: (err: any) => showToast(err.message || "Failed to update event", "error"),
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upcomingEvents"] });
      showToast("Event removed.");
    },
    onError: (err: any) => showToast(err.message || "Failed to delete event", "error"),
  });

  const handleCreateOrUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) {
      showToast("Please enter title and date for the event", "error");
      return;
    }

    let uploadedPosterUrl = "";
    if (posterFile) {
      setIsUploadingPoster(true);
      try {
        const formData = new FormData();
        formData.append("file", posterFile);
        formData.append("folder", "events");
        const uploadRes = await api.post<{ url: string }>("/api/v1/files/upload", formData);
        uploadedPosterUrl = uploadRes.url;
      } catch (err: any) {
        setIsUploadingPoster(false);
        showToast("Poster upload failed: " + (err.message || "error"), "error");
        return;
      }
      setIsUploadingPoster(false);
    }

    const payload = {
      title: eventTitle.trim(),
      description: eventDesc.trim(),
      venue: eventVenue.trim() || "Main Auditorium",
      eventDate: new Date(eventDate).toISOString(),
      capacity: eventCapacity ? parseInt(eventCapacity, 10) : undefined,
      posterUrl: uploadedPosterUrl || existingPosterUrl || undefined,
      createdByStaffId: currentUser?.userId || 1,
    };

    if (editingEventId) {
      updateEventMutation.mutate({ id: editingEventId, body: payload });
    } else {
      createEventMutation.mutate(payload);
    }
  };

  // Announcements query
  const { data: rawAnnouncements } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => api.get<any>("/api/v1/announcements/me?scope=INSTITUTION&scopeId=1"),
  });

  const announcementsList: AnnouncementItem[] = (
    Array.isArray(rawAnnouncements)
      ? rawAnnouncements
      : rawAnnouncements?.content || rawAnnouncements?.dataList || []
  ).map((a: any) => ({
    id: a.announcementId,
    title: a.title || "Announcement",
    content: a.content || a.message || "",
    postedAt: a.postedAt || a.createdAt ? new Date(a.postedAt || a.createdAt).toLocaleString() : "Recently",
  }));

  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");

  const publishAnnMutation = useMutation({
    mutationFn: (body: any) => api.post("/api/v1/announcements", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setAnnTitle("");
      setAnnContent("");
      showToast("Announcement published!");
    },
    onError: (err: any) => showToast(err.message || "Failed to publish announcement", "error"),
  });

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      showToast("Please enter title and message", "error");
      return;
    }
    publishAnnMutation.mutate({
      title: annTitle.trim(),
      content: annContent.trim(),
      scope: "INSTITUTION",
      scopeId: 1,
    });
  };

  // Search filters
  const filteredBatches = batches.filter(
    (b) =>
      b.name.toLowerCase().includes(batchSearch.toLowerCase()) ||
      b.departmentName?.toLowerCase().includes(batchSearch.toLowerCase()) ||
      b.academicYearLabel?.toLowerCase().includes(batchSearch.toLowerCase())
  );

  const filteredOfferings = offerings.filter(
    (o) =>
      o.courseCode?.toLowerCase().includes(offeringSearch.toLowerCase()) ||
      o.courseTitle?.toLowerCase().includes(offeringSearch.toLowerCase()) ||
      o.lecturerName?.toLowerCase().includes(offeringSearch.toLowerCase()) ||
      o.semesterName?.toLowerCase().includes(offeringSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="admin" name={currentUser?.fullName || "Staff Administrator"} sub="System Admin · Institution-wide" />

      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1400px] w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[var(--on-surface)] tracking-tight">
              Events & Batch Enrollment
            </h1>
            <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm mt-1">
              Multi-step batch course enrollment wizard, event scheduling, and institutional notices.
            </p>
          </div>
        </div>

        {/* Global Toast */}
        {toast && (
          <div className="fixed top-6 right-6 z-50 animate-bounce duration-300">
            <div
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-semibold text-[var(--on-surface)] ${
                toast.type === "error"
                  ? "bg-rose-600 border-rose-400"
                  : "bg-emerald-600 border-emerald-400"
              }`}
            >
              <i className={`ti ${toast.type === "error" ? "ti-alert-triangle" : "ti-circle-check"} text-xl`} />
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Primary Tabs */}
        <div className="flex gap-2 border-b border-[var(--outline-variant)]">
          <button
            onClick={() => setActiveTab("wizard")}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "wizard"
                ? "border-cyan-500 text-[var(--tertiary)] bg-[var(--surface-container)]"
                : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-low)]"
            }`}
          >
            <i className="ti ti-wand text-base" /> Batch Enrollment Wizard
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "events"
                ? "border-cyan-500 text-[var(--tertiary)] bg-[var(--surface-container)]"
                : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-low)]"
            }`}
          >
            <i className="ti ti-calendar-event text-base" /> Events & RSVPs
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "announcements"
                ? "border-cyan-500 text-[var(--tertiary)] bg-[var(--surface-container)]"
                : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-low)]"
            }`}
          >
            <i className="ti ti-speakerphone text-base" /> Announcements
          </button>
        </div>

        {/* TAB 1: BATCH ENROLLMENT WIZARD */}
        {activeTab === "wizard" && (
          <div className="space-y-6">
            {/* Step Progress Header */}
            <div className="card p-6 border border-[var(--border)] bg-[var(--surface-container-low)] backdrop-blur-md rounded-2xl shadow-xl">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center">
                {/* Step 1 */}
                <button
                  onClick={() => setEnrollStep(1)}
                  className={`flex flex-col sm:flex-row items-center gap-2.5 p-3 rounded-xl transition-all text-left ${
                    enrollStep === 1
                      ? "bg-[var(--tertiary-container)] border border-[var(--tertiary)] text-[var(--tertiary)] ring-2 ring-[var(--tertiary)]"
                      : selectedBatchId
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-pointer"
                      : "opacity-60 text-[var(--on-surface-variant)]"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md ${
                      enrollStep === 1
                        ? "bg-[var(--tertiary)] text-[var(--on-surface)]"
                        : selectedBatchId
                        ? "bg-emerald-500 text-[var(--on-surface)]"
                        : "bg-[var(--surface-container)] text-[var(--on-surface-variant)]"
                    }`}
                  >
                    {selectedBatchId && enrollStep !== 1 ? "✓" : "1"}
                  </span>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold uppercase tracking-wider">Step 1</p>
                    <p className="text-xs sm:text-sm font-black truncate">
                      {selectedBatch ? selectedBatch.name : "Select Target Batch"}
                    </p>
                  </div>
                </button>

                {/* Step 2 */}
                <button
                  onClick={() => selectedBatchId && setEnrollStep(2)}
                  disabled={!selectedBatchId}
                  className={`flex flex-col sm:flex-row items-center gap-2.5 p-3 rounded-xl transition-all text-left ${
                    enrollStep === 2
                      ? "bg-[var(--tertiary-container)] border border-[var(--tertiary)] text-[var(--tertiary)] ring-2 ring-[var(--tertiary)]"
                      : selectedOfferingIds.length > 0
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-pointer"
                      : "opacity-60 text-[var(--on-surface-variant)] disabled:cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md ${
                      enrollStep === 2
                        ? "bg-[var(--tertiary)] text-[var(--on-surface)]"
                        : selectedOfferingIds.length > 0
                        ? "bg-emerald-500 text-[var(--on-surface)]"
                        : "bg-[var(--surface-container)] text-[var(--on-surface-variant)]"
                    }`}
                  >
                    {selectedOfferingIds.length > 0 && enrollStep > 2 ? "✓" : "2"}
                  </span>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold uppercase tracking-wider">Step 2</p>
                    <p className="text-xs sm:text-sm font-black truncate">
                      {selectedOfferingIds.length === 0
                        ? "Select Course Offering(s)"
                        : selectedOfferingIds.length === 1
                        ? selectedOfferings[0]?.courseCode
                        : `${selectedOfferingIds.length} offerings selected`}
                    </p>
                  </div>
                </button>

                {/* Step 3 */}
                <button
                  onClick={() => selectedBatchId && selectedOfferingIds.length > 0 && setEnrollStep(3)}
                  disabled={!selectedBatchId || selectedOfferingIds.length === 0}
                  className={`flex flex-col sm:flex-row items-center gap-2.5 p-3 rounded-xl transition-all text-left ${
                    enrollStep === 3
                      ? "bg-[var(--tertiary-container)] border border-[var(--tertiary)] text-[var(--tertiary)] ring-2 ring-[var(--tertiary)]"
                      : "opacity-60 text-[var(--on-surface-variant)] disabled:cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md ${
                      enrollStep === 3 ? "bg-[var(--tertiary)] text-[var(--on-surface)]" : "bg-[var(--surface-container)] text-[var(--on-surface-variant)]"
                    }`}
                  >
                    3
                  </span>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold uppercase tracking-wider">Step 3</p>
                    <p className="text-xs sm:text-sm font-black truncate">Bulk Confirm</p>
                  </div>
                </button>
              </div>
            </div>

            {/* STEP 1: SELECT BATCH */}
            {enrollStep === 1 && (
              <div className="card p-6 border border-[var(--border)] bg-[var(--surface-container-low)] backdrop-blur-md rounded-2xl shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--outline-variant)]">
                  <div>
                    <h2 className="text-lg font-black text-[var(--on-surface)] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[var(--tertiary-container)] text-[var(--tertiary)] flex items-center justify-center text-xs">
                        1
                      </span>
                      Select Target Student Batch
                    </h2>
                    <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                      Choose which academic batch you want to bulk enroll into course offerings.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] text-sm pointer-events-none z-10" />
                    <input
                      type="text"
                      placeholder="Search batch or department..."
                      value={batchSearch}
                      onChange={(e) => setBatchSearch(e.target.value)}
                      style={{ paddingLeft: "2.5rem" }}
                      className="w-full bg-[var(--surface-container-lowest)] border border-[var(--border)] rounded-xl !pl-10 pr-3 py-2 text-xs text-[var(--on-surface)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--tertiary)]"
                    />
                  </div>
                </div>

                {batchesLoading ? (
                  <div className="py-12 text-center text-[var(--on-surface-variant)] text-sm flex flex-col items-center justify-center gap-2">
                    <i className="ti ti-loader animate-spin text-2xl text-[var(--tertiary)]" />
                    <span>Loading student batches from database...</span>
                  </div>
                ) : filteredBatches.length === 0 ? (
                  <div className="py-12 text-center text-[var(--on-surface-variant)] text-sm bg-[var(--surface-container)] rounded-xl border border-dashed border-[var(--outline-variant)]">
                    <i className="ti ti-users-group text-3xl text-[var(--ink-faint)] block mb-2" />
                    <p className="font-semibold">No Batches Found</p>
                    <p className="text-xs text-[var(--ink-faint)] mt-1">
                      Create batches in the Academic Structure page first.
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBatches.map((b) => {
                      const isSelected = selectedBatchId === b.batchId;
                      return (
                        <div
                          key={b.batchId}
                          onClick={() => setSelectedBatchId(b.batchId)}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
                            isSelected
                              ? "border-cyan-500 bg-[var(--tertiary-container)] ring-2 ring-[var(--tertiary)] shadow-lg shadow-[var(--surface-container-highest)]"
                              : "border-[var(--outline-variant)] bg-[var(--surface-container-low)] hover:border-[var(--border)] hover:bg-[var(--surface-container-low)]"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[var(--surface-container)] text-[var(--tertiary)] border border-[var(--tertiary)]">
                                {b.academicYearLabel}
                              </span>
                              {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-[var(--tertiary)] text-[var(--on-surface)] flex items-center justify-center text-xs font-black">
                                  ✓
                                </span>
                              )}
                            </div>
                            <h3 className="font-black text-base text-[var(--on-surface)] group-hover:text-[var(--tertiary)] transition-colors">
                              {b.name}
                            </h3>
                            <p className="text-xs text-[var(--on-surface-variant)] flex items-center gap-1.5">
                              <i className="ti ti-building text-[var(--ink-faint)]" />
                              {b.departmentName}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between text-xs text-[var(--on-surface-variant)]">
                            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                              <i className="ti ti-user-check" /> Active Batch
                            </span>
                            <span className="text-[11px] text-[var(--ink-faint)]">ID #{b.batchId}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Batch Action Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--outline-variant)]">
                  <div className="text-xs text-[var(--on-surface-variant)]">
                    {selectedBatch ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <i className="ti ti-check" /> Selected: <b>{selectedBatch.name}</b> ({selectedBatch.departmentName})
                      </span>
                    ) : (
                      "Please select a batch to proceed."
                    )}
                  </div>
                  <button
                    onClick={() => selectedBatchId && setEnrollStep(2)}
                    disabled={!selectedBatchId}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-[var(--on-surface)] bg-cyan-400 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--tertiary)] flex items-center gap-2"
                  >
                    <span>Next: Choose Course Offering</span>
                    <i className="ti ti-arrow-right" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SELECT COURSE OFFERING(S) */}
            {enrollStep === 2 && (
              <div className="card p-6 border border-[var(--border)] bg-[var(--surface-container-low)] backdrop-blur-md rounded-2xl shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--outline-variant)]">
                  <div>
                    <h2 className="text-lg font-black text-[var(--on-surface)] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[var(--tertiary-container)] text-[var(--tertiary)] flex items-center justify-center text-xs">
                        2
                      </span>
                      Select Course Offering(s)
                    </h2>
                    <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                      Target Batch: <span className="text-[var(--tertiary)] font-bold">{selectedBatch?.name}</span> ({selectedBatch?.departmentName})
                      {" · "}
                      <span className="text-emerald-400 font-bold">
                        {selectedOfferingIds.length} offering{selectedOfferingIds.length === 1 ? "" : "s"} selected
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                      <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] text-sm pointer-events-none z-10" />
                      <input
                        type="text"
                        placeholder="Search course code or title..."
                        value={offeringSearch}
                        onChange={(e) => setOfferingSearch(e.target.value)}
                        style={{ paddingLeft: "2.5rem" }}
                        className="w-full bg-[var(--surface-container-lowest)] border border-[var(--border)] rounded-xl !pl-10 pr-3 py-2 text-xs text-[var(--on-surface)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--tertiary)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={selectAllFilteredOfferings}
                      className="px-3 py-2 rounded-xl text-[11px] font-bold text-[var(--tertiary)] bg-[var(--tertiary-container)] border border-[var(--tertiary)] hover:bg-cyan-900/50 transition-all whitespace-nowrap"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={clearOfferingSelection}
                      disabled={selectedOfferingIds.length === 0}
                      className="px-3 py-2 rounded-xl text-[11px] font-bold text-[var(--on-surface-variant)] bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {offeringsLoading ? (
                  <div className="py-12 text-center text-[var(--on-surface-variant)] text-sm flex flex-col items-center justify-center gap-2">
                    <i className="ti ti-loader animate-spin text-2xl text-[var(--tertiary)]" />
                    <span>Loading course offerings from database...</span>
                  </div>
                ) : filteredOfferings.length === 0 ? (
                  <div className="py-12 text-center text-[var(--on-surface-variant)] text-sm bg-[var(--surface-container)] rounded-xl border border-dashed border-[var(--outline-variant)] space-y-3">
                    <i className="ti ti-books text-3xl text-[var(--ink-faint)] block" />
                    <p className="font-semibold text-[var(--on-surface-variant)]">No Course Offerings Created Yet</p>
                    <p className="text-xs text-[var(--ink-faint)] max-w-md mx-auto">
                      Course offerings link courses to semesters, batches, and lecturers. Please create offerings under Academic Structure &gt; Course Offerings.
                    </p>
                    <a
                      href="/admin/academic-structure"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--tertiary-container)] text-[var(--tertiary)] border border-[var(--tertiary)] hover:bg-[var(--tertiary)]/30 transition-all"
                    >
                      <i className="ti ti-plus" /> Manage Course Offerings
                    </a>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOfferings.map((off) => {
                      const isSelected = selectedOfferingIds.includes(off.offeringId);
                      return (
                        <div
                          key={off.offeringId}
                          onClick={() => toggleOfferingSelection(off.offeringId)}
                          role="checkbox"
                          aria-checked={isSelected}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
                            isSelected
                              ? "border-cyan-500 bg-[var(--tertiary-container)] ring-2 ring-[var(--tertiary)] shadow-lg shadow-[var(--surface-container-highest)]"
                              : "border-[var(--outline-variant)] bg-[var(--surface-container-low)] hover:border-[var(--border)] hover:bg-[var(--surface-container-low)]"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[var(--surface-container)] text-[var(--tertiary)] border border-[var(--tertiary)]">
                                {off.courseCode}
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="text-[11px] text-[var(--ink-faint)]">{off.semesterName}</span>
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-black border transition-all ${
                                    isSelected
                                      ? "bg-[var(--tertiary)] border-cyan-500 text-[var(--on-surface)]"
                                      : "bg-transparent border-slate-600 text-transparent"
                                  }`}
                                >
                                  ✓
                                </span>
                              </span>
                            </div>
                            <h3 className="font-black text-base text-[var(--on-surface)] group-hover:text-[var(--tertiary)] transition-colors">
                              {off.courseTitle}
                            </h3>
                            <p className="text-xs text-[var(--on-surface-variant)] flex items-center gap-1.5">
                              <i className="ti ti-user text-[var(--ink-faint)]" />
                              Lecturer: {off.lecturerName}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between text-xs text-[var(--on-surface-variant)]">
                            <span className="flex items-center gap-1 text-[var(--on-surface-variant)]">
                              <i className="ti ti-users" /> Capacity: {off.capacity}
                            </span>
                            <span className="text-[11px] text-[var(--ink-faint)]">Offering #{off.offeringId}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Offering Action Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--outline-variant)]">
                  <button
                    onClick={() => setEnrollStep(1)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--on-surface-variant)] bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] transition-all flex items-center gap-1.5"
                  >
                    <i className="ti ti-arrow-left" /> Back to Batches
                  </button>
                  <button
                    onClick={() => selectedOfferingIds.length > 0 && setEnrollStep(3)}
                    disabled={selectedOfferingIds.length === 0}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-[var(--on-surface)] bg-cyan-400 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--tertiary)] flex items-center gap-2"
                  >
                    <span>
                      Next: Review & Confirm
                      {selectedOfferingIds.length > 0 ? ` (${selectedOfferingIds.length})` : ""}
                    </span>
                    <i className="ti ti-arrow-right" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & CONFIRM */}
            {enrollStep === 3 && (
              <div className="card p-6 border border-[var(--border)] bg-[var(--surface-container-low)] backdrop-blur-md rounded-2xl shadow-xl space-y-6">
                <div className="pb-4 border-b border-[var(--outline-variant)]">
                  <h2 className="text-lg font-black text-[var(--on-surface)] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[var(--tertiary-container)] text-[var(--tertiary)] flex items-center justify-center text-xs">
                      3
                    </span>
                    Review & Bulk Confirm Enrollment
                  </h2>
                  <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                    Double-check details before executing batch-wide course registration into the database.
                  </p>
                </div>

                {/* Result Message Banner */}
                {enrollResult && (
                  <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <i className="ti ti-circle-check text-lg text-emerald-400" />
                      <span>{enrollResult.message}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-emerald-500/20">
                      <div>
                        <span className="text-emerald-500 block font-semibold">Offerings:</span>
                        <span className="font-bold text-[var(--on-surface)] text-sm">{enrollResult.totalOfferings ?? selectedOfferingIds.length}</span>
                      </div>
                      <div>
                        <span className="text-emerald-500 block font-semibold">Total Students:</span>
                        <span className="font-bold text-[var(--on-surface)] text-sm">{enrollResult.totalStudents}</span>
                      </div>
                      <div>
                        <span className="text-emerald-500 block font-semibold">Newly Enrolled:</span>
                        <span className="font-bold text-emerald-400 text-sm">+{enrollResult.newlyEnrolled}</span>
                      </div>
                      <div>
                        <span className="text-emerald-500 block font-semibold">Already Enrolled:</span>
                        <span className="font-bold text-[var(--on-surface-variant)] text-sm">{enrollResult.alreadyEnrolled}</span>
                      </div>
                    </div>

                    {/* Breakdown for multiple offerings */}
                    {enrollResult.perOffering && enrollResult.perOffering.length > 1 && (
                      <div className="pt-3 border-t border-emerald-500/20 space-y-1.5">
                        {enrollResult.perOffering.map((po) => (
                          <div key={po.offeringId} className="flex items-center justify-between text-[11px] bg-emerald-950/30 rounded-lg px-3 py-1.5">
                            <span className="font-semibold text-emerald-200">{po.courseLabel || `Offering #${po.offeringId}`}</span>
                            <span className="text-emerald-400">
                              +{po.newlyEnrolled} new · {po.alreadyEnrolled} already{po.skippedCapacity ? ` · ${po.skippedCapacity} skipped (capacity)` : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Details Overview */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Batch Card */}
                  <div className="p-5 rounded-2xl bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] space-y-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[var(--surface-container)] text-[var(--tertiary)] border border-[var(--tertiary)]">
                      Target Batch
                    </span>
                    <h3 className="font-black text-lg text-white">{selectedBatch?.name}</h3>
                    <div className="text-xs text-[var(--on-surface-variant)] space-y-1">
                      <p><b>Department:</b> {selectedBatch?.departmentName}</p>
                      <p><b>Academic Year:</b> {selectedBatch?.academicYearLabel}</p>
                      <p><b>Batch ID:</b> #{selectedBatch?.batchId}</p>
                    </div>
                  </div>

                  {/* Offering(s) Card */}
                  <div className="p-5 rounded-2xl bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] space-y-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[var(--surface-container)] text-[var(--on-surface-variant)] border border-[var(--outline-variant)]">
                      Target Course Offering{selectedOfferings.length === 1 ? "" : "s"} ({selectedOfferings.length})
                    </span>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                      {selectedOfferings.map((so) => (
                        <div key={so.offeringId} className="pb-2 border-b border-[var(--outline-variant)] last:border-0 last:pb-0">
                          <h3 className="font-black text-sm text-white">
                            {so.courseCode} - {so.courseTitle}
                          </h3>
                          <div className="text-[11px] text-[var(--on-surface-variant)]">
                            <span>{so.lecturerName}</span>
                            {" · "}
                            <span>{so.semesterName}</span>
                            {" · "}
                            <span>Offering #{so.offeringId}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Students In Batch Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[var(--on-surface)] flex items-center gap-2">
                      <i className="ti ti-users text-[var(--tertiary)]" />
                      Students In This Batch ({selectedBatchStudents.length})
                    </h4>
                    <span className="text-xs text-[var(--on-surface-variant)]">Live Database Roster</span>
                  </div>

                  {studentsLoading ? (
                    <div className="py-6 text-center text-[var(--on-surface-variant)] text-xs flex items-center justify-center gap-2">
                      <i className="ti ti-loader animate-spin text-[var(--tertiary)]" /> Loading student roster...
                    </div>
                  ) : selectedBatchStudents.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-center text-xs text-[var(--on-surface-variant)]">
                      No student records found in batch <b>{selectedBatch?.name}</b> yet.
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto border border-[var(--outline-variant)] rounded-xl divide-y divide-[var(--outline-variant)] bg-[var(--surface-container-low)]">
                      {selectedBatchStudents.map((s) => (
                        <div key={s.studentId} className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-[var(--surface-container-low)]">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-[var(--surface-container)] border border-[var(--border)] text-[var(--tertiary)] font-bold flex items-center justify-center text-[10px]">
                              {s.fullName.charAt(0)}
                            </span>
                            <div>
                              <p className="font-semibold text-white">{s.fullName}</p>
                              <p className="text-[11px] text-[var(--ink-faint)]">{s.email}</p>
                            </div>
                          </div>
                          <span className="font-mono text-[var(--on-surface-variant)] text-[11px]">{s.studentNo}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--outline-variant)]">
                  <button
                    onClick={() => setEnrollStep(2)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--on-surface-variant)] bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] transition-all flex items-center gap-1.5"
                  >
                    <i className="ti ti-arrow-left" /> Back
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setEnrollStep(1);
                        setSelectedBatchId(null);
                        setSelectedOfferingIds([]);
                        setEnrollResult(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-all"
                    >
                      Reset Wizard
                    </button>
                    <button
                      onClick={handleExecuteBulkEnroll}
                      disabled={bulkEnrollMutation.isPending || selectedOfferingIds.length === 0}
                      className="px-6 py-2.5 rounded-xl text-xs font-black text-[var(--on-surface)] bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:opacity-40 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
                    >
                      {bulkEnrollMutation.isPending ? (
                        <>
                          <i className="ti ti-loader animate-spin" /> Enrolling batch...
                        </>
                      ) : (
                        <>
                          <i className="ti ti-user-check text-sm" /> Confirm Bulk Batch Enrollment
                          {selectedOfferingIds.length > 1 ? ` (${selectedOfferingIds.length} offerings)` : ""}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EVENTS */}
        {activeTab === "events" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div id="event-form-card" className={`card p-6 border transition-all rounded-2xl shadow-xl space-y-4 ${
              editingEventId ? "border-amber-500/50 bg-[var(--surface-container)] ring-2 ring-amber-500/20" : "border-[var(--border)] bg-[var(--surface-container-low)] backdrop-blur-md"
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
                <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
                  {editingEventId ? (
                    <>
                      <i className="ti ti-edit text-amber-400" /> Edit Campus Event
                    </>
                  ) : (
                    <>
                      <i className="ti ti-calendar-plus text-[var(--tertiary)]" /> Create Campus Event
                    </>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  {editingEventId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[var(--surface-container)] text-[var(--tertiary)] border border-[var(--tertiary)]">
                    Storj S3 Storage
                  </span>
                </div>
              </div>

              <form onSubmit={handleCreateOrUpdateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="e.g. Annual Tech Symposium 2026"
                    className="w-full bg-[var(--surface-container-lowest)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--on-surface)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--tertiary)]"
                  />
                </div>

                {/* Poster Upload */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                    Event Poster Image (Cloud Storage)
                  </label>
                  {posterPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-[var(--tertiary)] bg-[var(--surface-container-lowest)] group">
                      <img src={posterPreview} alt="Poster Preview" className="w-full h-44 object-cover" />
                      <div className="absolute inset-0 bg-[var(--surface-container-lowest)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={handleRemovePoster}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-[var(--on-surface)] hover:bg-rose-500 flex items-center gap-1 shadow-lg"
                        >
                          <i className="ti ti-trash" /> Remove Poster
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[var(--border)] hover:border-[var(--tertiary)] rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-low)] transition-all text-center group">
                      <i className="ti ti-cloud-upload text-3xl text-[var(--tertiary)] mb-1.5 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-slate-200">Click to upload poster image</span>
                      <span className="text-[11px] text-[var(--ink-faint)] mt-0.5">PNG, JPG, WEBP up to 10MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    placeholder="Provide details about the event, agenda, guests..."
                    className="w-full bg-[var(--surface-container-lowest)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--on-surface)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--tertiary)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Event Date *</label>
                    <input
                      type="datetime-local"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-[var(--surface-container-lowest)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--on-surface)] focus:outline-none focus:border-[var(--tertiary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Venue</label>
                    <input
                      type="text"
                      value={eventVenue}
                      onChange={(e) => setEventVenue(e.target.value)}
                      placeholder="e.g. Main Auditorium"
                      className="w-full bg-[var(--surface-container-lowest)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--on-surface)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--tertiary)]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={createEventMutation.isPending || updateEventMutation.isPending || isUploadingPoster}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                      editingEventId
                        ? "text-[var(--on-surface)] bg-amber-400 hover:bg-amber-300 shadow-amber-500/20"
                        : "text-[var(--on-surface)] bg-cyan-400 hover:opacity-90 shadow-[var(--tertiary)]"
                    }`}
                  >
                    {isUploadingPoster ? (
                      <>
                        <i className="ti ti-loader animate-spin" /> Uploading poster...
                      </>
                    ) : createEventMutation.isPending || updateEventMutation.isPending ? (
                      <>
                        <i className="ti ti-loader animate-spin" /> Saving changes...
                      </>
                    ) : editingEventId ? (
                      <>
                        <i className="ti ti-check" /> Save & Update Event
                      </>
                    ) : (
                      <>
                        <i className="ti ti-calendar-plus" /> Publish Event
                      </>
                    )}
                  </button>

                  {editingEventId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="card p-6 border border-[var(--border)] bg-[var(--surface-container-low)] backdrop-blur-md rounded-2xl shadow-xl space-y-4">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)] flex items-center gap-2">
                <i className="ti ti-calendar-event text-[var(--tertiary)]" /> Upcoming Events ({eventsList.length})
              </h3>
              {eventsList.length === 0 ? (
                <div className="py-12 text-center text-[var(--ink-faint)] text-xs">No upcoming events scheduled.</div>
              ) : (
                <div className="space-y-4 max-h-[680px] overflow-y-auto pr-1">
                  {eventsList.map((ev) => (
                    <div
                      key={ev.id}
                      className="relative rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] overflow-hidden group hover:border-[var(--tertiary)] transition-all min-h-[220px] p-5 flex flex-col justify-between shadow-xl"
                    >
                      {/* Background Image */}
                      {ev.posterUrl ? (
                        <img
                          src={
                            ev.posterUrl.startsWith("http") && !ev.posterUrl.includes("gateway.storjshare.io")
                              ? ev.posterUrl
                              : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${
                                  ev.posterUrl.startsWith("/") ? "" : "/"
                                }${
                                  ev.posterUrl.includes("gateway.storjshare.io")
                                    ? "api/v1/files/download/events_" + ev.posterUrl.substring(ev.posterUrl.lastIndexOf("/") + 1)
                                    : ev.posterUrl
                                }`
                          }
                          alt={ev.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop";
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950" />
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />

                      {/* Top Action Row */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[var(--surface-container)]/90 text-[var(--tertiary)] border border-[var(--tertiary)] backdrop-blur-md">
                          Campus Event
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(ev)}
                            title="Edit Event"
                            className="text-amber-400 hover:text-amber-300 p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 transition-colors"
                          >
                            <i className="ti ti-edit text-sm" />
                          </button>
                          <button
                            onClick={() => deleteEventMutation.mutate(ev.id)}
                            title="Delete Event"
                            className="text-[var(--on-surface-variant)] hover:text-rose-400 p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 transition-colors"
                          >
                            <i className="ti ti-trash text-sm" />
                          </button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="relative z-10 space-y-1.5 mt-auto pt-4">
                        <h4 className="font-bold text-base text-[var(--on-surface)] group-hover:text-[var(--tertiary)] transition-colors">
                          {ev.title}
                        </h4>
                        {ev.description && <p className="text-xs text-[var(--on-surface-variant)] line-clamp-2">{ev.description}</p>}
                        <div className="flex items-center justify-between text-[11px] text-[var(--on-surface-variant)] pt-2 border-t border-white/10">
                          <span className="text-[var(--tertiary)] font-semibold flex items-center gap-1">
                            <i className="ti ti-clock" /> {ev.eventDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="ti ti-map-pin text-[var(--tertiary)]" /> {ev.venue}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ANNOUNCEMENTS */}
        {activeTab === "announcements" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card p-6 border border-[var(--border)] bg-[var(--surface-container-low)] backdrop-blur-md rounded-2xl shadow-xl lg:col-span-1 space-y-4">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)] flex items-center gap-2">
                <i className="ti ti-speakerphone text-[var(--tertiary)]" /> Publish Notice
              </h3>
              <form onSubmit={handlePublishAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Notice Title *</label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="Important Notice"
                    className="w-full bg-[var(--surface-container-lowest)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--on-surface)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--tertiary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Notice Content *</label>
                  <textarea
                    rows={4}
                    required
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    placeholder="Enter announcement message..."
                    className="w-full bg-[var(--surface-container-lowest)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--on-surface)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--tertiary)]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={publishAnnMutation.isPending}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-[var(--on-surface)] bg-cyan-400 hover:opacity-90 transition-all shadow-md shadow-[var(--tertiary)]"
                >
                  {publishAnnMutation.isPending ? "Publishing..." : "Publish Announcement"}
                </button>
              </form>
            </div>

            <div className="card p-6 border border-[var(--border)] bg-[var(--surface-container-low)] backdrop-blur-md rounded-2xl shadow-xl lg:col-span-2 space-y-4">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)] flex items-center gap-2">
                <i className="ti ti-bell text-[var(--tertiary)]" /> Published Announcements ({announcementsList.length})
              </h3>
              {announcementsList.length === 0 ? (
                <div className="py-12 text-center text-[var(--ink-faint)] text-xs">No announcements published yet.</div>
              ) : (
                <div className="space-y-3">
                  {announcementsList.map((ann) => (
                    <div key={ann.id} className="p-4 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white">{ann.title}</h4>
                        <span className="text-[10px] text-[var(--ink-faint)]">{ann.postedAt}</span>
                      </div>
                      <p className="text-xs text-[var(--on-surface-variant)] whitespace-pre-wrap">{ann.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
