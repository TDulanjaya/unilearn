import Link from "next/link";

const COURSES = [
  { id: "1", code: "SE308.3", title: "Software Process Management", lecturer: "Dr. K. Perera", icon: "ti-code", gradient: "from-[#0d1c2e] to-[#006a61]" },
  { id: "2", code: "SE202.2", title: "Database Systems", lecturer: "Dr. M. Rathnayake", icon: "ti-database", gradient: "from-[#0d1c2e] to-[#0090a9]" },
  { id: "3", code: "SE309.3", title: "Software Verification & Validation", lecturer: "Prof. A. Fernando", icon: "ti-bug", gradient: "from-[#006a61] to-[#4cd7f6]" },
];

export default function AiAssistantPage() {
  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
          AI Study Assistant
        </h1>
        <p className="text-[var(--on-surface-variant)] text-sm">
          Select a course to open its dedicated AI assistant with quizzes, Q&A, and course-scoped chat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COURSES.map((c) => (
          <Link
            key={c.id}
            href={`/student/courses/${c.id}?tab=ai`}
            className="card p-6 flex flex-col items-center text-center hover:shadow-xl transition-all duration-200 group"
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
              <i className={`ti ${c.icon} text-2xl text-white`}></i>
            </div>
            <span className="badge badge-accent mb-2">{c.code}</span>
            <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-1">{c.title}</h3>
            <p className="text-xs text-[var(--on-surface-variant)] mb-4">{c.lecturer}</p>
            <span className="btn-primary text-xs shadow-sm group-hover:shadow-md transition-shadow">
              <i className="ti ti-sparkles text-sm"></i> Open AI Assistant
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
