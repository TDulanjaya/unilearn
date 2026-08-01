"use client";
import LecturerNavbar from "@/components/LecturerNavbar";

export default function LecturerAnnouncementPage() {
  return (
    <div>
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-8 py-7">
        <h1 className="font-display font-extrabold text-2xl mb-1">Class announcements</h1>
        <p className="text-[#666B80] text-sm mb-6">Broadcast notices to students enrolled in your modules.</p>

        <div className="card p-5 max-w-2xl">
          <h3 className="font-display font-bold text-base mb-3">Post New Announcement</h3>
          <select className="mb-3">
            <option>SE308.3 Software Process Management</option>
          </select>
          <input type="text" placeholder="Title" className="mb-3" />
          <textarea rows={4} placeholder="Announcement details..." className="mb-4"></textarea>
          <button className="btn-primary">Publish Announcement</button>
        </div>
      </main>
    </div>
  );
}
