"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";
export default function Page() {
  useInteractive();
  return (
    <div className="flex">
      <Sidebar role="examiner" name="Prof. A. Fernando" sub="Examiner · Faculty of Computing" />
      <main className="flex-1 px-8 py-7 max-w-[1300px]">
<h1 className="font-display font-extrabold text-2xl mb-1">Proctoring & statistics</h1>
<p className="text-[#666B80] text-sm mb-5">SE201.2 Data Structures — Final exam, live now</p>
<div className="flex gap-1 mb-5 border-b border-[#E7E8F0]" data-tabgroup="prst">
  <span className="tab-btn active" data-tab="proc">Live proctoring</span>
  <span className="tab-btn" data-tab="stat">Statistics</span>
</div>
<div id="prst-proc" data-tabpanel="prst"><div className='grid sm:grid-cols-3 gap-4'>
<div className="card p-4 ">
  <div className="flex items-center gap-2 mb-2"><div className="avatar w-7 h-7 text-[10px]">N</div><span className="text-sm font-semibold flex-1">Nadeesha Silva</span></div>
  <div className="progress-track mb-1"><div className="progress-fill" style={{width:'64%'}}></div></div>
  <p className="text-xs text-[#9CA0B3]">64% complete</p>
</div>
<div className="card p-4 border-[#DC2626]">
  <div className="flex items-center gap-2 mb-2"><div className="avatar w-7 h-7 text-[10px]">I</div><span className="text-sm font-semibold flex-1">Ishara Fonseka</span><span className="badge badge-danger">Flagged</span></div>
  <div className="progress-track mb-1"><div className="progress-fill" style={{width:'40%'}}></div></div>
  <p className="text-xs text-[#9CA0B3]">40% complete</p>
</div>
<div className="card p-4 ">
  <div className="flex items-center gap-2 mb-2"><div className="avatar w-7 h-7 text-[10px]">K</div><span className="text-sm font-semibold flex-1">Kasun Perera</span></div>
  <div className="progress-track mb-1"><div className="progress-fill" style={{width:'88%'}}></div></div>
  <p className="text-xs text-[#9CA0B3]">88% complete</p>
</div>
<div className="card p-4 border-[#DC2626]">
  <div className="flex items-center gap-2 mb-2"><div className="avatar w-7 h-7 text-[10px]">T</div><span className="text-sm font-semibold flex-1">Tharindu Jayasuriya</span><span className="badge badge-danger">Flagged</span></div>
  <div className="progress-track mb-1"><div className="progress-fill" style={{width:'22%'}}></div></div>
  <p className="text-xs text-[#9CA0B3]">22% complete</p>
</div>
<div className="card p-4 ">
  <div className="flex items-center gap-2 mb-2"><div className="avatar w-7 h-7 text-[10px]">S</div><span className="text-sm font-semibold flex-1">Sanduni Bandara</span></div>
  <div className="progress-track mb-1"><div className="progress-fill" style={{width:'71%'}}></div></div>
  <p className="text-xs text-[#9CA0B3]">71% complete</p>
</div>
<div className="card p-4 ">
  <div className="flex items-center gap-2 mb-2"><div className="avatar w-7 h-7 text-[10px]">D</div><span className="text-sm font-semibold flex-1">Dilan Wickrama</span></div>
  <div className="progress-track mb-1"><div className="progress-fill" style={{width:'55%'}}></div></div>
  <p className="text-xs text-[#9CA0B3]">55% complete</p>
</div></div></div>
<div id="prst-stat" data-tabpanel="prst" className="hidden">
<div className="grid lg:grid-cols-2 gap-5">
  <div className="card p-5">
    <h3 className="font-display font-bold mb-4">Score distribution</h3>
    <div className="flex items-end gap-3 h-40">
      <div className="flex-1 bg-[#EEEDFE] rounded-t" style={{height:'30%'}}></div>
      <div className="flex-1 bg-[#EEEDFE] rounded-t" style={{height:'55%'}}></div>
      <div className="flex-1 bg-accent rounded-t" style={{height:'90%'}}></div>
      <div className="flex-1 bg-[#EEEDFE] rounded-t" style={{height:'60%'}}></div>
      <div className="flex-1 bg-[#EEEDFE] rounded-t" style={{height:'25%'}}></div>
    </div>
  </div>
  <div className="card p-5">
    <h3 className="font-display font-bold mb-4">Pass / fail</h3>
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28"><svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90"><circle cx="18" cy="18" r="15.5" fill="none" stroke="#FEE2E2" stroke-width="4"></circle><circle cx="18" cy="18" r="15.5" fill="none" stroke="#16A34A" stroke-width="4" stroke-dasharray="82,100" stroke-linecap="round"></circle></svg><span className="absolute inset-0 flex items-center justify-center font-bold">82%</span></div>
      <div className="text-sm space-y-1"><p><span className="w-2.5 h-2.5 inline-block rounded-full bg-[#16A34A] mr-1"></span>Pass — 82%</p><p><span className="w-2.5 h-2.5 inline-block rounded-full bg-[#DC2626] mr-1"></span>Fail — 18%</p></div>
    </div>
  </div>
</div></div>
      </main>
    </div>
  );
}
