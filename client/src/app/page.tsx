"use client";
import Link from "next/link";
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const SERVICES = [
  {
    icon: "ti-sparkles",
    tileBg: "bg-[var(--primary)] text-[var(--secondary-container)]",
    title: "AI Study Assistant",
    desc: "Grounded, course-aware quizzes and Q&A generated instantly from official course materials.",
    featured: true,
  },
  {
    icon: "ti-clipboard-check",
    tileBg: "bg-[#ffdad6] text-[#ba1a1a]",
    title: "Exams & Grading",
    desc: "Full assessment lifecycle from exam workspace setup to gradebooks and results release.",
    featured: false,
  },
  {
    icon: "ti-calendar-event",
    tileBg: "bg-[#86f2e4] text-[#006f66]",
    title: "Attendance & Timetables",
    desc: "Live schedules and real-time attendance tracking kept in sync across every course offering.",
    featured: false,
  },
  {
    icon: "ti-speakerphone",
    tileBg: "bg-[#acedff] text-[#004e5c]",
    title: "Announcements",
    desc: "Institution and department-wide announcements delivered instantly to target audiences.",
    featured: false,
  },
  {
    icon: "ti-certificate",
    tileBg: "bg-[#ffdad6] text-[#ba1a1a]",
    title: "Academic Records",
    desc: "A single source of truth for transcripts, semester GPAs, and student academic history.",
    featured: false,
  },
];

const UPDATES = [
  {
    date: "Aug 12, 2026",
    title: "New AI Quiz Generator Rolled Out for Semester 2 Modules",
    gradient: "from-[#0d1c2e] via-[#006a61] to-[#0090a9]",
  },
  {
    date: "Aug 08, 2026",
    title: "Semester 2 Class Timetables & Exam Venues Now Live",
    gradient: "from-[#006a61] via-[#0090a9] to-[#6bd8cb]",
  },
  {
    date: "Aug 02, 2026",
    title: "Automated Grading Workflow Streamlines Assessment Cycles",
    gradient: "from-[#0d1c2e] via-[#1c3454] to-[#0090a9]",
  },
];

const EVENTS = [
  {
    day: "18",
    month: "AUG",
    title: "Semester 2 Academic Orientation",
    desc: "Welcome session and platform walkthrough for newly registered software engineering students.",
    time: "09:00 AM - 11:30 AM · Main Auditorium",
  },
  {
    day: "25",
    month: "AUG",
    title: "Final Exam Timetable Release",
    desc: "Official publication of final exam dates, venues, and student hall admission slips.",
    time: "02:00 PM - 04:00 PM · Online Portal",
  },
];

const FACULTIES = [
  {
    name: "Faculty of Computing",
    desc: "Software Engineering, Computer Science, and AI Systems.",
    icon: "ti-code",
    gradient: "from-[#0d1c2e] to-[#006a61]",
  },
  {
    name: "Faculty of Business",
    desc: "Management Information Systems and Financial Technology.",
    icon: "ti-building-bank",
    gradient: "from-[#0d1c2e] to-[#0090a9]",
  },
  {
    name: "Faculty of Science",
    desc: "Computational Mathematics and Data Science analytics.",
    icon: "ti-flask",
    gradient: "from-[#006a61] to-[#4cd7f6]",
  },
];

