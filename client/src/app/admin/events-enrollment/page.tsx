"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";

type RsvpStatus = "Attending" | "Declined" | "Pending";

interface RsvpAttendee {
  id: string;
  studentName: string;
  batchName: string;
  status: RsvpStatus;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  venue: string;
  scope: string;
  rsvps: RsvpAttendee[];
}

interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  publishedAt: string;
}

const INITIAL_EVENTS: EventItem[] = [
  {
    id: "ev-1",
    title: "Career Fair 2026",
    date: "2026-08-25",
    venue: "Main Gymnasium & Exhibition Center",
    scope: "Institution-wide",
    rsvps: [
      { id: "r-1", studentName: "Nadeesha Silva", batchName: "CS2023-A", status: "Attending" },
      { id: "r-2", studentName: "Kasun Perera", batchName: "CS2023-A", status: "Attending" },
      { id: "r-3", studentName: "Dilan Fernando", batchName: "CS2023-B", status: "Declined" },
      { id: "r-4", studentName: "Ruwan Munaweera", batchName: "SE2024-A", status: "Pending" },
      { id: "r-5", studentName: "Tharushi Wickrama", batchName: "CS2023-A", status: "Attending" },
    ],
  },
  {
    id: "ev-2",
    title: "AI in Practice — Guest Lecture",
    date: "2026-09-02",
    venue: "Auditorium 2",
    scope: "Faculty of Computing",
    rsvps: [
      { id: "r-6", studentName: "Amaya Jayawardena", batchName: "CS2023-B", status: "Attending" },
      { id: "r-7", studentName: "Bhanuka Mendis", batchName: "SE2024-A", status: "Attending" },
      { id: "r-8", studentName: "Sachini Ratnayake", batchName: "CS2023-A", status: "Pending" },
    ],
  },
];

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "ann-1",
    title: "Semester 1 Final Examination Schedule Released",
    message: "The finalized examination timetable for all undergraduate programs is now available on the student portal. Please review your exam dates and room allocations carefully.",
    publishedAt: "2026-08-01 10:30 AM",
  },
  {
    id: "ann-2",
    title: "Campus Infrastructure Maintenance Notice",
    message: "Network infrastructure maintenance will take place this Saturday from 00:00 to 04:00 AM. Student portal access may be briefly interrupted during this window.",
    publishedAt: "2026-07-28 04:15 PM",
  },
];

