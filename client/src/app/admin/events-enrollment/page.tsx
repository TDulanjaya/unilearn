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

export default function Page() {
  useInteractive();

  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string | null>("ev-1");

  // New Event Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newScope, setNewScope] = useState("Institution-wide");

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

  // Toggle Attendee RSVP status
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

  // Add Mock RSVP
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

  const activeEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Events & Enrollment
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Create events, manage student RSVP registrations, and assign students to batches.
          </p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-[var(--outline-variant)]" data-tabgroup="evn">
          <span className="tab-btn active" data-tab="ev">Events & RSVPs</span>
          <span className="tab-btn" data-tab="reg">Registrations List</span>
          <span className="tab-btn" data-tab="enr">Batch Enrollment</span>
        </div>

        <div id="evn-ev" data-tabpanel="evn">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Create Event Form */}
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

            {/* Upcoming Events & RSVP List (FR-EVENT-01) */}
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

                      {/* Expandable RSVP Panel */}
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

        <div id="evn-reg" data-tabpanel="evn" className="hidden">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                {activeEvent ? `${activeEvent.title} — ${activeEvent.rsvps.length} registered` : "Event Registrations"}
              </h3>
              <button className="btn-secondary text-xs !py-1.5 shadow-sm">
                <i className="ti ti-download"></i> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                    <th className="pb-3 px-3 font-semibold">Student</th>
                    <th className="pb-3 px-3 font-semibold">Batch</th>
                    <th className="pb-3 px-3 font-semibold">RSVP Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline-variant)]">
                  {activeEvent?.rsvps.map((r) => (
                    <tr key={r.id} className="table-row transition-colors">
                      <td className="py-3 px-3 font-semibold text-[var(--on-surface)]">{r.studentName}</td>
                      <td className="py-3 px-3 text-[var(--on-surface-variant)]">{r.batchName}</td>
                      <td className="py-3 px-3">
                        <span className={`badge ${r.status === "Attending" ? "badge-success" : r.status === "Declined" ? "badge-danger" : "badge-warning"}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="evn-enr" data-tabpanel="evn" className="hidden">
          <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
            <div className="card p-6">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-4 pb-2 border-b border-[var(--outline-variant)]">
                Unassigned Students (42)
              </h3>
              <div className="space-y-2.5 text-sm">
                <label className="flex items-center gap-3 border border-[var(--outline-variant)] rounded-xl px-4 py-2.5 text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  <input type="checkbox" /> R. Munasinghe
                </label>
                <label className="flex items-center gap-3 border border-[var(--outline-variant)] rounded-xl px-4 py-2.5 text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  <input type="checkbox" /> D. Abeywickrama
                </label>
              </div>
            </div>
            <div className="pt-10 flex justify-center">
              <button className="btn-primary shadow-md">
                <i className="ti ti-arrow-right"></i>
              </button>
            </div>
            <div className="card p-6">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-4 pb-2 border-b border-[var(--outline-variant)]">
                Target: CS2026-A / SE101.1
              </h3>
              <div className="space-y-3">
                <select><option>Batch CS2026-A</option></select>
                <select><option>Course offering SE101.1</option></select>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
