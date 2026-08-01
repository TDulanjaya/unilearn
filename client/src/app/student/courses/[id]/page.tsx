"use client";
import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

/* ─── Mock course lookup ─── */
const COURSES: Record<string, { code: string; title: string; lecturer: string; dept: string; progress: number }> = {
  "1": { code: "SE308.3", title: "Software Process Management", lecturer: "Dr. K. Perera", dept: "Software Eng.", progress: 75 },
  "2": { code: "SE202.2", title: "Database Systems", lecturer: "Dr. M. Rathnayake", dept: "Computer Science", progress: 90 },
  "3": { code: "SE309.3", title: "Software Verification & Validation", lecturer: "Prof. A. Fernando", dept: "Software Eng.", progress: 50 },
};

/* ─── Mock materials ─── */
const MOCK_MATERIALS = [
  { id: 1, title: "Lecture 01 — Introduction to Software Processes", type: "PDF", date: "Jul 10, 2026" },
  { id: 2, title: "Lecture 02 — CMMI & Process Maturity Models", type: "PDF", date: "Jul 17, 2026" },
  { id: 3, title: "Tutorial 01 — SDLC Comparison Worksheet", type: "DOCX", date: "Jul 20, 2026" },
  { id: 4, title: "Lecture 03 — Agile Frameworks & Scrum", type: "PPTX", date: "Jul 24, 2026" },
];

/* ─── Mock assignments ─── */
const MOCK_ASSIGNMENTS = [
  { id: 1, title: "Assignment 1: SDLC Case Study Analysis", due: "Aug 05, 2026", status: "Submitted", grade: "A-" },
  { id: 2, title: "Assignment 2: Test Case Design Document", due: "Aug 18, 2026", status: "Pending", grade: null },
  { id: 3, title: "Lab Report: Unit Testing with JUnit", due: "Jul 28, 2026", status: "Graded", grade: "B+" },
];

