import Link from "next/link";

const COURSES = [
  { id: "1", code: "SE308.3", title: "Software Process Management", lecturer: "Dr. K. Perera · Software Eng. Department", progress: 75 },
  { id: "2", code: "SE202.2", title: "Database Systems", lecturer: "Dr. M. Rathnayake · Computer Science", progress: 90 },
  { id: "3", code: "SE309.3", title: "Software Verification & Validation", lecturer: "Prof. A. Fernando · Software Eng.", progress: 50 },
];

export default function StudentCoursesPage() {
  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            My Courses
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Enrolled course modules for current semester.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COURSES.map((c) => (
            <div key={c.id} className="card p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
              <div>
                <span className="badge badge-accent mb-3">{c.code}</span>
                <h3 className="font-display font-bold text-lg mb-1 text-[var(--on-surface)]">
                  {c.title}
                </h3>
                <p className="text-xs text-[var(--on-surface-variant)] mb-4">
                  {c.lecturer}
                </p>
                <div className="progress-track mb-2">
                  <div className="progress-fill" style={{ width: `${c.progress}%` }}></div>
                </div>
                <p className="text-xs text-[var(--outline)] font-medium">{c.progress}% Course Completed</p>
              </div>
              <Link href={`/student/courses/${c.id}`} className="btn-primary text-xs mt-6 justify-center shadow-sm">
                View course
              </Link>
            </div>
          ))}
        </div>
      </main>
  );
}
