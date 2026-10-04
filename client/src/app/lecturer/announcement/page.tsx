"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { useAuth } from "@/context/AuthContext";
import LecturerNavbar from "@/components/LecturerNavbar";

export default function LecturerAnnouncementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeOfferingId, setActiveOfferingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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

  // announcements for offering
  const { data: announcementsData, isLoading: announcementsLoading } = useQuery({
    queryKey: ["courseAnnouncements", activeOfferingId],
    queryFn: () => api.get<any>(`/api/v1/announcements/me?scope=course&scopeId=${activeOfferingId}&size=50`),
    enabled: !!activeOfferingId,
  });

  const announcements = announcementsData?.dataList || [];

  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Mutations
  const createAnnouncementMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/v1/announcements", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseAnnouncements", activeOfferingId] });
      setTitle("");
      setContent("");
      alert("Announcement published successfully!");
    },
    onError: (err: any) => alert("Failed to publish: " + err.message),
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      api.put(`/api/v1/announcements/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseAnnouncements", activeOfferingId] });
      setEditingAnnouncementId(null);
      alert("Announcement updated successfully!");
    },
    onError: (err: any) => alert("Failed to update: " + err.message),
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseAnnouncements", activeOfferingId] });
      setConfirmDeleteId(null);
      alert("Announcement deleted successfully!");
    },
    onError: (err: any) => alert("Failed to delete: " + err.message),
  });

  const handlePostAnnouncement = async () => {
    if (!title.trim() || !content.trim() || !activeOfferingId) return;
    try {
      await createAnnouncementMutation.mutateAsync({
        scope: "course",
        offeringId: activeOfferingId,
        title: title.trim(),
        content: content.trim(),
        postedByUserId: user?.userId,
      });
    } catch (err: any) {
      alert("Failed to publish: " + err.message);
    }
  };

  if (offeringsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-sm font-semibold text-[var(--on-surface-variant)] animate-pulse">
          Loading Class Modules...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)] pb-12">
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Class Announcements
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Broadcast notices to students enrolled in your modules.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Editor Form */}
          <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] self-start">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--outline-variant)]">
              <i className="ti ti-speakerphone text-xl text-[var(--tertiary)]"></i>
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                Post New Announcement
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                  Target Course Module
                </label>
                <select
                  value={activeOfferingId || ""}
                  onChange={(e) => setActiveOfferingId(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
                >
                  {offerings?.map((o: any) => (
                    <option key={o.offeringId} value={o.offeringId}>
                      {o.courseCode} — {o.courseName} ({o.batchName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lab Session Postponement Notice"
                  className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                  Message Body
                </label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Announcement details..."
                  className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
                ></textarea>
              </div>

              <button
                onClick={handlePostAnnouncement}
                disabled={!title.trim() || !content.trim() || createAnnouncementMutation.isPending}
                className="btn-primary shadow-md w-full justify-center disabled:opacity-40"
              >
                <i className="ti ti-send mr-1"></i> {createAnnouncementMutation.isPending ? "Publishing..." : "Publish Announcement"}
              </button>
            </div>
          </div>

          {/* Broadcast History */}
          <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] self-start">
            <h3 className="font-display font-bold text-base text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)]">
              Broadcast History ({announcements.length})
            </h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {announcementsLoading ? (
                <div className="text-center py-6 text-xs text-[var(--on-surface-variant)]">Loading history...</div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--on-surface-variant)] font-semibold">
                  No announcements published for this module.
                </div>
              ) : (
                announcements.map((ann: any) => {
                  const isEditing = editingAnnouncementId === ann.announcementId;
                  const isConfirmingDelete = confirmDeleteId === ann.announcementId;

                  if (isEditing) {
                    return (
                      <form
                        key={ann.announcementId}
                        onSubmit={(e) => {
                          e.preventDefault();
                          updateAnnouncementMutation.mutate({
                            id: ann.announcementId,
                            body: {
                              scope: "course",
                              offeringId: activeOfferingId,
                              title: editTitle.trim(),
                              content: editContent.trim(),
                              postedByUserId: user?.userId,
                            },
                          });
                        }}
                        className="p-3.5 border border-[var(--tertiary)] rounded-xl bg-[var(--surface-container-low)] space-y-2"
                      >
                        <p className="text-xs font-bold text-[var(--on-surface)]">Edit Announcement</p>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
                          placeholder="Title"
                          required
                        />
                        <textarea
                          rows={3}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
                          placeholder="Content"
                          required
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingAnnouncementId(null)}
                            className="btn-secondary text-xs !py-1 !px-2.5"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={updateAnnouncementMutation.isPending}
                            className="btn-primary text-xs !py-1 !px-3 shadow"
                          >
                            {updateAnnouncementMutation.isPending ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </form>
                    );
                  }

                  if (isConfirmingDelete) {
                    return (
                      <div
                        key={ann.announcementId}
                        className="p-3.5 border border-red-500/30 rounded-xl bg-red-500/10 space-y-2 text-xs"
                      >
                        <p className="text-red-500 font-semibold">Delete "{ann.title}"?</p>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1 rounded-lg bg-[var(--surface-container-high)] text-[var(--on-surface)] hover:bg-[var(--surface-container)] text-xs font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAnnouncementMutation.mutate(ann.announcementId)}
                            disabled={deleteAnnouncementMutation.isPending}
                            className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 text-xs"
                          >
                            {deleteAnnouncementMutation.isPending ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={ann.announcementId}
                      className="group p-3.5 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-low)] space-y-2 hover:border-[var(--tertiary)]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[var(--outline)]">
                          {new Date(ann.postedAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAnnouncementId(ann.announcementId);
                              setEditTitle(ann.title);
                              setEditContent(ann.content);
                            }}
                            className="p-1 rounded hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--tertiary)] transition-colors"
                            title="Edit Announcement"
                          >
                            <i className="ti ti-pencil text-xs"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(ann.announcementId)}
                            className="p-1 rounded hover:bg-red-500/10 text-[var(--on-surface-variant)] hover:text-red-500 transition-colors"
                            title="Delete Announcement"
                          >
                            <i className="ti ti-trash text-xs"></i>
                          </button>
                        </div>
                      </div>
                      <p className="font-bold text-xs text-[var(--on-surface)]">{ann.title}</p>
                      <div
                        className="text-xs text-[var(--on-surface-variant)] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(ann.content) }}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
