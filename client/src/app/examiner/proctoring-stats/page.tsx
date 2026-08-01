"use client";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";

export default function Page() {
  useInteractive();
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="examiner" name="Prof. A. Fernando" sub="Chief Examiner · Computing" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Proctoring & Statistics
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            SE201.2 Data Structures — Final exam, live now
          </p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-[var(--outline-variant)]" data-tabgroup="prst">
          <span className="tab-btn active" data-tab="proc">Live proctoring</span>
          <span className="tab-btn" data-tab="stat">Statistics</span>
        </div>

        <div id="prst-proc" data-tabpanel="prst">
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="avatar w-8 h-8 text-xs font-bold">N</div>
                <span className="text-sm font-semibold text-[var(--on-surface)] flex-1">Nadeesha Silva</span>
              </div>
              <div className="progress-track mb-2">
                <div className="progress-fill" style={{ width: "64%" }}></div>
              </div>
              <p className="text-xs text-[var(--outline)] font-medium">64% complete</p>
            </div>

            <div className="card p-5 border-2 border-[var(--error)] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="avatar w-8 h-8 text-xs font-bold">I</div>
                <span className="text-sm font-semibold text-[var(--on-surface)] flex-1">Ishara Fonseka</span>
                <span className="badge badge-danger">Flagged</span>
              </div>
              <div className="progress-track mb-2">
                <div className="progress-fill" style={{ width: "40%" }}></div>
              </div>
              <p className="text-xs text-[var(--outline)] font-medium">40% complete</p>
            </div>

            <div className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="avatar w-8 h-8 text-xs font-bold">K</div>
                <span className="text-sm font-semibold text-[var(--on-surface)] flex-1">Kasun Perera</span>
              </div>
              <div className="progress-track mb-2">
                <div className="progress-fill" style={{ width: "88%" }}></div>
              </div>
              <p className="text-xs text-[var(--outline)] font-medium">88% complete</p>
            </div>

            <div className="card p-5 border-2 border-[var(--error)] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="avatar w-8 h-8 text-xs font-bold">T</div>
                <span className="text-sm font-semibold text-[var(--on-surface)] flex-1">Tharindu Jayasuriya</span>
                <span className="badge badge-danger">Flagged</span>
              </div>
              <div className="progress-track mb-2">
                <div className="progress-fill" style={{ width: "22%" }}></div>
              </div>
              <p className="text-xs text-[var(--outline)] font-medium">22% complete</p>
            </div>

            <div className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="avatar w-8 h-8 text-xs font-bold">S</div>
                <span className="text-sm font-semibold text-[var(--on-surface)] flex-1">Sanduni Bandara</span>
              </div>
              <div className="progress-track mb-2">
                <div className="progress-fill" style={{ width: "71%" }}></div>
              </div>
              <p className="text-xs text-[var(--outline)] font-medium">71% complete</p>
            </div>

            <div className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="avatar w-8 h-8 text-xs font-bold">D</div>
                <span className="text-sm font-semibold text-[var(--on-surface)] flex-1">Dilan Wickrama</span>
              </div>
              <div className="progress-track mb-2">
                <div className="progress-fill" style={{ width: "55%" }}></div>
              </div>
              <p className="text-xs text-[var(--outline)] font-medium">55% complete</p>
            </div>
          </div>
        </div>

        <div id="prst-stat" data-tabpanel="prst" className="hidden">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Score Distribution
              </h3>
              <div className="flex items-end gap-4 h-48 pt-4">
                <div className="flex-1 bg-[var(--surface-container)] rounded-t-lg border border-[var(--outline-variant)]" style={{ height: "30%" }}></div>
                <div className="flex-1 bg-[var(--surface-container)] rounded-t-lg border border-[var(--outline-variant)]" style={{ height: "55%" }}></div>
                <div className="flex-1 bg-[var(--tertiary)] rounded-t-lg shadow-sm" style={{ height: "90%" }}></div>
                <div className="flex-1 bg-[var(--surface-container)] rounded-t-lg border border-[var(--outline-variant)]" style={{ height: "60%" }}></div>
                <div className="flex-1 bg-[var(--surface-container-low)] rounded-t-lg border border-[var(--outline-variant)]" style={{ height: "25%" }}></div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Pass / Fail Statistics
              </h3>
              <div className="flex items-center gap-8 py-2">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--error-container)" strokeWidth="4"></circle>
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--secondary)" strokeWidth="4" strokeDasharray="82,100" strokeLinecap="round"></circle>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-xl text-[var(--on-surface)]">82%</span>
                </div>
                <div className="text-sm space-y-2 font-semibold">
                  <p className="flex items-center text-[var(--on-surface)]">
                    <span className="w-3 h-3 inline-block rounded-full bg-[var(--secondary)] mr-2"></span>Pass — 82%
                  </p>
                  <p className="flex items-center text-[var(--on-surface)]">
                    <span className="w-3 h-3 inline-block rounded-full bg-[var(--error)] mr-2"></span>Fail — 18%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
