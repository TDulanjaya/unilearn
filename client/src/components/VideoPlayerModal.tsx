"use client";

import { useEffect, useRef } from "react";
import { useFileUrl } from "@/lib/files";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  moduleName?: string;
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  title,
  url,
  moduleName,
}: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // uploaded videos need the login token, so load them as a blob
  const { src: videoSrc, error: videoError } = useFileUrl(isOpen ? url : null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass w-full max-w-4xl h-full sm:h-auto max-h-screen rounded-none sm:rounded-3xl border-0 sm:border border-[var(--glass-border)] shadow-2xl flex flex-col overflow-hidden bg-[var(--surface-container-lowest)]">
        {/* Header */}
        <div className="p-3 sm:p-4 sm:px-6 border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 pr-2 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold shrink-0">
              <i className="ti ti-video text-lg sm:text-xl"></i>
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm sm:text-base text-[var(--on-surface)] truncate">
                {title}
              </h3>
              {moduleName && (
                <p className="text-[11px] sm:text-xs text-[var(--on-surface-variant)] truncate">{moduleName}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-high)] transition-colors shrink-0"
            aria-label="Close video"
          >
            <i className="ti ti-x text-xl"></i>
          </button>
        </div>

        {/* Video Player */}
        <div className="flex-1 sm:flex-none relative bg-black aspect-video flex items-center justify-center">
          {videoError ? (
            <p className="text-xs text-red-400 p-4 text-center">{videoError}</p>
          ) : !videoSrc ? (
            <p className="text-xs text-slate-300 p-4 text-center">Loading video...</p>
          ) : (
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  );
}
