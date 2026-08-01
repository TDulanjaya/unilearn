"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";
export default function Page() {
  useInteractive();
  return (
    <div className="flex">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-8 py-7 max-w-[1300px]">
<h1 className="font-display font-extrabold text-2xl mb-1">Academic structure</h1>
<p className="text-[#666B80] text-sm mb-5">Faculties, departments, courses and academic calendar.</p>
<div className="flex gap-1 mb-5 border-b border-[#E7E8F0]" data-tabgroup="acs">
  <span className="tab-btn active" data-tab="fac">Faculties & departments</span>
  <span className="tab-btn" data-tab="courses">Courses</span>
  <span className="tab-btn" data-tab="cal">Academic calendar</span>
</div>
<div id="acs-fac" data-tabpanel="acs">
<div className="grid lg:grid-cols-2 gap-5">
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3"><h3 className="font-display font-bold">Faculties</h3><button className="btn-secondary text-xs !py-1.5"><i className="ti ti-plus"></i> Add</button></div>
    <div className="space-y-2">
      <div className="border border-accent bg-[#EEEDFE] rounded-lg px-3 py-2.5 text-sm font-semibold">Faculty of Computing</div>
      <div className="border border-[#E7E8F0] rounded-lg px-3 py-2.5 text-sm font-semibold">Faculty of Business</div>
      <div className="border border-[#E7E8F0] rounded-lg px-3 py-2.5 text-sm font-semibold">Faculty of Engineering</div>
    </div>
  </div>
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3"><h3 className="font-display font-bold">Departments — Faculty of Computing</h3><button className="btn-secondary text-xs !py-1.5"><i className="ti ti-plus"></i> Add</button></div>
    <div className="space-y-2">
      <div className="flex items-center justify-between border border-[#E7E8F0] rounded-lg px-3 py-2.5 text-sm"><span className="font-semibold">Software Engineering</span><select className="w-40 !py-1 text-xs"><option>Dr. S. Wickramasinghe</option></select></div>
      <div className="flex items-center justify-between border border-[#E7E8F0] rounded-lg px-3 py-2.5 text-sm"><span className="font-semibold">Computer Science</span><select className="w-40 !py-1 text-xs"><option>Dr. M. Rathnayake</option></select></div>
    </div>
  </div>
</div></div>
<div id="acs-courses" data-tabpanel="acs" className="hidden">
<div className="card p-5">
  <div className="grid sm:grid-cols-4 gap-3 mb-4"><input type="text" placeholder="Course code"/><input type="text" placeholder="Title" className="sm:col-span-2"/><input type="number" placeholder="Credits"/></div>
  <button className="btn-primary mb-5">Save course</button>
  <table className="w-full text-sm"><thead><tr className="text-left text-[#9CA0B3] text-xs"><th className="pb-2">Code</th><th className="pb-2">Title</th><th className="pb-2">Credits</th><th className="pb-2">Version</th></tr></thead>
  <tbody className="divide-y divide-[#E7E8F0]">
    <tr><td className="py-2.5">SE309.3</td><td className="py-2.5">Software Verification & Validation</td><td className="py-2.5">4</td><td className="py-2.5">v3</td></tr>
    <tr><td className="py-2.5">SE308.3</td><td className="py-2.5">Software Process Management</td><td className="py-2.5">4</td><td className="py-2.5">v2</td></tr>
  </tbody></table>
</div></div>
<div id="acs-cal" data-tabpanel="acs" className="hidden">
<div className="grid lg:grid-cols-3 gap-5">
  <div className="card p-5"><h3 className="font-display font-bold mb-3 text-sm">Academic years</h3><div className="space-y-2 text-sm"><div className="border border-[#E7E8F0] rounded-lg px-3 py-2">2025/2026</div><div className="border border-[#E7E8F0] rounded-lg px-3 py-2">2026/2027</div></div><button className="btn-secondary text-xs !py-1.5 mt-3">+ Add year</button></div>
  <div className="card p-5"><h3 className="font-display font-bold mb-3 text-sm">Semesters</h3><div className="space-y-2 text-sm"><div className="border border-[#E7E8F0] rounded-lg px-3 py-2">Semester 1</div><div className="border border-[#E7E8F0] rounded-lg px-3 py-2">Semester 2</div></div><button className="btn-secondary text-xs !py-1.5 mt-3">+ Add semester</button></div>
  <div className="card p-5"><h3 className="font-display font-bold mb-3 text-sm">Batches</h3><div className="space-y-2 text-sm"><div className="border border-[#E7E8F0] rounded-lg px-3 py-2">CS2023-A</div><div className="border border-[#E7E8F0] rounded-lg px-3 py-2">CS2023-B</div></div><button className="btn-secondary text-xs !py-1.5 mt-3">+ Add batch</button></div>
</div></div>
      </main>
    </div>
  );
}
