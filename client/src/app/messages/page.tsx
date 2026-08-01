"use client";
import StudentNavbar from "@/components/StudentNavbar";

export default function MessagesPage() {
  return (
    <div>
      <StudentNavbar />
      <main className="max-w-[1100px] mx-auto px-8 py-7">
        <h1 className="font-display font-extrabold text-2xl mb-1">Messages</h1>
        <p className="text-[#666B80] text-sm mb-6">Direct messages with lecturers, tutors, and peers.</p>

        <div className="grid lg:grid-cols-[300px_1fr] border border-[#E7E8F0] rounded-2xl bg-white overflow-hidden min-h-[500px]">
          <div className="border-r border-[#E7E8F0] p-4 divide-y divide-[#E7E8F0]">
            <div className="pb-3">
              <input type="text" placeholder="Search conversations" className="text-xs !py-1.5" />
            </div>
            <div className="pt-3 space-y-2">
              <div className="p-2.5 rounded-xl bg-[#EEEDFE] flex items-center gap-3 cursor-pointer">
                <div className="avatar w-8 h-8 text-xs">D</div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-bold truncate">Dr. K. Perera</p>
                  <p className="text-[11px] text-[#666B80] truncate">Regarding SE308.3 assignment...</p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl hover:bg-[#F6F7FB] flex items-center gap-3 cursor-pointer">
                <div className="avatar w-8 h-8 text-xs">I</div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-bold truncate">Ishara Fonseka</p>
                  <p className="text-[11px] text-[#666B80] truncate">Can we study together?</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between p-6">
            <div className="border-b border-[#E7E8F0] pb-4 flex items-center gap-3">
              <div className="avatar w-9 h-9 text-xs">D</div>
              <div>
                <h3 className="font-display font-bold text-sm">Dr. K. Perera</h3>
                <p className="text-[11px] text-[#666B80]">Senior Lecturer · Software Engineering</p>
              </div>
            </div>

            <div className="space-y-4 my-6 text-sm">
              <div className="flex items-start gap-3">
                <div className="avatar w-7 h-7 text-[10px] shrink-0">D</div>
                <div className="bg-[#F2F2FA] p-3 rounded-xl max-w-md">
                  Hello Nadeesha, please make sure to submit your test plan document before Friday.
                </div>
              </div>
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-accent text-white p-3 rounded-xl max-w-md">
                  Thank you Dr. Perera, I will submit it tomorrow morning!
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-[#E7E8F0]">
              <input type="text" placeholder="Write a message..." className="flex-1" />
              <button className="btn-primary"><i className="ti ti-send"></i></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
