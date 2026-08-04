"use client";

import { useState } from "react";
import { MaterialItem, Course, getFileTypeMeta } from "@/types/course";
import VideoPlayerModal from "@/components/VideoPlayerModal";

interface CourseMaterialsTabProps {
  course: Course;
  materials: MaterialItem[];
}

export default function CourseMaterialsTab({
  course,
  materials,
}: CourseMaterialsTabProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<{
    title: string;
    url: string;
    moduleName?: string;
  } | null>(null);

  const handleDownloadMaterial = (m: MaterialItem) => {
    const blob = new Blob(
      [
        `[UniLearn Course Material]\nTitle: ${m.title}\nCourse: ${course.code} - ${course.title}\nReleased: ${m.date}\nSummary: ${m.summary}`,
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${m.title.replace(/[^a-zA-Z0-9]/g, "_")}.${m.type.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card p-6 space-y-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
        <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
          <i className="ti ti-book text-[var(--tertiary)] text-xl"></i> Course Materials
        </h3>
      </div>

      <div className="space-y-3">
        {materials.map((m) => {
          const hasAttachments = m.attachments && m.attachments.length > 0;
          const meta = hasAttachments
            ? { icon: "ti-presentation", bg: "bg-[var(--tertiary-container)]/30 text-[var(--tertiary)] border-[var(--tertiary)]/30" }
            : getFileTypeMeta(m.type);

          return (
            <div
              key={m.id}
              className="border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-lowest)] overflow-hidden transition-colors"
            >
              
              <div className="flex items-center justify-between p-4 hover:bg-[var(--surface-container-low)]/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${meta.bg}`}
                  >
                    <i className={`ti ${meta.icon} text-lg`}></i>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--on-surface)] truncate">
                        {m.title}
                      </p>
                      {hasAttachments && (
                        <span className="badge badge-accent text-[10px] font-bold">
                          {m.attachments?.length} Attached Resources
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--on-surface-variant)]">
                      {m.module} {hasAttachments ? "" : `· ${m.size}`} · Published {m.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {!hasAttachments && (
                    <>
                      {m.type === "VIDEO" ? (
                        <button
                          onClick={() =>
                            setActiveVideoModal({
                              title: m.title,
                              url:
                                m.linkUrl ||
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                              moduleName: m.module,
                            })
                          }
                          className="btn-primary text-xs !py-1.5 flex items-center gap-1 bg-pink-600 hover:bg-pink-700 text-white"
                          title="Watch Recorded Video"
                        >
                          <i className="ti ti-player-play text-sm"></i> Watch Video
                        </button>
                      ) : m.type === "LINK" ? (
                        <a
                          href={m.linkUrl || "https://ieee.org"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-xs !py-1.5 flex items-center gap-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                          title="Open External Resource"
                        >
                          <i className="ti ti-external-link text-sm"></i> Open Link
                        </a>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedMaterial(m)}
                            className="btn-secondary text-xs !py-1.5"
                            title="Preview Summary"
                          >
                            <i className="ti ti-eye text-sm"></i>{" "}
                            <span className="hidden sm:inline">Preview</span>
                          </button>
                          <button
                            onClick={() => handleDownloadMaterial(m)}
                            className="btn-primary text-xs !py-1.5"
                            title="Download Document"
                          >
                            <i className="ti ti-download text-sm"></i>{" "}
                            <span className="hidden sm:inline">Download</span>
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              
              {hasAttachments && (
                <div className="border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)]/40 p-3.5 space-y-2">
                  <p className="text-[11px] font-bold text-[var(--on-surface-variant)] uppercase tracking-wider px-1">
                    Lecture Attached Package Materials:
                  </p>
                  <div className="space-y-2">
                    {m.attachments?.map((att) => {
                      const attMeta = getFileTypeMeta(att.type);
                      return (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div
                              className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${attMeta.bg}`}
                            >
                              <i className={`ti ${attMeta.icon} text-sm`}></i>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[var(--on-surface)] truncate">
                                {att.title}
                              </p>
                              <p className="text-[10px] text-[var(--outline)]">
                                {att.type} · {att.size}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {att.type === "VIDEO" ? (
                              <button
                                onClick={() =>
                                  setActiveVideoModal({
                                    title: att.title,
                                    url:
                                      att.linkUrl ||
                                      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                                    moduleName: m.module,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold text-[11px] flex items-center gap-1"
                              >
                                <i className="ti ti-player-play"></i> Watch
                              </button>
                            ) : att.type === "LINK" ? (
                              <a
                                href={att.linkUrl || "https://ieee.org"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-[11px] flex items-center gap-1"
                              >
                                <i className="ti ti-external-link"></i> Open
                              </a>
                            ) : (
                              <button
                                onClick={() =>
                                  handleDownloadMaterial({
                                    id: att.id,
                                    title: att.title,
                                    type: att.type,
                                    module: m.module,
                                    date: m.date,
                                    size: att.size,
                                    summary: att.summary || m.summary,
                                  })
                                }
                                className="btn-primary text-[11px] !py-1 !px-2.5"
                              >
                                <i className="ti ti-download mr-1"></i> Download
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-6 animate-scaleIn bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)] mb-4">
              <div className="flex items-center gap-2">
                <i className="ti ti-file-text text-xl text-[var(--tertiary)]"></i>
                <h3 className="font-display font-bold text-base text-[var(--on-surface)] truncate max-w-[280px]">
                  {selectedMaterial.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              >
                <i className="ti ti-x text-lg"></i>
              </button>
            </div>
            <div className="space-y-3 mb-5 text-xs text-[var(--on-surface-variant)]">
              <div className="flex justify-between border-b border-[var(--outline-variant)] pb-2">
                <span>Module & Format:</span>
                <span className="font-semibold text-[var(--on-surface)]">
                  {selectedMaterial.module} ({selectedMaterial.type}, {selectedMaterial.size})
                </span>
              </div>
              <div className="flex justify-between border-b border-[var(--outline-variant)] pb-2">
                <span>Release Date:</span>
                <span className="font-semibold text-[var(--on-surface)]">
                  {selectedMaterial.date}
                </span>
              </div>
              <div>
                <p className="font-bold text-[var(--on-surface)] mb-1">
                  Module Summary & Agenda:
                </p>
                <p className="bg-[var(--surface-container-low)] p-3 rounded-xl border border-[var(--outline-variant)] text-[var(--on-surface)] leading-relaxed">
                  {selectedMaterial.summary}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--outline-variant)]">
              <button
                onClick={() => setSelectedMaterial(null)}
                className="btn-secondary text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadMaterial(selectedMaterial);
                  setSelectedMaterial(null);
                }}
                className="btn-primary text-xs"
              >
                <i className="ti ti-download mr-1"></i> Download File
              </button>
            </div>
          </div>
        </div>
      )}

      
      {activeVideoModal && (
        <VideoPlayerModal
          isOpen={!!activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
          title={activeVideoModal.title}
          url={activeVideoModal.url}
          moduleName={activeVideoModal.moduleName}
        />
      )}
    </div>
  );
}
