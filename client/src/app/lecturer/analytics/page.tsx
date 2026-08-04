"use client";

import { useState } from "react";
import LecturerNavbar from "@/components/LecturerNavbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
} from "recharts";

const gradeDistributionData = [
  { range: "A+ (90-100)", count: 14, fill: "var(--tertiary)" },
  { range: "A (80-89)", count: 28, fill: "var(--tertiary)" },
  { range: "B (70-79)", count: 35, fill: "var(--secondary)" },
  { range: "C (60-69)", count: 18, fill: "var(--secondary)" },
  { range: "D (50-59)", count: 8, fill: "#f59e0b" },
  { range: "F (<50)", count: 4, fill: "#ef4444" },
];

const submissionTimelineData = [
  { date: "Day 1", count: 12 },
  { date: "Day 2", count: 25 },
  { date: "Day 3", count: 45 },
  { date: "Day 4", count: 68 },
  { date: "Day 5 (Due)", count: 102 },
  { date: "Late (+1d)", count: 5 },
];

interface AtRiskStudent {
  id: string;
  name: string;
  indexNo: string;
  courseCode: string;
  attendancePct: number;
  avgScorePct: number;
  riskLevel: "High" | "Medium" | "Low";
  reason: string;
}

export default function LecturerAnalyticsPage() {
  const [selectedCourse, setSelectedCourse] = useState("SE308.3");

  const atRiskStudents: AtRiskStudent[] = [
    { id: "1", name: "Sahan Jayawardena", indexNo: "SE/2023/088", courseCode: "SE308.3", attendancePct: 52, avgScorePct: 44, riskLevel: "High", reason: "Low Attendance & Failing Midterm" },
    { id: "2", name: "Kavindi Ranasinghe", indexNo: "SE/2023/041", courseCode: "SE308.3", attendancePct: 65, avgScorePct: 58, riskLevel: "Medium", reason: "2 Missing Assignment Submissions" },
    { id: "3", name: "Nipuna Mendis", indexNo: "SE/2023/102", courseCode: "SE202.2", attendancePct: 58, avgScorePct: 49, riskLevel: "High", reason: "Multiple Unexcused Absences" },
    { id: "4", name: "Chathuri Wickramasinghe", indexNo: "SE/2023/019", courseCode: "SE308.3", attendancePct: 74, avgScorePct: 61, riskLevel: "Low", reason: "Declining Quiz Scores" },
  ];

  const filteredRiskList = atRiskStudents.filter((s) => s.courseCode === selectedCourse);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)] pb-12">
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)]">
              Course Learning Analytics
            </h1>
            <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm mt-1">
              Visualizing grade bell curves, submission timelines, and early-warning at-risk indicators.
            </p>
          </div>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] self-start sm:self-auto"
          >
            <option value="SE308.3">SE308.3 — Software Process Management</option>
            <option value="SE202.2">SE202.2 — Database Systems</option>
          </select>
        </div>

        
        <div className="grid lg:grid-cols-2 gap-6">
          
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] flex items-center gap-2">
                <i className="ti ti-chart-bar text-[var(--tertiary)]"></i> Grade Distribution Bell Curve
              </h3>
              <span className="badge badge-accent text-[10px]">Cohort Total: 107</span>
            </div>

            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: "var(--on-surface-variant)" }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: "var(--on-surface-variant)" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--surface-container-lowest)", borderColor: "var(--outline-variant)", borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {gradeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] flex items-center gap-2">
                <i className="ti ti-timeline text-[var(--tertiary)]"></i> Assignment Submission Pacing
              </h3>
              <span className="badge badge-success text-[10px]">95% On-Time Submission Rate</span>
            </div>

            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={submissionTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--tertiary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--tertiary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--on-surface-variant)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--on-surface-variant)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--surface-container-lowest)", borderColor: "var(--outline-variant)", borderRadius: "12px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="count" stroke="var(--tertiary)" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
            <div>
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
                <i className="ti ti-alert-triangle text-amber-500"></i> Early-Warning At-Risk Students ({filteredRiskList.length})
              </h3>
              <p className="text-xs text-[var(--on-surface-variant)]">Students identified based on low attendance and declining marks.</p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredRiskList.map((student) => (
              <div key={student.id} className="p-4 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-lowest)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-container-low)] transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm text-[var(--on-surface)] truncate">{student.name}</p>
                    <span className="text-xs text-[var(--on-surface-variant)]">({student.indexNo})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${student.riskLevel === "High" ? "bg-red-500/10 text-red-600 border border-red-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"}`}>
                      {student.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-xs text-[var(--on-surface-variant)]">
                    Trigger: <span className="font-semibold text-[var(--on-surface)]">{student.reason}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right text-xs">
                    <p className="font-bold text-[var(--on-surface)]">Attn: {student.attendancePct}%</p>
                    <p className="text-[10px] text-[var(--on-surface-variant)]">Avg Score: {student.avgScorePct}%</p>
                  </div>
                  <button onClick={() => alert(`Support notice sent to ${student.name}!`)} className="btn-secondary text-xs !py-1.5 shadow-sm">
                    <i className="ti ti-mail"></i> Send Support Notice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
