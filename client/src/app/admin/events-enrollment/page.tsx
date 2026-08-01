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
            Events & Enrollment
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Create events, manage registrations, and assign students to batches.
          </p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-[var(--outline-variant)]" data-tabgroup="evn">
          <span className="tab-btn active" data-tab="ev">Events</span>
          <span className="tab-btn" data-tab="reg">Registrations</span>
          <span className="tab-btn" data-tab="enr">Enrollment</span>
        </div>

        <div id="evn-ev" data-tabpanel="evn">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Create Event
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                    Event Title
                  </label>
                  <input type="text" placeholder="Event title" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                    Description
                  </label>
                  <textarea rows={2} placeholder="Description"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" />
                  <input type="text" placeholder="Venue" />
                </div>
                <select>
                  <option>Institution-wide</option>
                  <option>Faculty of Computing</option>
                  <option>Faculty of Business</option>
                </select>
                <button className="btn-primary shadow-md">Publish event</button>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Upcoming Events
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  <span className="font-semibold">Career Fair 2026</span>
                  <button className="text-[var(--error)] text-xs font-bold hover:underline">Cancel</button>
                </div>
                <div className="flex items-center justify-between border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  <span className="font-semibold">AI in Practice — Guest Lecture</span>
                  <button className="text-[var(--error)] text-xs font-bold hover:underline">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="evn-reg" data-tabpanel="evn" className="hidden">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                Career Fair 2026 — 312 registered
              </h3>
              <button className="btn-secondary text-xs !py-1.5 shadow-sm">
                <i className="ti ti-download"></i> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                    <th className="pb-3 px-3 font-semibold">Student</th>
                    <th className="pb-3 px-3 font-semibold">Department</th>
                    <th className="pb-3 px-3 font-semibold">Registered</th>
                    <th className="pb-3 px-3 font-semibold">Check-in</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline-variant)]">
                  <tr className="table-row transition-colors">
                    <td className="py-3 px-3 font-semibold text-[var(--on-surface)]">Nadeesha Silva</td>
                    <td className="py-3 px-3 text-[var(--on-surface-variant)]">Software Eng.</td>
                    <td className="py-3 px-3 text-[var(--on-surface-variant)]">Aug 2</td>
                    <td className="py-3 px-3"><input type="checkbox" /></td>
                  </tr>
                  <tr className="table-row transition-colors">
                    <td className="py-3 px-3 font-semibold text-[var(--on-surface)]">Kasun Perera</td>
                    <td className="py-3 px-3 text-[var(--on-surface-variant)]">Computer Science</td>
                    <td className="py-3 px-3 text-[var(--on-surface-variant)]">Aug 3</td>
                    <td className="py-3 px-3"><input type="checkbox" defaultChecked /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="evn-enr" data-tabpanel="evn" className="hidden">
          <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
            <div className="card p-6">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-4 pb-2 border-b border-[var(--outline-variant)]">
                Unassigned Students (42)
              </h3>
              <div className="space-y-2.5 text-sm">
                <label className="flex items-center gap-3 border border-[var(--outline-variant)] rounded-xl px-4 py-2.5 text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  <input type="checkbox" /> R. Munasinghe
                </label>
                <label className="flex items-center gap-3 border border-[var(--outline-variant)] rounded-xl px-4 py-2.5 text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  <input type="checkbox" /> D. Abeywickrama
                </label>
              </div>
            </div>
            <div className="pt-10 flex justify-center">
              <button className="btn-primary shadow-md">
                <i className="ti ti-arrow-right"></i>
              </button>
            </div>
            <div className="card p-6">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)] mb-4 pb-2 border-b border-[var(--outline-variant)]">
                Target: CS2026-A / SE101.1
              </h3>
              <div className="space-y-3">
                <select><option>Batch CS2026-A</option></select>
                <select><option>Course offering SE101.1</option></select>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
