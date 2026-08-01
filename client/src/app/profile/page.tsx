"use client";
import StudentNavbar from "@/components/StudentNavbar";

export default function ProfilePage() {
  return (
    <div>
      <StudentNavbar />
      <main className="max-w-[1000px] mx-auto px-8 py-7">
        <h1 className="font-display font-extrabold text-2xl mb-1">User profile</h1>
        <p className="text-[#666B80] text-sm mb-6">Personal details, academic enrollment, and account settings.</p>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-6 text-center">
            <div className="avatar w-20 h-20 text-2xl mx-auto mb-4">N</div>
            <h2 className="font-display font-bold text-lg">Nadeesha Silva</h2>
            <p className="text-xs text-[#666B80] mb-2">Student ID: SE/2023/042</p>
            <span className="badge badge-accent">Faculty of Computing</span>

            <div className="mt-6 pt-4 border-t border-[#E7E8F0] space-y-2 text-left text-xs text-[#666B80]">
              <p><b>Email:</b> nadeesha.s@uni.edu</p>
              <p><b>Batch:</b> CS2023-A</p>
              <p><b>Degree:</b> BSc (Hons) Software Engineering</p>
            </div>
          </div>

          <div className="lg:col-span-2 card p-6 space-y-4">
            <h3 className="font-display font-bold text-base border-b border-[#E7E8F0] pb-2">Account Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#666B80] mb-1">First Name</label>
                <input type="text" defaultValue="Nadeesha" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#666B80] mb-1">Last Name</label>
                <input type="text" defaultValue="Silva" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#666B80] mb-1">Email</label>
                <input type="email" defaultValue="nadeesha.s@uni.edu" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#666B80] mb-1">Contact No.</label>
                <input type="text" defaultValue="+94 77 123 4567" />
              </div>
            </div>

            <button className="btn-primary text-xs mt-4">Save changes</button>
          </div>
        </div>
      </main>
    </div>
  );
}
