"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";
export default function Page() {
  useInteractive();
  return (
    <div className="flex">
      <Sidebar role="examiner" name="Prof. A. Fernando" sub="Examiner · Faculty of Computing" />
      <main className="flex-1 px-8 py-7 max-w-[1300px]">
<h1 className="font-display font-extrabold text-2xl mb-1">Exam workspace</h1>
<p className="text-[#666B80] text-sm mb-5">Manage the question bank, build exams, and schedule final exams.</p>
<div className="flex gap-1 mb-5 border-b border-[#E7E8F0]" data-tabgroup="ew">
  <span className="tab-btn active" data-tab="qb">Question bank</span>
  <span className="tab-btn" data-tab="build">Build exam</span>
  <span className="tab-btn" data-tab="sched">Schedule</span>
</div>
<div id="ew-qb" data-tabpanel="ew">
<div className="grid lg:grid-cols-[1fr_360px] gap-5">
  <div className="card p-5">
    <div className="flex items-center gap-3 mb-4">
      <select className="w-40"><option>All courses</option></select>
      <select className="w-32"><option>Difficulty</option></select>
      <input type="text" placeholder="Search questions" className="flex-1"/>
    </div>
    <table className="w-full text-sm"><thead><tr className="text-left text-[#9CA0B3] text-xs"><th className="pb-2">Question</th><th className="pb-2">Type</th><th className="pb-2">Marks</th><th className="pb-2">Difficulty</th></tr></thead>
    <tbody className="divide-y divide-[#E7E8F0]">
      <tr><td className="py-2.5">What is the primary goal of black-box testing?</td><td className="py-2.5">MCQ</td><td className="py-2.5">2</td><td className="py-2.5"><span className="badge badge-accent">Medium</span></td></tr>
      <tr><td className="py-2.5">Explain the V-model of software development.</td><td className="py-2.5">Essay</td><td className="py-2.5">10</td><td className="py-2.5"><span className="badge badge-warning">Hard</span></td></tr>
      <tr><td className="py-2.5">Define code coverage.</td><td className="py-2.5">Short answer</td><td className="py-2.5">3</td><td className="py-2.5"><span className="badge badge-success">Easy</span></td></tr>
    </tbody></table>
  </div>
  <div className="card p-5">
    <h3 className="font-display font-bold mb-3">Add / edit question</h3>
    <select className="mb-3"><option>MCQ</option><option>Essay</option><option>Short answer</option></select>
    <textarea rows={2} placeholder="Question text" className="mb-3"></textarea>
    <div className="space-y-1.5 mb-3">
      <label className="flex items-center gap-2 text-sm"><input type="radio" name="opt" checked/> Verify code correctness</label>
      <label className="flex items-center gap-2 text-sm"><input type="radio" name="opt"/> Measure performance</label>
    </div>
    <div className="grid grid-cols-2 gap-2 mb-3"><input type="number" placeholder="Marks"/><input type="text" placeholder="Topic tag"/></div>
    <button className="btn-primary w-full justify-center">Save question</button>
  </div>
</div></div>
<div id="ew-build" data-tabpanel="ew" className="hidden">
<div className="grid lg:grid-cols-2 gap-5">
  <div className="card p-5">
    <h3 className="font-display font-bold mb-3">Question bank</h3>
    <div className="space-y-2">
      <label className="flex items-center gap-2 border border-[#E7E8F0] rounded-lg px-3 py-2 text-sm"><input type="checkbox" checked/> Black-box testing goal (2 marks)</label>
      <label className="flex items-center gap-2 border border-[#E7E8F0] rounded-lg px-3 py-2 text-sm"><input type="checkbox" checked/> V-model explanation (10 marks)</label>
      <label className="flex items-center gap-2 border border-[#E7E8F0] rounded-lg px-3 py-2 text-sm"><input type="checkbox"/> Code coverage definition (3 marks)</label>
    </div>
  </div>
  <div className="card p-5">
    <h3 className="font-display font-bold mb-3">Assembled exam — 2 questions, 12 marks</h3>
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 border border-[#E7E8F0] rounded-lg px-3 py-2 text-sm"><i className="ti ti-grip-vertical text-[#9CA0B3]"></i> Black-box testing goal — 2 marks</div>
      <div className="flex items-center gap-2 border border-[#E7E8F0] rounded-lg px-3 py-2 text-sm"><i className="ti ti-grip-vertical text-[#9CA0B3]"></i> V-model explanation — 10 marks</div>
    </div>
    <input type="number" placeholder="Timer (minutes)" className="mb-3"/>
    <button className="btn-primary w-full justify-center">Save exam draft</button>
  </div>
</div></div>
<div id="ew-sched" data-tabpanel="ew" className="hidden">
<div className="card p-5 max-w-xl">
  <div className="grid sm:grid-cols-2 gap-3 mb-3">
    <select><option>SE308.3 Software Process Mgmt</option></select>
    <select><option>Batch CS2023-A</option></select>
  </div>
  <div className="grid sm:grid-cols-2 gap-3 mb-3">
    <input type="date"/><input type="time"/>
  </div>
  <div className="grid sm:grid-cols-2 gap-3 mb-3">
    <input type="text" placeholder="Venue"/><input type="number" placeholder="Duration (min)"/>
  </div>
  <div className="flex items-center gap-2 bg-[#FEF3C7] text-[#92400E] text-sm rounded-lg px-3 py-2 mb-3"><i className="ti ti-alert-triangle"></i> No conflicts detected for this batch.</div>
  <button className="btn-primary">Schedule final exam</button>
</div></div>
      </main>
    </div>
  );
}
