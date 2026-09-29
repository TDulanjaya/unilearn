"use client";

import { useState } from "react";
import { Assignment, SubmissionStatus, SubmissionAttempt } from "@/types/course";
import FileDropzone from "@/components/FileDropzone";

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const styles: Record<SubmissionStatus, string> = {
    Draft: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
    Submitted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700",
    Late: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700",
    Graded: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
  );
}

interface CourseAssignmentsTabProps {
  assignments: Assignment[];
  onUpdateAssignment: (updated: Assignment) => void;
  showToast: (msg: string) => void;
}

export default function CourseAssignmentsTab({
  assignments,
  onUpdateAssignment,
  showToast,
}: CourseAssignmentsTabProps) {
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [submitFiles, setSubmitFiles] = useState<File[]>([]);
  const [submitNotes, setSubmitNotes] = useState("");

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    const fileName =
      submitFiles.length > 0
        ? submitFiles[0].name
        : `Submission_${submittingAssignment.id}_Nadeesha.pdf`;
    const nowStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newAttempt: SubmissionAttempt = {
      version: submittingAssignment.attempts.length + 1,
      fileName,
      timestamp: nowStr,
      status: "Submitted",
      notes: submitNotes || "Client dropzone submission",
    };

    const updatedAssignment: Assignment = {
      ...submittingAssignment,
      status: "Submitted",
      submittedFile: fileName,
      submittedAt: nowStr,
      attempts: [newAttempt, ...submittingAssignment.attempts],
    };

    onUpdateAssignment(updatedAssignment);
    setSubmittingAssignment(null);
    setSubmitFiles([]);
    setSubmitNotes("");
    showToast(`Assignment "${submittingAssignment.title}" submitted successfully!`);
  };

  return (
    <div className="space-y-4">
      {assignments.map((a) => (
        <div
          key={a.id}
          className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
        >
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--on-surface)] mb-1">{a.title}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--on-surface-variant)]">
              <span className="flex items-center gap-1">
                <i className="ti ti-calendar text-sm text-[var(--tertiary)]"></i> Due: {a.due}
              </span>
              <SubmissionStatusBadge status={a.status} />
              {a.grade && <span className="badge badge-success">Grade: {a.grade}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto w-full sm:w-auto">
            {a.status === "Draft" || a.status === "Late" ? (
              <button
                onClick={() => setSubmittingAssignment(a)}
                className="btn-primary text-xs !py-2.5 sm:!py-1.5 min-h-[44px] shadow-sm w-full sm:w-auto justify-center"
              >
                <i className="ti ti-upload text-sm mr-1"></i> Upload Submission
              </button>
            ) : (
              <button
                onClick={() => setViewingAssignment(a)}
                className="btn-secondary text-xs !py-2.5 sm:!py-1.5 min-h-[44px] w-full sm:w-auto justify-center"
              >
                <i className="ti ti-eye text-sm mr-1"></i> View Details & History
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Upload Submission Modal */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <form
            onSubmit={handleConfirmSubmit}
            className="card max-w-lg w-full p-4 sm:p-6 animate-scaleIn max-h-[92vh] overflow-y-auto bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)] mb-4">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">
                Submit Assignment File
              </h3>
              <button
                type="button"
                onClick={() => setSubmittingAssignment(null)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                aria-label="Close"
              >
                <i className="ti ti-x text-lg"></i>
              </button>
            </div>
            <div className="space-y-4 mb-5">
              <div>
                <p className="text-xs font-bold text-[var(--on-surface)]">
                  {submittingAssignment.title}
                </p>
                <p className="text-xs text-[var(--on-surface-variant)]">
                  Due: {submittingAssignment.due} · Max Score: {submittingAssignment.maxScore} pts
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface)] mb-2">
                  Upload Submission File
                </label>
                <FileDropzone
                  accept=".pdf,.docx,.zip,.rar"
                  maxSizeMB={15}
                  multiple={false}
                  onFilesSelected={(files) => setSubmitFiles(files)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">
                  Submission Notes (Optional)
                </label>
                <textarea
                  value={submitNotes}
                  onChange={(e) => setSubmitNotes(e.target.value)}
                  placeholder="Notes or references for lecturer..."
                  className="w-full text-xs h-20 p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
                />
              </div>

              {submittingAssignment.attempts.length > 0 && (
                <div className="border-t border-[var(--outline-variant)] pt-3 space-y-2">
                  <p className="text-xs font-bold text-[var(--on-surface)]">
                    Past Submission Attempts Timeline:
                  </p>
                  <div className="relative border-l-2 border-[var(--tertiary)]/40 ml-2 pl-4 space-y-3">
                    {submittingAssignment.attempts.map((att, idx) => (
                      <div key={idx} className="relative text-xs">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--tertiary)]"></div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[var(--on-surface)]">
                            Version {att.version}: {att.fileName}
                          </span>
                          <SubmissionStatusBadge status={att.status} />
                        </div>
                        <p className="text-[10px] text-[var(--outline)]">{att.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-[var(--outline-variant)]">
              <button
                type="button"
                onClick={() => setSubmittingAssignment(null)}
                className="btn-secondary text-xs min-h-[44px] justify-center"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs shadow-md min-h-[44px] justify-center">
                Confirm & Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Details Modal */}
      {viewingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="card max-w-lg w-full p-4 sm:p-6 animate-scaleIn space-y-4 max-h-[92vh] overflow-y-auto bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
              <div>
                <h3 className="font-display font-bold text-base text-[var(--on-surface)]">
                  {viewingAssignment.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <SubmissionStatusBadge status={viewingAssignment.status} />
                </div>
              </div>
              <button
                onClick={() => setViewingAssignment(null)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                aria-label="Close"
              >
                <i className="ti ti-x text-lg"></i>
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-[var(--on-surface)] mb-1">Assignment Brief:</p>
              <p className="text-xs text-[var(--on-surface-variant)] bg-[var(--surface-container-low)] p-3 rounded-xl border border-[var(--outline-variant)] leading-relaxed">
                {viewingAssignment.description}
              </p>
            </div>

            <div className="border-t border-b border-[var(--outline-variant)] py-3 space-y-2">
              <p className="text-xs font-bold text-[var(--on-surface)]">
                Submission Attempts History Timeline:
              </p>
              <div className="relative border-l-2 border-[var(--tertiary)]/40 ml-2 pl-4 space-y-3">
                {viewingAssignment.attempts.map((att, idx) => (
                  <div key={idx} className="relative text-xs">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--tertiary)]"></div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--on-surface)]">
                        v{att.version}: {att.fileName}
                      </span>
                      <SubmissionStatusBadge status={att.status} />
                    </div>
                    <p className="text-[10px] text-[var(--outline)]">{att.timestamp}</p>
                    {att.notes && (
                      <p className="text-[11px] text-[var(--on-surface-variant)] italic mt-0.5">
                        {att.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {viewingAssignment.status === "Graded" && (
              <div className="bg-[var(--secondary-container)] border border-[var(--secondary)] rounded-xl p-4 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[var(--on-secondary-container)]">
                    Lecturer Grade & Feedback
                  </span>
                  <span className="badge badge-success text-sm font-bold">
                    {viewingAssignment.grade}
                  </span>
                </div>
                <p className="text-[var(--on-secondary-container)] font-medium italic">
                  "{viewingAssignment.feedback}"
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-[var(--outline-variant)]">
              <button onClick={() => setViewingAssignment(null)} className="btn-secondary text-xs min-h-[44px] px-4">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
