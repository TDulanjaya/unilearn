"use client";

import { useState, useEffect } from "react";
import LecturerNavbar from "@/components/LecturerNavbar";
import DataTable from "@/components/DataTable";

interface Question {
  id: string;
  text: string;
  type: "MCQ" | "Essay" | "Short answer";
  marks: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface FlagEvent {
  id: string;
  studentName: string;
  indexNo: string;
  flagType: "Tab switch detected" | "Copy-paste detected" | "Window focus lost" | "Secondary window open";
  timestamp: string;
  severity: "Low" | "Medium" | "High";
  status: "Active" | "Warned" | "Paused" | "Terminated";
}

const INITIAL_QUESTIONS: Question[] = [
  { id: "q-1", text: "What is the primary goal of black-box testing?", type: "MCQ", marks: 2, difficulty: "Medium" },
  { id: "q-2", text: "Explain the V-model of software development.", type: "Essay", marks: 10, difficulty: "Hard" },
  { id: "q-3", text: "Define code coverage.", type: "Short answer", marks: 3, difficulty: "Easy" },
];

const INITIAL_FLAGS: FlagEvent[] = [
  { id: "flag-1", studentName: "Ishara Fonseka", indexNo: "SE/2023/018", flagType: "Tab switch detected", timestamp: "10:14:22 AM", severity: "High", status: "Active" },
  { id: "flag-2", studentName: "Tharindu Jayasuriya", indexNo: "SE/2023/055", flagType: "Window focus lost", timestamp: "10:15:04 AM", severity: "Medium", status: "Active" },
  { id: "flag-3", studentName: "Nipuna Mendis", indexNo: "SE/2023/102", flagType: "Copy-paste detected", timestamp: "10:16:11 AM", severity: "High", status: "Active" },
];

const STUDENT_NAMES = ["Bhanuka Mendis", "Sachini Ratnayake", "Amaya Jayawardena", "Ruwan Munaweera", "Dilan Wickrama"];
const FLAG_TYPES: FlagEvent["flagType"][] = ["Tab switch detected", "Copy-paste detected", "Window focus lost", "Secondary window open"];
const SEVERITIES: FlagEvent["severity"][] = ["Low", "Medium", "High"];

export default function LecturerExamsPage() {
  const [selectedOffering, setSelectedOffering] = useState("SE308.3 — Software Process Management (Batch CS2023-A)");
  const [activeTab, setActiveTab] = useState<"qb" | "build" | "proctoring">("qb");

  
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<"MCQ" | "Essay" | "Short answer">("MCQ");
  const [qMarks, setQMarks] = useState(5);
  const [qDifficulty, setQDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(["q-1", "q-2"]);
  const [examTimer, setExamTimer] = useState(120);

  
  const [flags, setFlags] = useState<FlagEvent[]>(INITIAL_FLAGS);

  
  useEffect(() => {
    if (activeTab !== "proctoring") return;
    const interval = setInterval(() => {
      const name = STUDENT_NAMES[Math.floor(Math.random() * STUDENT_NAMES.length)];
      const type = FLAG_TYPES[Math.floor(Math.random() * FLAG_TYPES.length)];
      const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
      const now = new Date().toLocaleTimeString();

      const newFlag: FlagEvent = {
        id: `flag-${Date.now()}`,
        studentName: name,
        indexNo: `SE/2023/0${Math.floor(10 + Math.random() * 80)}`,
        flagType: type,
        timestamp: now,
        severity: severity,
        status: "Active",
      };

      setFlags((prev) => [newFlag, ...prev.slice(0, 20)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) return;
    const created: Question = {
      id: `q-${Date.now()}`,
      text: qText.trim(),
      type: qType,
      marks: qMarks,
      difficulty: qDifficulty,
    };
    setQuestions([...questions, created]);
    setQText("");
  };

  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleProctorAction = (id: string, action: "Warned" | "Paused" | "Terminated") => {
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, status: action } : f)));
  };

  const totalAssembledMarks = questions
    .filter((q) => selectedQuestionIds.includes(q.id))
    .reduce((acc, q) => acc + q.marks, 0);

  const proctorColumns = [
    {
      header: "Timestamp",
      accessor: (row: FlagEvent) => (
        <span className="font-mono text-xs text-[var(--on-surface-variant)]">{row.timestamp}</span>
      ),
    },
    {
      header: "Student Name",
      accessor: (row: FlagEvent) => (
        <div>
          <p className="font-bold text-xs text-[var(--on-surface)]">{row.studentName}</p>
          <p className="text-[10px] text-[var(--outline)]">{row.indexNo}</p>
        </div>
      ),
    },
    {
      header: "Flag Event Type",
      accessor: (row: FlagEvent) => (
        <span className="font-semibold text-xs text-[var(--on-surface)] flex items-center gap-1.5">
          <i className="ti ti-alert-circle text-amber-500"></i> {row.flagType}
        </span>
      ),
    },
    {
      header: "Severity",
      accessor: (row: FlagEvent) => {
        const colors = {
          High: "bg-red-500/10 text-red-600 border-red-500/20",
          Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          Low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors[row.severity]}`}>
            {row.severity}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessor: (row: FlagEvent) => (
        <span className={`badge ${row.status === "Active" ? "badge-danger" : "badge-gray"}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row: FlagEvent) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleProctorAction(row.id, "Warned")}
            disabled={row.status === "Terminated"}
            className="px-2 py-1 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 disabled:opacity-40"
          >
            Warn
          </button>
          <button
            onClick={() => handleProctorAction(row.id, "Paused")}
            disabled={row.status === "Terminated"}
            className="px-2 py-1 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 disabled:opacity-40"
          >
            Pause
          </button>
          <button
            onClick={() => handleProctorAction(row.id, "Terminated")}
            disabled={row.status === "Terminated"}
            className="px-2 py-1 rounded text-[11px] font-semibold bg-red-500/10 text-red-600 hover:bg-red-500/20 disabled:opacity-40"
          >
            Terminate
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)] pb-12">
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
              Exam Authoring & Live Proctoring
            </h1>
            <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm">
              Question bank management, exam paper builder, and real-time live proctoring feed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[var(--on-surface-variant)] shrink-0">Course Offering:</label>
            <select
              value={selectedOffering}
              onChange={(e) => setSelectedOffering(e.target.value)}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
            >
              <option value="SE308.3 — Software Process Management (Batch CS2023-A)">
                SE308.3 — Software Process Management (Batch CS2023-A)
              </option>
              <option value="SE202.2 — Database Systems (Batch CS2023-A)">
                SE202.2 — Database Systems (Batch CS2023-A)
              </option>
              <option value="SE309.3 — Software Verification & Validation (Batch CS2023-B)">
                SE309.3 — Software Verification & Validation (Batch CS2023-B)
              </option>
            </select>
          </div>
        </div>

        
        <div className="flex gap-2 border-b border-[var(--outline-variant)]">
          <button
            onClick={() => setActiveTab("qb")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${activeTab === "qb" ? "border-[var(--tertiary)] text-[var(--tertiary)]" : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"}`}
          >
            <i className="ti ti-database mr-1.5"></i> Question Bank
          </button>
          <button
            onClick={() => setActiveTab("build")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${activeTab === "build" ? "border-[var(--tertiary)] text-[var(--tertiary)]" : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"}`}
          >
            <i className="ti ti-file-pencil mr-1.5"></i> Build Exam
          </button>
          <button
            onClick={() => setActiveTab("proctoring")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${activeTab === "proctoring" ? "border-[var(--tertiary)] text-[var(--tertiary)]" : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"}`}
          >
            <i className="ti ti-shield-check mr-1.5 text-red-500"></i> Live Exam Proctoring
          </button>
        </div>

        
        {activeTab === "qb" && (
          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Question Bank ({questions.length} Items)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] uppercase font-semibold">
                      <th className="pb-3 px-3">Question</th>
                      <th className="pb-3 px-3">Type</th>
                      <th className="pb-3 px-3">Marks</th>
                      <th className="pb-3 px-3">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--outline-variant)]">
                    {questions.map((q) => (
                      <tr key={q.id} className="hover:bg-[var(--surface-container-low)]">
                        <td className="py-3 px-3 font-medium text-[var(--on-surface)]">{q.text}</td>
                        <td className="py-3 px-3 text-[var(--on-surface-variant)]">{q.type}</td>
                        <td className="py-3 px-3 font-bold">{q.marks}</td>
                        <td className="py-3 px-3">
                          <span className={`badge ${q.difficulty === "Easy" ? "badge-success" : q.difficulty === "Medium" ? "badge-accent" : "badge-danger"}`}>
                            {q.difficulty}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            
            <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] self-start">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)]">
                Add New Question
              </h3>
              <form onSubmit={handleAddQuestion} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Question Type</label>
                  <select value={qType} onChange={(e) => setQType(e.target.value as any)} className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
                    <option value="MCQ">MCQ</option>
                    <option value="Essay">Essay</option>
                    <option value="Short answer">Short answer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Question Prompt</label>
                  <textarea rows={3} value={qText} onChange={(e) => setQText(e.target.value)} placeholder="Type question text..." className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" required></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Marks</label>
                    <input type="number" min={1} value={qMarks} onChange={(e) => setQMarks(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Difficulty</label>
                    <select value={qDifficulty} onChange={(e) => setQDifficulty(e.target.value as any)} className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full justify-center text-xs shadow-sm">
                  Save Question
                </button>
              </form>
            </div>
          </div>
        )}

        
        {activeTab === "build" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)]">
                Select Questions from Bank
              </h3>
              <div className="space-y-2.5">
                {questions.map((q) => {
                  const isChecked = selectedQuestionIds.includes(q.id);
                  return (
                    <label key={q.id} className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${isChecked ? "border-[var(--tertiary)] bg-[var(--surface-container-low)]" : "border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"}`}>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={isChecked} onChange={() => toggleQuestionSelection(q.id)} className="rounded text-[var(--tertiary)]" />
                        <span className="text-xs font-semibold text-[var(--on-surface)]">{q.text}</span>
                      </div>
                      <span className="badge badge-accent text-[10px] font-bold">{q.marks} marks</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] self-start">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)]">
                Assembled Exam Summary — {selectedQuestionIds.length} Questions ({totalAssembledMarks} Marks)
              </h3>
              <div className="space-y-2">
                {questions.filter((q) => selectedQuestionIds.includes(q.id)).map((q) => (
                  <div key={q.id} className="p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-xs flex justify-between">
                    <span className="font-semibold text-[var(--on-surface)]">{q.text}</span>
                    <span className="font-bold text-[var(--tertiary)]">{q.marks} Marks</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--on-surface)]">Exam Timer (Minutes)</label>
                <input type="number" value={examTimer} onChange={(e) => setExamTimer(Number(e.target.value))} className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]" />
              </div>

              <button onClick={() => alert("Exam paper draft saved successfully!")} className="btn-primary w-full justify-center text-xs shadow-md">
                Save Exam Draft
              </button>
            </div>
          </div>
        )}

        
        {activeTab === "proctoring" && (
          <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <h3 className="font-display font-bold text-base text-[var(--on-surface)]">
                  Live Exam Integrity Violation Feed ({selectedOffering})
                </h3>
              </div>
              <span className="text-xs text-[var(--on-surface-variant)]">
                Auto-updating feed ({flags.length} events logged)
              </span>
            </div>

            <DataTable data={flags} columns={proctorColumns} searchPlaceholder="Search flagged students or event types..." pageSize={10} />
          </div>
        )}
      </main>
    </div>
  );
}
