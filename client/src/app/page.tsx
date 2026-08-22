"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

interface EventDisplayItem {
  id?: number | string;
  day: string;
  month: string;
  time?: string;
  venue: string;
  title: string;
  desc: string;
  category: string;
  posterUrl?: string;
}

function resolvePosterUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  return `${apiBase.replace(/\/+$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
}

// Academic Programs & Faculties
const FACULTIES_DATA = [
  {
    id: "computing",
    name: "Faculty of Computing",
    tagline: "Pioneering Software Engineering, AI & Cybersecurity",
    icon: "ti-code",
    color: "from-blue-950 via-teal-900 to-emerald-950",
    badge: "Accredited by BCS & IESL",
    stats: "3,400+ Undergraduates · 18 Research Labs",
    programs: [
      { name: "BSc (Hons) in Software Engineering", duration: "4 Years", type: "Undergraduate" },
      { name: "BSc (Hons) in Artificial Intelligence & Data Science", duration: "4 Years", type: "Undergraduate" },
      { name: "BSc (Hons) in Cybersecurity & Cloud Computing", duration: "4 Years", type: "Undergraduate" },
      { name: "MSc in Computer Science & Applied AI", duration: "2 Years", type: "Postgraduate" },
    ],
  },
  {
    id: "business",
    name: "Faculty of Business & Management",
    tagline: "Cultivating Next-Generation Enterprise Leaders & Innovators",
    icon: "ti-building-bank",
    color: "from-blue-950 via-indigo-950 to-slate-900",
    badge: "AACSB Member Institution",
    stats: "2,200+ Undergraduates · 95% Placement",
    programs: [
      { name: "BBA (Hons) in Management Information Systems", duration: "3-4 Years", type: "Undergraduate" },
      { name: "BSc (Hons) in Financial Technology & Analytics", duration: "4 Years", type: "Undergraduate" },
      { name: "BBA (Hons) in International Business & Marketing", duration: "3-4 Years", type: "Undergraduate" },
      { name: "Master of Business Administration (Executive MBA)", duration: "2 Years", type: "Postgraduate" },
    ],
  },
  {
    id: "engineering",
    name: "Faculty of Engineering & Technology",
    tagline: "Designing Intelligent Systems, Robotics & Infrastructure",
    icon: "ti-settings",
    color: "from-slate-950 via-cyan-950 to-blue-950",
    badge: "Washington Accord Recognized",
    stats: "1,800+ Undergraduates · 12 Maker Spaces",
    programs: [
      { name: "BSc (Eng) Hons in Electronic & Mechatronics Engineering", duration: "4 Years", type: "Undergraduate" },
      { name: "BSc (Eng) Hons in Computer Systems & IoT", duration: "4 Years", type: "Undergraduate" },
      { name: "BSc (Eng) Hons in Electrical & Smart Grid Systems", duration: "4 Years", type: "Undergraduate" },
      { name: "MSc in Autonomous Systems & Robotics", duration: "2 Years", type: "Postgraduate" },
    ],
  },
  {
    id: "science",
    name: "Faculty of Applied Sciences",
    tagline: "Discovery-Driven Research in Mathematics & Bio-Sciences",
    icon: "ti-flask",
    color: "from-teal-950 via-emerald-950 to-slate-900",
    badge: "National Science Foundation Partner",
    stats: "1,200+ Undergraduates · 8 Centers of Excellence",
    programs: [
      { name: "BSc (Hons) in Computational Mathematics & Statistics", duration: "4 Years", type: "Undergraduate" },
      { name: "BSc (Hons) in Bioinformatics & Genomic Analytics", duration: "4 Years", type: "Undergraduate" },
      { name: "BSc (Hons) in Data Science & Operational Research", duration: "4 Years", type: "Undergraduate" },
      { name: "MSc in Quantitative Modeling & Analytics", duration: "2 Years", type: "Postgraduate" },
    ],
  },
];

// Academic Events
const UPCOMING_EVENTS = [
  {
    day: "28",
    month: "AUG",
    time: "09:00 AM - 04:30 PM",
    venue: "Main Convocation Hall & Live Stream",
    title: "Fall 2026 University Open Day & Degree Fair",
    desc: "Meet faculty deans, explore state-of-the-art campus labs, and receive instant on-the-spot admission evaluations.",
    category: "Admissions",
  },
  {
    day: "04",
    month: "SEP",
    time: "02:00 PM - 06:00 PM",
    venue: "Auditorium Complex 1",
    title: "International Symposium on Advances in Applied Computing (ISAAC 2026)",
    desc: "Keynote addresses by leading scholars from industry and global research institutes on generative AI and quantum algorithms.",
    category: "Conference",
  },
  {
    day: "12",
    month: "SEP",
    time: "10:00 AM - 01:00 PM",
    venue: "Student Activity Center",
    title: "Semester 2 New Undergraduate Orientation & Induction",
    desc: "Official welcome for enrolled students, campus library walkthroughs, student union societies registration, and LMS access.",
    category: "Orientation",
  },
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("computing");
  const [liveEvents, setLiveEvents] = useState<EventDisplayItem[]>(UPCOMING_EVENTS);
  const [selectedPosterModal, setSelectedPosterModal] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    async function fetchUpcomingEvents() {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiBase.replace(/\/+$/, "")}/api/v1/events/upcoming?size=6`);
        if (!res.ok) return;
        const data = await res.json();
        const items = Array.isArray(data) ? data : data?.content || data?.dataList || [];
        if (items.length > 0) {
          const parsed: EventDisplayItem[] = items.map((e: any) => {
            const rawDate = e.eventDate || e.startDateTime || "";
            let day = "28";
            let month = "AUG";
            let time = "09:00 AM - 04:00 PM";
            if (rawDate) {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) {
                day = String(d.getDate()).padStart(2, "0");
                month = d.toLocaleString("default", { month: "short" }).toUpperCase();
                time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              }
            }
            return {
              id: e.eventId || e.id,
              day,
              month,
              time,
              venue: e.venue || "University Main Campus",
              title: e.name || e.title || "Academic Event",
              desc: e.description || "",
              category: e.facultyName || "Campus Event",
              posterUrl: e.posterUrl || "",
            };
          });
          setLiveEvents(parsed);
        }
      } catch {
        // Keep fallback UPCOMING_EVENTS
      }
    }
    fetchUpcomingEvents();
  }, []);

  const currentFaculty = FACULTIES_DATA.find((f) => f.id === selectedFaculty) || FACULTIES_DATA[0];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--on-background)] transition-colors duration-300 antialiased selection:bg-[#006a61] selection:text-white">
      
      {/* ─── Main University Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass border-b border-[var(--glass-border)] backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Logo & Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] rounded-xl transition-colors"
              aria-label="Toggle navigation menu"
            >
              <i className={`ti ${isMenuOpen ? "ti-x" : "ti-menu-2"} text-xl`}></i>
            </button>
            <Link href="/" className="flex items-center group">
              <Logo />
            </Link>
          </div>

          {/* Desktop Navigation Links (Clean, Single Line, No Wrapping) */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-9 text-sm font-semibold text-[var(--on-surface-variant)] whitespace-nowrap">
            <a href="#about" className="hover:text-[var(--on-surface)] transition-colors">
              About
            </a>
            <a href="#faculties" className="hover:text-[var(--on-surface)] transition-colors">
              Faculties &amp; Degrees
            </a>
            <a href="#campus-life" className="hover:text-[var(--on-surface)] transition-colors">
              Campus Life
            </a>
            <a href="#events" className="hover:text-[var(--on-surface)] transition-colors">
              Academic Events
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/login"
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] border border-[var(--outline-variant)] transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <i className="ti ti-user-circle text-base text-[var(--tertiary)]"></i>
              <span>Portal Sign In</span>
            </Link>
            <Link
              href="/login"
              className="btn-primary text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-xl shadow-md font-bold whitespace-nowrap hidden sm:inline-flex items-center gap-1.5"
            >
              <span>Apply Now</span>
              <i className="ti ti-arrow-right text-xs"></i>
            </Link>
            <ThemeToggle />
          </div>

        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <nav className="lg:hidden px-4 pt-3 pb-5 border-t border-[var(--glass-border)] flex flex-col space-y-2 text-sm font-bold bg-[var(--surface)]/95 backdrop-blur-md">
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="p-2.5 rounded-xl text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] transition">
              About University
            </a>
            <a href="#faculties" onClick={() => setIsMenuOpen(false)} className="p-2.5 rounded-xl text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] transition">
              Faculties &amp; Degrees
            </a>
            <a href="#campus-life" onClick={() => setIsMenuOpen(false)} className="p-2.5 rounded-xl text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] transition">
              Campus Life
            </a>
            <a href="#events" onClick={() => setIsMenuOpen(false)} className="p-2.5 rounded-xl text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] transition">
              Academic Events
            </a>
            <div className="pt-2 border-t border-[var(--outline-variant)] flex flex-col gap-2">
              <Link href="/login" className="btn-primary w-full justify-center text-center">
                Access Student &amp; Staff Portal
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        
        {/* ─── Hero Section: Prestigious University Campus ──────────────────── */}
        <section className="relative bg-[#071321] text-white pt-16 sm:pt-24 pb-28 sm:pb-36 overflow-hidden">
          
          {/* Background Ambient Lighting & Texture */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4cd7f6_1px,transparent_1px)] [background-size:24px_24px]"></div>
          <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-gradient-to-tr from-[#006a61] to-[#0090a9] opacity-25 blur-[140px] rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-tr from-[#0d1c2e] to-[#4cd7f6] opacity-20 blur-[130px] rounded-full pointer-events-none"></div>

          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6 flex flex-col items-center">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-[#6bd8cb] backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>National Institute of Higher Learning · Est. 1999</span>
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-[66px] leading-[1.12] tracking-[-0.02em] text-white">
                Empowering Scholars, Innovators &amp;{" "}
                <span className="bg-gradient-to-r from-[#6bd8cb] via-[#4cd7f6] to-white bg-clip-text text-transparent">
                  Global Leaders
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-xl leading-relaxed max-w-2xl font-normal">
                UniLearn is a premier university dedicated to academic excellence, state-of-the-art laboratory research, and world-class undergraduate and postgraduate degree pathways.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
                <a
                  href="#faculties"
                  className="bg-gradient-to-r from-[#006a61] to-[#0090a9] hover:from-[#00554e] hover:to-[#00788d] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl hover:scale-105 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <span>Explore Academic Faculties</span>
                  <i className="ti ti-arrow-right text-base"></i>
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* ─── Institutional Key Stats / By The Numbers ─────────────────────── */}
        <section id="about" className="bg-[var(--surface-container-low)] border-y border-[var(--outline-variant)] py-14 relative">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[var(--outline-variant)]">
              
              <div className="pt-4 md:pt-0">
                <p className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--tertiary)]">
                  #1
                </p>
                <p className="text-xs sm:text-sm font-bold text-[var(--on-surface)] mt-1">
                  Private Higher Education Institute
                </p>
                <p className="text-[11px] text-[var(--on-surface-variant)] mt-0.5">
                  Ranked for Computing &amp; Business
                </p>
              </div>

              <div className="pt-4 md:pt-0 md:pl-8">
                <p className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--secondary)]">
                  18,500+
                </p>
                <p className="text-xs sm:text-sm font-bold text-[var(--on-surface)] mt-1">
                  Enrolled Students
                </p>
                <p className="text-[11px] text-[var(--on-surface-variant)] mt-0.5">
                  Undergraduate &amp; Postgraduate Scholars
                </p>
              </div>

              <div className="pt-4 md:pt-0 md:pl-8">
                <p className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--tertiary)]">
                  98.4%
                </p>
                <p className="text-xs sm:text-sm font-bold text-[var(--on-surface)] mt-1">
                  Graduate Employability Rate
                </p>
                <p className="text-[11px] text-[var(--on-surface-variant)] mt-0.5">
                  Placed within 6 months of graduation
                </p>
              </div>

              <div className="pt-4 md:pt-0 md:pl-8">
                <p className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--secondary)]">
                  140+
                </p>
                <p className="text-xs sm:text-sm font-bold text-[var(--on-surface)] mt-1">
                  Global Academic Alliances
                </p>
                <p className="text-[11px] text-[var(--on-surface-variant)] mt-0.5">
                  UK, Australia &amp; US Dual Degrees
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ─── Academic Faculties & Degree Pathways ─────────────────────────── */}
        <section id="faculties" className="max-w-[1400px] mx-auto px-6 py-24 sm:py-32">
          
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-3">
            <p className="eyebrow">Academic Excellence</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--on-surface)]">
              Academic Faculties &amp; Degree Programs
            </h2>
            <p className="text-[var(--on-surface-variant)] text-base">
              Discover industry-focused degrees configured to meet international quality standards and future industry demands.
            </p>
          </div>

          {/* Faculty Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {FACULTIES_DATA.map((fac) => {
              const isSelected = selectedFaculty === fac.id;
              return (
                <button
                  key={fac.id}
                  onClick={() => setSelectedFaculty(fac.id)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-display font-bold text-sm transition-all duration-200 border ${
                    isSelected
                      ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-lg shadow-[var(--primary)]/15 scale-105"
                      : "bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] border-[var(--outline-variant)] hover:bg-[var(--surface-container)]"
                  }`}
                >
                  <i className={`ti ${fac.icon} text-lg ${isSelected ? "text-[var(--secondary-container)]" : ""}`}></i>
                  <span>{fac.name}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Faculty Details Card */}
          <div className="glass rounded-3xl p-6 sm:p-10 border border-[var(--glass-border)] shadow-2xl max-w-5xl mx-auto space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--outline-variant)]">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--tertiary-container)]/30 text-[var(--tertiary)] text-xs font-bold mb-2">
                  <span>{currentFaculty.badge}</span>
                </div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)]">
                  {currentFaculty.name}
                </h3>
                <p className="text-sm text-[var(--on-surface-variant)] mt-1">
                  {currentFaculty.tagline}
                </p>
              </div>
              <div className="text-left md:text-right">
                <span className="text-xs font-bold text-[var(--secondary)] bg-[var(--secondary-container)]/30 px-3 py-1.5 rounded-xl border border-[var(--secondary)]/20">
                  {currentFaculty.stats}
                </span>
              </div>
            </div>

            {/* Degree Programs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentFaculty.programs.map((prog, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] hover:border-[var(--tertiary)] transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]">
                      {prog.type}
                    </span>
                    <span className="text-xs font-semibold text-[var(--on-surface-variant)] flex items-center gap-1">
                      <i className="ti ti-clock text-xs text-[var(--tertiary)]"></i>
                      <span>{prog.duration}</span>
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-base text-[var(--on-surface)] group-hover:text-[var(--tertiary)] transition-colors">
                    {prog.name}
                  </h4>

                  <div className="pt-2 border-t border-[var(--outline-variant)]/60 flex items-center justify-between text-xs font-semibold text-[var(--on-surface-variant)]">
                    <span className="flex items-center gap-1.5">
                      <i className="ti ti-certificate text-xs text-[var(--tertiary)]"></i>
                      <span>Accredited Degree</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--tertiary)]">
                      Full-Time
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </section>

        {/* ─── Upcoming Academic Events Calendar ─────────────────────────────── */}
        <section id="events" className="bg-[var(--surface-container-low)] border-y border-[var(--outline-variant)] py-24 sm:py-32">
          <div className="max-w-[1400px] mx-auto px-6">
            
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <p className="eyebrow">Campus Calendar</p>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--on-surface)]">
                Upcoming Academic Events
              </h2>
              <p className="text-[var(--on-surface-variant)] text-base">
                Mark your calendar for symposia, degree orientations, and public lectures.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {liveEvents.map((evt, idx) => (
                <div
                  key={evt.id || idx}
                  className="glass rounded-3xl p-5 border border-[var(--glass-border)] shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-4 group overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Event Poster Image (if uploaded by admin) */}
                    {evt.posterUrl ? (
                      <div
                        onClick={() => setSelectedPosterModal({ title: evt.title, url: resolvePosterUrl(evt.posterUrl) })}
                        className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden cursor-pointer bg-slate-900 border border-[var(--outline-variant)]/60 shadow-inner group/poster"
                      >
                        <img
                          src={resolvePosterUrl(evt.posterUrl)}
                          alt={evt.title}
                          className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-end justify-between p-3.5">
                          <span className="text-[11px] font-bold text-white flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-lg backdrop-blur-md">
                            <i className="ti ti-zoom-in text-sm text-[#4cd7f6]"></i>
                            <span>View Full Poster</span>
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {/* Date badge & Category */}
                    <div className="flex items-center gap-3">
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[var(--surface-container-high)] border border-[var(--outline-variant)] flex flex-col items-center justify-center font-bold shrink-0 text-[var(--tertiary)] p-2">
                        <span className="text-lg leading-none">{evt.day}</span>
                        <span className="text-[10px] tracking-wider uppercase mt-0.5">{evt.month}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--tertiary-container)]/40 text-[var(--tertiary)] inline-block truncate max-w-full">
                          {evt.category}
                        </span>
                        {evt.time && (
                          <p className="text-xs text-[var(--on-surface-variant)] mt-1 flex items-center gap-1 font-medium">
                            <i className="ti ti-clock text-xs text-[var(--tertiary)]"></i>
                            <span>{evt.time}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <h3 className="font-display font-bold text-base text-[var(--on-surface)] leading-snug group-hover:text-[var(--tertiary)] transition-colors">
                      {evt.title}
                    </h3>

                    {evt.desc && (
                      <p className="text-[var(--on-surface-variant)] text-xs leading-relaxed line-clamp-3">
                        {evt.desc}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[var(--outline-variant)]/60 text-xs text-[var(--on-surface-variant)] flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1 truncate max-w-[70%]">
                      <i className="ti ti-map-pin text-[var(--tertiary)] shrink-0"></i>
                      <span className="truncate">{evt.venue}</span>
                    </span>
                    {evt.posterUrl && (
                      <button
                        onClick={() => setSelectedPosterModal({ title: evt.title, url: resolvePosterUrl(evt.posterUrl) })}
                        className="text-[11px] font-bold text-[var(--tertiary)] hover:underline flex items-center gap-1 shrink-0"
                      >
                        <i className="ti ti-photo text-xs"></i>
                        <span>Poster</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ─── Campus Life & Facilities ─────────────────────────────────────── */}
        <section id="campus-life" className="max-w-[1400px] mx-auto px-6 py-24 sm:py-32">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <p className="eyebrow">Vibrant Student Experience</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--on-surface)]">
              Life on Campus &amp; Student Development
            </h2>
            <p className="text-[var(--on-surface-variant)] text-base">
              Beyond lectures and coursework, UniLearn provides a world-class environment fostering innovation, leadership, and community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] hover:border-[var(--tertiary)] transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--tertiary-container)]/30 text-[var(--tertiary)] flex items-center justify-center font-bold text-xl">
                <i className="ti ti-books"></i>
              </div>
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">
                24/7 Digital Library
              </h3>
              <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
                Over 500,000 journals, IEEE &amp; ACM database access with quiet collaborative study pods.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] hover:border-[var(--tertiary)] transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--tertiary-container)]/30 text-[var(--tertiary)] flex items-center justify-center font-bold text-xl">
                <i className="ti ti-trophy"></i>
              </div>
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">
                Sports &amp; Athletics
              </h3>
              <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
                Olympic swimming pool, indoor arena, fitness gymnasium, and national inter-university leagues.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] hover:border-[var(--tertiary)] transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--tertiary-container)]/30 text-[var(--tertiary)] flex items-center justify-center font-bold text-xl">
                <i className="ti ti-users-group"></i>
              </div>
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">
                45+ Student Clubs
              </h3>
              <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
                IEEE Student Branch, Hackathons, Rotaract, Toastmasters, Robotics, and Arts Societies.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] hover:border-[var(--tertiary)] transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--tertiary-container)]/30 text-[var(--tertiary)] flex items-center justify-center font-bold text-xl">
                <i className="ti ti-heart-handshake"></i>
              </div>
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">
                Career Guidance Unit
              </h3>
              <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
                One-on-one career coaching, industry internships, and global corporate networking days.
              </p>
            </div>
          </div>

        </section>

      </main>

      {/* ─── Authentic University Footer ───────────────────────────────────── */}
      <footer className="bg-[#050e18] text-slate-400 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 text-sm">
          
          {/* Col 1: University Identity */}
          <div className="space-y-4 md:col-span-2">
            <Logo />
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              UniLearn University is an accredited national higher education institute committed to transformative research, undergraduate excellence, and future leadership development.
            </p>
            <div className="text-xs text-slate-400 space-y-1 pt-1">
              <p className="font-semibold text-slate-300">University Main Campus:</p>
              <p>128 University Park Boulevard, Faculty Quadrant</p>
              <p>Colombo 00700, Sri Lanka</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition" aria-label="Facebook">
                <i className="ti ti-brand-facebook text-sm"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition" aria-label="Twitter">
                <i className="ti ti-brand-x text-sm"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition" aria-label="LinkedIn">
                <i className="ti ti-brand-linkedin text-sm"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition" aria-label="YouTube">
                <i className="ti ti-brand-youtube text-sm"></i>
              </a>
            </div>
          </div>

          {/* Col 2: Academic Faculties */}
          <div>
            <p className="font-display font-bold text-sm mb-4 text-white">Academics</p>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#faculties" className="hover:text-white transition">Faculty of Computing</a></li>
              <li><a href="#faculties" className="hover:text-white transition">Faculty of Business</a></li>
              <li><a href="#faculties" className="hover:text-white transition">Faculty of Engineering</a></li>
              <li><a href="#faculties" className="hover:text-white transition">Faculty of Applied Sciences</a></li>
              <li><a href="#faculties" className="hover:text-white transition">Postgraduate Studies</a></li>
            </ul>
          </div>

          {/* Col 3: Quick Portals */}
          <div>
            <p className="font-display font-bold text-sm mb-4 text-white">Portals &amp; Resources</p>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/login" className="hover:text-white transition">Student LMS Portal</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Faculty Gateway</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Exam &amp; Gradebook</Link></li>
              <li><a href="#campus-life" className="hover:text-white transition">24/7 Digital Library</a></li>
              <li><a href="#events" className="hover:text-white transition">Academic Calendar</a></li>
            </ul>
          </div>

          {/* Col 4: University Governance & Info */}
          <div>
            <p className="font-display font-bold text-sm mb-4 text-white">Administration</p>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#about" className="hover:text-white transition">About the University</a></li>
              <li><a href="#faculties" className="hover:text-white transition">Academic Programs</a></li>
              <li><a href="#campus-life" className="hover:text-white transition">Campus Facilities</a></li>
              <li><a href="#campus-life" className="hover:text-white transition">Career Guidance Unit</a></li>
              <li><a href="#" className="hover:text-white transition">Emergency Hotline</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 py-6 text-center text-xs text-slate-500 max-w-[1400px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 UniLearn University. All rights reserved. Registered with Ministry of Higher Education.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition">Academic Integrity</a>
            <a href="#" className="hover:text-slate-300 transition">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition">Terms of Enrollment</a>
          </div>
        </div>
      </footer>

      {/* ─── Poster Lightbox Modal ─── */}
      {selectedPosterModal && (
        <div
          onClick={() => setSelectedPosterModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-[var(--surface)] rounded-3xl border border-[var(--glass-border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-high)]">
              <p className="font-display font-bold text-sm text-[var(--on-surface)] truncate pr-4">
                {selectedPosterModal.title}
              </p>
              <button
                onClick={() => setSelectedPosterModal(null)}
                className="w-8 h-8 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-highest)] text-[var(--on-surface)] flex items-center justify-center transition shrink-0"
              >
                <i className="ti ti-x text-sm"></i>
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-black/30">
              <img
                src={selectedPosterModal.url}
                alt={selectedPosterModal.title}
                className="max-h-[72vh] w-auto rounded-xl object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
