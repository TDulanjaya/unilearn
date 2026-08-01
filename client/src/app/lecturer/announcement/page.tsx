"use client";
import LecturerNavbar from "@/components/LecturerNavbar";

export default function LecturerAnnouncementPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Class Announcements
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Broadcast notices to students enrolled in your modules.
          </p>
        </div>

        <div className="card p-6 max-w-2xl">
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
              <select>
                <option>SE308.3 Software Process Management</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                Announcement Title
              </label>
              <input type="text" placeholder="Title" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                Message Body
              </label>
              <textarea rows={4} placeholder="Announcement details..."></textarea>
            </div>
            <button className="btn-primary shadow-md">
              Publish Announcement
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
