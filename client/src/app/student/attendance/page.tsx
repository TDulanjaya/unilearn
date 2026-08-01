"use client";
import StudentNavbar from "@/components/StudentNavbar";

export default function StudentAttendancePage() {
  return (
    <div>
      <StudentNavbar />
      <main className="max-w-[1200px] mx-auto px-8 py-7">
        <h1 className="font-display font-extrabold text-2xl mb-1">Attendance tracking</h1>
        <p className="text-[#666B80] text-sm mb-6">Module-wise attendance breakdown and eligibility threshold (min 80%).</p>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="card p-5">
            <h3 className="font-display font-bold text-sm mb-2">SE308.3 Software Process Mgmt</h3>
            <div className="progress-track mb-2"><div className="progress-fill" style={{width:'92%'}}></div></div>
            <div className="flex justify-between text-xs text-[#666B80]"><span>23 / 25 Sessions</span><span className="text-[#16A34A] font-bold">92% (Eligible)</span></div>
          </div>
          <div className="card p-5">
            <h3 className="font-display font-bold text-sm mb-2">SE202.2 Database Systems</h3>
            <div className="progress-track mb-2"><div className="progress-fill" style={{width:'88%'}}></div></div>
            <div className="flex justify-between text-xs text-[#666B80]"><span>22 / 25 Sessions</span><span className="text-[#16A34A] font-bold">88% (Eligible)</span></div>
          </div>
          <div className="card p-5">
            <h3 className="font-display font-bold text-sm mb-2">SE309.3 Verification & Validation</h3>
            <div className="progress-track mb-2"><div className="progress-fill" style={{width:'76%'}}></div></div>
            <div className="flex justify-between text-xs text-[#666B80]"><span>19 / 25 Sessions</span><span className="text-[#D97706] font-bold">76% (Warning)</span></div>
          </div>
        </div>
      </main>
    </div>
  );
}
