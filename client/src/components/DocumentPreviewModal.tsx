"use client";

import { useEffect } from "react";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  type: string;
  fileSize?: string;
}

export default function DocumentPreviewModal({
  isOpen,
  onClose,
  title,
  url,
  type,
  fileSize,
}: DocumentPreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass w-full max-w-4xl h-full sm:h-[85vh] rounded-none sm:rounded-3xl border-0 sm:border border-[var(--glass-border)] shadow-2xl flex flex-col overflow-hidden bg-[var(--surface-container-lowest)]">
        {/* Header */}
        <div className="p-3 sm:p-4 sm:px-6 border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 pr-2 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] flex items-center justify-center font-bold shrink-0">
              <i className="ti ti-file-text text-lg sm:text-xl"></i>
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm sm:text-base text-[var(--on-surface)] truncate">
                {title}
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--on-surface-variant)] flex items-center gap-1.5 sm:gap-2">
                <span className="badge badge-accent text-[10px]">{type}</span>
                {fileSize && <span>{fileSize}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-xs min-h-[44px] px-3 hidden sm:flex items-center gap-1"
            >
              <i className="ti ti-external-link"></i> Open Tab
            </a>
            <a
              href={url}
              download
              className="btn-primary text-xs min-h-[44px] px-3.5 flex items-center gap-1"
            >
              <i className="ti ti-download"></i> <span className="hidden sm:inline">Download</span>
            </a>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-high)] transition-colors"
              aria-label="Close modal"
            >
              <i className="ti ti-x text-xl"></i>
            </button>
          </div>
        </div>

        {/* Content iframe */}
        <div className="flex-1 bg-black/5 dark:bg-black/40 relative">
          <iframe
            src={url}
            title={title}
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
