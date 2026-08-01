export default function StudentDashboard() {
  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Welcome back, Nadeesha!
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            BSc (Hons) Software Engineering · Semester 2 Overview
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--surface-container)] text-[var(--tertiary)] flex items-center justify-center font-bold">
              <i className="ti ti-book text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Enrolled Courses</p>
              <p className="font-display font-extrabold text-2xl text-[var(--on-surface)]">5</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] flex items-center justify-center font-bold">
              <i className="ti ti-award text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Current GPA</p>
              <p className="font-display font-extrabold text-2xl text-[var(--tertiary)]">3.78</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center font-bold">
              <i className="ti ti-checkup-list text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Overall Attendance</p>
              <p className="font-display font-extrabold text-2xl text-[var(--secondary)]">92%</p>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[var(--warning-container)] text-[var(--on-warning-container)] flex items-center justify-center font-bold">
              <i className="ti ti-clock text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-[var(--on-surface-variant)] font-semibold mb-0.5">Pending Submissions</p>
              <p className="font-display font-extrabold text-2xl text-[var(--warning)]">2</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <i className="ti ti-books text-xl text-[var(--tertiary)]"></i>
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">Enrolled Courses</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 border border-[var(--outline-variant)] rounded-xl hover:bg-[var(--surface-container-low)] transition-colors">
                <div>
                  <p className="font-semibold text-sm text-[var(--on-surface)]">SE308.3 Software Process Management</p>
                  <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">Dr. K. Perera · 4 Credits</p>
                </div>
                <span className="badge badge-accent">Active</span>
              </div>
              <div className="flex items-center justify-between p-3.5 border border-[var(--outline-variant)] rounded-xl hover:bg-[var(--surface-container-low)] transition-colors">
                <div>
                  <p className="font-semibold text-sm text-[var(--on-surface)]">SE202.2 Database Management Systems</p>
                  <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">Dr. M. Rathnayake · 4 Credits</p>
                </div>
                <span className="badge badge-accent">Active</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <i className="ti ti-calendar-event text-xl text-[var(--tertiary)]"></i>
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">Upcoming Deadlines & Exams</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3.5 border border-[var(--outline-variant)] rounded-xl hover:bg-[var(--surface-container-low)] transition-colors">
                <span className="font-semibold text-[var(--on-surface)]">SE308.3 Assignment 2</span>
                <span className="badge badge-danger">Due in 2 days</span>
              </div>
              <div className="flex items-center justify-between p-3.5 border border-[var(--outline-variant)] rounded-xl hover:bg-[var(--surface-container-low)] transition-colors">
                <span className="font-semibold text-[var(--on-surface)]">SE308.3 Final Exam</span>
                <span className="text-xs text-[var(--on-surface-variant)] font-medium">Dec 12, 2025</span>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
