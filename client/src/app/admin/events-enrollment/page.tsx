"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";
export default function Page() {
  useInteractive();
  return (
    <div className="flex">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-8 py-7 max-w-[1300px]">
<h1 className="font-display font-extrabold text-2xl mb-1">Events & enrollment</h1>
<p className="text-[#666B80] text-sm mb-5">Create events, manage registrations, and assign students to batches.</p>
<div className="flex gap-1 mb-5 border-b border-[#E7E8F0]" data-tabgroup="evn">
  <span className="tab-btn active" data-tab="ev">Events</span>
  <span className="tab-btn" data-tab="reg">Registrations</span>
  <span className="tab-btn" data-tab="enr">Enrollment</span>
</div>
<div id="evn-ev" data-tabpanel="evn">
<div className="grid lg:grid-cols-2 gap-5">
  <div className="card p-5">
    <h3 className="font-display font-bold mb-3">Create event</h3>
    <input type="text" placeholder="Event title" className="mb-3"/>
    <textarea rows={2} placeholder="Description" className="mb-3"></textarea>
    <div className="grid grid-cols-2 gap-3 mb-3"><input type="date"/><input type="text" placeholder="Venue"/></div>
    <select className="mb-3"><option>Institution-wide</option><option>Faculty of Computing</option><option>Faculty of Business</option></select>
    <button className="btn-primary">Publish event</button>
  </div>
  <div className="card p-5">
    <h3 className="font-display font-bold mb-3">Upcoming events</h3>
    <div className="space-y-2">
      <div className="flex items-center justify-between border border-[#E7E8F0] rounded-lg px-3 py-2.5 text-sm"><span className="font-semibold">Career Fair 2026</span><button className="text-[#DC2626] text-xs font-semibold">Cancel</button></div>
      <div className="flex items-center justify-between border border-[#E7E8F0] rounded-lg px-3 py-2.5 text-sm"><span className="font-semibold">AI in Practice — Guest Lecture</span><button className="text-[#DC2626] text-xs font-semibold">Cancel</button></div>
    </div>
  </div>
</div></div>
<div id="evn-reg" data-tabpanel="evn" className="hidden">
<div className="card p-5">
  <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold">Career Fair 2026 — 312 registered</h3><button className="btn-secondary text-xs !py-1.5"><i className="ti ti-download"></i> Export</button></div>
  <table className="w-full text-sm"><thead><tr className="text-left text-[#9CA0B3] text-xs"><th className="pb-2">Student</th><th className="pb-2">Department</th><th className="pb-2">Registered</th><th className="pb-2">Check-in</th></tr></thead>
  <tbody className="divide-y divide-[#E7E8F0]">
    <tr><td className="py-2.5">Nadeesha Silva</td><td className="py-2.5">Software Eng.</td><td className="py-2.5">Aug 2</td><td className="py-2.5"><input type="checkbox"/></td></tr>
    <tr><td className="py-2.5">Kasun Perera</td><td className="py-2.5">Computer Science</td><td className="py-2.5">Aug 3</td><td className="py-2.5"><input type="checkbox" checked/></td></tr>
  </tbody></table>
</div></div>
<div id="evn-enr" data-tabpanel="evn" className="hidden">
<div className="grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
  <div className="card p-5"><h3 className="font-display font-bold mb-3 text-sm">Unassigned students (42)</h3><div className="space-y-2 text-sm"><label className="flex items-center gap-2 border border-[#E7E8F0] rounded-lg px-3 py-2"><input type="checkbox"/> R. Munasinghe</label><label className="flex items-center gap-2 border border-[#E7E8F0] rounded-lg px-3 py-2"><input type="checkbox"/> D. Abeywickrama</label></div></div>
  <div className="pt-10"><button className="btn-primary"><i className="ti ti-arrow-right"></i></button></div>
  <div className="card p-5"><h3 className="font-display font-bold mb-3 text-sm">Target: CS2026-A / SE101.1</h3><select className="mb-2"><option>Batch CS2026-A</option></select><select><option>Course offering SE101.1</option></select></div>
</div></div>
      </main>
    </div>
  );
}
