"use client";
import StudentNavbar from "@/components/StudentNavbar";

export default function StudentCoursesPage() {
  return (
    <div>
      <StudentNavbar />
      <main className="max-w-[1200px] mx-auto px-8 py-7">
        <h1 className="font-display font-extrabold text-2xl mb-1">My courses</h1>
        <p className="text-[#666B80] text-sm mb-6">Enrolled course modules for current semester.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="card p-5 flex flex-col justify-between">
            <div>
              <span className="badge badge-accent mb-2">SE308.3</span>
              <h3 className="font-display font-bold text-base mb-1">Software Process Management</h3>
              <p className="text-xs text-[#666B80] mb-4">Dr. K. Perera · Software Eng. Department</p>
              <div className="progress-track mb-2"><div className="progress-fill" style={{width:'75%'}}></div></div>
              <p className="text-xs text-[#9CA0B3]">75% Course Completed</p>
            </div>
            <button className="btn-primary text-xs mt-5 justify-center">View course</button>
          </div>

          <div className="card p-5 flex flex-col justify-between">
            <div>
              <span className="badge badge-accent mb-2">SE202.2</span>
              <h3 className="font-display font-bold text-base mb-1">Database Systems</h3>
              <p className="text-xs text-[#666B80] mb-4">Dr. M. Rathnayake · Computer Science</p>
              <div className="progress-track mb-2"><div className="progress-fill" style={{width:'90%'}}></div></div>
              <p className="text-xs text-[#9CA0B3]">90% Course Completed</p>
            </div>
            <button className="btn-primary text-xs mt-5 justify-center">View course</button>
          </div>

          <div className="card p-5 flex flex-col justify-between">
            <div>
              <span className="badge badge-accent mb-2">SE309.3</span>
              <h3 className="font-display font-bold text-base mb-1">Software Verification & Validation</h3>
              <p className="text-xs text-[#666B80] mb-4">Prof. A. Fernando · Software Eng.</p>
              <div className="progress-track mb-2"><div className="progress-fill" style={{width:'50%'}}></div></div>
              <p className="text-xs text-[#9CA0B3]">50% Course Completed</p>
            </div>
            <button className="btn-primary text-xs mt-5 justify-center">View course</button>
          </div>
        </div>
      </main>
    </div>
  );
}
