"use client";
import StudentNavbar from "@/components/StudentNavbar";

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <StudentNavbar />
      <main className="max-w-[1100px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Messages
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Direct messages with lecturers, tutors, and peers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] border border-[var(--outline-variant)] rounded-2xl glass overflow-hidden min-h-[500px] shadow-xl">
          <div className="border-r border-[var(--outline-variant)] p-4 divide-y divide-[var(--outline-variant)]">
            <div className="pb-3">
              <input type="text" placeholder="Search conversations" className="text-xs !py-1.5" />
            </div>
            <div className="pt-3 space-y-2">
              <div className="p-3 rounded-xl bg-[var(--surface-container)] border border-[var(--outline-variant)] flex items-center gap-3 cursor-pointer shadow-sm">
                <div className="avatar w-8 h-8 text-xs">D</div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-bold text-[var(--tertiary)] truncate">Dr. K. Perera</p>
                  <p className="text-[11px] text-[var(--on-surface-variant)] truncate">Regarding SE308.3 assignment...</p>
                </div>
              </div>
              <div className="p-3 rounded-xl hover:bg-[var(--surface-container-low)] border border-transparent hover:border-[var(--outline-variant)] flex items-center gap-3 cursor-pointer transition-all">
                <div className="avatar w-8 h-8 text-xs">I</div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-bold text-[var(--on-surface)] truncate">Ishara Fonseka</p>
                  <p className="text-[11px] text-[var(--on-surface-variant)] truncate">Can we study together?</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between p-6 bg-[var(--surface-container-lowest)]">
            <div className="border-b border-[var(--outline-variant)] pb-4 flex items-center gap-3">
              <div className="avatar w-9 h-9 text-xs">D</div>
              <div>
                <h3 className="font-display font-bold text-sm text-[var(--on-surface)]">Dr. K. Perera</h3>
                <p className="text-[11px] text-[var(--on-surface-variant)]">Senior Lecturer · Software Engineering</p>
              </div>
            </div>

            <div className="space-y-4 my-6 text-sm flex-1">
              <div className="flex items-start gap-3">
                <div className="avatar w-7 h-7 text-[10px] shrink-0">D</div>
                <div className="bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-[var(--on-surface)] p-3.5 rounded-2xl max-w-md">
                  Hello Nadeesha, please make sure to submit your test plan document before Friday.
                </div>
              </div>
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-[var(--primary)] text-[var(--on-primary)] p-3.5 rounded-2xl max-w-md shadow-sm">
                  Thank you Dr. Perera, I will submit it tomorrow morning!
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-[var(--outline-variant)]">
              <input type="text" placeholder="Write a message..." className="flex-1" />
              <button className="btn-primary shadow-md"><i className="ti ti-send"></i></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
