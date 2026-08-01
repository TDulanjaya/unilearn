"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";
export default function Page() {
  useInteractive();
  return (
    <div className="flex">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-8 py-7 max-w-[1300px]">
<div className="flex items-center justify-between mb-1">
  <h1 className="font-display font-extrabold text-2xl">User management</h1>
  <button className="btn-primary" data-modal-open="add-user-modal"><i className="ti ti-plus"></i> Add user</button>
</div>
<p className="text-[#666B80] text-sm mb-6">Manage students, lecturers, examiners, staff and HOD/Dean accounts.</p>
<div className="card p-5 mb-5">
  <div className="flex items-center gap-3 mb-4"><input type="text" placeholder="Search users" className="flex-1"/><select className="w-40"><option>All roles</option></select><select className="w-40"><option>All departments</option></select></div>
  <table className="w-full text-sm"><thead><tr className="text-left text-[#9CA0B3] text-xs"><th className="pb-2">Name</th><th className="pb-2">Email</th><th className="pb-2">Role</th><th className="pb-2">Department</th><th className="pb-2">Status</th><th className="pb-2"></th></tr></thead>
  <tbody>
<tr className="table-row border-b border-[#E7E8F0] last:border-0">
  <td className="py-2.5 flex items-center gap-2"><div className="avatar w-7 h-7 text-[10px]">N</div>Nadeesha Silva</td>
  <td className="py-2.5 text-[#666B80]">nadeesha.s@uni.edu</td><td className="py-2.5"><span className="badge badge-accent">Student</span></td>
  <td className="py-2.5 text-[#666B80]">Software Eng.</td><td className="py-2.5"><span className="badge badge-success">Active</span></td>
  <td className="py-2.5"><a href="#" className="text-accent font-semibold text-xs">Edit</a></td>
</tr>
<tr className="table-row border-b border-[#E7E8F0] last:border-0">
  <td className="py-2.5 flex items-center gap-2"><div className="avatar w-7 h-7 text-[10px]">D</div>Dr. K. Perera</td>
  <td className="py-2.5 text-[#666B80]">k.perera@uni.edu</td><td className="py-2.5"><span className="badge badge-gray">Lecturer</span></td>
  <td className="py-2.5 text-[#666B80]">Software Eng.</td><td className="py-2.5"><span className="badge badge-success">Active</span></td>
  <td className="py-2.5"><a href="#" className="text-accent font-semibold text-xs">Edit</a></td>
</tr>
<tr className="table-row border-b border-[#E7E8F0] last:border-0">
  <td className="py-2.5 flex items-center gap-2"><div className="avatar w-7 h-7 text-[10px]">P</div>Prof. A. Fernando</td>
  <td className="py-2.5 text-[#666B80]">a.fernando@uni.edu</td><td className="py-2.5"><span className="badge badge-gray">Examiner</span></td>
  <td className="py-2.5 text-[#666B80]">Computing</td><td className="py-2.5"><span className="badge badge-success">Active</span></td>
  <td className="py-2.5"><a href="#" className="text-accent font-semibold text-xs">Edit</a></td>
</tr>
<tr className="table-row border-b border-[#E7E8F0] last:border-0">
  <td className="py-2.5 flex items-center gap-2"><div className="avatar w-7 h-7 text-[10px]">D</div>Dr. S. Wickramasinghe</td>
  <td className="py-2.5 text-[#666B80]">s.wick@uni.edu</td><td className="py-2.5"><span className="badge badge-danger">HOD/Dean</span></td>
  <td className="py-2.5 text-[#666B80]">Software Eng.</td><td className="py-2.5"><span className="badge badge-success">Active</span></td>
  <td className="py-2.5"><a href="#" className="text-accent font-semibold text-xs">Edit</a></td>
</tr>
<tr className="table-row border-b border-[#E7E8F0] last:border-0">
  <td className="py-2.5 flex items-center gap-2"><div className="avatar w-7 h-7 text-[10px]">T</div>T. Bandara</td>
  <td className="py-2.5 text-[#666B80]">t.guest@uni.edu</td><td className="py-2.5"><span className="badge badge-warning">Guest Lecturer</span></td>
  <td className="py-2.5 text-[#666B80]">Computing</td><td className="py-2.5"><span className="badge badge-success">Active</span></td>
  <td className="py-2.5"><a href="#" className="text-accent font-semibold text-xs">Edit</a></td>
</tr></tbody></table>
</div>
<div className="card p-5">
  <h3 className="font-display font-bold mb-3">Last bulk import — 214 rows</h3>
  <div className="flex items-center gap-6 mb-3 text-sm"><span className="text-[#16A34A] font-semibold">208 succeeded</span><span className="text-[#DC2626] font-semibold">6 failed</span></div>
  <table className="w-full text-sm"><thead><tr className="text-left text-[#9CA0B3] text-xs"><th className="pb-2">Row</th><th className="pb-2">Name</th><th className="pb-2">Error</th></tr></thead>
  <tbody className="divide-y divide-[#E7E8F0]">
    <tr><td className="py-2">14</td><td className="py-2">S. Karunaratne</td><td className="py-2 text-[#DC2626]">Duplicate email</td></tr>
    <tr><td className="py-2">88</td><td className="py-2">M. Rathnayake</td><td className="py-2 text-[#DC2626]">Missing department</td></tr>
  </tbody></table>
  <button className="btn-secondary mt-3 text-xs !py-1.5">Re-upload corrected rows</button>
</div>
<div id="add-user-modal" className="hidden fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
  <div className="card w-full max-w-lg p-6 bg-white">
    <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-lg">Add user</h3><button data-modal-close="add-user-modal" className="text-[#9CA0B3]"><i className="ti ti-x text-xl"></i></button></div>
    <div className="flex gap-1 mb-4 border-b border-[#E7E8F0]" data-tabgroup="addu">
      <span className="tab-btn active" data-tab="single">Single entry</span>
      <span className="tab-btn" data-tab="bulk">Bulk import</span>
    </div>
    <div id="addu-single" data-tabpanel="addu">
      <select className="mb-3"><option>Student</option><option>Lecturer</option><option>Examiner</option><option>Staff/Admin</option><option>HOD/Dean</option></select>
      <div className="grid grid-cols-2 gap-3 mb-3"><input type="text" placeholder="Full name"/><input type="email" placeholder="Email"/></div>
      <div className="grid grid-cols-2 gap-3 mb-3"><select><option>Department</option></select><select><option>Batch (students only)</option></select>
      </div>
      <button className="btn-primary w-full justify-center">Register user</button>
    </div>
    <div id="addu-bulk" data-tabpanel="addu" className="hidden">
      <div className="border-2 border-dashed border-[#E7E8F0] rounded-xl p-6 text-center text-sm text-[#9CA0B3] mb-3"><i className="ti ti-cloud-upload text-2xl block mb-1"></i>Drag & drop a CSV file</div>
      <a href="#" className="text-xs font-semibold text-accent">Download CSV template</a>
      <button className="btn-primary w-full justify-center mt-3">Upload & validate</button>
    </div>
  </div>
</div>
      </main>
    </div>
  );
}
