export interface Course {
  code: string;
  title: string;
  lecturer: string;
  dept: string;
  progress: number;
}

export type MaterialType = "PDF" | "DOCX" | "PPTX" | "ZIP" | "TXT" | "XLSX" | "VIDEO" | "LINK";

export interface AttachmentMaterial {
  id: number;
  title: string;
  type: MaterialType;
  size: string;
  summary?: string;
  linkUrl?: string;
}

export interface MaterialItem {
  id: number;
  title: string;
  type: MaterialType;
  module: string;
  date: string;
  size: string;
  summary: string;
  linkUrl?: string;
  attachments?: AttachmentMaterial[];
}

export type SubmissionStatus = "Draft" | "Submitted" | "Late" | "Graded";

export interface SubmissionAttempt {
  version: number;
  fileName: string;
  timestamp: string;
  status: SubmissionStatus;
  notes?: string;
}

export interface Assignment {
  id: number;
  title: string;
  due: string;
  status: SubmissionStatus;
  grade: string | null;
  description: string;
  maxScore: number;
  feedback?: string;
  submittedFile?: string;
  submittedAt?: string;
  attempts: SubmissionAttempt[];
}

export interface Resource {
  id: number;
  fileName: string;
  uploadedAt: string;
}

export interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface StructuredQA {
  id: number;
  question: string;
  answer: string;
}

export type CourseTab = "materials" | "assignments" | "resources" | "ai";

export function getFileTypeMeta(typeOrFileName: string) {
  const str = typeOrFileName.toLowerCase();
  const uniformBg = "bg-[var(--tertiary-container)]/30 text-[var(--tertiary)] border-[var(--tertiary)]/30";

  if (str.includes("video") || str.endsWith(".mp4") || str.endsWith(".webm") || str.endsWith(".mkv")) {
    return { icon: "ti-video", bg: uniformBg };
  }
  if (str.includes("link") || str.startsWith("http://") || str.startsWith("https://")) {
    return { icon: "ti-link", bg: uniformBg };
  }
  if (str.includes("pdf")) {
    return { icon: "ti-file-type-pdf", bg: uniformBg };
  }
  if (str.includes("docx") || str.includes("doc")) {
    return { icon: "ti-file-type-docx", bg: uniformBg };
  }
  if (str.includes("pptx") || str.includes("ppt")) {
    return { icon: "ti-presentation", bg: uniformBg };
  }
  if (str.includes("zip") || str.includes("rar") || str.includes("7z")) {
    return { icon: "ti-file-zip", bg: uniformBg };
  }
  if (str.includes("xlsx") || str.includes("xls") || str.includes("csv")) {
    return { icon: "ti-file-spreadsheet", bg: uniformBg };
  }
  if (str.includes("txt")) {
    return { icon: "ti-file-text", bg: uniformBg };
  }
  return { icon: "ti-file-description", bg: uniformBg };
}
