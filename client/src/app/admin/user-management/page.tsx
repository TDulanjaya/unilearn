"use client";
import { useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";

interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  batch?: string;
  status: string;
}

interface CsvValidationRow {
  rowNumber: number;
  fullName: string;
  email: string;
  role: string;
  department: string;
  batch?: string;
  isValid: boolean;
  errorMessage?: string;
}

const INITIAL_USERS: UserRecord[] = [
  { id: "u-1", fullName: "Nadeesha Silva", email: "nadeesha.s@uni.edu", role: "Student", department: "Software Eng.", batch: "CS2023-A", status: "Active" },
  { id: "u-2", fullName: "Dr. K. Perera", email: "k.perera@uni.edu", role: "Lecturer", department: "Software Eng.", status: "Active" },
  { id: "u-3", fullName: "Prof. A. Fernando", email: "a.fernando@uni.edu", role: "Examiner", department: "Computing", status: "Active" },
  { id: "u-4", fullName: "Dr. S. Wickramasinghe", email: "s.wick@uni.edu", role: "HOD/Dean", department: "Software Eng.", status: "Active" },
  { id: "u-5", fullName: "T. Bandara", email: "t.guest@uni.edu", role: "Guest Lecturer", department: "Computing", status: "Active" },
];

const VALID_ROLES = ["Student", "Lecturer", "Examiner", "Staff/Admin", "HOD/Dean", "Guest Lecturer"];

