"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";

export interface FileDropzoneProps {
  accept?: string; 
  maxSizeMB?: number;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
}

export default function FileDropzone({
  accept = ".pdf,.docx,.zip,.txt,.pptx",
  maxSizeMB = 10,
  multiple = false,
  onFilesSelected,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList | File[]): File[] => {
    const valid: File[] = [];
    let err: string | null = null;

    const acceptedTypes = accept
      ? accept.split(",").map((t) => t.trim().toLowerCase())
      : [];

    Array.from(files).forEach((file) => {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        err = `File "${file.name}" exceeds the ${maxSizeMB}MB size limit.`;
        return;
      }

      if (acceptedTypes.length > 0) {
        const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
        const matches = acceptedTypes.some((type) => {
          if (type.startsWith(".")) {
            return fileExt === type;
          }
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.replace("/*", ""));
          }
          return file.type.toLowerCase() === type;
        });

        if (!matches) {
          err = `File "${file.name}" is not an accepted format (${accept}).`;
          return;
        }
      }

      valid.push(file);
    });

    setErrorMessage(err);
    return valid;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const valid = validateFiles(e.target.files);
    if (valid.length > 0) {
      const updated = multiple ? [...selectedFiles, ...valid] : valid;
      setSelectedFiles(updated);
      onFilesSelected(updated);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const valid = validateFiles(e.dataTransfer.files);
      if (valid.length > 0) {
        const updated = multiple ? [...selectedFiles, ...valid] : valid;
        setSelectedFiles(updated);
        onFilesSelected(updated);
      }
    }
  };

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onFilesSelected(updated);
    if (updated.length === 0) setErrorMessage(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-5 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
          errorMessage
            ? "border-red-400 bg-red-50/40 dark:bg-red-950/20"
            : isDragOver
            ? "border-[var(--tertiary)] bg-[var(--tertiary-container)]/20 scale-[1.01]"
            : "border-[var(--outline-variant)] hover:border-[var(--tertiary)] bg-[var(--surface-container-low)]/50 hover:bg-[var(--surface-container-low)]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-2xl bg-[var(--surface-container)] text-[var(--tertiary)] flex items-center justify-center mx-auto mb-3 shadow-sm">
          <i className="ti ti-cloud-upload text-2xl"></i>
        </div>

        <p className="font-display font-semibold text-sm text-[var(--on-surface)] mb-1">
          <span className="text-[var(--tertiary)] underline underline-offset-2">Click to browse</span>
          <span className="hidden sm:inline"> or drag and drop files here</span>
        </p>
        <p className="text-xs text-[var(--on-surface-variant)] mb-2">
          Accepted formats: <span className="font-mono">{accept}</span> (Max {maxSizeMB}MB)
        </p>

        {/* Mobile Choose File Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="sm:hidden btn-primary text-xs !py-2.5 !px-5 mt-2 min-h-[44px] inline-flex items-center gap-1.5 shadow-sm rounded-xl font-bold"
        >
          <i className="ti ti-folder-open text-base"></i> Choose File
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <i className="ti ti-alert-circle text-base shrink-0"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[var(--on-surface-variant)]">Selected File(s):</p>
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-xs shadow-sm gap-2"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] flex items-center justify-center font-bold shrink-0">
                  <i className="ti ti-file-description text-lg"></i>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--on-surface)] truncate">{file.name}</p>
                  <p className="text-[10px] text-[var(--outline)]">{formatSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                title="Remove file"
                aria-label="Remove file"
              >
                <i className="ti ti-x text-lg"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