/* ─── MCQ bank (per-course) ─── */
interface MCQQuestion { id: number; question: string; options: string[]; correctIndex: number }
const MCQ_BANKS: Record<string, MCQQuestion[]> = {
  "SE308.3": [
    { id: 1, question: "What is the primary goal of black-box testing?", options: ["To test internal implementation logic", "To verify functionality against software requirements", "To measure code coverage metrics", "To optimize memory usage"], correctIndex: 1 },
    { id: 2, question: "Which SDLC model incorporates risk analysis in every iteration?", options: ["Waterfall Model", "V-Model", "Spiral Model", "Big Bang Model"], correctIndex: 2 },
    { id: 3, question: "In Agile methodology, what is a Sprint Backlog?", options: ["List of all product features requested by customer", "Set of tasks selected for the current iteration", "Log of all fixed software bugs", "Documentation of software architecture"], correctIndex: 1 },
  ],
  "SE202.2": [
    { id: 1, question: "What does ACID stand for in database transactions?", options: ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Integrity, Design", "Atomicity, Concurrency, Isolation, Design", "Access, Consistency, Integrity, Durability"], correctIndex: 0 },
    { id: 2, question: "Which normal form eliminates transitive dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], correctIndex: 2 },
    { id: 3, question: "What type of join returns all rows from both tables?", options: ["INNER JOIN", "LEFT JOIN", "FULL OUTER JOIN", "CROSS JOIN"], correctIndex: 2 },
  ],
  "SE309.3": [
    { id: 1, question: "What is boundary value analysis?", options: ["Testing random inputs", "Testing values at the edges of input ranges", "Testing all possible inputs", "Testing only valid inputs"], correctIndex: 1 },
    { id: 2, question: "Which testing level verifies interactions between integrated modules?", options: ["Unit testing", "Integration testing", "System testing", "Acceptance testing"], correctIndex: 1 },
    { id: 3, question: "What is mutation testing?", options: ["Testing UI changes", "Introducing small faults to evaluate test effectiveness", "Testing database mutations", "Testing API endpoints"], correctIndex: 1 },
  ],
};

const STRUCTURED_BANKS: Record<string, { id: number; question: string; answer: string }[]> = {
  "SE308.3": [
    { id: 1, question: "Explain the difference between Verification and Validation in software quality assurance.", answer: "Verification checks whether software is built according to specified requirements ('Are we building the product right?'). Validation checks whether software fulfills customer needs ('Are we building the right product?')." },
    { id: 2, question: "Define Code Coverage and state two common types.", answer: "Code Coverage measures the degree to which source code is executed when a test suite runs. Two common types are Statement Coverage and Branch/Decision Coverage." },
  ],
  "SE202.2": [
    { id: 1, question: "What is database normalization and why is it important?", answer: "Database normalization organizes data to reduce redundancy and improve data integrity. It decomposes tables into smaller, well-structured tables linked by relationships." },
    { id: 2, question: "Explain the difference between clustered and non-clustered indexes.", answer: "A clustered index determines the physical order of data in a table (one per table). A non-clustered index creates a separate structure pointing to data rows (multiple allowed)." },
  ],
  "SE309.3": [
    { id: 1, question: "What is equivalence partitioning?", answer: "Equivalence partitioning divides input data into groups (partitions) where all values in a partition are expected to behave the same way, reducing the number of test cases needed." },
    { id: 2, question: "Explain the concept of test coverage criteria.", answer: "Test coverage criteria define measurable goals for testing completeness, such as statement coverage, branch coverage, and path coverage, helping determine when testing is sufficient." },
  ],
};

/* ─── Resource type ─── */
interface Resource { id: number; fileName: string; uploadedAt: string }

/* ─── Tab type ─── */
type Tab = "materials" | "assignments" | "resources" | "ai";

export default function CourseWorkspacePage() {
  const params = useParams();
  const courseId = (params.id as string) || "1";
  const course = COURSES[courseId] || COURSES["1"];
  const mcqBank = MCQ_BANKS[course.code] || MCQ_BANKS["SE308.3"];
  const structuredBank = STRUCTURED_BANKS[course.code] || STRUCTURED_BANKS["SE308.3"];

  /* Tab state */
  const [activeTab, setActiveTab] = useState<Tab>("materials");

  /* ─── Resources state ─── */
  const [resources, setResources] = useState<Resource[]>([
    { id: 1, fileName: "Chapter4_Notes.pdf", uploadedAt: "Jul 28, 2026" },
    { id: 2, fileName: "PastPaper_2025_Final.pdf", uploadedAt: "Jul 30, 2026" },
    { id: 3, fileName: "StudyGuide_Midterm.pdf", uploadedAt: "Aug 01, 2026" },
  ]);
  const [fileError, setFileError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    setFileError("");
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setFileError(`"${file.name}" rejected — only .pdf files are accepted.`);
      return;
    }
    const newRes: Resource = {
      id: Date.now(),
      fileName: file.name,
      uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    };
    setResources((prev) => [newRes, ...prev]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const startRename = (r: Resource) => { setEditingId(r.id); setEditName(r.fileName); };
  const confirmRename = () => {
    if (editingId && editName.trim()) {
      setResources((prev) => prev.map((r) => r.id === editingId ? { ...r, fileName: editName.trim() } : r));
    }
    setEditingId(null);
  };
  const deleteResource = (id: number) => setResources((prev) => prev.filter((r) => r.id !== id));

  /* ─── AI Quiz state ─── */
  const [quizState, setQuizState] = useState<"idle" | "loading" | "active" | "done">("idle");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: `Hello Nadeesha! I'm your AI Study Assistant for ${course.code}. Ask me anything about ${course.title} or request a quiz!` },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const startQuiz = () => {
    setQuizState("loading");
    setTimeout(() => { setQuizState("active"); setCurrentIdx(0); setSelectedOpt(null); setScore(0); }, 800);
  };
  const handleSelectOption = (idx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    if (idx === mcqBank[currentIdx].correctIndex) setScore((p) => p + 1);
  };
  const handleNextQuestion = () => {
    if (currentIdx + 1 < mcqBank.length) { setCurrentIdx((p) => p + 1); setSelectedOpt(null); }
    else setQuizState("done");
  };
  const toggleReveal = (id: number) => setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "ai", text: `Great question about "${userMsg}"! In ${course.title}, key concepts include process models, quality frameworks, and iterative improvement methodologies.` }]);
    }, 600);
  };

  /* ─── Tab definitions ─── */
  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "materials", label: "Materials", icon: "ti-book" },
    { key: "assignments", label: "Assignments", icon: "ti-clipboard-check" },
    { key: "resources", label: "My Resources", icon: "ti-folder" },
    { key: "ai", label: "AI Assistant", icon: "ti-sparkles" },
  ];

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--on-surface-variant)] mb-4 font-medium">
        <Link href="/student/courses" className="hover:text-[var(--tertiary)] transition-colors">My Courses</Link>
        <i className="ti ti-chevron-right text-[10px]"></i>
        <span className="text-[var(--on-surface)] font-semibold">{course.code}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="badge badge-accent">{course.code}</span>
          <span className="text-xs text-[var(--on-surface-variant)] font-medium">{course.lecturer} · {course.dept}</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)]">
          {course.title}
        </h1>
        <div className="mt-3 max-w-sm">
          <div className="progress-track mb-1"><div className="progress-fill" style={{ width: `${course.progress}%` }}></div></div>
          <p className="text-xs text-[var(--outline)] font-medium">{course.progress}% Course Completed</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--outline-variant)] overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`tab-btn flex items-center gap-1.5 ${activeTab === t.key ? "active" : ""}`}
          >
            <i className={`ti ${t.icon} text-sm`}></i>
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.split(" ").pop()}</span>
          </button>
        ))}
      </div>

      {/* ═══ Materials Tab ═══ */}
      {activeTab === "materials" && (
        <div className="card p-6">
          <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)] flex items-center gap-2">
            <i className="ti ti-book text-[var(--tertiary)] text-xl"></i> Course Materials
          </h3>
          <div className="space-y-2.5">
            {MOCK_MATERIALS.map((m) => (
              <div key={m.id} className="flex items-center justify-between border border-[var(--outline-variant)] rounded-xl px-4 py-3 hover:bg-[var(--surface-container-low)] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[var(--surface-container)] text-[var(--tertiary)] flex items-center justify-center shrink-0">
                    <i className="ti ti-file-text text-lg"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--on-surface)] truncate">{m.title}</p>
                    <p className="text-xs text-[var(--on-surface-variant)]">{m.type} · {m.date}</p>
                  </div>
                </div>
                <button className="btn-secondary text-xs !py-1.5 shrink-0 ml-3">
                  <i className="ti ti-download text-sm"></i> <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Assignments Tab ═══ */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          {MOCK_ASSIGNMENTS.map((a) => (
            <div key={a.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--on-surface)] mb-1">{a.title}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--on-surface-variant)]">
                  <span className="flex items-center gap-1"><i className="ti ti-calendar text-sm text-[var(--tertiary)]"></i> Due: {a.due}</span>
                  <span className={`badge ${a.status === "Submitted" ? "badge-accent" : a.status === "Graded" ? "badge-success" : "badge-warning"}`}>{a.status}</span>
                  {a.grade && <span className="badge badge-success">{a.grade}</span>}
                </div>
              </div>
              <button className="btn-secondary text-xs !py-1.5 shrink-0">{a.status === "Pending" ? "Submit" : "View"}</button>
            </div>
          ))}
        </div>
      )}

      {/* ═══ My Resources Tab ═══ */}
      {activeTab === "resources" && (
        <div className="space-y-6">
          {/* Privacy banner */}
          <div className="glass rounded-2xl p-4 flex items-center gap-3 border border-[var(--glass-border)]">
            <div className="w-9 h-9 rounded-xl bg-[var(--surface-container)] text-[var(--tertiary)] flex items-center justify-center shrink-0">
              <i className="ti ti-lock text-lg"></i>
            </div>
            <p className="text-xs text-[var(--on-surface-variant)] font-medium">
              <span className="font-bold text-[var(--on-surface)]">Personal resources are private</span> — visible only to you. Upload your study notes, past papers, and reference documents here.
            </p>
          </div>

          {/* Upload area */}
          <div
            className={`card p-6 border-2 border-dashed transition-colors ${isDragging ? "border-[var(--tertiary)] bg-[var(--surface-container-low)]" : "border-[var(--outline-variant)]"}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <i className="ti ti-cloud-upload text-3xl text-[var(--tertiary)] block mb-2"></i>
              <p className="text-sm font-semibold text-[var(--on-surface)] mb-1">Drag & drop a PDF file here</p>
              <p className="text-xs text-[var(--on-surface-variant)] mb-3">or click to browse • .pdf files only</p>
              <button onClick={() => fileRef.current?.click()} className="btn-secondary text-xs">
                <i className="ti ti-upload text-sm"></i> Choose File
              </button>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
            </div>
            {fileError && (
              <div className="mt-3 flex items-center gap-2 bg-[var(--error-container)] text-[var(--on-error-container)] text-xs font-semibold rounded-xl px-4 py-2.5 border border-[var(--outline-variant)]">
                <i className="ti ti-alert-circle text-base"></i> {fileError}
              </div>
            )}
          </div>

          {/* Resources list */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)] flex items-center gap-2">
              <i className="ti ti-folder text-[var(--tertiary)] text-xl"></i> Uploaded Resources
              <span className="badge badge-accent ml-auto">{resources.length}</span>
            </h3>
            {resources.length === 0 ? (
              <p className="text-sm text-[var(--on-surface-variant)] text-center py-6">No resources uploaded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {resources.map((r) => (
                  <div key={r.id} className="flex items-center justify-between border border-[var(--outline-variant)] rounded-xl px-4 py-3 hover:bg-[var(--surface-container-low)] transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-[var(--error-container)] text-[var(--on-error-container)] flex items-center justify-center shrink-0">
                        <i className="ti ti-file-type-pdf text-base"></i>
                      </div>
                      {editingId === r.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={confirmRename}
                          onKeyDown={(e) => e.key === "Enter" && confirmRename()}
                          className="flex-1 text-sm !py-1"
                          autoFocus
                        />
                      ) : (
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--on-surface)] truncate">{r.fileName}</p>
                          <p className="text-xs text-[var(--on-surface-variant)]">{r.uploadedAt}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      <button onClick={() => startRename(r)} className="p-1.5 rounded-lg text-[var(--on-surface-variant)] hover:text-[var(--tertiary)] hover:bg-[var(--surface-container)] transition-colors" title="Rename">
                        <i className="ti ti-edit text-base"></i>
                      </button>
                      <button onClick={() => deleteResource(r.id)} className="p-1.5 rounded-lg text-[var(--on-surface-variant)] hover:text-[var(--error)] hover:bg-[var(--error-container)] transition-colors" title="Delete">
                        <i className="ti ti-trash text-base"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ AI Assistant Tab ═══ */}
      {activeTab === "ai" && (
        <div>
          <div className="mb-6">
            <h2 className="font-display font-extrabold text-xl text-[var(--on-surface)] flex items-center gap-2">
              <i className="ti ti-sparkles text-[var(--tertiary)]"></i>
              AI Study Assistant — {course.code} {course.title}
            </h2>
            <p className="text-xs text-[var(--on-surface-variant)] mt-1">Interactive MCQ quiz engine, structured Q&A, and AI course chat scoped to this course.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* MCQ Engine */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--outline-variant)]">
                  <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
                    <i className="ti ti-brain text-[var(--tertiary)] text-xl"></i> MCQ Practice Engine
                  </h3>
                  {quizState === "active" && <span className="badge badge-accent">Q {currentIdx + 1} of {mcqBank.length}</span>}
                </div>

                {quizState === "idle" && (
                  <div className="text-center py-8">
                    <i className="ti ti-sparkles text-4xl text-[var(--tertiary)] block mb-3"></i>
                    <p className="font-semibold text-base mb-1 text-[var(--on-surface)]">Generate Customized Practice Quiz</p>
                    <p className="text-xs text-[var(--on-surface-variant)] mb-5">Test your knowledge on {course.code} {course.title}</p>
                    <button onClick={startQuiz} className="btn-primary shadow-md">Start Quiz</button>
                  </div>
                )}
                {quizState === "loading" && (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-[var(--tertiary)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-xs font-semibold text-[var(--on-surface-variant)]">Generating AI Quiz Questions...</p>
                  </div>
                )}
                {quizState === "active" && (
                  <div>
                    <p className="text-sm font-semibold mb-4 text-[var(--on-surface)]">{mcqBank[currentIdx].question}</p>
                    <div className="space-y-2.5 mb-5">
                      {mcqBank[currentIdx].options.map((opt, i) => {
                        let btnClass = "w-full text-left p-3.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors";
                        if (selectedOpt !== null) {
                          if (i === mcqBank[currentIdx].correctIndex) btnClass = "w-full text-left p-3.5 rounded-xl border border-[var(--secondary)] bg-[var(--secondary-container)] text-[var(--on-secondary-container)] font-bold text-sm";
                          else if (i === selectedOpt) btnClass = "w-full text-left p-3.5 rounded-xl border border-[var(--error)] bg-[var(--error-container)] text-[var(--on-error-container)] font-bold text-sm";
                        }
                        return <button key={i} disabled={selectedOpt !== null} onClick={() => handleSelectOption(i)} className={btnClass}>{opt}</button>;
                      })}
                    </div>
                    {selectedOpt !== null && (
                      <button onClick={handleNextQuestion} className="btn-primary w-full justify-center shadow-md">
                        {currentIdx + 1 < mcqBank.length ? "Next Question" : "Finish Quiz"}
                      </button>
                    )}
                  </div>
                )}
                {quizState === "done" && (
                  <div className="text-center py-6">
                    <i className="ti ti-trophy text-4xl text-[var(--secondary)] block mb-2"></i>
                    <h4 className="font-display font-bold text-lg mb-1 text-[var(--on-surface)]">Quiz Completed!</h4>
                    <p className="text-sm text-[var(--on-surface-variant)] mb-5">You scored <b className="text-[var(--on-surface)]">{score} / {mcqBank.length}</b></p>
                    <button onClick={startQuiz} className="btn-secondary text-xs">Try Another Quiz</button>
                  </div>
                )}
              </div>

              {/* Structured Q&A */}
              <div className="card p-6">
                <h3 className="font-display font-bold text-lg mb-4 text-[var(--on-surface)] flex items-center gap-2 pb-3 border-b border-[var(--outline-variant)]">
                  <i className="ti ti-help-circle text-[var(--tertiary)] text-xl"></i> Structured Q&A Bank
                </h3>
                <div className="space-y-3">
                  {structuredBank.map((item) => (
                    <div key={item.id} className="border border-[var(--outline-variant)] rounded-xl p-4 bg-[var(--surface-container-low)]">
                      <p className="text-sm font-semibold mb-2 text-[var(--on-surface)]">{item.question}</p>
                      {revealedAnswers[item.id] ? (
                        <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg p-3 text-xs text-[var(--on-surface)] mt-2">
                          <p className="font-bold mb-1 text-[var(--tertiary)]">Sample Answer:</p>
                          {item.answer}
                        </div>
                      ) : (
                        <button onClick={() => toggleReveal(item.id)} className="btn-secondary text-xs !py-1">Show Answer</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="card p-6 flex flex-col h-[600px]">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2 pb-3 border-b border-[var(--outline-variant)] text-[var(--on-surface)]">
                <i className="ti ti-messages text-[var(--tertiary)] text-xl"></i> Course AI Tutor Chat
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex items-start gap-2.5 ${m.sender === "user" ? "justify-end" : ""}`}>
                    {m.sender === "ai" && <div className="avatar w-7 h-7 text-[10px] shrink-0">AI</div>}
                    <div className={`p-3 rounded-xl text-xs max-w-sm ${m.sender === "user" ? "bg-[var(--primary)] text-[var(--on-primary)]" : "bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-[var(--on-surface)]"}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>
              <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-3 border-t border-[var(--outline-variant)]">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={`Ask about ${course.code}...`} className="flex-1" />
                <button type="submit" className="btn-primary"><i className="ti ti-send"></i></button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
