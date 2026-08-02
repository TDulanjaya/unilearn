import Link from "next/link";

const COURSES = [
  { id: "1", code: "SE308.3", title: "Software Process Management", lecturer: "Dr. K. Perera · Software Eng. Department", progress: 75, assignmentsPending: 1 },
  { id: "2", code: "SE202.2", title: "Database Systems", lecturer: "Dr. M. Rathnayake · Computer Science", progress: 90, assignmentsPending: 0 },
  { id: "3", code: "SE309.3", title: "Software Verification & Validation", lecturer: "Prof. A. Fernando · Software Eng.", progress: 50, assignmentsPending: 2 },
];

export default function StudentCoursesPage() {
  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
          My Courses
        </h1>
        <p className="text-[var(--on-surface-variant)] text-sm">
          Enrolled course modules for current semester. Click any course to access workspace, materials, assignments, and AI tutor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COURSES.map((c) => (
          <div key={c.id} className="card p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="badge badge-accent">{c.code}</span>
                {c.assignmentsPending > 0 ? (
                  <span className="badge badge-warning text-[10px]">{c.assignmentsPending} Pending</span>
                ) : (
                  <span className="badge badge-success text-[10px]">Up to date</span>
                )}
              </div>
              <h3 className="font-display font-bold text-lg mb-1 text-[var(--on-surface)]">
                {c.title}
              </h3>
              <p className="text-xs text-[var(--on-surface-variant)] mb-4">
                {c.lecturer}
              </p>
              <div className="progress-track mb-2">
                <div className="progress-fill" style={{ width: `${c.progress}%` }}></div>
              </div>
              <p className="text-xs text-[var(--outline)] font-medium mb-4">{c.progress}% Course Completed</p>

              {/* Quick Tab Links */}
              <div className="flex items-center justify-between text-xs pt-3 border-t border-[var(--outline-variant)] text-[var(--tertiary)] font-semibold">
                <Link href={`/student/courses/${c.id}?tab=materials`} className="hover:underline flex items-center gap-1">
                  <i className="ti ti-book text-sm"></i> Materials
                </Link>
                <Link href={`/student/courses/${c.id}?tab=assignments`} className="hover:underline flex items-center gap-1">
                  <i className="ti ti-clipboard-check text-sm"></i> Assignments
                </Link>
                <Link href={`/student/courses/${c.id}?tab=ai`} className="hover:underline flex items-center gap-1">
                  <i className="ti ti-sparkles text-sm"></i> AI Tutor
                </Link>
              </div>
            </div>
            <Link href={`/student/courses/${c.id}`} className="btn-primary text-xs mt-5 justify-center shadow-sm">
              View course workspace <i className="ti ti-arrow-right ml-1"></i>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
