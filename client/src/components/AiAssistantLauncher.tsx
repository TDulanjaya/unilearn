"use client";
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface Message {
  sender: "user" | "ai";
  text: string;
}

export default function AiAssistantLauncher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isAiTabActive, setIsAiTabActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hi Nadeesha! I'm your AI study companion. How can I help with your courses today?",
    },
  ]);

  useEffect(() => {
    const checkAiTab = () => {
      const isAiPage = pathname === "/student/ai-assistant";
      const isTabAi = searchParams?.get("tab") === "ai" || (typeof window !== "undefined" && window.location.search.includes("tab=ai"));
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

  
  if (isAiTabActive) {
    return null;
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Here is a summary for "${userMsg}": Refer to lecture slides on SE308.3 section 4 for detailed examples and review guidelines.`,
        },
      ]);
    }, 600);
  };

  return (
    <>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-4 sm:right-6 bottom-6 z-40 glass rounded-2xl px-3.5 py-2.5 border border-[var(--glass-border)] shadow-[0_0_20px_rgba(0,144,169,0.35)] hover:shadow-[0_0_25px_rgba(0,144,169,0.5)] transition-all duration-300 flex items-center gap-3 group hover:scale-105 active:scale-95"
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
        <div className="fixed right-4 sm:right-6 bottom-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[460px] glass rounded-3xl border border-[var(--glass-border)] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <div className="p-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#70d6ff] text-[#0d1c2e] flex items-center justify-center font-bold shadow-sm">
                <i className="ti ti-robot text-lg"></i>
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-[var(--on-surface)]">
                  AI Companion
                </h3>
                <p className="text-[10px] text-[var(--on-surface-variant)]">
                  Grounded on Course Materials
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container)] transition-colors"
              aria-label="Close panel"
            >
              <i className="ti ti-x text-lg"></i>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-[var(--surface-container-lowest)]/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "ai" && (
                  <div className="w-7 h-7 rounded-xl bg-[#70d6ff] text-[#0d1c2e] flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 shadow-sm">
                    <i className="ti ti-robot"></i>
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-sm"
                      : "bg-[var(--surface-container-lowest)] text-[var(--on-surface)] border border-[var(--outline-variant)] shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] flex gap-2">
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] focus:outline-none focus:border-[var(--tertiary)]"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="btn-primary text-xs !py-2 !px-3.5 disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
