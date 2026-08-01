"use client";
import StudentNavbar from "@/components/StudentNavbar";

export default function StudentTimetablePage() {
  return (
    <div>
      <StudentNavbar />
      <main className="max-w-[1200px] mx-auto px-8 py-7">
        <h1 className="font-display font-extrabold text-2xl mb-1">Weekly timetable</h1>
        <p className="text-[#666B80] text-sm mb-6">Semester 2 weekly lecture and lab schedule.</p>

        <div className="card p-5">
          <div className="grid grid-cols-5 gap-3 text-center font-display font-bold text-sm border-b border-[#E7E8F0] pb-3 mb-3">
            <div>Monday</div>
            <div>Tuesday</div>
            <div>Wednesday</div>
            <div>Thursday</div>
            <div>Friday</div>
          </div>
          <div className="grid grid-cols-5 gap-3 text-xs">
            <div className="bg-[#EEEDFE] p-3 rounded-lg border border-accent">
              <p className="font-bold text-accent">SE308.3 Lecture</p>
              <p className="text-[#666B80]">09:00 - 11:00</p>
              <p className="text-[10px] text-[#9CA0B3] mt-1">Hall 3A</p>
            </div>
            <div className="bg-[#FAFAFD] p-3 rounded-lg border border-[#E7E8F0]">
              <p className="font-bold">SE202.2 Lab</p>
              <p className="text-[#666B80]">11:00 - 13:00</p>
              <p className="text-[10px] text-[#9CA0B3] mt-1">Lab B</p>
            </div>
            <div className="bg-[#EEEDFE] p-3 rounded-lg border border-accent">
              <p className="font-bold text-accent">SE309.3 Lecture</p>
              <p className="text-[#666B80]">10:00 - 12:00</p>
              <p className="text-[10px] text-[#9CA0B3] mt-1">Hall 2B</p>
            </div>
            <div className="bg-[#FAFAFD] p-3 rounded-lg border border-[#E7E8F0]">
              <p className="font-bold">SE104.1 Tutorial</p>
              <p className="text-[#666B80]">14:00 - 16:00</p>
              <p className="text-[10px] text-[#9CA0B3] mt-1">Room 102</p>
            </div>
            <div className="bg-[#DCFCE7] p-3 rounded-lg border border-[#16A34A]">
              <p className="font-bold text-[#166534]">Project Review</p>
              <p className="text-[#666B80]">13:00 - 15:00</p>
              <p className="text-[10px] text-[#9CA0B3] mt-1">Discussion Rm</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
