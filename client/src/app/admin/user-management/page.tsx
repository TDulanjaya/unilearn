"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";

export default function Page() {
  useInteractive();
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)]">
            User Management
          </h1>
          <button className="btn-primary shadow-md" data-modal-open="add-user-modal">
            <i className="ti ti-plus"></i> Add user
          </button>
        </div>
        <p className="text-[var(--on-surface-variant)] text-sm mb-6">
          Manage students, lecturers, examiners, staff and HOD/Dean accounts.
        </p>

        <div className="card p-6 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-5 pb-4 border-b border-[var(--outline-variant)]">
            <input type="text" placeholder="Search users" className="flex-1" />
            <select className="w-40"><option>All roles</option></select>
            <select className="w-40"><option>All departments</option></select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                  <th className="pb-3 px-3 font-semibold">Name</th>
                  <th className="pb-3 px-3 font-semibold">Email</th>
                  <th className="pb-3 px-3 font-semibold">Role</th>
                  <th className="pb-3 px-3 font-semibold">Department</th>
                  <th className="pb-3 px-3 font-semibold">Status</th>
                  <th className="pb-3 px-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-variant)]">
                <tr className="table-row transition-colors">
                  <td className="py-3.5 px-3 flex items-center gap-2 font-semibold text-[var(--on-surface)]">
                    <div className="avatar w-7 h-7 text-[10px]">N</div>Nadeesha Silva
                  </td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">nadeesha.s@uni.edu</td>
                  <td className="py-3.5 px-3"><span className="badge badge-accent">Student</span></td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">Software Eng.</td>
                  <td className="py-3.5 px-3"><span className="badge badge-success">Active</span></td>
                  <td className="py-3.5 px-3">
                    <a href="#" className="text-[var(--tertiary)] font-bold text-xs hover:underline">Edit</a>
                  </td>
                </tr>
                <tr className="table-row transition-colors">
                  <td className="py-3.5 px-3 flex items-center gap-2 font-semibold text-[var(--on-surface)]">
                    <div className="avatar w-7 h-7 text-[10px]">D</div>Dr. K. Perera
                  </td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">k.perera@uni.edu</td>
                  <td className="py-3.5 px-3"><span className="badge badge-gray">Lecturer</span></td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">Software Eng.</td>
                  <td className="py-3.5 px-3"><span className="badge badge-success">Active</span></td>
                  <td className="py-3.5 px-3">
                    <a href="#" className="text-[var(--tertiary)] font-bold text-xs hover:underline">Edit</a>
                  </td>
                </tr>
                <tr className="table-row transition-colors">
                  <td className="py-3.5 px-3 flex items-center gap-2 font-semibold text-[var(--on-surface)]">
                    <div className="avatar w-7 h-7 text-[10px]">P</div>Prof. A. Fernando
                  </td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">a.fernando@uni.edu</td>
                  <td className="py-3.5 px-3"><span className="badge badge-gray">Examiner</span></td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">Computing</td>
                  <td className="py-3.5 px-3"><span className="badge badge-success">Active</span></td>
                  <td className="py-3.5 px-3">
                    <a href="#" className="text-[var(--tertiary)] font-bold text-xs hover:underline">Edit</a>
                  </td>
                </tr>
                <tr className="table-row transition-colors">
                  <td className="py-3.5 px-3 flex items-center gap-2 font-semibold text-[var(--on-surface)]">
                    <div className="avatar w-7 h-7 text-[10px]">D</div>Dr. S. Wickramasinghe
                  </td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">s.wick@uni.edu</td>
                  <td className="py-3.5 px-3"><span className="badge badge-danger">HOD/Dean</span></td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">Software Eng.</td>
                  <td className="py-3.5 px-3"><span className="badge badge-success">Active</span></td>
                  <td className="py-3.5 px-3">
                    <a href="#" className="text-[var(--tertiary)] font-bold text-xs hover:underline">Edit</a>
                  </td>
                </tr>
                <tr className="table-row transition-colors">
                  <td className="py-3.5 px-3 flex items-center gap-2 font-semibold text-[var(--on-surface)]">
                    <div className="avatar w-7 h-7 text-[10px]">T</div>T. Bandara
                  </td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">t.guest@uni.edu</td>
                  <td className="py-3.5 px-3"><span className="badge badge-warning">Guest Lecturer</span></td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">Computing</td>
                  <td className="py-3.5 px-3"><span className="badge badge-success">Active</span></td>
                  <td className="py-3.5 px-3">
                    <a href="#" className="text-[var(--tertiary)] font-bold text-xs hover:underline">Edit</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
            Last Bulk Import — 214 rows
          </h3>
          <div className="flex items-center gap-6 mb-4 text-sm font-semibold">
            <span className="text-[var(--secondary)]">208 succeeded</span>
            <span className="text-[var(--error)]">6 failed</span>
          </div>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                  <th className="pb-3 px-3 font-semibold">Row</th>
                  <th className="pb-3 px-3 font-semibold">Name</th>
                  <th className="pb-3 px-3 font-semibold">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-variant)]">
                <tr className="table-row transition-colors">
                  <td className="py-3 px-3 font-medium text-[var(--on-surface)]">14</td>
                  <td className="py-3 px-3 font-semibold text-[var(--on-surface)]">S. Karunaratne</td>
                  <td className="py-3 px-3 text-[var(--error)] font-semibold">Duplicate email</td>
                </tr>
                <tr className="table-row transition-colors">
                  <td className="py-3 px-3 font-medium text-[var(--on-surface)]">88</td>
                  <td className="py-3 px-3 font-semibold text-[var(--on-surface)]">M. Rathnayake</td>
                  <td className="py-3 px-3 text-[var(--error)] font-semibold">Missing department</td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className="btn-secondary text-xs !py-1.5">
            Re-upload corrected rows
          </button>
        </div>

        <div id="add-user-modal" className="hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6 bg-[var(--surface-container-lowest)] shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">Add user</h3>
              <button data-modal-close="add-user-modal" className="text-[var(--outline)] hover:text-[var(--on-surface)]">
                <i className="ti ti-x text-xl"></i>
              </button>
            </div>
            <div className="flex gap-2 mb-5 border-b border-[var(--outline-variant)]" data-tabgroup="addu">
              <span className="tab-btn active" data-tab="single">Single entry</span>
              <span className="tab-btn" data-tab="bulk">Bulk import</span>
            </div>
            <div id="addu-single" data-tabpanel="addu">
              <div className="space-y-4">
                <select><option>Student</option><option>Lecturer</option><option>Examiner</option><option>Staff/Admin</option><option>HOD/Dean</option></select>
                <div className="grid grid-cols-2 gap-3"><input type="text" placeholder="Full name"/><input type="email" placeholder="Email"/></div>
                <div className="grid grid-cols-2 gap-3"><select><option>Department</option></select><select><option>Batch (students only)</option></select></div>
                <button className="btn-primary w-full justify-center shadow-md">Register user</button>
              </div>
            </div>
            <div id="addu-bulk" data-tabpanel="addu" className="hidden">
              <div className="border-2 border-dashed border-[var(--outline-variant)] rounded-2xl p-6 text-center text-sm text-[var(--outline)] mb-3 bg-[var(--surface-container-low)]">
                <i className="ti ti-cloud-upload text-3xl block mb-2 text-[var(--tertiary)]"></i>
                Drag & drop a CSV file
              </div>
              <a href="#" className="text-xs font-semibold text-[var(--tertiary)] hover:underline">Download CSV template</a>
              <button className="btn-primary w-full justify-center mt-4 shadow-md">Upload & validate</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
