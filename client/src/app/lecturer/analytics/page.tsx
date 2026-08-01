"use client";
import LecturerNavbar from "@/components/LecturerNavbar";

export default function LecturerAnalyticsPage() {
  return (
    <div>
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-8 py-7">
        <h1 className="font-display font-extrabold text-2xl mb-1">Course analytics</h1>
        <p className="text-[#666B80] text-sm mb-6">Student performance metrics, grade distribution, and engagement.</p>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="font-display font-bold text-sm mb-4">Grade Distribution</h3>
            <div className="flex items-end gap-3 h-40">
              <div className="flex-1 bg-accent rounded-t" style={{height:'80%'}}></div>
              <div className="flex-1 bg-accent rounded-t" style={{height:'60%'}}></div>
              <div className="flex-1 bg-[#EEEDFE] rounded-t" style={{height:'40%'}}></div>
              <div className="flex-1 bg-[#EEEDFE] rounded-t" style={{height:'20%'}}></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
