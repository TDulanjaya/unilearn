"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import LecturerNavbar from "@/components/LecturerNavbar";
import FileDropzone from "@/components/FileDropzone";

const examSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  courseCode: z.string().min(1, "Please select a course"),
  durationMinutes: z.number().min(5, "Minimum duration is 5 minutes"),
  startDateTime: z.string().min(1, "Start time is required"),
  endDateTime: z.string().min(1, "End time is required"),
  randomizeQuestions: z.boolean(),
});

type ExamFormData = z.infer<typeof examSchema>;

interface Question {
  id: number;
  text: string;
  type: "MCQ" | "ESSAY";
  marks: number;
  options?: string[];
  correctOptionIndex?: number;
}

interface CourseMaterial {
  id: number;
  title: string;
  category: "Slide" | "Syllabus" | "Brief" | "Lab";
  fileName: string;
  size: string;
  date: string;
}

interface Exam {
  id: number;
  title: string;
  courseCode: string;
  durationMinutes: number;
  startDateTime: string;
  endDateTime: string;
  randomizeQuestions: boolean;
  questionCount: number;
}

export default function LecturerCoursesPage() {
  const [activeCourse, setActiveCourse] = useState("SE308.3");
  const [materials, setMaterials] = useState<CourseMaterial[]>([
    { id: 1, title: "Lecture 01 - Introduction to Agile", category: "Slide", fileName: "Lecture01_Agile.pdf", size: "2.4 MB", date: "Aug 01, 2026" },
    { id: 2, title: "Software Process Management Syllabus", category: "Syllabus", fileName: "Syllabus_SE308.pdf", size: "1.1 MB", date: "Jul 25, 2026" },
    { id: 3, title: "Assignment 01 Brief & Rubric", category: "Brief", fileName: "Assignment1_Brief.docx", size: "850 KB", date: "Aug 03, 2026" },
  ]);

  const [announcements, setAnnouncements] = useState<string[]>([
    "Welcome to SE308.3! Midterm exam schedule has been posted.",
  ]);

  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, text: "Which SDLC model is best suited for unclear initial requirements?", type: "MCQ", marks: 5, options: ["Waterfall", "Spiral", "Big Bang", "V-Model"], correctOptionIndex: 1 },
    { id: 2, text: "Explain how sprint velocity is calculated in Scrum.", type: "ESSAY", marks: 10 },
  ]);

  const [exams, setExams] = useState<Exam[]>([
    { id: 1, title: "SE308.3 Midterm Examination 2026", courseCode: "SE308.3", durationMinutes: 60, startDateTime: "2026-08-15T09:00", endDateTime: "2026-08-15T11:00", randomizeQuestions: true, questionCount: 25 },
  ]);

  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [materialCategory, setMaterialCategory] = useState<CourseMaterial["category"]>("Slide");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  
  const editorRef = useRef<HTMLDivElement>(null);

  const applyFormatting = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
  };

  const handlePostAnnouncement = () => {
    if (editorRef.current && editorRef.current.innerHTML.trim()) {
      setAnnouncements([editorRef.current.innerHTML, ...announcements]);
      editorRef.current.innerHTML = "";
    }
  };

  
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<"MCQ" | "ESSAY">("MCQ");
  const [qMarks, setQMarks] = useState(5);
  const [qOptions, setQOptions] = useState<string[]>(["Option A", "Option B", "Option C", "Option D"]);
  const [correctIdx, setCorrectIdx] = useState(0);

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) return;
    const newQ: Question = {
      id: Date.now(),
      text: qText.trim(),
      type: qType,
      marks: qMarks,
      options: qType === "MCQ" ? qOptions : undefined,
      correctOptionIndex: qType === "MCQ" ? correctIdx : undefined,
    };
    setQuestions([...questions, newQ]);
    setQText("");
    setShowQuestionModal(false);
  };

  
  const {
    register: registerExam,
    handleSubmit: handleSubmitExam,
    formState: { errors: examErrors },
    reset: resetExam,
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      courseCode: activeCourse,
      durationMinutes: 60,
      randomizeQuestions: true,
    },
  });

  const onExamSubmit = (data: ExamFormData) => {
    const newExam: Exam = {
      id: Date.now(),
      ...data,
      questionCount: questions.length,
    };
    setExams([...exams, newExam]);
    resetExam();
    setShowExamModal(false);
  };

  const handleConfirmUpload = () => {
    if (uploadedFiles.length === 0) return;
    const newMats: CourseMaterial[] = uploadedFiles.map((file, idx) => ({
      id: Date.now() + idx,
      title: file.name.replace(/\.[^/.]+$/, ""),
      category: materialCategory,
      fileName: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    }));
    setMaterials([...newMats, ...materials]);
    setUploadedFiles([]);
    setShowUploadModal(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)] pb-12">
      <LecturerNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)]">
              Course & Exam Management
            </h1>
            <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm mt-1">
              Upload course materials, publish announcements, and build exam question banks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[var(--on-surface-variant)]">Select Course:</label>
            <select
              value={activeCourse}
              onChange={(e) => setActiveCourse(e.target.value)}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
            >
              <option value="SE308.3">SE308.3 — Software Process Management</option>
              <option value="SE202.2">SE202.2 — Database Systems</option>
              <option value="SE309.3">SE309.3 — Software Verification</option>
            </select>
          </div>
        </div>

        
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
            <div>
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
                <i className="ti ti-folder text-[var(--tertiary)]"></i> Course Materials ({activeCourse})
              </h3>
              <p className="text-xs text-[var(--on-surface-variant)]">Manage slides, syllabus, and assignment briefs.</p>
            </div>
            <button onClick={() => setShowUploadModal(true)} className="btn-primary text-xs shadow-sm">
              <i className="ti ti-upload"></i> Upload Material
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {materials.map((m) => (
              <div key={m.id} className="border border-[var(--outline-variant)] rounded-xl p-3.5 bg-[var(--surface-container-lowest)] hover:bg-[var(--surface-container-low)] transition-colors flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-[var(--surface-container-high)] text-[var(--on-surface)] border-[var(--outline-variant)] mb-1.5 inline-block">
                    {m.category}
                  </span>
                  <p className="text-xs font-bold text-[var(--on-surface)] truncate">{m.title}</p>
                  <p className="text-[10px] text-[var(--on-surface-variant)] mt-1">{m.fileName} · {m.size} · {m.date}</p>
                </div>
                <button
                  onClick={() => setMaterials(materials.filter((item) => item.id !== m.id))}
                  className="text-[var(--on-surface-variant)] hover:text-red-500 p-1"
                  title="Remove material"
                >
                  <i className="ti ti-trash text-sm"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        
        <div className="card p-6 space-y-4">
          <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2 pb-3 border-b border-[var(--outline-variant)]">
            <i className="ti ti-speakerphone text-[var(--tertiary)]"></i> Course Announcements Editor
          </h3>

          <div className="border border-[var(--outline-variant)] rounded-xl overflow-hidden bg-[var(--surface-container-lowest)]">
            
            <div className="flex items-center gap-1 p-2 bg-[var(--surface-container-low)] border-b border-[var(--outline-variant)] text-xs">
              <button
                type="button"
                onClick={() => applyFormatting("bold")}
                className="px-2.5 py-1 rounded hover:bg-[var(--surface-container-high)] font-bold text-[var(--on-surface)]"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("italic")}
                className="px-2.5 py-1 rounded hover:bg-[var(--surface-container-high)] italic text-[var(--on-surface)]"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("insertUnorderedList")}
                className="px-2.5 py-1 rounded hover:bg-[var(--surface-container-high)] text-[var(--on-surface)]"
                title="Bullet List"
              >
                <i className="ti ti-list"></i>
              </button>
              <div className="w-px h-4 bg-[var(--outline-variant)] mx-1"></div>
              <span className="text-[10px] text-[var(--outline)]">Rich Text Announcement Editor</span>
            </div>

            
            <div
              ref={editorRef}
              contentEditable
              className="p-4 min-h-[100px] text-xs text-[var(--on-surface)] focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button onClick={handlePostAnnouncement} className="btn-primary text-xs shadow-sm">
              <i className="ti ti-send"></i> Publish Announcement
            </button>
          </div>

          
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-[var(--on-surface)]">Recent Published Announcements:</p>
            {announcements.map((ann, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-xs text-[var(--on-surface)]">
                <div dangerouslySetInnerHTML={{ __html: ann }} />
              </div>
            ))}
          </div>
        </div>

        
        <div className="grid lg:grid-cols-2 gap-6">
          
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] flex items-center gap-2">
                <i className="ti ti-help-circle text-[var(--tertiary)]"></i> Question Bank ({questions.length})
              </h3>
              <button onClick={() => setShowQuestionModal(true)} className="btn-primary text-xs">
                <i className="ti ti-plus"></i> Add Question
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.id} className="p-3.5 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-low)] space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-[var(--on-surface)]">{q.text}</p>
                    <span className="badge badge-accent text-[10px]">{q.marks} Marks</span>
                  </div>
                  {q.type === "MCQ" && q.options && (
                    <ul className="text-[11px] text-[var(--on-surface-variant)] space-y-0.5 pl-3 list-disc">
                      {q.options.map((opt, i) => (
                        <li key={i} className={i === q.correctOptionIndex ? "text-emerald-500 font-bold" : ""}>
                          {opt} {i === q.correctOptionIndex && "(Correct)"}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] flex items-center gap-2">
                <i className="ti ti-file-certificate text-[var(--tertiary)]"></i> Scheduled Exams
              </h3>
              <button onClick={() => setShowExamModal(true)} className="btn-primary text-xs">
                <i className="ti ti-plus"></i> Create Exam
              </button>
            </div>

            <div className="space-y-3">
              {exams.map((ex) => (
                <div key={ex.id} className="p-4 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-low)] space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[var(--on-surface)]">{ex.title}</p>
                    <span className="badge badge-accent">{ex.courseCode}</span>
                  </div>
                  <div className="text-[11px] text-[var(--on-surface-variant)] space-y-1">
                    <p><i className="ti ti-clock mr-1"></i> Duration: {ex.durationMinutes} mins · {ex.questionCount} Questions</p>
                    <p><i className="ti ti-calendar mr-1"></i> Start: {new Date(ex.startDateTime).toLocaleString()}</p>
                    <p><i className="ti ti-arrows-shuffle mr-1"></i> Question Randomization: {ex.randomizeQuestions ? "Enabled" : "Disabled"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 space-y-4 animate-scaleIn bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">Upload Course File</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-[var(--on-surface-variant)]">
                <i className="ti ti-x text-lg"></i>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">Material Category</label>
              <select
                value={materialCategory}
                onChange={(e) => setMaterialCategory(e.target.value as CourseMaterial["category"])}
                className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
              >
                <option value="Slide">Lecture Slides (.pdf, .pptx)</option>
                <option value="Syllabus">Syllabus Document (.pdf)</option>
                <option value="Brief">Assignment Brief (.docx)</option>
                <option value="Lab">Lab Exercise Package (.zip)</option>
              </select>
            </div>

            <FileDropzone
              accept=".pdf,.docx,.doc,.pptx,.ppt,.zip,.rar"
              maxSizeMB={20}
              multiple={true}
              onFilesSelected={(files) => setUploadedFiles(files)}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--outline-variant)]">
              <button onClick={() => setShowUploadModal(false)} className="btn-secondary text-xs">Cancel</button>
              <button onClick={handleConfirmUpload} disabled={uploadedFiles.length === 0} className="btn-primary text-xs disabled:opacity-40">
                Confirm & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateQuestion} className="card max-w-lg w-full p-6 space-y-4 animate-scaleIn bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">Add New Question</h3>
              <button type="button" onClick={() => setShowQuestionModal(false)} className="text-[var(--on-surface-variant)]">
                <i className="ti ti-x text-lg"></i>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--on-surface)]">Question Text</label>
              <textarea
                rows={2}
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="Enter question statement..."
                className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--on-surface)]">Question Type</label>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value as "MCQ" | "ESSAY")}
                  className="w-full text-xs p-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                >
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                  <option value="ESSAY">Essay / Descriptive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--on-surface)]">Mark Weight</label>
                <input
                  type="number"
                  min={1}
                  value={qMarks}
                  onChange={(e) => setQMarks(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                />
              </div>
            </div>

            {qType === "MCQ" && (
              <div className="space-y-2 border-t border-[var(--outline-variant)] pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--on-surface)]">MCQ Options Builder</label>
                  <button
                    type="button"
                    onClick={() => setQOptions([...qOptions, `Option ${qOptions.length + 1}`])}
                    className="text-[11px] text-[var(--tertiary)] font-semibold"
                  >
                    + Add Option
                  </button>
                </div>
                {qOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctIdx === idx}
                      onChange={() => setCorrectIdx(idx)}
                      title="Mark as correct answer"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...qOptions];
                        updated[idx] = e.target.value;
                        setQOptions(updated);
                      }}
                      className="flex-1 text-xs p-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                    />
                    {qOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setQOptions(qOptions.filter((_, i) => i !== idx))}
                        className="text-red-500 text-xs p-1"
                      >
                        <i className="ti ti-x"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--outline-variant)]">
              <button type="button" onClick={() => setShowQuestionModal(false)} className="btn-secondary text-xs">Cancel</button>
              <button type="submit" className="btn-primary text-xs">Save Question</button>
            </div>
          </form>
        </div>
      )}

      
      {showExamModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmitExam(onExamSubmit)} className="card max-w-lg w-full p-6 space-y-4 animate-scaleIn bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">Create New Examination</h3>
              <button type="button" onClick={() => setShowExamModal(false)} className="text-[var(--on-surface-variant)]">
                <i className="ti ti-x text-lg"></i>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--on-surface)]">Exam Title</label>
              <input
                type="text"
                {...registerExam("title")}
                placeholder="e.g. SE308.3 Final Exam 2026"
                className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
              />
              {examErrors.title && <p className="text-[10px] text-red-500 mt-1">{examErrors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--on-surface)]">Course</label>
                <select
                  {...registerExam("courseCode")}
                  className="w-full text-xs p-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                >
                  <option value="SE308.3">SE308.3</option>
                  <option value="SE202.2">SE202.2</option>
                  <option value="SE309.3">SE309.3</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--on-surface)]">Duration (Minutes)</label>
                <input
                  type="number"
                  {...registerExam("durationMinutes", { valueAsNumber: true })}
                  className="w-full text-xs p-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                />
                {examErrors.durationMinutes && <p className="text-[10px] text-red-500 mt-1">{examErrors.durationMinutes.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--on-surface)]">Start Date & Time</label>
                <input
                  type="datetime-local"
                  {...registerExam("startDateTime")}
                  className="w-full text-xs p-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--on-surface)]">End Date & Time</label>
                <input
                  type="datetime-local"
                  {...registerExam("endDateTime")}
                  className="w-full text-xs p-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="randomize"
                {...registerExam("randomizeQuestions")}
                className="rounded text-[var(--tertiary)] focus:ring-0"
              />
              <label htmlFor="randomize" className="text-xs font-medium text-[var(--on-surface)]">
                Randomize Question Order for Each Student
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--outline-variant)]">
              <button type="button" onClick={() => setShowExamModal(false)} className="btn-secondary text-xs">Cancel</button>
              <button type="submit" className="btn-primary text-xs">Schedule Exam</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
