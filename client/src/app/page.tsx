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
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  
  if (url.includes("gateway.storjshare.io") || url.includes("backblazeb2.com")) {
    const filename = url.substring(url.lastIndexOf("/") + 1);
    return `${apiBase.replace(/\/+$/, "")}/api/v1/files/download/events_${filename}`;
  }

  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }

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

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("computing");
  const [liveEvents, setLiveEvents] = useState<EventDisplayItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [selectedPosterModal, setSelectedPosterModal] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    async function fetchUpcomingEvents() {
      setIsLoadingEvents(true);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiBase.replace(/\/+$/, "")}/api/v1/events/upcoming?size=6`);
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data?.dataList || data?.content || [];
          const parsed: EventDisplayItem[] = items.map((e: any) => {
            const rawDate = e.eventDate || e.startDateTime || "";
            let day = "01";
            let month = "EVENT";
            let time = "";
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
              title: e.title || e.name || "Academic Event",
              desc: e.description || "",
              category: e.facultyName || "Campus Event",
              posterUrl: e.posterUrl || "",
            };
          });
          setLiveEvents(parsed);
        } else {
          setLiveEvents([]);
        }
      } catch {
        setLiveEvents([]);
      } finally {
        setIsLoadingEvents(false);
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
              className="btn-primary text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-xl shadow-md font-bold whitespace-nowrap flex items-center gap-1.5"
            >
              <i className="ti ti-user-circle text-base"></i>
              <span>Portal Sign In</span>
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

            {isLoadingEvents ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="rounded-3xl min-h-[380px] bg-[var(--surface-container-high)]/30 animate-pulse border border-[var(--outline-variant)]/40 p-6 flex flex-col justify-between"
                  />
                ))}
              </div>
            ) : liveEvents.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {liveEvents.map((evt, idx) => (
                  <div
                    key={evt.id || idx}
                    className="relative rounded-3xl overflow-hidden min-h-[420px] p-6 border border-white/15 shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/40 transition-all duration-500 flex flex-col justify-between group cursor-pointer"
                    onClick={() => evt.posterUrl && setSelectedPosterModal({ title: evt.title, url: resolvePosterUrl(evt.posterUrl) })}
                  >
                    {/* Full Background Image */}
                    {evt.posterUrl ? (
                      <img
                        src={resolvePosterUrl(evt.posterUrl)}
                        alt={evt.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950" />
                    )}

                    {/* High-Contrast Gradient Backdrop Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40 group-hover:from-slate-950/95 group-hover:via-slate-950/70 transition-colors duration-300" />

                    {/* Top Layer: Badges & Category */}
                    <div className="relative z-10 flex items-start justify-between gap-3">
                      {/* Date Badge */}
                      <div className="bg-slate-950/70 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-2xl flex flex-col items-center justify-center font-bold text-cyan-300 shadow-lg">
                        <span className="text-xl leading-none font-black">{evt.day}</span>
                        <span className="text-[10px] tracking-wider uppercase mt-0.5 text-slate-300">{evt.month}</span>
                      </div>

                      {/* Category Tag */}
                      <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 backdrop-blur-md shadow-md">
                        {evt.category}
                      </span>
                    </div>

                    {/* Bottom Layer: Content & Venue Overlaid on Image */}
                    <div className="relative z-10 space-y-3 mt-auto pt-6">
                      {evt.time && (
                        <p className="text-xs text-cyan-400 flex items-center gap-1.5 font-bold tracking-wide">
                          <i className="ti ti-clock text-sm"></i>
                          <span>{evt.time}</span>
                        </p>
                      )}

                      <h3 className="font-display font-extrabold text-xl text-white leading-snug drop-shadow-md group-hover:text-cyan-300 transition-colors">
                        {evt.title}
                      </h3>

                      {evt.desc && (
                        <p className="text-slate-300 text-xs leading-relaxed line-clamp-2 drop-shadow">
                          {evt.desc}
                        </p>
                      )}

                      <div className="pt-3 border-t border-white/15 text-xs text-slate-300 flex items-center justify-between font-medium">
                        <span className="flex items-center gap-1.5 truncate max-w-[70%]">
                          <i className="ti ti-map-pin text-cyan-400 shrink-0"></i>
                          <span className="truncate">{evt.venue}</span>
                        </span>
                        {evt.posterUrl && (
                          <span className="text-[11px] font-bold text-cyan-400 group-hover:underline flex items-center gap-1 shrink-0 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                            <i className="ti ti-zoom-in text-xs"></i>
                            <span>Poster</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-3xl bg-[var(--surface-container-high)]/30 border border-[var(--outline-variant)]/40 max-w-md mx-auto p-8 space-y-3">
                <i className="ti ti-calendar-event text-4xl text-[var(--on-surface-variant)] opacity-60" />
                <p className="text-base font-bold text-[var(--on-surface)]">No Upcoming Events</p>
                <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
                  There are currently no events scheduled. Real campus events published in the system will appear here.
                </p>
              </div>
            )}

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

      {/* ─── Personal Developer & Campus LMS Footer ─────────────────────────── */}
      <footer className="bg-[#050e18] text-slate-400 border-t border-white/10 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-white/10">
            {/* Left: UniLearn Campus LMS Identity (6 cols) */}
            <div className="space-y-4 md:col-span-6">
              <div className="flex items-center gap-3">
                <Logo />
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  Campus Learning &amp; Management System
                </span>
              </div>

              <p className="text-xs leading-relaxed text-slate-400 max-w-md">
                UniLearn is a full-stack University &amp; Learning Management System engineered with modern web technologies to manage academic courses, student enrollments, exam grading, and campus events.
              </p>

              {/* Circular Social Media Icons */}
              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700/60 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition shadow-lg hover:scale-105"
                  aria-label="Facebook"
                >
                  <i className="ti ti-brand-facebook text-lg"></i>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700/60 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition shadow-lg hover:scale-105"
                  aria-label="X (Twitter)"
                >
                  <i className="ti ti-brand-x text-lg"></i>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700/60 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition shadow-lg hover:scale-105"
                  aria-label="Instagram"
                >
                  <i className="ti ti-brand-instagram text-lg"></i>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700/60 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition shadow-lg hover:scale-105"
                  aria-label="LinkedIn"
                >
                  <i className="ti ti-brand-linkedin text-lg"></i>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700/60 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition shadow-lg hover:scale-105"
                  aria-label="YouTube"
                >
                  <i className="ti ti-brand-youtube text-lg"></i>
                </a>
              </div>
            </div>

            {/* Middle: Vertical Faculties List (3 cols) */}
            <div className="md:col-span-3">
              <p className="font-display font-bold text-sm mb-3.5 text-white">Faculties</p>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#faculties" className="hover:text-cyan-300 transition">
                    Faculty of Computing
                  </a>
                </li>
                <li>
                  <a href="#faculties" className="hover:text-cyan-300 transition">
                    Faculty of Business
                  </a>
                </li>
                <li>
                  <a href="#faculties" className="hover:text-cyan-300 transition">
                    Faculty of Engineering
                  </a>
                </li>
                <li>
                  <a href="#faculties" className="hover:text-cyan-300 transition">
                    Faculty of Applied Sciences
                  </a>
                </li>
              </ul>
            </div>

            {/* Right: Platform Navigation (3 cols) */}
            <div className="md:col-span-3">
              <p className="font-display font-bold text-sm mb-3.5 text-white">Platform</p>
              <ul className="space-y-2 text-xs">
                <li><a href="#about" className="hover:text-cyan-300 transition">Overview</a></li>
                <li><a href="#events" className="hover:text-cyan-300 transition">Campus Events</a></li>
                <li><a href="#campus-life" className="hover:text-cyan-300 transition">Campus Life</a></li>
                <li><Link href="/login" className="hover:text-cyan-300 transition">Portals &amp; Sign In</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 text-center text-xs text-slate-500">
            <p>© 2026 Thisara Dulanjaya. All rights reserved.</p>
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
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop";
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
