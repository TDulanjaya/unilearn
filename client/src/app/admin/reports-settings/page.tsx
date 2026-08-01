"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";
export default function Page() {
  useInteractive();
  return (
    <div className="flex">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-8 py-7 max-w-[1300px]">
<h1 className="font-display font-extrabold text-2xl mb-1">Reports & settings</h1>
<p className="text-[#666B80] text-sm mb-5">Institution reports, finance, settings, announcements and audit log.</p>
<div className="flex gap-1 mb-5 border-b border-[#E7E8F0] overflow-x-auto" data-tabgroup="rs">
  <span className="tab-btn active" data-tab="rep">Reports</span>
  <span className="tab-btn" data-tab="fin">Finance</span>
  <span className="tab-btn" data-tab="set">Settings</span>
  <span className="tab-btn" data-tab="ann">Announcements</span>
  <span className="tab-btn" data-tab="aud">Audit log</span>
</div>
<div id="rs-rep" data-tabpanel="rs">
<div className="flex items-center gap-3 mb-5"><select className="w-40"><option>All faculties</option></select><input type="date"/><input type="date"/></div>
<div className="grid lg:grid-cols-3 gap-5">
  <div className="card p-5"><h3 className="font-display font-bold mb-3 text-sm">Attendance</h3><div className="flex items-end gap-2 h-24"><div className="flex-1 bg-[#EEEDFE] rounded-t" style={{height:'70%'}}></div><div className="flex-1 bg-accent rounded-t" style={{height:'88%'}}></div></div></div>
  <div className="card p-5"><h3 className="font-display font-bold mb-3 text-sm">Performance</h3><div className="flex items-end gap-2 h-24"><div className="flex-1 bg-[#DCFCE7] rounded-t" style={{height:'75%'}}></div><div className="flex-1 bg-[#FEF3C7] rounded-t" style={{height:'50%'}}></div></div></div>
  <div className="card p-5"><h3 className="font-display font-bold mb-3 text-sm">Enrollment trend</h3><div className="flex items-end gap-2 h-24"><div className="flex-1 bg-[#EEEDFE] rounded-t" style={{height:'60%'}}></div><div className="flex-1 bg-accent rounded-t" style={{height:'80%'}}></div></div></div>
</div></div>
<div id="rs-fin" data-tabpanel="rs" className="hidden">
<div className="grid sm:grid-cols-2 gap-4 mb-5"><div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Total collected</p><p className="font-display font-extrabold text-xl">LKR 42.1M</p></div><div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Total pending</p><p className="font-display font-extrabold text-xl text-[#D97706]">LKR 3.4M</p></div></div>
<div className="card p-5"><table className="w-full text-sm"><thead><tr className="text-left text-[#9CA0B3] text-xs"><th className="pb-2">Student</th><th className="pb-2">Status</th><th className="pb-2"></th></tr></thead>
<tbody className="divide-y divide-[#E7E8F0]"><tr><td className="py-2.5">Nadeesha Silva</td><td className="py-2.5"><span className="badge badge-warning">Pending</span></td><td className="py-2.5"><button className="text-accent text-xs font-semibold">Generate invoice</button></td></tr></tbody></table></div></div>
<div id="rs-set" data-tabpanel="rs" className="hidden">
<div className="grid lg:grid-cols-2 gap-5">
  <div className="card p-5"><h3 className="font-display font-bold mb-3 text-sm">Academic calendar</h3><div className="grid grid-cols-2 gap-3"><input type="date"/><input type="date"/></div></div>
  <div className="card p-5"><h3 className="font-display font-bold mb-3 text-sm">Notification settings</h3><div className="space-y-2 text-sm"><label className="flex items-center justify-between"><span>Exam scheduling alerts</span><input type="checkbox" checked/></label><label className="flex items-center justify-between"><span>Grade posted alerts</span><input type="checkbox" checked/></label></div></div>
</div></div>
<div id="rs-ann" data-tabpanel="rs" className="hidden">
<div className="card p-5 mb-5 max-w-2xl"><input type="text" placeholder="Title" className="mb-3"/><textarea rows={3} placeholder="Message" className="mb-3"></textarea><button className="btn-primary">Publish institution-wide</button></div></div>
<div id="rs-aud" data-tabpanel="rs" className="hidden">
<div className="card p-5"><table className="w-full text-sm"><thead><tr className="text-left text-[#9CA0B3] text-xs"><th className="pb-2">Time</th><th className="pb-2">User</th><th className="pb-2">Action</th><th className="pb-2">Entity</th></tr></thead>
<tbody className="divide-y divide-[#E7E8F0]"><tr><td className="py-2.5">10:42 AM</td><td className="py-2.5">Dr. K. Perera</td><td className="py-2.5">Grade updated</td><td className="py-2.5">Submission #4821</td></tr>
<tr><td className="py-2.5">9:15 AM</td><td className="py-2.5">R. Jayawardena</td><td className="py-2.5">User created</td><td className="py-2.5">User #5412</td></tr></tbody></table></div></div>
      </main>
    </div>
  );
}
