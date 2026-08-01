export default function StudentAttendancePage() {
  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Attendance Tracking
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Module-wise attendance breakdown and eligibility threshold (min 80%).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card p-6 hover:shadow-md transition-shadow">
            <h3 className="font-display font-bold text-base mb-3 text-[var(--on-surface)]">
              SE308.3 Software Process Mgmt
            </h3>
            <div className="progress-track mb-3">
              <div className="progress-fill" style={{ width: "92%" }}></div>
            </div>
            <div className="flex justify-between text-xs text-[var(--on-surface-variant)] font-medium">
              <span>23 / 25 Sessions</span>
              <span className="badge badge-success">92% (Eligible)</span>
            </div>
          </div>

          <div className="card p-6 hover:shadow-md transition-shadow">
            <h3 className="font-display font-bold text-base mb-3 text-[var(--on-surface)]">
              SE202.2 Database Systems
            </h3>
            <div className="progress-track mb-3">
              <div className="progress-fill" style={{ width: "88%" }}></div>
            </div>
            <div className="flex justify-between text-xs text-[var(--on-surface-variant)] font-medium">
              <span>22 / 25 Sessions</span>
              <span className="badge badge-success">88% (Eligible)</span>
            </div>
          </div>

          <div className="card p-6 hover:shadow-md transition-shadow">
            <h3 className="font-display font-bold text-base mb-3 text-[var(--on-surface)]">
              SE309.3 Verification & Validation
            </h3>
            <div className="progress-track mb-3">
              <div className="progress-fill" style={{ width: "76%" }}></div>
            </div>
            <div className="flex justify-between text-xs text-[var(--on-surface-variant)] font-medium">
              <span>19 / 25 Sessions</span>
              <span className="badge badge-warning">76% (Warning)</span>
            </div>
          </div>
        </div>
      </main>
  );
}
