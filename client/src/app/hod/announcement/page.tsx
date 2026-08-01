"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";

export default function HodAnnouncement() {
  useInteractive();
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="hod" name="Dr. S. Wickramasinghe" sub="HOD · Software Engineering" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Department Announcements
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Publish department-wide notices for students and staff.
          </p>
        </div>

        <div className="card p-6 max-w-2xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--outline-variant)]">
            <i className="ti ti-speakerphone text-xl text-[var(--tertiary)]"></i>
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
              Create Department Announcement
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                Announcement Title
              </label>
              <input type="text" placeholder="Title" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                Notice Content
              </label>
              <textarea rows={4} placeholder="Announcement text..."></textarea>
            </div>
            <button className="btn-primary shadow-md">
              Publish Notice
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
