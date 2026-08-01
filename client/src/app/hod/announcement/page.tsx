"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";

export default function HodAnnouncement() {
  useInteractive();
  return (
    <div className="flex">
      <Sidebar role="hod" name="Dr. S. Wickramasinghe" sub="Head of Department · Software Eng." />
      <main className="flex-1 px-8 py-7 max-w-[1300px]">
        <h1 className="font-display font-extrabold text-2xl mb-1">Department announcements</h1>
        <p className="text-[#666B80] text-sm mb-6">Publish department-wide notices for students and staff.</p>

        <div className="card p-5 max-w-2xl">
          <h3 className="font-display font-bold text-base mb-3">Create Department Announcement</h3>
          <input type="text" placeholder="Title" className="mb-3" />
          <textarea rows={4} placeholder="Announcement text..." className="mb-4"></textarea>
          <button className="btn-primary">Publish Notice</button>
        </div>
      </main>
    </div>
  );
}
