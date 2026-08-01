"use client";
import StudentNavbar from "@/components/StudentNavbar";

export default function NotificationsPage() {
  return (
    <div>
      <StudentNavbar />
      <main className="max-w-[1000px] mx-auto px-8 py-7">
        <h1 className="font-display font-extrabold text-2xl mb-1">Notifications</h1>
        <p className="text-[#666B80] text-sm mb-6">Course updates, exam schedules, and system alerts.</p>

        <div className="card divide-y divide-[#E7E8F0]">
          <div className="p-4 flex items-start gap-4 hover:bg-[#FAFAFD] transition">
            <div className="w-9 h-9 rounded-full bg-[#EEEDFE] text-accent flex items-center justify-center shrink-0 mt-0.5">
              <i className="ti ti-file-text text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">New Assignment Posted: SE308.3</p>
              <p className="text-xs text-[#666B80] mt-0.5">Assignment 2: Test Case Design is due on Dec 18, 2025.</p>
              <span className="text-[11px] text-[#9CA0B3] mt-1 block">10 mins ago</span>
            </div>
          </div>

          <div className="p-4 flex items-start gap-4 hover:bg-[#FAFAFD] transition">
            <div className="w-9 h-9 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5">
              <i className="ti ti-calendar text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Exam Scheduled: SE308.3 Software Process Mgmt</p>
              <p className="text-xs text-[#666B80] mt-0.5">Final exam scheduled for Dec 12, 2025 at Main Hall A.</p>
              <span className="text-[11px] text-[#9CA0B3] mt-1 block">2 hours ago</span>
            </div>
          </div>

          <div className="p-4 flex items-start gap-4 hover:bg-[#FAFAFD] transition">
            <div className="w-9 h-9 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
              <i className="ti ti-certificate text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Grade Published: SE202.2 Mid-term Exam</p>
              <p className="text-xs text-[#666B80] mt-0.5">You received 84% (Grade A-) in SE202.2 Database Systems.</p>
              <span className="text-[11px] text-[#9CA0B3] mt-1 block">Yesterday</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
