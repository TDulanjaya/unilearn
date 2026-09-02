"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StudentNavbar from "@/components/StudentNavbar";
import LecturerNavbar from "@/components/LecturerNavbar";

interface Contact {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  photoUrl: string | null;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
}

interface MessageItem {
  messageId: number;
  senderId: number;
  senderName: string;
  recipientId: number;
  receiverId: number;
  recipientName: string;
  receiverName: string;
  content: string;
  sentAt: string;
  readAt: string | null;
  isRead: boolean;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeContactId, setActiveContactId] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch live contacts & conversations
  const { data: contacts, isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ["contacts", user?.userId],
    queryFn: () => api.get<Contact[]>("/api/v1/messages/contacts"),
    enabled: !!user?.userId,
    refetchInterval: 5000,
  });

  // Set default active contact
  useEffect(() => {
    if (contacts && contacts.length > 0 && !activeContactId) {
      setActiveContactId(contacts[0].userId);
    }
  }, [contacts, activeContactId]);

  // 2. Fetch active conversation thread
  const { data: threadData, isLoading: threadLoading } = useQuery({
    queryKey: ["thread", user?.userId, activeContactId],
    queryFn: () => api.get<any>(`/api/v1/messages/thread/${activeContactId}?page=0&size=50`),
    enabled: !!user?.userId && !!activeContactId,
    refetchInterval: 3000,
  });

  const activeMessages: MessageItem[] = threadData?.dataList || [];
  const activeContact = contacts?.find((c) => c.userId === activeContactId) || contacts?.[0];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length, activeContactId]);

  // 3. Send message mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api.post<MessageItem>("/api/v1/messages", {
        receiverId: activeContactId,
        content,
      }),
    onSuccess: () => {
      setInputText("");
      queryClient.invalidateQueries({ queryKey: ["thread", user?.userId, activeContactId] });
      queryClient.invalidateQueries({ queryKey: ["contacts", user?.userId] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContactId || sendMutation.isPending) return;
    sendMutation.mutate(inputText.trim());
  };

  const filteredContacts = (contacts || []).filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)] pb-12">
      {user?.role === "student" ? (
        <StudentNavbar />
      ) : user?.role === "lecturer" || user?.role === "hod_dean" ? (
        <LecturerNavbar />
      ) : null}

      <main className="max-w-[1150px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Direct Messaging
          </h1>
          <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm">
            Instant chat messaging with lecturers, academic tutors, and peer classmates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] border border-[var(--outline-variant)] rounded-2xl bg-[var(--surface-container-lowest)] overflow-hidden min-h-[580px] shadow-xl">
          {/* Contacts Sidebar */}
          <div className="border-r border-[var(--outline-variant)] p-4 flex flex-col bg-[var(--surface-container-low)]">
            <div className="pb-3 border-b border-[var(--outline-variant)]">
              <input
                type="text"
                placeholder="Search contacts & messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] focus:outline-none focus:border-[var(--tertiary)]"
              />
            </div>

            <div className="pt-3 space-y-1.5 overflow-y-auto flex-1 max-h-[500px]">
              {contactsLoading ? (
                <div className="p-4 text-center text-xs text-[var(--on-surface-variant)] animate-pulse">
                  Loading contacts...
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--on-surface-variant)]">
                  No contacts found
                </div>
              ) : (
                filteredContacts.map((c) => {
                  const isSelected = c.userId === activeContactId;
                  const initial = c.fullName ? c.fullName.charAt(0).toUpperCase() : "U";

                  return (
                    <div
                      key={c.userId}
                      onClick={() => setActiveContactId(c.userId)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? "bg-[var(--surface-container-lowest)] border-[var(--tertiary)] shadow-sm"
                          : "border-transparent hover:bg-[var(--surface-container-lowest)]"
                      }`}
                    >
                      <div className="avatar w-9 h-9 text-xs font-bold shrink-0">
                        {initial}
                      </div>
                      <div className="overflow-hidden flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs font-bold truncate ${
                              isSelected ? "text-[var(--tertiary)]" : "text-[var(--on-surface)]"
                            }`}
                          >
                            {c.fullName}
                          </p>
                          {c.unreadCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-[var(--tertiary)] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--on-surface-variant)] truncate">
                          {c.lastMessage || c.role}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Window */}
          {activeContact ? (
            <div className="flex flex-col justify-between p-6 bg-[var(--surface-container-lowest)] flex-1 min-h-[580px]">
              {/* Header */}
              <div className="border-b border-[var(--outline-variant)] pb-4 flex items-center gap-3">
                <div className="avatar w-10 h-10 text-sm font-bold shrink-0">
                  {activeContact.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[var(--on-surface)]">
                    {activeContact.fullName}
                  </h3>
                  <p className="text-[11px] text-[var(--on-surface-variant)]">
                    {activeContact.role} · {activeContact.email}
                  </p>
                </div>
              </div>

              {/* Messages Timeline */}
              <div className="space-y-4 my-4 text-xs flex-1 overflow-y-auto max-h-[400px] pr-2">
                {threadLoading && activeMessages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--on-surface-variant)] animate-pulse">
                    Loading chat history...
                  </div>
                ) : activeMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-xs text-[var(--on-surface-variant)]">
                    <i className="ti ti-message-dots text-3xl mb-1 text-[var(--outline)]"></i>
                    <p className="font-semibold">No messages yet</p>
                    <p className="text-[11px]">Say hello to {activeContact.fullName} to start the conversation!</p>
                  </div>
                ) : (
                  activeMessages.map((m) => {
                    const isMe = m.senderId === user?.userId;
                    const timeStr = m.sentAt
                      ? new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "";

                    return (
                      <div
                        key={m.messageId}
                        className={`flex items-start gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        {!isMe && (
                          <div className="avatar w-7 h-7 text-[10px] font-bold shrink-0 mt-0.5">
                            {activeContact.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div
                          className={`p-3.5 rounded-2xl max-w-md ${
                            isMe
                              ? "bg-[var(--tertiary)] text-white shadow-sm"
                              : "bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-[var(--on-surface)]"
                          }`}
                        >
                          <p className="leading-relaxed text-xs">{m.content}</p>
                          <span
                            className={`block text-[9px] mt-1 text-right ${
                              isMe ? "text-white/80" : "text-[var(--on-surface-variant)]"
                            }`}
                          >
                            {timeStr}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-[var(--outline-variant)]">
                <input
                  type="text"
                  placeholder={`Message ${activeContact.fullName}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={sendMutation.isPending}
                  className="w-full text-xs p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] focus:outline-none focus:border-[var(--tertiary)]"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sendMutation.isPending}
                  className="btn-primary shrink-0 px-5 text-xs shadow-md disabled:opacity-50"
                >
                  {sendMutation.isPending ? (
                    "Sending..."
                  ) : (
                    <>
                      <i className="ti ti-send text-sm mr-1"></i> Send
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-xs text-[var(--on-surface-variant)] flex-1">
              <i className="ti ti-messages text-4xl mb-2 text-[var(--outline)]"></i>
              <p className="font-semibold text-sm mb-1">Select a Contact</p>
              <p>Choose a lecturer or student from the left panel to start messaging.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
