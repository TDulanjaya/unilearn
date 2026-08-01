"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";
export default function Page() {
  useInteractive();
  return (
    <div className="flex">
      <Sidebar role="examiner" name="Prof. A. Fernando" sub="Examiner · Faculty of Computing" />
      <main className="flex-1 px-8 py-7 max-w-[1300px]">
<h1 className="font-display font-extrabold text-2xl mb-1">Grading & results</h1>
<p className="text-[#666B80] text-sm mb-5">SE308.3 — Software Process Management, Mid-term exam</p>
<div className="flex gap-1 mb-5 border-b border-[#E7E8F0]" data-tabgroup="gres">
  <span className="tab-btn active" data-tab="grade">Manual grading</span>
  <span className="tab-btn" data-tab="pub">Publish results</span>
  <span className="tab-btn" data-tab="sheet">Result sheets</span>
</div>
<div id="gres-grade" data-tabpanel="gres">
<div className="card p-5 max-w-2xl">
  <p className="text-xs text-[#9CA0B3] font-semibold mb-1">Question 7 of 20 · Essay · 10 marks</p>
  <p className="text-sm font-medium mb-3">Explain the V-model of software development and its key phases.</p>
  <div className="border border-[#E7E8F0] rounded-lg p-3 text-sm text-[#666B80] mb-3">Student answer: "The V-model is a sequential development model where each development phase has a corresponding testing phase..."</div>
  <div className="flex items-center gap-3 mb-3"><input type="number" placeholder="Marks" className="w-24"/><span className="text-sm text-[#9CA0B3]">/ 10</span></div>
  <div className="flex justify-between"><button className="btn-secondary">Previous</button><button className="btn-primary">Save & next</button></div>
</div></div>
<div id="gres-pub" data-tabpanel="gres" className="hidden">
<div className="card p-5">
  <div className="flex items-center gap-6 mb-4 text-sm"><span>Average: <b>68%</b></span><span>Pass rate: <b>82%</b></span><span>Total students: <b>61</b></span></div>
  <table className="w-full text-sm mb-4"><thead><tr className="text-left text-[#9CA0B3] text-xs"><th className="pb-2">Student</th><th className="pb-2">Score</th><th className="pb-2">Grade</th></tr></thead>
  <tbody className="divide-y divide-[#E7E8F0]">
    <tr><td className="py-2">Nadeesha Silva</td><td className="py-2">76%</td><td className="py-2">B+</td></tr>
    <tr><td className="py-2">Ishara Fonseka</td><td className="py-2">61%</td><td className="py-2">C+</td></tr>
  </tbody></table>
  <button className="btn-primary">Publish results</button>
</div></div>
<div id="gres-sheet" data-tabpanel="gres" className="hidden">
<div className="card p-5 max-w-xl">
  <div className="grid sm:grid-cols-2 gap-3 mb-4">
    <select><option>SE308.3 Software Process Mgmt</option></select>
    <select><option>Batch CS2023-A</option></select>
  </div>
  <div className="border border-[#E7E8F0] rounded-lg p-4 mb-4 text-sm text-[#666B80]">Preview: result sheet for 61 students, including score, grade, and rank.</div>
  <div className="flex gap-2"><button className="btn-secondary"><i className="ti ti-file-type-pdf"></i> Export PDF</button><button className="btn-secondary"><i className="ti ti-file-spreadsheet"></i> Export Excel</button></div>
</div></div>
      </main>
    </div>
  );
}
