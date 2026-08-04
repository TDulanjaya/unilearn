"use client";

import { useState } from "react";
import StudentNavbar from "@/components/StudentNavbar";

interface Message {
  id: string;
  sender: "me" | "them";
  text: string;
  timestamp: string;
}

interface ChatThread {
  id: string;
  name: string;
  role: string;
  avatar: string;
  unreadCount: number;
  messages: Message[];
}

const INITIAL_THREADS: ChatThread[] = [
  {
    id: "th-1",
    name: "Dr. K. Perera",
    role: "Senior Lecturer · Software Engineering",
    avatar: "K",
    unreadCount: 2,
    messages: [
      { id: "m-1", sender: "them", text: "Hello Nadeesha, please make sure to submit your test plan document before Friday.", timestamp: "10:14 AM" },
      { id: "m-2", sender: "me", text: "Thank you Dr. Perera, I will submit it tomorrow morning!", timestamp: "10:18 AM" },
      { id: "m-3", sender: "them", text: "Excellent. Let me know if you run into issues with the rubric.", timestamp: "10:20 AM" },
    ],
  },
  {
    id: "th-2",
    name: "Ishara Fonseka",
    role: "Peer Student · CS2023-A",
    avatar: "I",
    unreadCount: 0,
    messages: [
      { id: "m-4", sender: "them", text: "Hey! Are you working on the Database Systems lab assignment?", timestamp: "Yesterday" },
      { id: "m-5", sender: "me", text: "Yes! Just finished section 3.", timestamp: "Yesterday" },
    ],
  },
  {
    id: "th-3",
    name: "Prof. A. Fernando",
    role: "Senior Lecturer · Computing",
    avatar: "A",
    unreadCount: 1,
    messages: [
      { id: "m-6", sender: "them", text: "Your regrade request for V&V Paper has been received.", timestamp: "Aug 02" },
    ],
  },
];

export default function MessagesPage() {
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState("th-1");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: "me",
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            unreadCount: 0,
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      })
    );

    setInputText("");
  };

  const handleSelectThread = (id: string) => {
    setActiveThreadId(id);
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t))
    );
  };

  const filteredThreads = threads.filter(
    (t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)] pb-12">
      <StudentNavbar />
      <main className="max-w-[1100px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Direct Messaging
          </h1>
          <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm">
            Instant chat messaging with lecturers, academic tutors, and peer classmates.
          </p>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] border border-[var(--outline-variant)] rounded-2xl bg-[var(--surface-container-lowest)] overflow-hidden min-h-[550px] shadow-xl">
          
          <div className="border-r border-[var(--outline-variant)] p-4 flex flex-col bg-[var(--surface-container-low)]">
            <div className="pb-3 border-b border-[var(--outline-variant)]">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
              />
            </div>

            <div className="pt-3 space-y-2 overflow-y-auto flex-1">
              {filteredThreads.map((th) => {
                const isSelected = th.id === activeThreadId;
                const lastMsg = th.messages[th.messages.length - 1];

                return (
                  <div
                    key={th.id}
                    onClick={() => handleSelectThread(th.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${isSelected ? "bg-[var(--surface-container-lowest)] border-[var(--tertiary)] shadow-sm" : "border-transparent hover:bg-[var(--surface-container-lowest)]"}`}
                  >
                    <div className="avatar w-9 h-9 text-xs shrink-0">{th.avatar}</div>
                    <div className="overflow-hidden flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold truncate ${isSelected ? "text-[var(--tertiary)]" : "text-[var(--on-surface)]"}`}>
                          {th.name}
                        </p>
                        {th.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-[var(--tertiary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {th.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--on-surface-variant)] truncate">{lastMsg ? lastMsg.text : th.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          
          <div className="flex flex-col justify-between p-6 bg-[var(--surface-container-lowest)]">
            
            <div className="border-b border-[var(--outline-variant)] pb-4 flex items-center gap-3">
              <div className="avatar w-9 h-9 text-xs">{activeThread.avatar}</div>
              <div>
                <h3 className="font-display font-bold text-sm text-[var(--on-surface)]">{activeThread.name}</h3>
                <p className="text-[11px] text-[var(--on-surface-variant)]">{activeThread.role}</p>
              </div>
            </div>

            
            <div className="space-y-4 my-6 text-xs flex-1 overflow-y-auto pr-2">
              {activeThread.messages.map((m) => (
                <div key={m.id} className={`flex items-start gap-2.5 ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
                  {m.sender === "them" && <div className="avatar w-7 h-7 text-[10px] shrink-0 mt-0.5">{activeThread.avatar}</div>}
                  <div className={`p-3.5 rounded-2xl max-w-md ${m.sender === "me" ? "bg-[var(--tertiary)] text-white shadow-sm" : "bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-[var(--on-surface)]"}`}>
                    <p className="leading-relaxed">{m.text}</p>
                    <span className={`block text-[9px] mt-1 text-right ${m.sender === "me" ? "text-white/80" : "text-[var(--on-surface-variant)]"}`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4 border-t border-[var(--outline-variant)]">
              <input
                type="text"
                placeholder="Write a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
              />
              <button type="submit" className="btn-primary text-xs shadow-md">
                <i className="ti ti-send"></i> Send
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
