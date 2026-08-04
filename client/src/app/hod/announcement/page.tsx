"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "@/components/Sidebar";

const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  targetPrograms: z.array(z.string()).min(1, "Select at least one Degree Program"),
  targetSemesters: z.array(z.string()).min(1, "Select at least one Semester"),
  targetBatches: z.array(z.string()).min(1, "Select at least one Batch"),
  priority: z.enum(["Normal", "Urgent"]),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface PublishedAnnouncement {
  id: string;
  title: string;
  content: string;
  programs: string[];
  semesters: string[];
  batches: string[];
  priority: "Normal" | "Urgent";
  publishedAt: string;
}

const PROGRAM_OPTIONS = ["BSc Software Engineering", "BSc Computer Science", "BSc Information Technology"];
const SEMESTER_OPTIONS = ["Semester 1", "Semester 3", "Semester 5", "Semester 7"];
const BATCH_OPTIONS = ["Batch 2023-A", "Batch 2023-B", "Batch 2024-A", "Batch 2025-A"];

export default function HodAnnouncement() {
  const [publishedList, setPublishedList] = useState<PublishedAnnouncement[]>([
    {
      id: "ann-1",
      title: "Departmental Midterm Evaluation Schedule 2026",
      content: "All 3rd Year Software Engineering students must register their project milestones before Friday.",
      programs: ["BSc Software Engineering"],
      semesters: ["Semester 5", "Semester 7"],
      batches: ["Batch 2023-A"],
      priority: "Urgent",
      publishedAt: "Aug 04, 2026 09:30 AM",
    },
  ]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      targetPrograms: ["BSc Software Engineering"],
      targetSemesters: ["Semester 5"],
      targetBatches: ["Batch 2023-A"],
      priority: "Normal",
    },
  });

  const onSubmit = (data: AnnouncementFormData) => {
    const newNotice: PublishedAnnouncement = {
      id: `ann-${Date.now()}`,
      title: data.title,
      content: data.content,
      programs: data.targetPrograms,
      semesters: data.targetSemesters,
      batches: data.targetBatches,
      priority: data.priority,
      publishedAt: new Date().toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    };

    setPublishedList([newNotice, ...publishedList]);
    reset();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="hod" name="Dr. S. Wickramasinghe" sub="HOD · Software Engineering" />
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
                      {PROGRAM_OPTIONS.map((prog) => (
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
                      ))}
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
                      {SEMESTER_OPTIONS.map((sem) => (
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
                      ))}
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
                      {BATCH_OPTIONS.map((batch) => (
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
                      ))}
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
              {publishedList.map((ann) => (
                <div key={ann.id} className="p-3.5 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-low)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ann.priority === "Urgent" ? "bg-red-500/10 text-red-600 border border-red-500/20" : "bg-blue-500/10 text-blue-600 border border-blue-500/20"}`}>
                      {ann.priority}
                    </span>
                    <span className="text-[10px] text-[var(--outline)]">{ann.publishedAt}</span>
                  </div>
                  <p className="font-bold text-xs text-[var(--on-surface)]">{ann.title}</p>
                  <p className="text-xs text-[var(--on-surface-variant)]">{ann.content}</p>
                  <div className="flex flex-wrap gap-1 pt-1 text-[9px]">
                    {ann.programs.map((p) => <span key={p} className="badge badge-accent">{p}</span>)}
                    {ann.batches.map((b) => <span key={b} className="badge badge-gray">{b}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
