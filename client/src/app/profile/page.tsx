"use client";
import StudentNavbar from "@/components/StudentNavbar";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <StudentNavbar />
      <main className="max-w-[1000px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            User Profile
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Personal details, academic enrollment, and account settings.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-6 text-center shadow-md">
            <div className="avatar w-20 h-20 text-2xl mx-auto mb-4 font-extrabold shadow-sm">N</div>
            <h2 className="font-display font-bold text-xl text-[var(--on-surface)]">Nadeesha Silva</h2>
            <p className="text-xs text-[var(--on-surface-variant)] mb-3 font-medium">Student ID: SE/2023/042</p>
            <span className="badge badge-accent">Faculty of Computing</span>

            <div className="mt-6 pt-4 border-t border-[var(--outline-variant)] space-y-2 text-left text-xs text-[var(--on-surface-variant)]">
              <p><b className="text-[var(--on-surface)]">Email:</b> nadeesha.s@uni.edu</p>
              <p><b className="text-[var(--on-surface)]">Batch:</b> CS2023-A</p>
              <p><b className="text-[var(--on-surface)]">Degree:</b> BSc (Hons) Software Engineering</p>
            </div>
          </div>

          <div className="lg:col-span-2 card p-6 space-y-5 shadow-md">
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)] border-b border-[var(--outline-variant)] pb-3">
              Account Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                  First Name
                </label>
                <input type="text" defaultValue="Nadeesha" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                  Last Name
                </label>
                <input type="text" defaultValue="Silva" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                  Email
                </label>
                <input type="email" defaultValue="nadeesha.s@uni.edu" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                  Contact No.
                </label>
                <input type="text" defaultValue="+94 77 123 4567" />
              </div>
            </div>

            <button className="btn-primary text-xs mt-4 shadow-md">
              Save changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
