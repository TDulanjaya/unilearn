"use client";
import StudentNavbar from "@/components/StudentNavbar";

export default function StudentExamsPage() {
  return (
    <div>
      <StudentNavbar />
      <main className="max-w-[1200px] mx-auto px-8 py-7">
        <h1 className="font-display font-extrabold text-2xl mb-1">Exams & assessments</h1>
        <p className="text-[#666B80] text-sm mb-6">Upcoming final exams, quizzes, and hall admission slips.</p>

        <div className="card p-5 mb-6">
          <h3 className="font-display font-bold text-base mb-3">Examination Schedule</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#9CA0B3] text-xs">
                <th className="pb-2">Course</th>
                <th className="pb-2">Date & Time</th>
                <th className="pb-2">Venue</th>
                <th className="pb-2">Admission Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E8F0]">
              <tr>
                <td className="py-3 font-semibold">SE308.3 Software Process Mgmt</td>
                <td className="py-3 text-[#666B80]">Dec 12, 09:00 AM</td>
                <td className="py-3">Main Hall A</td>
                <td className="py-3"><button className="btn-secondary text-xs !py-1"><i className="ti ti-download"></i> Download Slip</button></td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">SE201.2 Data Structures</td>
                <td className="py-3 text-[#666B80]">Dec 14, 01:30 PM</td>
                <td className="py-3">Lab 04</td>
                <td className="py-3"><button className="btn-secondary text-xs !py-1"><i className="ti ti-download"></i> Download Slip</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
