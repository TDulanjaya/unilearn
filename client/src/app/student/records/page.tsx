"use client";
import StudentNavbar from "@/components/StudentNavbar";

export default function StudentRecordsPage() {
  return (
    <div>
      <StudentNavbar />
      <main className="max-w-[1200px] mx-auto px-8 py-7">
        <h1 className="font-display font-extrabold text-2xl mb-1">Academic records</h1>
        <p className="text-[#666B80] text-sm mb-6">Official transcripts, semester GPAs, and credit achievements.</p>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base">Semester Transcript — Year 2 Semester 1</h3>
            <button className="btn-secondary text-xs !py-1.5"><i className="ti ti-file-text"></i> Download Official Transcript</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#9CA0B3] text-xs">
                <th className="pb-2">Course Code</th>
                <th className="pb-2">Course Name</th>
                <th className="pb-2">Credits</th>
                <th className="pb-2">Grade</th>
                <th className="pb-2">Grade Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E8F0]">
              <tr><td className="py-2.5 font-semibold">SE201.2</td><td className="py-2.5">Data Structures & Algorithms</td><td className="py-2.5">4</td><td className="py-2.5"><span className="badge badge-success">A</span></td><td className="py-2.5">4.00</td></tr>
              <tr><td className="py-2.5 font-semibold">SE202.2</td><td className="py-2.5">Database Systems</td><td className="py-2.5">4</td><td className="py-2.5"><span className="badge badge-success">A-</span></td><td className="py-2.5">3.70</td></tr>
              <tr><td className="py-2.5 font-semibold">SE203.2</td><td className="py-2.5">Web Technologies</td><td className="py-2.5">3</td><td className="py-2.5"><span className="badge badge-success">B+</span></td><td className="py-2.5">3.30</td></tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
