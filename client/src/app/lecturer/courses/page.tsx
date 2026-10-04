"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { useAuth } from "@/context/AuthContext";
import LecturerNavbar from "@/components/LecturerNavbar";
import FileDropzone from "@/components/FileDropzone";

export default function LecturerCoursesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeOfferingId, setActiveOfferingId] = useState<number | null>(null);
  const [materialCategory, setMaterialCategory] = useState<"Slide" | "Syllabus" | "Brief" | "Lab">("Slide");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  // lecturer offerings
  const { data: offerings, isLoading: offeringsLoading } = useQuery({
    queryKey: ["lecturerOfferings", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/course-offerings/lecturer/${user?.userId}`),
    enabled: !!user?.userId,
  });

  useEffect(() => {
    if (offerings && offerings.length > 0 && !activeOfferingId) {
      setActiveOfferingId(offerings[0].offeringId);
    }
  }, [offerings]);

  // materials for offering
  const { data: materialsData, isLoading: materialsLoading } = useQuery({
    queryKey: ["materials", activeOfferingId],
    queryFn: () => api.get<any>(`/api/v1/materials/offering/${activeOfferingId}?size=100`),
    enabled: !!activeOfferingId,
  });

  const materials = materialsData?.dataList || [];

  // announcements for offering
  const { data: announcementsData } = useQuery({
    queryKey: ["courseAnnouncements", activeOfferingId],
    queryFn: () => api.get<any>(`/api/v1/announcements/me?scope=course&scopeId=${activeOfferingId}&size=50`),
    enabled: !!activeOfferingId,
  });

  const announcements = announcementsData?.dataList || [];

  // exams for offering
  const { data: examsList } = useQuery({
    queryKey: ["exams", activeOfferingId],
    queryFn: () => api.get<any[]>(`/api/v1/exams/offering/${activeOfferingId}`),
    enabled: !!activeOfferingId,
  });

  const exams = examsList || [];

  // question bank questions
  const activeOffering = offerings?.find((o: any) => o.offeringId === activeOfferingId);
  const courseId = activeOffering?.courseId;

  const { data: qbList } = useQuery({
    queryKey: ["qbs", courseId],
    queryFn: () => api.get<any[]>(`/api/v1/question-banks/course/${courseId}`),
    enabled: !!courseId,
  });

  const activeBankId = qbList && qbList.length > 0 ? qbList[0].bankId : null;
  const { data: questionsResponse } = useQuery({
    queryKey: ["questions", activeBankId],
    queryFn: () => api.get<any>(`/api/v1/questions/bank/${activeBankId}?size=100`),
    enabled: !!activeBankId,
  });

  const questions = questionsResponse?.dataList || [];

  // Mutations
  const uploadMaterialMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/v1/materials", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials", activeOfferingId] });
      setShowUploadModal(false);
      setUploadedFiles([]);
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/materials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials", activeOfferingId] });
    },
  });

  const postAnnouncementMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/v1/announcements", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseAnnouncements", activeOfferingId] });
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    },
  });

  // DB only accepts: pdf, video, slides, link, other
  const toResourceType = (category: string, fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (["mp4", "mov", "webm", "mkv", "avi"].includes(ext)) return "video";
    if (category === "Slide") return "slides";
    if (ext === "pdf") return "pdf";
    return "other";
  };

  const handleConfirmUpload = async () => {
    if (uploadedFiles.length === 0 || !activeOfferingId || isUploading) return;
    setIsUploading(true);
    try {
      for (const file of uploadedFiles) {
        // if the upload fails we stop, so no broken material is saved
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "materials");
        const uploadRes = await api.post<{ url: string }>("/api/v1/files/upload", formData);
        if (!uploadRes?.url) {
          throw new Error(`Could not upload ${file.name}`);
        }

        await uploadMaterialMutation.mutateAsync({
          offeringId: activeOfferingId,
          title: file.name.replace(/\.[^/.]+$/, ""),
          resourceType: toResourceType(materialCategory, file.name),
          fileUrl: uploadRes.url,
          uploadedById: user?.userId,
        });
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMaterial = async (id: number) => {
    if (confirm("Are you sure you want to delete this material?")) {
      try {
        await deleteMaterialMutation.mutateAsync(id);
      } catch (err: any) {
        alert("Failed to delete material: " + err.message);
      }
    }
  };

  const handlePostAnnouncement = async () => {
    if (editorRef.current && editorRef.current.innerHTML.trim() && activeOfferingId) {
      try {
        await postAnnouncementMutation.mutateAsync({
          scope: "course",
          offeringId: activeOfferingId,
          title: "Course Announcement",
          content: editorRef.current.innerHTML,
          postedByUserId: user?.userId,
        });
      } catch (err: any) {
        alert("Failed to publish announcement: " + err.message);
      }
    }
  };

  const applyFormatting = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
  };

  if (offeringsLoading || materialsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-sm font-semibold text-[var(--on-surface-variant)] animate-pulse">
          Loading Course Offerings...
        </div>
      </div>
    );
  }

  const selectedCode = activeOffering?.courseCode || "Courses";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)] pb-12">
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)]">
              Course & Exam Management
            </h1>
            <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm mt-1">
              Upload course materials, publish announcements, and build exam question banks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[var(--on-surface-variant)]">Select Course:</label>
            <select
              value={activeOfferingId || ""}
              onChange={(e) => setActiveOfferingId(Number(e.target.value))}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
            >
              {offerings?.map((o: any) => (
                <option key={o.offeringId} value={o.offeringId}>
                  {o.courseCode} — {o.courseName} ({o.batchName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Materials Card */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
            <div>
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
                <i className="ti ti-folder text-[var(--tertiary)]"></i> Course Materials ({selectedCode})
              </h3>
              <p className="text-xs text-[var(--on-surface-variant)]">Manage slides, syllabus, and assignment briefs.</p>
            </div>
            <button onClick={() => setShowUploadModal(true)} className="btn-primary text-xs shadow-sm">
              <i className="ti ti-upload"></i> Upload Material
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {materials.length === 0 ? (
              <div className="text-center p-6 text-xs text-[var(--on-surface-variant)] font-semibold col-span-3">
                No course materials uploaded yet.
              </div>
            ) : (
              materials.map((m: any) => (
                <div key={m.materialId} className="border border-[var(--outline-variant)] rounded-xl p-3.5 bg-[var(--surface-container-lowest)] hover:bg-[var(--surface-container-low)] transition-colors flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-[var(--surface-container-high)] text-[var(--on-surface)] border-[var(--outline-variant)] mb-1.5 inline-block">
                      {m.resourceType}
                    </span>
                    <p className="text-xs font-bold text-[var(--on-surface)] truncate">{m.title}</p>
                    <p className="text-[10px] text-[var(--on-surface-variant)] mt-1">
                      {m.fileUrl?.split("/").pop()} · {new Date(m.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveMaterial(m.materialId)}
                    className="text-[var(--on-surface-variant)] hover:text-red-500 p-1"
                    title="Remove material"
                  >
                    <i className="ti ti-trash text-sm"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements Editor */}
        <div className="card p-6 space-y-4">
          <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2 pb-3 border-b border-[var(--outline-variant)]">
            <i className="ti ti-speakerphone text-[var(--tertiary)]"></i> Course Announcements Editor
          </h3>

          <div className="border border-[var(--outline-variant)] rounded-xl overflow-hidden bg-[var(--surface-container-lowest)]">
            <div className="flex items-center gap-1 p-2 bg-[var(--surface-container-low)] border-b border-[var(--outline-variant)] text-xs">
              <button
                type="button"
                onClick={() => applyFormatting("bold")}
                className="px-2.5 py-1 rounded hover:bg-[var(--surface-container-high)] font-bold text-[var(--on-surface)]"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("italic")}
                className="px-2.5 py-1 rounded hover:bg-[var(--surface-container-high)] italic text-[var(--on-surface)]"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("insertUnorderedList")}
                className="px-2.5 py-1 rounded hover:bg-[var(--surface-container-high)] text-[var(--on-surface)]"
                title="Bullet List"
              >
                <i className="ti ti-list"></i>
              </button>
              <div className="w-px h-4 bg-[var(--outline-variant)] mx-1"></div>
              <span className="text-[10px] text-[var(--outline)]">Rich Text Announcement Editor</span>
            </div>

            <div
              ref={editorRef}
              contentEditable
              className="p-4 min-h-[100px] text-xs text-[var(--on-surface)] focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button onClick={handlePostAnnouncement} className="btn-primary text-xs shadow-sm">
              <i className="ti ti-send"></i> Publish Announcement
            </button>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-[var(--on-surface)]">Recent Course Announcements:</p>
            {announcements.length === 0 ? (
              <div className="text-center p-6 text-xs text-[var(--on-surface-variant)] font-semibold">
                No announcements published for this course yet.
              </div>
            ) : (
              announcements.map((ann: any) => (
                <div key={ann.announcementId} className="p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-xs text-[var(--on-surface)] space-y-1">
                  <span className="text-[10px] text-[var(--outline)]">
                    Published: {new Date(ann.postedAt).toLocaleDateString()}
                  </span>
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(ann.content) }} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic bottom views */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] flex items-center gap-2">
                <i className="ti ti-help-circle text-[var(--tertiary)]"></i> Course Question Bank ({questions.length})
              </h3>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {questions.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--on-surface-variant)] font-semibold">
                  No questions found in this course's bank.
                </div>
              ) : (
                questions.map((q: any) => (
                  <div key={q.questionId} className="p-3.5 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-low)] space-y-2">
                    <p className="text-xs font-semibold text-[var(--on-surface)]">{q.text}</p>
                    <span className="badge badge-accent text-[10px]">{q.marks} Marks</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] flex items-center gap-2">
                <i className="ti ti-file-certificate text-[var(--tertiary)]"></i> Scheduled Exams ({exams.length})
              </h3>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {exams.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--on-surface-variant)] font-semibold">
                  No exams scheduled for this course.
                </div>
              ) : (
                exams.map((ex: any) => (
                  <div key={ex.examId} className="p-4 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-low)] space-y-2">
                    <p className="text-xs font-bold text-[var(--on-surface)]">{ex.title}</p>
                    <div className="text-[11px] text-[var(--on-surface-variant)] space-y-1">
                      <p><i className="ti ti-clock mr-1"></i> Duration: {ex.durationMinutes} mins</p>
                      <p><i className="ti ti-calendar mr-1"></i> Start: {new Date(ex.startDateTime).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Upload modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="card max-w-md w-full p-6 space-y-4 bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] shadow-2xl rounded-3xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">Upload Course File</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-[var(--on-surface-variant)]">
                <i className="ti ti-x text-lg"></i>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">Material Category</label>
              <select
                value={materialCategory}
                onChange={(e) => setMaterialCategory(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
              >
                <option value="Slide">Lecture Slides (.pdf, .pptx)</option>
                <option value="Syllabus">Syllabus Document (.pdf)</option>
                <option value="Brief">Assignment Brief (.docx)</option>
                <option value="Lab">Lab Exercise Package (.zip)</option>
              </select>
            </div>

            <FileDropzone
              accept=".pdf,.docx,.doc,.pptx,.ppt,.zip,.rar"
              maxSizeMB={20}
              multiple={true}
              onFilesSelected={(files) => setUploadedFiles(files)}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--outline-variant)]">
              <button onClick={() => setShowUploadModal(false)} disabled={isUploading} className="btn-secondary text-xs">Cancel</button>
              <button onClick={handleConfirmUpload} disabled={uploadedFiles.length === 0 || isUploading} className="btn-primary text-xs disabled:opacity-40 flex items-center gap-1.5">
                {isUploading && <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                <span>{isUploading ? "Uploading & Processing..." : "Confirm & Upload"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