const TESTIMONIALS = [
  {
    name: "Dr. K. Perera",
    role: "Senior Lecturer · Software Engineering",
    initials: "KP",
    quote:
      "UniLearn's automated grading and AI quiz generation saves me hours every week during assessment preparation. It seamlessly bridges lecture content with evaluation.",
  },
  {
    name: "Nadeesha Silva",
    role: "Student · BSc (Hons) Software Engineering",
    initials: "NS",
    quote:
      "The AI study assistant helped me master complex data structure topics with customized practice quizzes right before my mid-term examinations.",
  },
  {
    name: "Dr. S. Wickramasinghe",
    role: "Head of Department · Software Engineering",
    initials: "SW",
    quote:
      "Institution-wide analytics and real-time attendance tracking give our faculty complete visibility over student progress and academic performance.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--on-background)] transition-colors duration-300">
      <header className="sticky top-0 z-50 glass border-b border-[var(--glass-border)]">
        <div className="max-w-[1400px] mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold">
            <Link href="/" className="text-[var(--tertiary)] font-bold">
              Home
            </Link>
            <a href="#features" className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition">
              Features
            </a>
            <a href="#role-solutions" className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition">
              Role Solutions
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary hidden sm:inline-flex">
              Sign In
            </Link>
            <Link href="/login" className="btn-primary">
              Get Started <i className="ti ti-arrow-right"></i>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-[1400px] mx-auto px-6 pt-16 pb-20 text-center flex flex-col items-center">
          <div className="space-y-6 max-w-3xl">
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[54px] leading-[1.1] tracking-[-0.02em]">
              We Help You Build Your Academic{" "}
              <span className="text-[var(--tertiary)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--tertiary)] to-[var(--secondary)]">
                Future
              </span>
            </h1>

            <p className="text-[var(--on-surface-variant)] text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
              Empower your institution with real-time course analytics, proctored exams, automated grading, and intelligent AI study assistance built for modern universities.
            </p>

            <div className="flex items-center justify-center gap-4 pt-2">
              <Link href="/login" className="btn-primary text-base px-6 py-3 shadow-md">
                Get Started <i className="ti ti-arrow-right"></i>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4 border-t border-[var(--outline-variant)]">
              <span className="text-xs font-semibold text-[var(--on-surface-variant)] mr-1">Follow Us:</span>
              <a href="#" className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition">
                <i className="ti ti-brand-facebook text-base"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition">
                <i className="ti ti-brand-x text-base"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition">
                <i className="ti ti-brand-instagram text-base"></i>
              </a>
            </div>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-6 mb-24">
          <div className="glass rounded-2xl p-8 border border-[var(--glass-border)] text-center">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--on-surface-variant)] mb-6">
              Powering Every Faculty
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center">
              <div className="flex items-center gap-2 font-display font-bold text-sm sm:text-base text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition">
                <i className="ti ti-code text-xl text-[var(--tertiary)]"></i>
                <span>Faculty of Computing</span>
              </div>
              <div className="flex items-center gap-2 font-display font-bold text-sm sm:text-base text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition">
                <i className="ti ti-building-bank text-xl text-[var(--tertiary)]"></i>
                <span>Faculty of Business</span>
              </div>
              <div className="flex items-center gap-2 font-display font-bold text-sm sm:text-base text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition">
                <i className="ti ti-settings text-xl text-[var(--tertiary)]"></i>
                <span>Faculty of Engineering</span>
              </div>
              <div className="flex items-center gap-2 font-display font-bold text-sm sm:text-base text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition">
                <i className="ti ti-palette text-xl text-[var(--tertiary)]"></i>
                <span>Faculty of Arts</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-8">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--tertiary)]"></span>
              <span className="w-2 h-2 rounded-full bg-[var(--outline-variant)]"></span>
              <span className="w-2 h-2 rounded-full bg-[var(--outline-variant)] opacity-50"></span>
              <span className="w-2 h-2 rounded-full bg-[var(--outline-variant)] opacity-30"></span>
            </div>
          </div>
        </section>

        <section id="features" className="max-w-[1400px] mx-auto px-6 pb-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="badge badge-accent mb-3">
              <i className="ti ti-box"></i> Comprehensive Platform
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-3">
              Our Services
            </h2>
            <p className="text-[var(--on-surface-variant)] text-base">
              Tailored LMS solutions supporting academic excellence across every department.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {SERVICES.slice(0, 3).map((service, idx) => (
              <div
                key={idx}
                className={`glass rounded-2xl p-7 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col justify-between ${
                  service.featured
                    ? "border-[var(--tertiary)] shadow-xl relative"
                    : "border-[var(--glass-border)]"
                }`}
              >
                {service.featured && (
                  <span className="absolute -top-3 right-6 badge bg-[var(--tertiary)] text-white font-bold text-[10px] uppercase tracking-wider">
                    Featured
                  </span>
                )}
                <div>
                  <div className={`w-11 h-11 rounded-xl ${service.tileBg} flex items-center justify-center mb-5 font-bold`}>
                    <i className={`ti ${service.icon} text-xl`}></i>
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2 text-[var(--on-surface)]">
                    {service.title}
                  </h3>
                  <p className="text-[var(--on-surface-variant)] text-sm leading-relaxed mb-6">
                    {service.desc}
                  </p>
                </div>
                <a href="#ai-assistant" className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--tertiary)] hover:underline">
                  <span>Learn More</span>
                  <i className="ti ti-arrow-right text-sm"></i>
                </a>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {SERVICES.slice(3, 5).map((service, idx) => (
              <div
                key={idx}
                className="glass rounded-2xl p-7 border border-[var(--glass-border)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div className={`w-11 h-11 rounded-xl ${service.tileBg} flex items-center justify-center mb-5 font-bold`}>
                    <i className={`ti ${service.icon} text-xl`}></i>
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2 text-[var(--on-surface)]">
                    {service.title}
                  </h3>
                  <p className="text-[var(--on-surface-variant)] text-sm leading-relaxed mb-6">
                    {service.desc}
                  </p>
                </div>
                <a href="#architecture" className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--tertiary)] hover:underline">
                  <span>Learn More</span>
                  <i className="ti ti-arrow-right text-sm"></i>
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-6 pb-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="badge badge-accent mb-3">
              <i className="ti ti-news"></i> Latest News
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-3">
              Campus Updates
            </h2>
            <p className="text-[var(--on-surface-variant)] text-base">
              Stay informed with the latest platform rollouts and academic announcements.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {UPDATES.map((item, idx) => (
              <div key={idx} className="glass rounded-2xl overflow-hidden border border-[var(--glass-border)] shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className={`h-40 bg-gradient-to-br ${item.gradient} relative overflow-hidden flex items-center justify-center p-6`}>
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]"></div>
                  <i className="ti ti-article text-4xl text-white/80 z-10"></i>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--on-surface-variant)] font-semibold">
                    <i className="ti ti-calendar text-sm text-[var(--tertiary)]"></i>
                    <span>{item.date}</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-[var(--on-surface)] leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/login" className="btn-primary">
              View All Updates <i className="ti ti-arrow-right"></i>
            </Link>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-6 pb-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="badge badge-accent mb-3">
              <i className="ti ti-calendar-event"></i> Academic Schedule
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-3">
              Upcoming Academic Events
            </h2>
            <p className="text-[var(--on-surface-variant)] text-base">
              Mark your calendar for key university milestones and orientation dates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {EVENTS.map((evt, idx) => (
              <div key={idx} className="glass rounded-2xl p-6 border border-[var(--glass-border)] flex items-start gap-5 shadow-lg">
                <div className="w-16 h-16 rounded-xl bg-[var(--surface-container-high)] border border-[var(--outline-variant)] flex flex-col items-center justify-center font-bold shrink-0 text-[var(--tertiary)]">
                  <span className="text-xl leading-none">{evt.day}</span>
                  <span className="text-[10px] tracking-wider uppercase">{evt.month}</span>
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                    {evt.title}
                  </h3>
                  <p className="text-[var(--on-surface-variant)] text-xs leading-relaxed">
                    {evt.desc}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--on-surface-variant)] font-medium">
                      <i className="ti ti-clock text-sm text-[var(--tertiary)]"></i>
                      <span>{evt.time}</span>
                    </div>
                    <a href="#" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--tertiary)] hover:underline">
                      <span>Learn More</span>
                      <i className="ti ti-arrow-right text-xs"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-8">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--tertiary)]"></span>
            <span className="w-2 h-2 rounded-full bg-[var(--outline-variant)]"></span>
            <span className="w-2 h-2 rounded-full bg-[var(--outline-variant)] opacity-50"></span>
            <span className="w-2 h-2 rounded-full bg-[var(--outline-variant)] opacity-30"></span>
          </div>
        </section>

        <section id="role-solutions" className="max-w-[1400px] mx-auto px-6 pb-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="badge badge-accent mb-3">
              <i className="ti ti-building"></i> Faculties
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-3">
              Explore by Faculty
            </h2>
            <p className="text-[var(--on-surface-variant)] text-base">
              Specialized academic environments configured for distinct degree disciplines.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FACULTIES.map((fac, idx) => (
              <div key={idx} className="glass rounded-2xl p-6 border border-[var(--glass-border)] text-center space-y-4 hover:shadow-xl transition-all">
                <div className={`h-36 rounded-xl bg-gradient-to-br ${fac.gradient} flex items-center justify-center shadow-inner`}>
                  <i className={`ti ${fac.icon} text-4xl text-white`}></i>
                </div>
                <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                  {fac.name}
                </h3>
                <p className="text-[var(--on-surface-variant)] text-xs leading-relaxed">
                  {fac.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-8">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--tertiary)]"></span>
            <span className="w-2 h-2 rounded-full bg-[var(--outline-variant)]"></span>
            <span className="w-2 h-2 rounded-full bg-[var(--outline-variant)] opacity-50"></span>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-6 pb-24 relative">
          <div className="text-center max-w-2xl mx-auto mb-14 relative">
            <span className="badge badge-accent mb-3">
              <i className="ti ti-quote"></i> Testimonials
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-3">
              What People Say
            </h2>
            <p className="text-[var(--on-surface-variant)] text-base">
              Hear from lecturers, students, and department heads using UniLearn daily.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="glass rounded-2xl p-6 border border-[var(--glass-border)] flex flex-col justify-between shadow-lg">
                <p className="text-[var(--on-surface-variant)] text-xs leading-relaxed italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--outline-variant)]">
                  <div className="avatar w-10 h-10 text-xs font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm text-[var(--on-surface)]">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-[var(--on-surface-variant)]">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-8">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--tertiary)]"></span>
            <span className="w-2 h-2 rounded-full bg-[var(--outline-variant)]"></span>
            <span className="w-2 h-2 rounded-full bg-[var(--outline-variant)] opacity-50"></span>
          </div>
        </section>

        <section className="bg-[#0a1626] text-white py-20 relative overflow-hidden border-t border-b border-[var(--outline-variant)]">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#4cd7f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="max-w-[1400px] mx-auto px-6 relative z-10">
            <div className="glass rounded-3xl p-10 md:p-14 text-center max-w-4xl mx-auto border border-white/10 shadow-2xl bg-white/5">
              <div className="space-y-6">
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl leading-tight">
                  Ready to Elevate Your Campus?
                </h2>
                <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
                  Transform your institution&apos;s learning experience with UniLearn today.
                </p>
                <div className="pt-2">
                  <Link href="/login" className="bg-gradient-to-r from-[#0d1c2e] via-[#006a61] to-[#0090a9] text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-lg hover:opacity-95 transition-all duration-200 hover:scale-105 inline-flex items-center gap-2">
                    <span>Get Started</span>
                    <i className="ti ti-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#07111e] text-slate-400 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
          <div className="space-y-4">
            <Logo />
            <div className="text-xs leading-relaxed space-y-1 text-slate-400 pt-1">
              <p>128 University Park Blvd</p>
              <p>Faculty Quadrant, Suite 400</p>
              <p>Colombo, Sri Lanka</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition">
                <i className="ti ti-brand-facebook text-sm"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition">
                <i className="ti ti-brand-x text-sm"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition">
                <i className="ti ti-brand-linkedin text-sm"></i>
              </a>
            </div>
          </div>

          <div>
            <p className="font-display font-bold text-sm mb-4 text-white">Company</p>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Responsibilities</a></li>
              <li><a href="#features" className="hover:text-white transition">Our Services</a></li>
            </ul>
          </div>

          <div>
            <p className="font-display font-bold text-sm mb-4 text-white">Legal</p>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-white transition">Disclaimer</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <p className="font-display font-bold text-sm mb-4 text-white">Support</p>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
              <li><a href="#" className="hover:text-white transition">Testimonials</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
          © 2026 UniLearn LMS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
