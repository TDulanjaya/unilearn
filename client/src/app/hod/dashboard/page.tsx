"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";

export default function HodDashboard() {
  useInteractive();
  return (
    <div className="flex">
      <Sidebar role="hod" name="Dr. S. Wickramasinghe" sub="Head of Department · Software Eng." />
      <main className="flex-1 px-8 py-7 max-w-[1300px]">
        <h1 className="font-display font-extrabold text-2xl mb-1">HOD dashboard</h1>
        <p className="text-[#666B80] text-sm mb-6">Departmental overview for Software Engineering.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Department Lecturers</p><p className="font-display font-extrabold text-2xl">14</p></div>
          <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Enrolled Students</p><p className="font-display font-extrabold text-2xl text-accent">480</p></div>
          <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Offered Courses</p><p className="font-display font-extrabold text-2xl">22</p></div>
          <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Pending Approvals</p><p className="font-display font-extrabold text-2xl text-[#D97706]">3</p></div>
        </div>
      </main>
    </div>
  );
}
