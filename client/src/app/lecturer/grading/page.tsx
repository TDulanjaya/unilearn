"use client";
import LecturerNavbar from "@/components/LecturerNavbar";

export default function LecturerGradingPage() {
  return (
    <div>
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-8 py-7">
        <h1 className="font-display font-extrabold text-2xl mb-1">Assignment grading</h1>
        <p className="text-[#666B80] text-sm mb-6">Review student submissions and assign marks.</p>

        <div className="card p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#9CA0B3] text-xs">
                <th className="pb-2">Student</th>
                <th className="pb-2">Assignment</th>
                <th className="pb-2">Submitted</th>
                <th className="pb-2">Marks</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E8F0]">
              <tr>
                <td className="py-2.5 font-semibold">Nadeesha Silva</td>
                <td className="py-2.5">Assignment 1 - SDLC Analysis</td>
                <td className="py-2.5 text-[#666B80]">Aug 14, 10:20 AM</td>
                <td className="py-2.5 font-bold text-accent">88 / 100</td>
                <td className="py-2.5"><button className="btn-secondary text-xs !py-1">Edit Grade</button></td>
              </tr>
              <tr>
                <td className="py-2.5 font-semibold">Ishara Fonseka</td>
                <td className="py-2.5">Assignment 1 - SDLC Analysis</td>
                <td className="py-2.5 text-[#666B80]">Aug 14, 11:45 AM</td>
                <td className="py-2.5 text-[#D97706] font-bold">Pending</td>
                <td className="py-2.5"><button className="btn-primary text-xs !py-1">Grade Now</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
