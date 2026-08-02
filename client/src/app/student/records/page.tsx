"use client";
import { useState } from "react";

interface CourseRecord {
  code: string;
  name: string;
  credits: number;
  grade: string;
  points: number;
}

interface SemesterData {
  semester: string;
  gpa: number;
  credits: number;
  courses: CourseRecord[];
}

const SEMESTERS: SemesterData[] = [
  {
    semester: "Year 2 Semester 1",
    gpa: 3.67,
    credits: 11,
    courses: [
      { code: "SE201.2", name: "Data Structures & Algorithms", credits: 4, grade: "A", points: 4.00 },
      { code: "SE202.2", name: "Database Systems", credits: 4, grade: "A-", points: 3.70 },
      { code: "SE203.2", name: "Web Technologies", credits: 3, grade: "B+", points: 3.30 },
    ],
  },
  {
    semester: "Year 1 Semester 2",
    gpa: 3.78,
    credits: 14,
    courses: [
      { code: "SE104.1", name: "Object Oriented Programming", credits: 4, grade: "A", points: 4.00 },
      { code: "SE105.1", name: "Computer Architecture", credits: 3, grade: "A-", points: 3.70 },
      { code: "SE106.1", name: "Discrete Mathematics", credits: 3, grade: "A", points: 4.00 },
      { code: "SE107.1", name: "Software Engineering Fundamentals", credits: 4, grade: "B+", points: 3.30 },
    ],
  },
  {
    semester: "Year 1 Semester 1",
    gpa: 3.70,
    credits: 15,
    courses: [
      { code: "SE101.1", name: "Programming Fundamentals (C/C++)", credits: 4, grade: "A", points: 4.00 },
      { code: "SE102.1", name: "Mathematics for Computing", credits: 4, grade: "A-", points: 3.70 },
      { code: "SE103.1", name: "Communication Skills", credits: 3, grade: "A", points: 4.00 },
      { code: "GEN101", name: "General English", credits: 4, grade: "B+", points: 3.30 },
    ],
  },
];

export default function StudentRecordsPage() {
  const [selectedSemIdx, setSelectedSemIdx] = useState(0);
  const currentSem = SEMESTERS[selectedSemIdx];

  const totalCredits = SEMESTERS.reduce((sum, s) => sum + s.credits, 0);
  const cgpa = (
    SEMESTERS.reduce((sum, s) => sum + s.gpa * s.credits, 0) / totalCredits
  ).toFixed(2);

  const handleDownloadTranscript = () => {
    let transcriptText = `
============================================================
           UNILEARN OFFICIAL ACADEMIC TRANSCRIPT
============================================================
Student Name: Nadeesha Silva
Student ID  : SE-2023-042
Degree      : Bachelor of Science (Hons) in Software Engineering
Faculty     : Computing & Information Technology
Overall CGPA: ${cgpa}
Total Credits: ${totalCredits}
Academic Standing: First Class Honors Candidate

------------------------------------------------------------
`;

    SEMESTERS.forEach((sem) => {
      transcriptText += `\n${sem.semester.toUpperCase()} (Semester GPA: ${sem.gpa.toFixed(2)})\n`;
      transcriptText += `Code     | Course Name                         | Cr | Grade | Points\n`;
      transcriptText += `------------------------------------------------------------\n`;
      sem.courses.forEach((c) => {
        transcriptText += `${c.code.padEnd(8)} | ${c.name.padEnd(35)} | ${c.credits}  | ${c.grade.padEnd(5)} | ${c.points.toFixed(2)}\n`;
      });
    });

    transcriptText += `\n============================================================\nIssued on: ${new Date().toLocaleDateString("en-US")}\nVerified by Registrar Office\n============================================================\n`;

    const blob = new Blob([transcriptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AcademicTranscript_Nadeesha_Silva.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
          Academic Records & Transcripts
        </h1>
        <p className="text-[var(--on-surface-variant)] text-sm">
          Official grades, semester credit breakdown, and CGPA trajectory.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] flex items-center justify-center text-xl font-bold">
            <i className="ti ti-chart-line"></i>
          </div>
          <div>
            <p className="text-xs text-[var(--on-surface-variant)] font-medium">Cumulative GPA (CGPA)</p>
            <h3 className="font-display font-extrabold text-2xl text-[var(--on-surface)]">{cgpa}</h3>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center text-xl font-bold">
            <i className="ti ti-school"></i>
          </div>
          <div>
            <p className="text-xs text-[var(--on-surface-variant)] font-medium">Total Credits Earned</p>
            <h3 className="font-display font-extrabold text-2xl text-[var(--on-surface)]">{totalCredits} <span className="text-xs font-normal text-[var(--outline)]">/ 120</span></h3>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--surface-container-high)] text-[var(--tertiary)] flex items-center justify-center text-xl font-bold">
            <i className="ti ti-trophy"></i>
          </div>
          <div>
            <p className="text-xs text-[var(--on-surface-variant)] font-medium">Academic Standing</p>
            <h3 className="font-display font-bold text-sm text-[var(--on-surface)]">First Class Honors</h3>
          </div>
        </div>
      </div>

      {/* Semester Selector Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--outline-variant)] overflow-x-auto">
        {SEMESTERS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedSemIdx(idx)}
            className={`tab-btn flex items-center gap-2 ${selectedSemIdx === idx ? "active" : ""}`}
          >
            <i className="ti ti-bookmark text-sm"></i>
            <span>{s.semester} (GPA: {s.gpa.toFixed(2)})</span>
          </button>
        ))}
      </div>

      {/* Semester Record Card */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-[var(--outline-variant)]">
          <div className="flex items-center gap-2">
            <i className="ti ti-certificate text-xl text-[var(--tertiary)]"></i>
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
              Semester Transcript — {currentSem.semester}
            </h3>
          </div>
          <button
            onClick={handleDownloadTranscript}
            className="btn-primary text-xs !py-1.5 shadow-sm"
          >
            <i className="ti ti-file-text mr-1.5"></i> Download Official Transcript
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[500px]">
            <thead>
              <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                <th className="pb-3 px-3 font-semibold">Course Code</th>
                <th className="pb-3 px-3 font-semibold">Course Title</th>
                <th className="pb-3 px-3 font-semibold">Credits</th>
                <th className="pb-3 px-3 font-semibold">Letter Grade</th>
                <th className="pb-3 px-3 font-semibold text-right">Grade Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {currentSem.courses.map((course, idx) => (
                <tr key={idx} className="table-row transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-[var(--on-surface)]">
                    {course.code}
                  </td>
                  <td className="py-3.5 px-3 text-[var(--on-surface)] font-medium">
                    {course.name}
                  </td>
                  <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">
                    {course.credits}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`badge ${course.grade.startsWith("A") ? "badge-success" : "badge-accent"}`}>
                      {course.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-right text-[var(--on-surface)]">
                    {course.points.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
