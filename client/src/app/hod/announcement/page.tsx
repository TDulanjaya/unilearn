"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "@/components/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  targetPrograms: z.array(z.string()).min(1, "Select at least one Degree Program"),
  targetSemesters: z.array(z.string()).min(1, "Select at least one Semester"),
  targetBatches: z.array(z.string()).min(1, "Select at least one Batch"),
  priority: z.enum(["Normal", "Urgent"]),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

export default function HodAnnouncement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // active assignment
  const { data: assignments } = useQuery({
    queryKey: ["hodAssignments", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/hod-dean-assignments/user/${user?.userId}`),
    enabled: !!user?.userId,
  });

  const activeAssignment = assignments?.find((a: any) => a.active);
  const departmentId = activeAssignment?.departmentId;
  const departmentName = activeAssignment?.departmentName || "Department";

  // programs, semesters, and batches
  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get<any>("/api/v1/departments?size=100"),
  });
  const programOptions: string[] = (deptData?.dataList || (Array.isArray(deptData) ? deptData : []))
    .map((d: any) => d.name)
    .filter(Boolean);

  const { data: semestersData } = useQuery({
    queryKey: ["semesters"],
    queryFn: () => api.get<any[]>("/api/v1/semesters"),
  });
  const semesterOptions: string[] = (Array.isArray(semestersData) ? semestersData : [])
    .map((s: any) => s.name)
    .filter(Boolean);

  const { data: batchesData } = useQuery({
    queryKey: ["batches", departmentId],
    queryFn: () =>
      departmentId
        ? api.get<any[]>(`/api/v1/batches/department/${departmentId}`)
        : api.get<any[]>("/api/v1/batches"),
  });
  const batchOptions: string[] = (Array.isArray(batchesData) ? batchesData : [])
    .map((b: any) => b.name)
    .filter(Boolean);

  // announcements
  const { data: announcementsData, isLoading: announcementsLoading } = useQuery({
    queryKey: ["announcements", departmentId],
    queryFn: () => api.get<any>(`/api/v1/announcements/me?scope=department&scopeId=${departmentId}&size=50`),
    enabled: !!departmentId,
  });

  const publishedList = announcementsData?.dataList || [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      targetPrograms: [],
      targetSemesters: [],
      targetBatches: [],
      priority: "Normal",
    },
  });

  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/v1/announcements", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements", departmentId] });
      reset();
      alert("Announcement broadcasted successfully!");
    },
    onError: (err: any) => alert("Failed to broadcast: " + err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      api.put(`/api/v1/announcements/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements", departmentId] });
      setEditingAnnouncementId(null);
      alert("Announcement updated successfully!");
    },
    onError: (err: any) => alert("Failed to update: " + err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements", departmentId] });
      setConfirmDeleteId(null);
      alert("Announcement deleted successfully!");
    },
    onError: (err: any) => alert("Failed to delete: " + err.message),
  });

  const onSubmit = async (data: AnnouncementFormData) => {
    try {
      const payload = {
        scope: "department",
        departmentId: departmentId,
        title: data.title,
        content: data.content,
        postedByUserId: user?.userId,
        targetPrograms: data.targetPrograms,
        targetSemesters: data.targetSemesters,
        targetBatches: data.targetBatches,
      };
      await createMutation.mutateAsync(payload);
    } catch (err: any) {
      alert("Failed to broadcast: " + err.message);
    }
  };

  if (announcementsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-sm font-semibold text-[var(--on-surface-variant)] animate-pulse">
          Loading HOD Announcements...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="hod" name={user?.fullName || "HOD Dean"} sub={`HOD · ${departmentName}`} />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full space-y-8">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Department Broadcast Announcements
          </h1>
          <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm">
            Publish targeted multi-select broadcasts by Degree Program, Semester, and Student Batch.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div className="card p-6 space-y-5 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--outline-variant)]">
              <i className="ti ti-speakerphone text-xl text-[var(--tertiary)]"></i>
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                Create Multi-Target Broadcast
              </h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  {...register("title")}
                  placeholder="e.g. End Semester Viva Voce Guidelines"
                  className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                />
                {errors.title && <p className="text-[10px] text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">
                  Notice Content & Agenda
                </label>
                <textarea
                  rows={4}
                  {...register("content")}
                  placeholder="Write full announcement details..."
                  className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                ></textarea>
                {errors.content && <p className="text-[10px] text-red-500 mt-1">{errors.content.message}</p>}
              </div>

              <div className="border border-[var(--outline-variant)] rounded-xl p-3.5 bg-[var(--surface-container-low)] space-y-2">
                <label className="block text-xs font-bold text-[var(--on-surface)]">
                  Target Degree Programs:
                </label>
                <Controller
                  name="targetPrograms"
                  control={control}
                  render={({ field }) => (
                    <div className="grid sm:grid-cols-2 gap-2 text-xs">
                      {programOptions.length === 0 ? (
                        <span className="text-[var(--on-surface-variant)] text-xs italic">No programs available</span>
                      ) : (
                        programOptions.map((prog) => (
                          <label key={prog} className="flex items-center gap-2 text-[var(--on-surface-variant)] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.value.includes(prog)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...field.value, prog]
                                  : field.value.filter((val) => val !== prog);
                                field.onChange(updated);
                              }}
                              className="rounded text-[var(--tertiary)]"
                            />
                            <span>{prog}</span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                />
                {errors.targetPrograms && <p className="text-[10px] text-red-500">{errors.targetPrograms.message}</p>}
              </div>

              <div className="border border-[var(--outline-variant)] rounded-xl p-3.5 bg-[var(--surface-container-low)] space-y-2">
                <label className="block text-xs font-bold text-[var(--on-surface)]">
                  Target Academic Semesters:
                </label>
                <Controller
                  name="targetSemesters"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {semesterOptions.length === 0 ? (
                        <span className="text-[var(--on-surface-variant)] text-xs italic">No semesters available</span>
                      ) : (
                        semesterOptions.map((sem) => (
                          <label key={sem} className="flex items-center gap-2 text-[var(--on-surface-variant)] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.value.includes(sem)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...field.value, sem]
                                  : field.value.filter((val) => val !== sem);
                                field.onChange(updated);
                              }}
                              className="rounded text-[var(--tertiary)]"
                            />
                            <span>{sem}</span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                />
                {errors.targetSemesters && <p className="text-[10px] text-red-500">{errors.targetSemesters.message}</p>}
              </div>

              <div className="border border-[var(--outline-variant)] rounded-xl p-3.5 bg-[var(--surface-container-low)] space-y-2">
                <label className="block text-xs font-bold text-[var(--on-surface)]">
                  Target Student Batches:
                </label>
                <Controller
                  name="targetBatches"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {batchOptions.length === 0 ? (
                        <span className="text-[var(--on-surface-variant)] text-xs italic">No batches available</span>
                      ) : (
                        batchOptions.map((batch) => (
                          <label key={batch} className="flex items-center gap-2 text-[var(--on-surface-variant)] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.value.includes(batch)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...field.value, batch]
                                  : field.value.filter((val) => val !== batch);
                                field.onChange(updated);
                              }}
                              className="rounded text-[var(--tertiary)]"
                            />
                            <span>{batch}</span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                />
                {errors.targetBatches && <p className="text-[10px] text-red-500">{errors.targetBatches.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">
                  Notice Priority Level
                </label>
                <select
                  {...register("priority")}
                  className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
                >
                  <option value="Normal">Normal Notification</option>
                  <option value="Urgent">Urgent High-Priority Alert</option>
                </select>
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-primary w-full justify-center shadow-md">
                  <i className="ti ti-send mr-1"></i> Broadcast Announcement
                </button>
              </div>
            </form>
          </div>

          <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] self-start">
            <h3 className="font-display font-bold text-base text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)]">
              Broadcast History ({publishedList.length})
            </h3>
            <div className="space-y-3">
              {publishedList.length === 0 ? (
                <div className="text-center p-6 text-xs text-[var(--on-surface-variant)] font-semibold">
                  No announcements broadcasted yet.
                </div>
              ) : (
                publishedList.map((ann: any) => {
                  const isEditing = editingAnnouncementId === ann.announcementId;
                  const isConfirmingDelete = confirmDeleteId === ann.announcementId;

                  if (isEditing) {
                    return (
                      <form
                        key={ann.announcementId}
                        onSubmit={(e) => {
                          e.preventDefault();
                          updateMutation.mutate({
                            id: ann.announcementId,
                            body: {
                              scope: "department",
                              departmentId: departmentId,
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
                            disabled={updateMutation.isPending}
                            className="btn-primary text-xs !py-1 !px-3 shadow"
                          >
                            {updateMutation.isPending ? "Saving..." : "Save"}
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
                            onClick={() => deleteMutation.mutate(ann.announcementId)}
                            disabled={deleteMutation.isPending}
                            className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 text-xs"
                          >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
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
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          {ann.scope}
                        </span>
                        <div className="flex items-center gap-1.5">
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
                      </div>
                      <p className="font-bold text-xs text-[var(--on-surface)]">{ann.title}</p>
                      <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">{ann.content}</p>
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
