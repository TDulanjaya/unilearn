"use client";
import StudentNavbar from "@/components/StudentNavbar";

export default function StudentDashboard() {
  return (
    <div>
      <StudentNavbar />
      <main className="max-w-[1200px] mx-auto px-8 py-7">
        <h1 className="font-display font-extrabold text-2xl mb-1">Welcome back, Nadeesha!</h1>
        <p className="text-[#666B80] text-sm mb-6">BSc (Hons) Software Engineering · Semester 2 Overview</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Enrolled Courses</p><p className="font-display font-extrabold text-2xl">5</p></div>
          <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Current GPA</p><p className="font-display font-extrabold text-2xl text-accent">3.78</p></div>
          <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Overall Attendance</p><p className="font-display font-extrabold text-2xl text-[#16A34A]">92%</p></div>
          <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Pending Submissions</p><p className="font-display font-extrabold text-2xl text-[#D97706]">2</p></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-display font-bold mb-3">Enrolled Courses</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-[#E7E8F0] rounded-xl">
                <div>
                  <p className="font-semibold text-sm">SE308.3 Software Process Management</p>
                  <p className="text-xs text-[#666B80]">Dr. K. Perera · 4 Credits</p>
                </div>
                <span className="badge badge-accent">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-[#E7E8F0] rounded-xl">
                <div>
                  <p className="font-semibold text-sm">SE202.2 Database Management Systems</p>
                  <p className="text-xs text-[#666B80]">Dr. M. Rathnayake · 4 Credits</p>
                </div>
                <span className="badge badge-accent">Active</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-display font-bold mb-3">Upcoming Deadline & Exams</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 border border-[#E7E8F0] rounded-xl">
                <span className="font-semibold">SE308.3 Assignment 2</span>
                <span className="text-xs text-[#DC2626] font-bold">Due in 2 days</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-[#E7E8F0] rounded-xl">
                <span className="font-semibold">SE308.3 Final Exam</span>
                <span className="text-xs text-[#666B80]">Dec 12, 2025</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
