"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";
export default function Page() {
  useInteractive();
  return (
    <div className="flex">
      <Sidebar role="examiner" name="Prof. A. Fernando" sub="Examiner · Faculty of Computing" />
      <main className="flex-1 px-8 py-7 max-w-[1300px]">
<h1 className="font-display font-extrabold text-2xl mb-1">Examiner dashboard</h1>
<p className="text-[#666B80] text-sm mb-6">Overview of upcoming exams and grading status.</p>
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
  <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Upcoming finals</p><p className="font-display font-extrabold text-2xl">5</p></div>
  <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Pending manual grading</p><p className="font-display font-extrabold text-2xl text-[#D97706]">27</p></div>
  <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Published results</p><p className="font-display font-extrabold text-2xl">8</p></div>
  <div className="card p-4"><p className="text-xs text-[#9CA0B3] mb-1">Question bank size</p><p className="font-display font-extrabold text-2xl">412</p></div>
</div>
<div className="grid lg:grid-cols-2 gap-5">
  <div className="card p-5">
    <h3 className="font-display font-bold mb-3">Upcoming final exams</h3>
    <table className="w-full text-sm"><tbody className="divide-y divide-[#E7E8F0]">
      <tr><td className="py-2.5 font-semibold">SE308.3 Software Process Mgmt</td><td className="py-2.5 text-right text-[#666B80]">Dec 12</td></tr>
      <tr><td className="py-2.5 font-semibold">SE201.2 Data Structures</td><td className="py-2.5 text-right text-[#666B80]">Dec 14</td></tr>
      <tr><td className="py-2.5 font-semibold">SE104.1 Discrete Mathematics</td><td className="py-2.5 text-right text-[#666B80]">Dec 16</td></tr>
    </tbody></table>
  </div>
  <div className="card p-5">
    <h3 className="font-display font-bold mb-3">Recently published results</h3>
    <table className="w-full text-sm"><tbody className="divide-y divide-[#E7E8F0]">
      <tr><td className="py-2.5 font-semibold">SE202.2 Database Systems — Mid-term</td><td className="py-2.5 text-right"><span className="badge badge-success">Published</span></td></tr>
      <tr><td className="py-2.5 font-semibold">SE105.1 Intro to Programming</td><td className="py-2.5 text-right"><span className="badge badge-success">Published</span></td></tr>
    </tbody></table>
  </div>
</div>
      </main>
    </div>
  );
}
