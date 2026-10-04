"use client";

import { useState } from "react";
import { Resource, getFileTypeMeta } from "@/types/course";
import FileDropzone from "@/components/FileDropzone";
import { api } from "@/lib/api";

interface CourseResourcesTabProps {
  offeringId?: number;
  resources: Resource[];
  onAddResource: (res: Resource) => void;
  onRenameResource: (id: number, newName: string) => void;
  onDeleteResource: (id: number) => void;
  showToast: (msg: string) => void;
}

export default function CourseResourcesTab({
  offeringId,
  resources,
  onAddResource,
  onRenameResource,
  onDeleteResource,
  showToast,
}: CourseResourcesTabProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleResourceFilesSelected = async (files: File[]) => {
    if (files.length === 0 || isUploading) return;
    if (resources.length >= 20) {
      showToast("Personal upload limit reached (maximum 20 files per student). Please delete older files to upload new ones.");
      return;
    }
    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      showToast("File size exceeds 10MB limit.");
      return;
    }
    setIsUploading(true);
    try {
      // stop if the upload fails, so we don't save a file that isn't there
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "resources");
      const uploadRes = await api.post<{ url: string }>("/api/v1/files/upload", formData);
      if (!uploadRes?.url) {
        throw new Error("Upload failed. Please try again.");
      }
      const fileUrl = uploadRes.url;

      if (offeringId) {
        const created = await api.post<any>("/api/v1/personal-resources", {
          offeringId: offeringId,
          title: file.name,
          fileUrl: fileUrl,
          fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
        });

        const newRes: Resource = {
          id: created.resourceId || Date.now(),
          fileName: created.title || file.name,
          uploadedAt: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }),
        };
        onAddResource(newRes);
        showToast(`Resource "${file.name}" uploaded to personal vault and indexed for AI.`);
      } else {
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
      }
    } catch (err: any) {
      showToast(`Upload failed: ${err.message || "Could not save resource"}`);
    } finally {
      setIsUploading(false);
    }
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
    <div className="space-y-4 sm:space-y-6">
      <div className="glass rounded-2xl p-4 flex items-center gap-3 border border-[var(--glass-border)]">
        <div className="w-9 h-9 rounded-xl bg-[var(--surface-container)] text-[var(--tertiary)] flex items-center justify-center shrink-0">
          <i className="ti ti-lock text-lg"></i>
        </div>

        <p className="text-xs text-[var(--on-surface-variant)] font-medium">
          <span className="font-bold text-[var(--on-surface)]">Personal resources are private</span>{" "}
          — visible only to you. Upload your study notes, past papers, and reference documents here.
        </p>
      </div>

      <div className="card p-4 sm:p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1">
          <h4 className="font-display font-bold text-sm text-[var(--on-surface)]">
            Upload Personal Resource File
          </h4>
          <span className="text-xs text-[var(--on-surface-variant)]">
            Vault: {resources.length}/20 files (max 10MB each)
          </span>
        </div>
        {resources.length >= 20 ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <i className="ti ti-alert-triangle text-base"></i>
            <span>You have reached the maximum limit of 20 personal resources. Please delete older files to upload new ones.</span>
          </div>
        ) : (
          <FileDropzone
            accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.zip,.rar,.txt,.jpg,.jpeg,.png"
            maxSizeMB={10}
            multiple={false}
            onFilesSelected={handleResourceFilesSelected}
          />
        )}
      </div>

      <div className="card p-4 sm:p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
        <h3 className="font-display font-bold text-base sm:text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)] flex items-center gap-2">
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
                  className="flex items-center justify-between border border-[var(--outline-variant)] rounded-xl px-3 sm:px-4 py-3 hover:bg-[var(--surface-container-low)] transition-colors gap-2"
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
                        className="flex-1 text-xs sm:text-sm !py-1 px-2 rounded border border-[var(--tertiary)] bg-[var(--surface-container-lowest)] min-h-[36px]"
                        autoFocus
                      />
                    ) : (
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-[var(--on-surface)] truncate">
                          {r.fileName}
                        </p>
                        <p className="text-[11px] text-[var(--on-surface-variant)]">{r.uploadedAt}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startRename(r)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--on-surface-variant)] hover:text-[var(--tertiary)] hover:bg-[var(--surface-container)] transition-colors"
                      title="Rename"
                      aria-label="Rename resource"
                    >
                      <i className="ti ti-edit text-base"></i>
                    </button>
                    <button
                      onClick={() => onDeleteResource(r.id)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--on-surface-variant)] hover:text-[var(--error)] hover:bg-[var(--error-container)] transition-colors"
                      title="Delete"
                      aria-label="Delete resource"
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