export default function Page() {
  useInteractive();

  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string | null>("ev-1");

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newScope, setNewScope] = useState("Institution-wide");

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [annSuccessMsg, setAnnSuccessMsg] = useState<string | null>(null);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: EventItem = {
      id: "ev-" + Date.now(),
      title: newTitle.trim(),
      date: newDate || "2026-09-15",
      venue: newVenue || "Main Hall",
      scope: newScope,
      rsvps: [],
    };
    setEvents((prev) => [created, ...prev]);
    setSelectedEventId(created.id);

    setNewTitle("");
    setNewDesc("");
    setNewDate("");
    setNewVenue("");
  };

  const handleToggleRsvpStatus = (eventId: string, rsvpId: string) => {
    const statusCycle: RsvpStatus[] = ["Attending", "Declined", "Pending"];
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          rsvps: ev.rsvps.map((r) => {
            if (r.id !== rsvpId) return r;
            const nextIndex = (statusCycle.indexOf(r.status) + 1) % statusCycle.length;
            return { ...r, status: statusCycle[nextIndex] };
          }),
        };
      })
    );
  };

  const handleAddMockRsvp = (eventId: string) => {
    const mockNames = [
      "Dinuka Karunaratne",
      "Malith Senanayake",
      "Chathuri Abeyrathna",
      "Pawan Mendis",
      "Sahan Wickramasinghe",
    ];
    const mockBatches = ["CS2023-A", "CS2023-B", "SE2024-A"];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const randomBatch = mockBatches[Math.floor(Math.random() * mockBatches.length)];

    const newRsvp: RsvpAttendee = {
      id: "r-" + Date.now(),
      studentName: randomName,
      batchName: randomBatch,
      status: "Attending",
    };

    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, rsvps: [newRsvp, ...ev.rsvps] } : ev))
    );
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;

    const now = new Date();
    const formattedDate = `${now.toISOString().split("T")[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newAnn: AnnouncementItem = {
      id: "ann-" + Date.now(),
      title: annTitle.trim(),
      message: annMessage.trim(),
      publishedAt: formattedDate,
    };

    setAnnouncements((prev) => [newAnn, ...prev]);
    setAnnTitle("");
    setAnnMessage("");
    setAnnSuccessMsg("Announcement published successfully!");
    setTimeout(() => setAnnSuccessMsg(null), 4000);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Events & Announcements
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Create events, track student RSVP registrations, and publish institution-wide announcements.
          </p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-[var(--outline-variant)]" data-tabgroup="evn">
          <span className="tab-btn active" data-tab="ev">Events</span>
          <span className="tab-btn" data-tab="ann">Announcements</span>
        </div>

        <div id="evn-ev" data-tabpanel="evn">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Create Event
              </h3>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Description"
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                  <input
                    type="text"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    placeholder="Venue"
                  />
                </div>
                <select value={newScope} onChange={(e) => setNewScope(e.target.value)}>
                  <option>Institution-wide</option>
                  <option>Faculty of Computing</option>
                  <option>Faculty of Business</option>
                </select>
                <button type="submit" className="btn-primary shadow-md">Publish event</button>
              </form>
            </div>

            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Upcoming Events & RSVP Counts
              </h3>

              <div className="space-y-4">
                {events.map((ev) => {
                  const attendingCount = ev.rsvps.filter((r) => r.status === "Attending").length;
                  const isExpanded = selectedEventId === ev.id;

                  return (
                    <div key={ev.id} className="border border-[var(--outline-variant)] rounded-xl overflow-hidden bg-[var(--surface-container-low)]">
                      <div className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-[var(--on-surface)]">{ev.title}</span>
                            <span className="badge badge-accent text-[10px]">{attendingCount} Attending</span>
                          </div>
                          <p className="text-xs text-[var(--on-surface-variant)]">
                            <i className="ti ti-calendar text-xs mr-1 text-[var(--tertiary)]"></i>{ev.date} · {ev.venue}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddMockRsvp(ev.id)}
                            className="btn-secondary text-[11px] !py-1"
                            title="Add a test RSVP entry"
                          >
                            + Mock RSVP
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedEventId(isExpanded ? null : ev.id)}
                            className="btn-secondary text-xs !py-1"
                          >
                            {isExpanded ? "Hide RSVPs" : "View RSVPs"}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 border-t border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] animate-in fade-in duration-150">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-[var(--on-surface)]">
                              RSVP Attendees ({ev.rsvps.length} total)
                            </p>
                            <span className="text-[10px] text-[var(--on-surface-variant)]">Click status badge to cycle status</span>
                          </div>

                          {ev.rsvps.length === 0 ? (
                            <p className="text-xs text-[var(--on-surface-variant)] italic">No RSVPs recorded yet. Click &apos;+ Mock RSVP&apos; above.</p>
                          ) : (
                            <div className="space-y-2">
                              {ev.rsvps.map((r) => (
                                <div key={r.id} className="flex items-center justify-between text-xs p-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)]">
                                  <div>
                                    <p className="font-semibold text-[var(--on-surface)]">{r.studentName}</p>
                                    <p className="text-[10px] text-[var(--on-surface-variant)]">{r.batchName}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleRsvpStatus(ev.id, r.id)}
                                    className={`badge cursor-pointer transition-transform hover:scale-105 ${
                                      r.status === "Attending"
                                        ? "badge-success"
                                        : r.status === "Declined"
                                        ? "badge-danger"
                                        : "badge-warning"
                                    }`}
                                  >
                                    {r.status} <i className="ti ti-refresh text-[10px] ml-1"></i>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div id="evn-ann" data-tabpanel="evn" className="hidden">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-1">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Institution-wide Announcement
              </h3>

              {annSuccessMsg && (
                <div className="mb-4 p-3 rounded-xl bg-[var(--surface-container-high)] border border-[var(--tertiary)] text-[var(--tertiary)] text-xs font-semibold flex items-center justify-between animate-fadeIn">
                  <span className="flex items-center gap-2">
                    <i className="ti ti-circle-check text-base"></i> {annSuccessMsg}
                  </span>
                  <button onClick={() => setAnnSuccessMsg(null)} className="hover:opacity-75 font-bold text-sm">×</button>
                </div>
              )}

              <form onSubmit={handlePublishAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Announcement title..."
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write message details..."
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                    className="w-full text-xs"
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary shadow-md w-full justify-center">
                  <i className="ti ti-speakerphone mr-1"></i> Publish institution-wide
                </button>
              </form>
            </div>

            <div className="card p-6 lg:col-span-2">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)] flex items-center justify-between">
                <span>Published Announcements ({announcements.length})</span>
                <span className="text-xs font-normal text-[var(--on-surface-variant)]">Most recent first</span>
              </h3>

              {announcements.length === 0 ? (
                <p className="text-xs text-[var(--on-surface-variant)] italic text-center py-8">
                  No announcements published yet. Fill in the form on the left to publish one.
                </p>
              ) : (
                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-4 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] space-y-2 transition-colors hover:border-[var(--outline)]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-[var(--on-surface)]">{ann.title}</h4>
                        <span className="badge badge-accent text-[10px] flex items-center gap-1">
                          <i className="ti ti-clock text-[9px]"></i> {ann.publishedAt}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed whitespace-pre-line">
                        {ann.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
