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

const GRADE_POINTS: Record<string, number> = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  F: 0.0,
};

const INITIAL_SEMESTERS: SemesterData[] = [
  {
    semester: "Year 2 Semester 1",
    gpa: 3.67,
    credits: 11,
    courses: [
      { code: "SE201.2", name: "Data Structures & Algorithms", credits: 4, grade: "A", points: 4.0 },
      { code: "SE202.2", name: "Database Systems", credits: 4, grade: "A-", points: 3.7 },
      { code: "SE203.2", name: "Web Technologies", credits: 3, grade: "B+", points: 3.3 },
    ],
  },
  {
    semester: "Year 1 Semester 2",
    gpa: 3.78,
    credits: 14,
    courses: [
      { code: "SE104.1", name: "Object Oriented Programming", credits: 4, grade: "A", points: 4.0 },
      { code: "SE105.1", name: "Computer Architecture", credits: 3, grade: "A-", points: 3.7 },
      { code: "SE106.1", name: "Discrete Mathematics", credits: 3, grade: "A", points: 4.0 },
      { code: "SE107.1", name: "Software Engineering Fundamentals", credits: 4, grade: "B+", points: 3.3 },
    ],
  },
];

export default function StudentRecordsPage() {
  const [selectedSemIdx, setSelectedSemIdx] = useState(0);

  
  const [hypotheticalGrades, setHypotheticalGrades] = useState<Record<string, string>>({});

  const currentSem = INITIAL_SEMESTERS[selectedSemIdx];

  const totalCredits = INITIAL_SEMESTERS.reduce((sum, s) => sum + s.credits, 0);
  const actualCgpa = (
    INITIAL_SEMESTERS.reduce((sum, s) => sum + s.gpa * s.credits, 0) / totalCredits
  ).toFixed(2);

  
  const calculateSimulatedGpa = () => {
    let totalQualityPoints = 0;
    let totalCreds = 0;

    INITIAL_SEMESTERS.forEach((sem) => {
      sem.courses.forEach((course) => {
        const gradeKey = hypotheticalGrades[course.code] || course.grade;
        const pts = GRADE_POINTS[gradeKey] ?? course.points;
        totalQualityPoints += pts * course.credits;
        totalCreds += course.credits;
      });
    });

    return totalCreds > 0 ? (totalQualityPoints / totalCreds).toFixed(2) : actualCgpa;
  };

  const simulatedCgpa = calculateSimulatedGpa();

  const handleGradeChange = (code: string, newGrade: string) => {
    setHypotheticalGrades((prev) => ({
      ...prev,
      [code]: newGrade,
    }));
  };

  const handleResetSimulator = () => {
    setHypotheticalGrades({});
  };

  const handleDownloadTranscript = () => {
    let transcriptText = `
============================================================
           UNILEARN OFFICIAL ACADEMIC TRANSCRIPT
============================================================
Student Name: Nadeesha Silva
Student ID  : SE-2023-042
Degree      : Bachelor of Science (Hons) in Software Engineering
Overall CGPA: ${actualCgpa}
Total Credits: ${totalCredits}

------------------------------------------------------------
`;

    INITIAL_SEMESTERS.forEach((sem) => {
      transcriptText += `\n${sem.semester.toUpperCase()} (Semester GPA: ${sem.gpa.toFixed(2)})\n`;
      transcriptText += `Code     | Course Name                         | Cr | Grade | Points\n`;
      transcriptText += `------------------------------------------------------------\n`;
      sem.courses.forEach((c) => {
        transcriptText += `${c.code.padEnd(8)} | ${c.name.padEnd(35)} | ${c.credits}  | ${c.grade.padEnd(5)} | ${c.points.toFixed(2)}\n`;
      });
    });

    transcriptText += `\n============================================================\nIssued on: ${new Date().toLocaleDateString("en-US")}\n============================================================\n`;

    const blob = new Blob([transcriptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AcademicTranscript_Nadeesha_Silva.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Academic Records & Transcripts
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Single source of truth for cumulative GPA, semester breakdown, and grade history.
          </p>
        </div>

        <button
          onClick={handleDownloadTranscript}
          className="btn-primary text-xs !py-2.5 !px-5 shadow-md flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <i className="ti ti-file-download text-base"></i> Download Transcript (.txt)
        </button>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
          <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-1">Cumulative CGPA</p>
          <p className="font-display font-extrabold text-3xl text-[var(--tertiary)]">{actualCgpa}</p>
          <p className="text-[11px] text-[var(--outline)] mt-1">Based on {totalCredits} completed credits</p>
        </div>

        <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
          <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-1">Total Credits Earned</p>
          <p className="font-display font-extrabold text-3xl text-[var(--on-surface)]">{totalCredits}</p>
          <p className="text-[11px] text-[var(--outline)] mt-1">First Class Honors Track</p>
        </div>

        
        <div className="card p-6 border border-[var(--tertiary)]/50 bg-[var(--tertiary-container)]/10">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-[var(--tertiary)] font-bold flex items-center gap-1.5">
              <i className="ti ti-calculator text-base"></i> "What-If" Simulated CGPA
            </p>
            <span className="badge badge-warning text-[10px]">Simulated — not official</span>
          </div>
          <p className="font-display font-extrabold text-3xl text-[var(--tertiary)]">{simulatedCgpa}</p>
          {Object.keys(hypotheticalGrades).length > 0 && (
            <button
              onClick={handleResetSimulator}
              className="text-[11px] text-red-500 font-semibold hover:underline mt-1 block"
            >
              Reset simulated grades
            </button>
          )}
        </div>
      </div>

      
      <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
        <div className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-3">
          <div>
            <h3 className="font-display font-bold text-base text-[var(--on-surface)] flex items-center gap-2">
              <i className="ti ti-adjustments-horizontal text-[var(--tertiary)]"></i> Interactive "What-If" Grade Simulator
            </h3>
            <p className="text-xs text-[var(--on-surface-variant)]">
              Adjust hypothetical grades below to see live predictions of your target CGPA.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {currentSem.courses.map((course) => {
            const currentGrade = hypotheticalGrades[course.code] || course.grade;
            return (
              <div
                key={course.code}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)]/40"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-accent font-bold">{course.code}</span>
                    <span className="text-xs font-semibold text-[var(--on-surface)]">{course.name}</span>
                  </div>
                  <p className="text-[11px] text-[var(--on-surface-variant)] mt-0.5">
                    {course.credits} Credits · Official Grade: <b>{course.grade}</b>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--on-surface-variant)] font-semibold">Simulated Grade:</span>
                  <select
                    value={currentGrade}
                    onChange={(e) => handleGradeChange(course.code, e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--tertiary)] focus:outline-none focus:border-[var(--tertiary)]"
                  >
                    {Object.keys(GRADE_POINTS).map((g) => (
                      <option key={g} value={g}>
                        {g} ({GRADE_POINTS[g].toFixed(1)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      
      <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
        <div className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-3">
          <h3 className="font-display font-bold text-base text-[var(--on-surface)]">
            Course Grade History — {currentSem.semester}
          </h3>
          <span className="badge bg-[var(--surface-container-high)] text-[var(--on-surface)]">
            Semester GPA: {currentSem.gpa}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] font-bold uppercase text-[11px]">
              <tr>
                <th className="p-3">Course Code</th>
                <th className="p-3">Course Title</th>
                <th className="p-3">Credits</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Grade Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {currentSem.courses.map((course) => (
                <tr key={course.code} className="hover:bg-[var(--surface-container-low)]/50">
                  <td className="p-3 font-bold text-[var(--tertiary)]">{course.code}</td>
                  <td className="p-3 font-semibold text-[var(--on-surface)]">{course.name}</td>
                  <td className="p-3">{course.credits}</td>
                  <td className="p-3">
                    <span className="badge badge-accent font-bold">{course.grade}</span>
                  </td>
                  <td className="p-3 font-mono font-bold">{course.points.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
