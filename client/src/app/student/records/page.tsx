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
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
};

// shown when there is no published final grade yet
const PENDING = "Pending";

const INITIAL_SEMESTERS: SemesterData[] = [];

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

interface EnrollmentRecord {
  semesterId: number | null;
  semesterName: string;
  course: CourseRecord;
}

const toList = (data: any): any[] =>
  Array.isArray(data) ? data : data?.content || data?.dataList || [];

export default function StudentRecordsPage() {
  const { user } = useAuth();

  const { data: enrollmentsData } = useQuery({
    queryKey: ["student-records-enrollments", user?.userId],
    queryFn: () => (user?.userId ? api.get<any[]>(`/api/v1/enrollments/student/${user.userId}`) : Promise.resolve([])),
    enabled: !!user?.userId,
  });

  const { data: rawSemesters } = useQuery({
    queryKey: ["semesters"],
    queryFn: () => api.get<any[]>("/api/v1/semesters"),
  });

  // server keeps status in lowercase, so compare without case
  const recordEnrollments = toList(enrollmentsData).filter((e: any) =>
    ["active", "enrolled", "completed"].includes(String(e.status || "").toLowerCase())
  );

  // load credits and final grade for each enrolled course
  const { data: records, error: recordsError } = useQuery({
    queryKey: ["student-records-details", user?.userId, recordEnrollments.map((e: any) => e.offeringId).join(",")],
    enabled: !!user?.userId && recordEnrollments.length > 0,
    queryFn: async (): Promise<EnrollmentRecord[]> => {
      return Promise.all(
        recordEnrollments.map(async (e: any) => {
          const offering = await api.get<any>(`/api/v1/course-offerings/${e.offeringId}`);
          const course = offering?.courseId ? await api.get<any>(`/api/v1/courses/${offering.courseId}`) : null;
          const credits = Number(course?.credits ?? course?.creditHours ?? 0);

          // grade comes from the published final exam result
          let grade = PENDING;
          const exams = toList(await api.get<any>(`/api/v1/exams/offering/${e.offeringId}`));
          const finalExam = exams.find((x: any) => String(x.examType || "").toLowerCase() === "final");
          if (finalExam) {
            try {
              const result = await api.get<any>(`/api/v1/exam-results/student/${user?.userId}?examId=${finalExam.examId}`);
              const letter = String(result?.grade || "").trim().toUpperCase();
              if (result?.publishedAt && letter in GRADE_POINTS) grade = letter;
            } catch {
              // no result yet or not published, so it stays pending
            }
          }

          return {
            semesterId: offering?.semesterId ?? null,
            semesterName: offering?.semesterName || offering?.semesterLabel || "",
            course: {
              code: e.courseCode || offering?.courseCode || "CRS",
              name: e.courseName || offering?.courseName || "Course",
              credits,
              grade,
              points: grade === PENDING ? 0 : GRADE_POINTS[grade],
            },
          };
        })
      );
    },
  });

  useEffect(() => {
    if (recordsError) alert((recordsError as Error).message || "Failed to load academic records");
  }, [recordsError]);

  const semesterList = toList(rawSemesters);

  // group the courses by semester, in the same order as the semester list
  const semesters: SemesterData[] = (() => {
    const groups = new Map<string, { order: number; name: string; courses: CourseRecord[] }>();
    (records || []).forEach((r) => {
      const key = r.semesterId != null ? String(r.semesterId) : "none";
      const idx = semesterList.findIndex((s: any) => s.semesterId === r.semesterId);
      if (!groups.has(key)) {
        groups.set(key, {
          order: idx >= 0 ? idx : semesterList.length,
          name: r.semesterName || (idx >= 0 ? semesterList[idx].name : "") || "Semester",
          courses: [],
        });
      }
      groups.get(key)!.courses.push(r.course);
    });

    return Array.from(groups.values())
      .sort((a, b) => a.order - b.order)
      .map((g) => {
        // pending courses are not part of the GPA
        const graded = g.courses.filter((c) => c.grade !== PENDING);
        const credits = graded.reduce((sum, c) => sum + c.credits, 0);
        const quality = graded.reduce((sum, c) => sum + c.points * c.credits, 0);
        return {
          semester: g.name,
          gpa: credits > 0 ? Number((quality / credits).toFixed(2)) : 0,
          credits,
          courses: g.courses,
        };
      });
  })();

  const [selectedSemIdx, setSelectedSemIdx] = useState(0);

  
  const [hypotheticalGrades, setHypotheticalGrades] = useState<Record<string, string>>({});

  const currentSem = semesters[selectedSemIdx] || semesters[0];

  const totalCredits = semesters.reduce((sum, s) => sum + s.credits, 0);
  const actualCgpa = totalCredits > 0 ? (
    semesters.reduce((sum, s) => sum + s.gpa * s.credits, 0) / totalCredits
  ).toFixed(2) : "0.00";

  
  const calculateSimulatedGpa = () => {
    let totalQualityPoints = 0;
    let totalCreds = 0;

    semesters.forEach((sem) => {
      sem.courses.forEach((course) => {
        const gradeKey = hypotheticalGrades[course.code] || course.grade;
        const pts = GRADE_POINTS[gradeKey];
        // skip courses that still have no grade
        if (pts === undefined) return;
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
    const studentName = user?.fullName || "Student User";
    const studentId = `STU-${user?.userId || "2026"}`;
    let transcriptText = `
============================================================
           UNILEARN OFFICIAL ACADEMIC TRANSCRIPT
============================================================
Student Name: ${studentName}
Student ID  : ${studentId}
Overall CGPA: ${actualCgpa}
Total Credits: ${totalCredits} (pending courses are not counted)

------------------------------------------------------------
`;

    semesters.forEach((sem) => {
      transcriptText += `\n${sem.semester.toUpperCase()} (Semester GPA: ${sem.gpa.toFixed(2)})\n`;
      transcriptText += `Code     | Course Name                         | Cr | Grade   | Points\n`;
      transcriptText += `------------------------------------------------------------\n`;
      sem.courses.forEach((c) => {
        transcriptText += `${c.code.padEnd(8)} | ${c.name.padEnd(35)} | ${String(c.credits).padEnd(2)} | ${c.grade.padEnd(7)} | ${c.grade === PENDING ? "-" : c.points.toFixed(2)}\n`;
      });
    });

    transcriptText += `\n============================================================\nIssued on: ${new Date().toLocaleDateString("en-US")}\n============================================================\n`;

    const blob = new Blob([transcriptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AcademicTranscript_${studentName.replace(/\s+/g, "_")}.txt`;
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
          <p className="text-[11px] text-[var(--outline)] mt-1">Pending courses are not counted</p>
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
          {currentSem?.courses ? (
            currentSem.courses.map((course) => {
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
                      {course.grade === PENDING && <option value={PENDING}>{PENDING}</option>}
                      {Object.keys(GRADE_POINTS).map((g) => (
                        <option key={g} value={g}>
                          {g} ({GRADE_POINTS[g].toFixed(1)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-[var(--on-surface-variant)] text-center py-4">No course records found for the selected semester.</p>
          )}
        </div>
      </div>

      
      {currentSem ? (
        <div className="card p-4 sm:p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--outline-variant)] pb-3">
            <h3 className="font-display font-bold text-base text-[var(--on-surface)]">
              Course Grade History — {currentSem.semester}
            </h3>
            <span className="badge bg-[var(--surface-container-high)] text-[var(--on-surface)] self-start sm:self-auto">
              Semester GPA: {currentSem.gpa}
            </span>
          </div>

          {/* Mobile Card View (< md) */}
          <div className="md:hidden divide-y divide-[var(--outline-variant)]">
            {currentSem.courses.map((course) => (
              <div key={course.code} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--tertiary)]">{course.code}</span>
                  <span className="badge badge-accent font-bold">{course.grade}</span>
                </div>
                <p className="text-xs font-semibold text-[var(--on-surface)]">{course.name}</p>
                <div className="flex items-center justify-between text-[11px] text-[var(--on-surface-variant)] pt-1">
                  <span>Credits: <b className="text-[var(--on-surface)]">{course.credits}</b></span>
                  <span>Grade Points: <b className="font-mono text-[var(--on-surface)]">{course.grade === PENDING ? "-" : course.points.toFixed(2)}</b></span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
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
                    <td className="p-3 font-mono font-bold">{course.grade === PENDING ? "-" : course.points.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-center text-xs text-[var(--on-surface-variant)]">
          No semester records available.
        </div>
      )}
    </main>
  );
}
