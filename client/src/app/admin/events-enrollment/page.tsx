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

const INITIAL_EVENTS: EventItem[] = [];

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [];

const BATCHES = ["Batch CS2023-A", "Batch CS2023-B", "Batch SE2024-A"];
const COURSES = [
  { code: "SE308.3", title: "Software Process Management", credits: 3 },
  { code: "SE202.2", title: "Database Systems", credits: 3 },
  { code: "SE309.3", title: "Software Verification & Validation", credits: 3 },
];

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useEffect } from "react";

export default function Page() {
  useInteractive();

  const { data: eventsResponse } = useQuery({
    queryKey: ["upcomingEvents"],
    queryFn: () => api.get<any>("/api/v1/events/upcoming"),
  });

  const { data: announcementsResponse } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => api.get<any>("/api/v1/announcements/me?scope=INSTITUTION&scopeId=1"),
  });

  const apiEvents: EventItem[] = eventsResponse?.dataList
    ? eventsResponse.dataList.map((e: any) => ({
        id: String(e.eventId),
        title: e.title || "",
        date: e.startTime ? new Date(e.startTime).toISOString().split("T")[0] : "2026-08-25",
        venue: e.location || e.venue || "Main Auditorium",
        scope: e.scope || "Institution-wide",
        rsvps: [],
      }))
    : INITIAL_EVENTS;

  const apiAnnouncements: AnnouncementItem[] = announcementsResponse?.dataList
    ? announcementsResponse.dataList.map((a: any) => ({
        id: String(a.announcementId),
        title: a.title || "",
        message: a.content || a.message || "",
        publishedAt: a.createdAt ? new Date(a.createdAt).toLocaleString() : "Recently",
      }))
    : INITIAL_ANNOUNCEMENTS;

  const [events, setEvents] = useState<EventItem[]>(apiEvents);
  const [selectedEventId, setSelectedEventId] = useState<string | null>("ev-1");

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(apiAnnouncements);

  useEffect(() => {
    if (apiEvents) setEvents(apiEvents);
  }, [eventsResponse]);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newScope, setNewScope] = useState("Institution-wide");

  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");

  
  const [enrollStep, setEnrollStep] = useState<1 | 2 | 3>(1);
  const [selectedEnrollBatch, setSelectedEnrollBatch] = useState(BATCHES[0]);
  const [selectedEnrollCourse, setSelectedEnrollCourse] = useState(COURSES[0].code);
  const [enrollSuccessMessage, setEnrollSuccessMessage] = useState("");

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
  };

  const handleCompleteBatchEnrollment = () => {
    setEnrollSuccessMessage(`Successfully enrolled all 42 students from ${selectedEnrollBatch} into ${selectedEnrollCourse}!`);
    setTimeout(() => {
      setEnrollSuccessMessage("");
      setEnrollStep(1);
    }, 4000);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full space-y-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Events & Batch Enrollment Wizard
          </h1>
          <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm">
            Event RSVPs, multi-step batch course enrollment wizard, and institutional announcements.
          </p>
        </div>

        <div className="flex gap-2 border-b border-[var(--outline-variant)]" data-tabgroup="evn">
          <span className="tab-btn active" data-tab="ev">Events</span>
          <span className="tab-btn" data-tab="ann">Announcements</span>
          <span className="tab-btn" data-tab="wizard">Batch Enrollment Wizard</span>
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
                  <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Event title" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                    Description
                  </label>
                  <textarea rows={2} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                  <input type="text" value={newVenue} onChange={(e) => setNewVenue(e.target.value)} placeholder="Venue" />
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
                {events.map((ev) => (
                  <div key={ev.id} className="border border-[var(--outline-variant)] rounded-xl p-4 bg-[var(--surface-container-low)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-[var(--on-surface)]">{ev.title}</span>
                      <span className="badge badge-accent text-[10px]">{ev.rsvps.length} RSVPs</span>
                    </div>
                    <p className="text-xs text-[var(--on-surface-variant)]">{ev.date} · {ev.venue}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        
        <div id="evn-ann" data-tabpanel="evn" className="hidden">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-1 space-y-4">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)]">
                Publish Notice
              </h3>
              <form onSubmit={handlePublishAnnouncement} className="space-y-4">
                <input type="text" required placeholder="Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} className="w-full text-xs" />
                <textarea rows={4} required placeholder="Message..." value={annMessage} onChange={(e) => setAnnMessage(e.target.value)} className="w-full text-xs"></textarea>
                <button type="submit" className="btn-primary shadow-md w-full justify-center">Publish</button>
              </form>
            </div>
            <div className="card p-6 lg:col-span-2 space-y-3">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] pb-3 border-b border-[var(--outline-variant)]">
                Published Announcements ({announcements.length})
              </h3>
              {announcements.map((ann) => (
                <div key={ann.id} className="p-4 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] space-y-1">
                  <h4 className="font-bold text-sm text-[var(--on-surface)]">{ann.title}</h4>
                  <p className="text-xs text-[var(--on-surface-variant)]">{ann.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        
        <div id="evn-wizard" data-tabpanel="evn" className="hidden space-y-6">
          {enrollSuccessMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-2">
              <i className="ti ti-check text-base"></i> {enrollSuccessMessage}
            </div>
          )}

          <div className="card p-6 space-y-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
            
            <div className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-4">
              <div className={`flex items-center gap-2 text-xs font-bold ${enrollStep === 1 ? "text-[var(--tertiary)]" : "text-[var(--on-surface-variant)]"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${enrollStep === 1 ? "bg-[var(--tertiary)] text-white" : "bg-[var(--surface-container-high)]"}`}>1</span>
                <span>Select Target Batch</span>
              </div>
              <i className="ti ti-chevron-right text-[var(--outline)]"></i>
              <div className={`flex items-center gap-2 text-xs font-bold ${enrollStep === 2 ? "text-[var(--tertiary)]" : "text-[var(--on-surface-variant)]"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${enrollStep === 2 ? "bg-[var(--tertiary)] text-white" : "bg-[var(--surface-container-high)]"}`}>2</span>
                <span>Select Course Offering</span>
              </div>
              <i className="ti ti-chevron-right text-[var(--outline)]"></i>
              <div className={`flex items-center gap-2 text-xs font-bold ${enrollStep === 3 ? "text-[var(--tertiary)]" : "text-[var(--on-surface-variant)]"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${enrollStep === 3 ? "bg-[var(--tertiary)] text-white" : "bg-[var(--surface-container-high)]"}`}>3</span>
                <span>Bulk Confirm Enrollment</span>
              </div>
            </div>

            
            {enrollStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-[var(--on-surface)]">Step 1: Select Target Student Batch</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {BATCHES.map((b) => (
                    <div
                      key={b}
                      onClick={() => setSelectedEnrollBatch(b)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedEnrollBatch === b ? "border-[var(--tertiary)] bg-[var(--tertiary-container)]/20 ring-2 ring-[var(--tertiary)]" : "border-[var(--outline-variant)] bg-[var(--surface-container-low)]"}`}
                    >
                      <p className="font-bold text-sm text-[var(--on-surface)]">{b}</p>
                      <p className="text-xs text-[var(--on-surface-variant)] mt-1">42 Enrolled Students</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-3">
                  <button onClick={() => setEnrollStep(2)} className="btn-primary text-xs shadow-md">
                    Next: Choose Course Offering <i className="ti ti-arrow-right ml-1"></i>
                  </button>
                </div>
              </div>
            )}

            
            {enrollStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-[var(--on-surface)]">
                  Step 2: Select Course Offering for <span className="text-[var(--tertiary)]">{selectedEnrollBatch}</span>
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {COURSES.map((c) => (
                    <div
                      key={c.code}
                      onClick={() => setSelectedEnrollCourse(c.code)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedEnrollCourse === c.code ? "border-[var(--tertiary)] bg-[var(--tertiary-container)]/20 ring-2 ring-[var(--tertiary)]" : "border-[var(--outline-variant)] bg-[var(--surface-container-low)]"}`}
                    >
                      <span className="badge badge-accent text-[10px] mb-2">{c.code}</span>
                      <p className="font-bold text-sm text-[var(--on-surface)]">{c.title}</p>
                      <p className="text-xs text-[var(--on-surface-variant)] mt-1">{c.credits} Credits · Core Offering</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-3">
                  <button onClick={() => setEnrollStep(1)} className="btn-secondary text-xs">
                    <i className="ti ti-arrow-left mr-1"></i> Back
                  </button>
                  <button onClick={() => setEnrollStep(3)} className="btn-primary text-xs shadow-md">
                    Next: Review & Bulk Enroll <i className="ti ti-arrow-right ml-1"></i>
                  </button>
                </div>
              </div>
            )}

            
            {enrollStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-[var(--on-surface)]">Step 3: Review & Confirm Bulk Enrollment</h3>
                <div className="p-4 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] space-y-2 text-xs">
                  <p className="font-bold text-[var(--on-surface)]">Enrollment Summary:</p>
                  <p className="text-[var(--on-surface-variant)]">Batch: <b>{selectedEnrollBatch}</b> (42 Students)</p>
                  <p className="text-[var(--on-surface-variant)]">Course: <b>{selectedEnrollCourse}</b></p>
                </div>

                <div className="flex justify-between pt-3">
                  <button onClick={() => setEnrollStep(2)} className="btn-secondary text-xs">
                    <i className="ti ti-arrow-left mr-1"></i> Back
                  </button>
                  <button onClick={handleCompleteBatchEnrollment} className="btn-primary text-xs shadow-md">
                    <i className="ti ti-user-check mr-1"></i> Confirm Bulk Batch Enrollment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