export default function Page() {
  useInteractive();

  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");

  // Single user add state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Student");
  const [newDept, setNewDept] = useState("Software Eng.");
  const [newBatch, setNewBatch] = useState("CS2023-A");

  // CSV Import State
  const [parsedRows, setParsedRows] = useState<CsvValidationRow[] | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [csvFileName, setCsvFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single user submit
  const handleAddSingleUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newUser: UserRecord = {
      id: "u-" + Date.now(),
      fullName: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      department: newDept,
      batch: newRole === "Student" ? newBatch : undefined,
      status: "Active",
    };
    setUsers((prev) => [newUser, ...prev]);
    setNewName("");
    setNewEmail("");

    // Close modal
    const modal = document.getElementById("add-user-modal");
    if (modal) modal.classList.add("hidden");
  };

  // CSV File Upload & Parsing
  const handleFileUpload = (file: File) => {
    if (!file) return;
    setCsvFileName(file.name);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setIsParsing(false);
        return;
      }

      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const rows: CsvValidationRow[] = [];
      const seenEmails = new Set<string>(users.map((u) => u.email.toLowerCase()));

      // Skip header if line 0 looks like header
      const startIdx = lines[0].toLowerCase().includes("name") || lines[0].toLowerCase().includes("email") ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        const fullName = parts[0] || "";
        const email = parts[1] || "";
        const role = parts[2] || "";
        const department = parts[3] || "";
        const batch = parts[4] || "";

        let isValid = true;
        let errorMessage = "";

        if (!fullName) {
          isValid = false;
          errorMessage = "Missing full name";
        } else if (!email || !email.includes("@")) {
          isValid = false;
          errorMessage = "Invalid or missing email";
        } else if (seenEmails.has(email.toLowerCase())) {
          isValid = false;
          errorMessage = "Duplicate email address";
        } else if (!VALID_ROLES.map(r => r.toLowerCase()).includes(role.toLowerCase())) {
          isValid = false;
          errorMessage = `Invalid role "${role}"`;
        } else if (!department) {
          isValid = false;
          errorMessage = "Missing department";
        }

        if (isValid) {
          seenEmails.add(email.toLowerCase());
        }

        rows.push({
          rowNumber: i + 1,
          fullName,
          email,
          role,
          department,
          batch,
          isValid,
          errorMessage,
        });
      }

      setParsedRows(rows);
      setIsParsing(false);
    };

    reader.readAsText(file);
  };

  // Seed sample mock CSV for instant testing
  const handleLoadSampleCsv = () => {
    const sampleCsv = `Full Name,Email,Role,Department,Batch
S. Karunaratne,nadeesha.s@uni.edu,Student,Software Eng.,CS2023-A
M. Rathnayake,m.rathnayake@uni.edu,Lecturer,,CS2023-A
D. Abeywickrama,d.abey@uni.edu,Student,Computer Science,CS2023-B
R. Perera,r.perera@uni.edu,InvalidRole,Engineering,CS2023-A
K. Wickrama,k.wick@uni.edu,Examiner,Computing,
`;
    const blob = new Blob([sampleCsv], { type: "text/csv" });
    const file = new File([blob], "sample_users.csv", { type: "text/csv" });
    handleFileUpload(file);
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (!parsedRows) return;
    const validRows = parsedRows.filter((r) => r.isValid);
    const newUsers: UserRecord[] = validRows.map((r) => ({
      id: "u-" + Date.now() + "-" + r.rowNumber,
      fullName: r.fullName,
      email: r.email,
      role: VALID_ROLES.find(vr => vr.toLowerCase() === r.role.toLowerCase()) || r.role,
      department: r.department,
      batch: r.batch || undefined,
      status: "Active",
    }));

    setUsers((prev) => [...newUsers, ...prev]);
    setParsedRows(null);
    setCsvFileName("");

    // Close modal
    const modal = document.getElementById("add-user-modal");
    if (modal) modal.classList.add("hidden");
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All roles" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)]">
            User Management
          </h1>
          <button className="btn-primary shadow-md" data-modal-open="add-user-modal">
            <i className="ti ti-plus"></i> Add user
          </button>
        </div>
        <p className="text-[var(--on-surface-variant)] text-sm mb-6">
          Manage students, lecturers, examiners, staff and HOD/Dean accounts.
        </p>

        {/* User List Table */}
        <div className="card p-6 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-5 pb-4 border-b border-[var(--outline-variant)]">
            <input
              type="text"
              placeholder="Search users by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <select className="w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option>All roles</option>
              {VALID_ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                  <th className="pb-3 px-3 font-semibold">Name</th>
                  <th className="pb-3 px-3 font-semibold">Email</th>
                  <th className="pb-3 px-3 font-semibold">Role</th>
                  <th className="pb-3 px-3 font-semibold">Department</th>
                  <th className="pb-3 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-variant)]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="table-row transition-colors">
                    <td className="py-3.5 px-3 flex items-center gap-2 font-semibold text-[var(--on-surface)]">
                      <div className="avatar w-7 h-7 text-[10px]">{u.fullName.charAt(0)}</div>
                      {u.fullName}
                    </td>
                    <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">{u.email}</td>
                    <td className="py-3.5 px-3">
                      <span className={`badge ${u.role === "Student" ? "badge-accent" : u.role === "HOD/Dean" ? "badge-danger" : "badge-gray"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[var(--on-surface-variant)]">{u.department}</td>
                    <td className="py-3.5 px-3"><span className="badge badge-success">{u.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add User & CSV Import */}
        <div id="add-user-modal" className="hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-xl p-6 bg-[var(--surface-container-lowest)] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">Add User / Import</h3>
              <button data-modal-close="add-user-modal" className="text-[var(--outline)] hover:text-[var(--on-surface)]">
                <i className="ti ti-x text-xl"></i>
              </button>
            </div>

            <div className="flex gap-2 mb-5 border-b border-[var(--outline-variant)]" data-tabgroup="addu">
              <span className="tab-btn active" data-tab="single">Single Entry</span>
              <span className="tab-btn" data-tab="bulk">Bulk CSV Import</span>
            </div>

            {/* Single Entry Tab */}
            <div id="addu-single" data-tabpanel="addu">
              <form onSubmit={handleAddSingleUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Role</label>
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                    {VALID_ROLES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Full Name</label>
                    <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Email</label>
                    <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@uni.edu" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Department</label>
                    <select value={newDept} onChange={(e) => setNewDept(e.target.value)}>
                      <option>Software Eng.</option>
                      <option>Computer Science</option>
                      <option>Business</option>
                      <option>Engineering</option>
                    </select>
                  </div>
                  {newRole === "Student" && (
                    <div>
                      <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Batch</label>
                      <select value={newBatch} onChange={(e) => setNewBatch(e.target.value)}>
                        <option>CS2023-A</option>
                        <option>CS2023-B</option>
                        <option>CS2026-A</option>
                      </select>
                    </div>
                  )}
                </div>
                <button type="submit" className="btn-primary w-full justify-center shadow-md">
                  Register User
                </button>
              </form>
            </div>

            {/* Bulk CSV Import Tab (FR-ADMIN-01) */}
            <div id="addu-bulk" data-tabpanel="addu" className="hidden">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--outline-variant)] rounded-2xl p-6 text-center text-sm text-[var(--outline)] mb-3 bg-[var(--surface-container-low)] hover:border-[var(--tertiary)] cursor-pointer transition-colors"
              >
                <i className="ti ti-cloud-upload text-3xl block mb-2 text-[var(--tertiary)]"></i>
                <p className="font-semibold text-[var(--on-surface)]">
                  {csvFileName ? csvFileName : "Click or drag & drop a CSV file"}
                </p>
                <p className="text-xs text-[var(--on-surface-variant)] mt-1">Columns: Full Name, Email, Role, Department, Batch</p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handleLoadSampleCsv}
                  className="text-xs font-semibold text-[var(--tertiary)] hover:underline"
                >
                  <i className="ti ti-file-text mr-1"></i> Load Test CSV with Validation Errors
                </button>
              </div>

              {/* Per-row validation table */}
              {parsedRows && (
                <div className="space-y-3 mb-4 max-h-[220px] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between text-xs font-bold px-1">
                    <span className="text-[var(--on-surface)]">Validation Results ({parsedRows.length} rows)</span>
                    <span className="text-[var(--secondary)]">{parsedRows.filter(r => r.isValid).length} Valid</span>
                    <span className="text-[var(--error)]">{parsedRows.filter(r => !r.isValid).length} Failed</span>
                  </div>

                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] uppercase">
                        <th className="pb-1.5 px-2">Row</th>
                        <th className="pb-1.5 px-2">Name / Email</th>
                        <th className="pb-1.5 px-2">Status</th>
                        <th className="pb-1.5 px-2">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--outline-variant)]">
                      {parsedRows.map((row) => (
                        <tr key={row.rowNumber} className="hover:bg-[var(--surface-container-low)]">
                          <td className="py-2 px-2 font-mono">{row.rowNumber}</td>
                          <td className="py-2 px-2">
                            <p className="font-semibold text-[var(--on-surface)]">{row.fullName || "—"}</p>
                            <p className="text-[10px] text-[var(--on-surface-variant)]">{row.email}</p>
                          </td>
                          <td className="py-2 px-2">
                            {row.isValid ? (
                              <span className="badge badge-success text-[10px]">✓ Valid</span>
                            ) : (
                              <span className="badge badge-danger text-[10px]">✗ Error</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-[var(--on-surface-variant)]">
                            {row.isValid ? `${row.role} · ${row.department}` : <span className="text-[var(--error)] font-semibold">{row.errorMessage}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                disabled={!parsedRows || parsedRows.filter(r => r.isValid).length === 0}
                onClick={handleConfirmImport}
                className="btn-primary w-full justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Import ({parsedRows ? parsedRows.filter(r => r.isValid).length : 0} valid users)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
