"use client";
import LecturerNavbar from "@/components/LecturerNavbar";

export default function LecturerDashboard() {
  return (
    <div>
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-8 py-7">
        <h1 className="font-display font-extrabold text-2xl mb-1">Lecturer dashboard</h1>
        <p className="text-[#666B80] text-sm mb-6">Welcome back, Dr. K. Perera · Department of Software Engineering</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Assigned Courses</p><p className="font-display font-extrabold text-2xl">3</p></div>
          <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Total Students</p><p className="font-display font-extrabold text-2xl text-accent">142</p></div>
          <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Pending Grading</p><p className="font-display font-extrabold text-2xl text-[#D97706]">18</p></div>
          <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Avg Attendance</p><p className="font-display font-extrabold text-2xl text-[#16A34A]">89%</p></div>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-bold mb-3">Active Course Offerings</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#9CA0B3] text-xs">
                <th className="pb-2">Course</th>
                <th className="pb-2">Batch</th>
                <th className="pb-2">Students</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E8F0]">
              <tr>
                <td className="py-2.5 font-semibold">SE308.3 Software Process Management</td>
                <td className="py-2.5">CS2023-A</td>
                <td className="py-2.5">61</td>
                <td className="py-2.5"><span className="badge badge-success">In Progress</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
