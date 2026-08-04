"use client";

import { useState } from "react";
import { Resource, getFileTypeMeta } from "@/types/course";
import FileDropzone from "@/components/FileDropzone";

interface CourseResourcesTabProps {
  resources: Resource[];
  onAddResource: (res: Resource) => void;
  onRenameResource: (id: number, newName: string) => void;
  onDeleteResource: (id: number) => void;
  showToast: (msg: string) => void;
}

export default function CourseResourcesTab({
  resources,
  onAddResource,
  onRenameResource,
  onDeleteResource,
  showToast,
}: CourseResourcesTabProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const handleResourceFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const newRes: Resource = {
      id: Date.now(),
      fileName: file.name,
      uploadedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };
    onAddResource(newRes);
    showToast(`Resource "${file.name}" uploaded to personal vault.`);
  };

  const startRename = (r: Resource) => {
    setEditingId(r.id);
    setEditName(r.fileName);
  };

  const confirmRename = () => {
    if (editingId && editName.trim()) {
      onRenameResource(editingId, editName.trim());
      showToast("Resource renamed.");
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-4 flex items-center gap-3 border border-[var(--glass-border)]">
        <div className="w-9 h-9 rounded-xl bg-[var(--surface-container)] text-[var(--tertiary)] flex items-center justify-center shrink-0">
          <i className="ti ti-lock text-lg"></i>
        </div>

        <p className="text-xs text-[var(--on-surface-variant)] font-medium">
          <span className="font-bold text-[var(--on-surface)]">Personal resources are private</span>{" "}
          — visible only to you. Upload your study notes, past papers, and reference documents here.
        </p>
      </div>

      <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
        <h4 className="font-display font-bold text-sm text-[var(--on-surface)] mb-3">
          Upload Personal Resource File
        </h4>
        <FileDropzone
          accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.zip,.rar,.txt,.jpg,.png"
          maxSizeMB={25}
          multiple={false}
          onFilesSelected={handleResourceFilesSelected}
        />
      </div>

      <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
        <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)] flex items-center gap-2">
          <i className="ti ti-folder text-[var(--tertiary)] text-xl"></i> Uploaded Resources
          <span className="badge badge-accent ml-auto">{resources.length}</span>
        </h3>
        {resources.length === 0 ? (
          <p className="text-sm text-[var(--on-surface-variant)] text-center py-6">
            No resources uploaded yet.
          </p>
        ) : (
          <div className="space-y-2.5">
            {resources.map((r) => {
              const meta = getFileTypeMeta(r.fileName);
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between border border-[var(--outline-variant)] rounded-xl px-4 py-3 hover:bg-[var(--surface-container-low)] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.bg}`}
                    >
                      <i className={`ti ${meta.icon} text-base`}></i>
                    </div>
                    {editingId === r.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={confirmRename}
                        onKeyDown={(e) => e.key === "Enter" && confirmRename()}
                        className="flex-1 text-sm !py-1 px-2 rounded border border-[var(--tertiary)] bg-[var(--surface-container-lowest)]"
                        autoFocus
                      />
                    ) : (
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--on-surface)] truncate">
                          {r.fileName}
                        </p>
                        <p className="text-xs text-[var(--on-surface-variant)]">{r.uploadedAt}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <button
                      onClick={() => startRename(r)}
                      className="p-1.5 rounded-lg text-[var(--on-surface-variant)] hover:text-[var(--tertiary)] hover:bg-[var(--surface-container)] transition-colors"
                      title="Rename"
                    >
                      <i className="ti ti-edit text-base"></i>
                    </button>
                    <button
                      onClick={() => onDeleteResource(r.id)}
                      className="p-1.5 rounded-lg text-[var(--on-surface-variant)] hover:text-[var(--error)] hover:bg-[var(--error-container)] transition-colors"
                      title="Delete"
                    >
                      <i className="ti ti-trash text-base"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
