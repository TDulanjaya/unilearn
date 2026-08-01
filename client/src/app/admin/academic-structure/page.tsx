"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";

export default function Page() {
  useInteractive();
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Academic Structure
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Faculties, departments, courses and academic calendar.
          </p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-[var(--outline-variant)]" data-tabgroup="acs">
          <span className="tab-btn active" data-tab="fac">Faculties & departments</span>
          <span className="tab-btn" data-tab="courses">Courses</span>
          <span className="tab-btn" data-tab="cal">Academic calendar</span>
        </div>

        <div id="acs-fac" data-tabpanel="acs">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--outline-variant)]">
                <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">Faculties</h3>
                <button className="btn-secondary text-xs !py-1.5"><i className="ti ti-plus"></i> Add</button>
              </div>
              <div className="space-y-2.5">
                <div className="border border-[var(--outline-variant)] bg-[var(--surface-container)] rounded-xl px-4 py-3 text-sm font-semibold text-[var(--tertiary)] shadow-sm">
                  Faculty of Computing
                </div>
                <div className="border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm font-semibold text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  Faculty of Business
                </div>
                <div className="border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm font-semibold text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  Faculty of Engineering
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--outline-variant)]">
                <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                  Departments — Faculty of Computing
                </h3>
                <button className="btn-secondary text-xs !py-1.5"><i className="ti ti-plus"></i> Add</button>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  <span className="font-semibold">Software Engineering</span>
                  <select className="w-48 !py-1 text-xs"><option>Dr. S. Wickramasinghe</option></select>
                </div>
                <div className="flex items-center justify-between border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  <span className="font-semibold">Computer Science</span>
                  <select className="w-48 !py-1 text-xs"><option>Dr. M. Rathnayake</option></select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="acs-courses" data-tabpanel="acs" className="hidden">
          <div className="card p-6">
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
              Course Catalog
            </h3>
            <div className="grid sm:grid-cols-4 gap-3 mb-4">
              <input type="text" placeholder="Course code" />
              <input type="text" placeholder="Title" className="sm:col-span-2" />
              <input type="number" placeholder="Credits" />
            </div>
            <button className="btn-primary mb-6 shadow-md">Save course</button>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                    <th className="pb-3 px-3 font-semibold">Code</th>
                    <th className="pb-3 px-3 font-semibold">Title</th>
                    <th className="pb-3 px-3 font-semibold">Credits</th>
                    <th className="pb-3 px-3 font-semibold">Version</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline-variant)]">
                  <tr className="table-row transition-colors">
                    <td className="py-3 px-3 font-semibold text-[var(--on-surface)]">SE309.3</td>
                    <td className="py-3 px-3 text-[var(--on-surface)]">Software Verification & Validation</td>
                    <td className="py-3 px-3 text-[var(--on-surface-variant)]">4</td>
                    <td className="py-3 px-3"><span className="badge badge-accent">v3</span></td>
                  </tr>
                  <tr className="table-row transition-colors">
                    <td className="py-3 px-3 font-semibold text-[var(--on-surface)]">SE308.3</td>
                    <td className="py-3 px-3 text-[var(--on-surface)]">Software Process Management</td>
                    <td className="py-3 px-3 text-[var(--on-surface-variant)]">4</td>
                    <td className="py-3 px-3"><span className="badge badge-accent">v2</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="acs-cal" data-tabpanel="acs" className="hidden">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card p-6">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-4 pb-2 border-b border-[var(--outline-variant)]">
                Academic Years
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="border border-[var(--outline-variant)] rounded-xl px-4 py-2.5 font-medium text-[var(--on-surface)] hover:bg-[var(--surface-container-low)]">2025/2026</div>
                <div className="border border-[var(--outline-variant)] rounded-xl px-4 py-2.5 font-medium text-[var(--on-surface)] hover:bg-[var(--surface-container-low)]">2026/2027</div>
              </div>
              <button className="btn-secondary text-xs !py-1.5 mt-4">+ Add year</button>
            </div>

            <div className="card p-6">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-4 pb-2 border-b border-[var(--outline-variant)]">
                Semesters
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="border border-[var(--outline-variant)] rounded-xl px-4 py-2.5 font-medium text-[var(--on-surface)] hover:bg-[var(--surface-container-low)]">Semester 1</div>
                <div className="border border-[var(--outline-variant)] rounded-xl px-4 py-2.5 font-medium text-[var(--on-surface)] hover:bg-[var(--surface-container-low)]">Semester 2</div>
              </div>
              <button className="btn-secondary text-xs !py-1.5 mt-4">+ Add semester</button>
            </div>

            <div className="card p-6">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-4 pb-2 border-b border-[var(--outline-variant)]">
                Batches
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="border border-[var(--outline-variant)] rounded-xl px-4 py-2.5 font-medium text-[var(--on-surface)] hover:bg-[var(--surface-container-low)]">CS2023-A</div>
                <div className="border border-[var(--outline-variant)] rounded-xl px-4 py-2.5 font-medium text-[var(--on-surface)] hover:bg-[var(--surface-container-low)]">CS2023-B</div>
              </div>
              <button className="btn-secondary text-xs !py-1.5 mt-4">+ Add batch</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
