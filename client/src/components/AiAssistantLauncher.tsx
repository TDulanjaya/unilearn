"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface Message {
  sender: "user" | "ai";
  text: string;
  sources?: string[];
  courseSources?: string[];
  noteSources?: string[];
  isError?: boolean;
  failedPrompt?: string;
}

export default function AiAssistantLauncher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sourceScope, setSourceScope] = useState<"both" | "course_materials" | "my_notes">("both");
  const [isAiTabActive, setIsAiTabActive] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // check if currently on a course page
  const courseMatch = pathname ? pathname.match(/\/student\/courses\/(\d+)/) : null;
  const urlOfferingId = courseMatch ? Number(courseMatch[1]) : null;

  // fall back to first active enrolled course
  const { data: enrollments } = useQuery({
    queryKey: ["studentEnrollments", user?.userId],
    queryFn: () => api.get<any[]>(`/api/v1/enrollments/student/${user?.userId}`),
    enabled: !!user?.userId && !urlOfferingId,
  });

  const activeOfferingId = urlOfferingId || (enrollments && enrollments.length > 0 ? enrollments[0].offeringId : null);

  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "Student";
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: `Hello ${firstName}! I am your AI study companion grounded on your university lecture materials. Ask me any question about your courses!`,
    },
  ]);

  useEffect(() => {
    const checkAiTab = () => {
      const isAiPage = pathname === "/student/ai-assistant";
      const isTabAi =
        searchParams?.get("tab") === "ai" ||
        (typeof window !== "undefined" && window.location.search.includes("tab=ai"));
      setIsAiTabActive(isAiPage || isTabAi);
    };

    checkAiTab();
    window.addEventListener("popstate", checkAiTab);
    const interval = setInterval(checkAiTab, 250);
    return () => {
      window.removeEventListener("popstate", checkAiTab);
      clearInterval(interval);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoadingAi]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (isAiTabActive) {
    return null;
  }

  const sendMessage = async (userMsg: string) => {
    if (!userMsg.trim() || isLoadingAi) return;

    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setIsLoadingAi(true);

    try {
      if (!activeOfferingId) {
        throw new Error("No active course offering found to ground the AI chat. Please enroll in a course or open a course page.");
      }

      const res = await api.post<any>("/api/v1/ai/chat", {
        offeringId: activeOfferingId,
        content: userMsg,
        sourceScope: sourceScope,
      });

      const reply = res?.content || "No response received from the assistant.";
      const sources = Array.isArray(res?.sources) && res.sources.length > 0 ? res.sources : undefined;
      const courseSources = Array.isArray(res?.courseSources) && res.courseSources.length > 0 ? res.courseSources : undefined;
      const noteSources = Array.isArray(res?.noteSources) && res.noteSources.length > 0 ? res.noteSources : undefined;
      setMessages((prev) => [...prev, { sender: "ai", text: reply, sources, courseSources, noteSources }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: err.message || "AI assistant is temporarily unavailable.",
          isError: true,
          failedPrompt: userMsg,
        },
      ]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoadingAi) return;
    const userMsg = input.trim();
    setInput("");
    await sendMessage(userMsg);
  };

  return (
    <>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-4 sm:right-6 bottom-20 sm:bottom-6 z-40 glass rounded-2xl p-2.5 sm:px-3.5 sm:py-2.5 border border-[var(--glass-border)] shadow-[0_0_20px_rgba(0,144,169,0.35)] hover:shadow-[0_0_25px_rgba(0,144,169,0.5)] transition-all duration-300 flex items-center gap-3 group hover:scale-105 active:scale-95 min-h-[48px] min-w-[48px]"
          aria-label="Open AI Companion"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#70d6ff] text-[#0d1c2e] flex items-center justify-center font-bold shadow-md transition-transform group-hover:scale-105">
            <i className="ti ti-robot text-xl"></i>
          </div>
          <span className="text-xs font-bold text-[var(--on-surface)] hidden sm:inline">
            AI Companion
          </span>
        </button>
      ) : (
        <div className="fixed inset-0 sm:inset-auto sm:right-6 sm:bottom-6 z-50 w-full sm:w-96 h-full sm:h-[480px] glass rounded-none sm:rounded-3xl border-0 sm:border border-[var(--glass-border)] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 bg-[var(--surface-container-lowest)]">
          {/* Header */}
          <div className="p-3.5 border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-[#70d6ff] text-[#0d1c2e] flex items-center justify-center font-bold shadow-sm">
                <i className="ti ti-robot text-base"></i>
              </div>
              <div>
                <h3 className="font-display font-bold text-xs sm:text-sm text-[var(--on-surface)]">
                  AI Companion
                </h3>
                <p className="text-[10px] text-[var(--on-surface-variant)]">
                  Grounded Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[10px]">
                <span className="text-[var(--on-surface-variant)] font-semibold">Use:</span>
                <select
                  value={sourceScope}
                  onChange={(e) => setSourceScope(e.target.value as any)}
                  className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] text-[var(--on-surface)] rounded-md px-2 py-1 text-[11px] focus:outline-none min-h-[34px]"
                >
                  <option value="both">Both</option>
                  <option value="course_materials">Course</option>
                  <option value="my_notes">Notes</option>
                </select>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container)] transition-colors"
                aria-label="Close panel"
              >
                <i className="ti ti-x text-lg"></i>
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 text-xs bg-[var(--surface-container-lowest)]/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 sm:gap-2.5 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "ai" && (
                  <div className="w-7 h-7 rounded-xl bg-[#70d6ff] text-[#0d1c2e] flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 shadow-sm">
                    <i className="ti ti-robot"></i>
                  </div>
                )}
                <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[80%]">
                  <div
                    className={`p-3 rounded-2xl leading-relaxed break-words [overflow-wrap:anywhere] ${
                      msg.sender === "user"
                        ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-sm"
                        : msg.isError
                          ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-[var(--on-surface)] shadow-sm"
                          : "bg-[var(--surface-container-lowest)] text-[var(--on-surface)] border border-[var(--outline-variant)] shadow-sm whitespace-pre-wrap"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* citations */}
                  {msg.sender === "ai" && !msg.isError && (
                    <div className="space-y-1 text-[10px] text-[var(--on-surface-variant)] px-1">
                      {((msg.courseSources && msg.courseSources.length > 0) || (msg.noteSources && msg.noteSources.length > 0)) ? (
                        <>
                          {msg.courseSources && msg.courseSources.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="font-semibold flex items-center gap-0.5">
                                <i className="ti ti-book text-[10px] text-[var(--primary)]"></i> Course:
                              </span>
                              {msg.courseSources.map((src, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] font-semibold border border-[var(--primary)]/20 break-all"
                                >
                                  {src}
                                </span>
                              ))}
                            </div>
                          )}
                          {msg.noteSources && msg.noteSources.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="font-semibold flex items-center gap-0.5">
                                <i className="ti ti-notes text-[10px] text-[var(--tertiary)]"></i> Notes:
                              </span>
                              {msg.noteSources.map((src, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-1.5 py-0.5 rounded bg-[var(--tertiary)]/10 text-[var(--tertiary)] font-semibold border border-[var(--tertiary)]/20 break-all"
                                >
                                  {src}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      ) : msg.sources && msg.sources.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="font-semibold flex items-center gap-0.5">
                            <i className="ti ti-book text-[10px]"></i> Sources:
                          </span>
                          {msg.sources.map((src, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.5 rounded bg-[var(--surface-container-high)] text-[var(--on-surface)] font-semibold border border-[var(--outline-variant)] break-all"
                            >
                              {src}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="italic">None (General Knowledge)</span>
                      )}
                    </div>
                  )}

                  {/* retry on error */}
                  {msg.isError && msg.failedPrompt && (
                    <button
                      onClick={() => {
                        const toRetry = msg.failedPrompt!;
                        setMessages((prev) => prev.filter((_, i) => i !== idx));
                        sendMessage(toRetry);
                      }}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400 hover:opacity-80 self-start px-2 py-1 rounded bg-red-500/10 border border-red-500/20 transition-opacity min-h-[32px]"
                    >
                      <i className="ti ti-rotate text-[10px]"></i> Try again
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoadingAi && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-xl bg-[#70d6ff] text-[#0d1c2e] flex items-center justify-center shrink-0 text-xs font-bold shadow-sm">
                  <i className="ti ti-robot"></i>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--surface-container-lowest)] text-[var(--on-surface-variant)] border border-[var(--outline-variant)] shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--tertiary)] animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-[var(--tertiary)] animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-[var(--tertiary)] animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] flex gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask a question about your courses..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoadingAi}
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] focus:outline-none focus:border-[var(--tertiary)] disabled:opacity-50 min-h-[44px]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoadingAi}
              className="btn-primary text-xs !py-2.5 !px-4 min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-40 rounded-xl"
            >
              {isLoadingAi ? <i className="ti ti-loader animate-spin text-base"></i> : "Send"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
