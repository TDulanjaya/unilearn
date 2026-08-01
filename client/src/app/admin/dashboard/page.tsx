"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";
export default function Page() {
  useInteractive();
  return (
    <div className="flex">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-8 py-7 max-w-[1300px]">
<h1 className="font-display font-extrabold text-2xl mb-1">Admin dashboard</h1>
<p className="text-[#666B80] text-sm mb-6">Institution-wide overview.</p>
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
  <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Total users</p><p className="font-display font-extrabold text-2xl">5,412</p></div>
  <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Faculties</p><p className="font-display font-extrabold text-2xl">6</p></div>
  <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Active courses</p><p className="font-display font-extrabold text-2xl">184</p></div>
  <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Upcoming events</p><p className="font-display font-extrabold text-2xl">7</p></div>
</div>
<div className="card p-5">
  <h3 className="font-display font-bold mb-3">System activity</h3>
  <div className="space-y-3 text-sm">
    <div className="flex items-center gap-3"><i className="ti ti-user-plus text-accent"></i><span>142 new students registered for Semester 2</span><span className="text-xs text-[#9CA0B3] ml-auto">2h ago</span></div>
    <div className="flex items-center gap-3"><i className="ti ti-calendar-event text-accent"></i><span>Career Fair 2026 event published</span><span className="text-xs text-[#9CA0B3] ml-auto">5h ago</span></div>
    <div className="flex items-center gap-3"><i className="ti ti-file-check text-accent"></i><span>SE314.3 course approved by HOD Wickramasinghe</span><span className="text-xs text-[#9CA0B3] ml-auto">Yesterday</span></div>
  </div>
</div>
      </main>
    </div>
  );
}
