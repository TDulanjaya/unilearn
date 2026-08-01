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
          <div className="card p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
            <div>
              <span className="badge badge-accent mb-3">SE308.3</span>
              <h3 className="font-display font-bold text-lg mb-1 text-[var(--on-surface)]">
                Software Process Management
              </h3>
              <p className="text-xs text-[var(--on-surface-variant)] mb-4">
                Dr. K. Perera · Software Eng. Department
              </p>
              <div className="progress-track mb-2">
                <div className="progress-fill" style={{ width: "75%" }}></div>
              </div>
              <p className="text-xs text-[var(--outline)] font-medium">75% Course Completed</p>
            </div>
            <button className="btn-primary text-xs mt-6 justify-center shadow-sm">
              View course
            </button>
          </div>

          <div className="card p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
            <div>
              <span className="badge badge-accent mb-3">SE202.2</span>
              <h3 className="font-display font-bold text-lg mb-1 text-[var(--on-surface)]">
                Database Systems
              </h3>
              <p className="text-xs text-[var(--on-surface-variant)] mb-4">
                Dr. M. Rathnayake · Computer Science
              </p>
              <div className="progress-track mb-2">
                <div className="progress-fill" style={{ width: "90%" }}></div>
              </div>
              <p className="text-xs text-[var(--outline)] font-medium">90% Course Completed</p>
            </div>
            <button className="btn-primary text-xs mt-6 justify-center shadow-sm">
              View course
            </button>
          </div>

          <div className="card p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
            <div>
              <span className="badge badge-accent mb-3">SE309.3</span>
              <h3 className="font-display font-bold text-lg mb-1 text-[var(--on-surface)]">
                Software Verification & Validation
              </h3>
              <p className="text-xs text-[var(--on-surface-variant)] mb-4">
                Prof. A. Fernando · Software Eng.
              </p>
              <div className="progress-track mb-2">
                <div className="progress-fill" style={{ width: "50%" }}></div>
              </div>
              <p className="text-xs text-[var(--outline)] font-medium">50% Course Completed</p>
            </div>
            <button className="btn-primary text-xs mt-6 justify-center shadow-sm">
              View course
            </button>
          </div>
        </div>
      </main>
  );
}
