"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DataTable from "@/components/DataTable";
import FileDropzone from "@/components/FileDropzone";

interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  batch?: string;
  studentNumber?: string;
  designation?: string;
  assignedCourses?: string[];
  engagementEndDate?: string;
  scopeLevel?: string;
  status: "Active" | "Locked";
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
  { id: "u-1", fullName: "Nadeesha Silva", email: "nadeesha.s@uni.edu", phone: "0771234567", role: "Student", department: "Software Eng.", batch: "CS2023-A", studentNumber: "SE/2023/042", status: "Active" },
  { id: "u-2", fullName: "Dr. K. Perera", email: "k.perera@uni.edu", phone: "0719876543", role: "Lecturer", department: "Software Eng.", designation: "Senior Lecturer", assignedCourses: ["SE308.3", "SE309.3"], status: "Active" },
  { id: "u-4", fullName: "Dr. S. Wickramasinghe", email: "s.wick@uni.edu", phone: "0755544332", role: "HOD/Dean", department: "Software Eng.", scopeLevel: "Department", status: "Active" },
  { id: "u-5", fullName: "T. Bandara", email: "t.guest@uni.edu", phone: "0723344556", role: "Guest Lecturer", department: "Computing", assignedCourses: ["SE202.2"], engagementEndDate: "2026-12-31", status: "Active" },
  { id: "u-6", fullName: "R. Jayawardena", email: "r.jaya@uni.edu", phone: "0788877665", role: "Staff/Admin", scopeLevel: "Institution-wide", status: "Active" },
];

const VALID_ROLES = ["Student", "Lecturer", "Guest Lecturer", "HOD/Dean", "Staff/Admin"];

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [toastMessage, setToastMessage] = useState("");

  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Student");
  const [newDept, setNewDept] = useState("Software Eng.");

  
  const [parsedRows, setParsedRows] = useState<CsvValidationRow[] | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleAddSingleUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) return;

    const newUser: UserRecord = {
      id: `u-${Date.now()}`,
      fullName: newFullName.trim(),
      email: newEmail.trim(),
      role: newRole,
      department: newDept,
      status: "Active",
    };

    setUsers([newUser, ...users]);
    setNewFullName("");
    setNewEmail("");
    setShowAddModal(false);
    showToast(`User ${newUser.fullName} added successfully.`);
  };

  const handleCsvFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const rows: CsvValidationRow[] = [];
      const seenEmails = new Set<string>(users.map((u) => u.email.toLowerCase()));

      const startIdx = lines[0].toLowerCase().includes("email") ? 1 : 0;
      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        const fullName = parts[0] || "";
        const email = parts[1] || "";
        const role = parts[2] || "Student";
        const department = parts[3] || "Software Eng.";

        let isValid = true;
        let errorMessage = "";

        if (!fullName) {
          isValid = false;
          errorMessage = "Missing Full Name";
        } else if (!email.includes("@")) {
          isValid = false;
          errorMessage = "Invalid Email";
        } else if (seenEmails.has(email.toLowerCase())) {
          isValid = false;
          errorMessage = "Duplicate Email";
        }

        if (isValid) seenEmails.add(email.toLowerCase());

        rows.push({ rowNumber: i + 1, fullName, email, role, department, isValid, errorMessage });
      }

      setParsedRows(rows);
    };

    reader.readAsText(file);
  };

  const handleConfirmBulkImport = () => {
    if (!parsedRows) return;
    const validRows = parsedRows.filter((r) => r.isValid);
    const newUsers: UserRecord[] = validRows.map((r) => ({
      id: `u-${Date.now()}-${r.rowNumber}`,
      fullName: r.fullName,
      email: r.email,
      role: r.role,
      department: r.department,
      status: "Active",
    }));

    setUsers([...newUsers, ...users]);
    setParsedRows(null);
    setShowAddModal(false);
    showToast(`Bulk imported ${newUsers.length} valid users.`);
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setEditingUser(null);
    showToast(`Updated user settings for ${editingUser.fullName}.`);
  };

  const handleTriggerPasswordReset = () => {
    if (!editingUser) return;
    showToast(`Password reset link dispatched to ${editingUser.email}.`);
  };

  const filteredUsers = users.filter(
    (u) => roleFilter === "All roles" || u.role === roleFilter
  );

  const columns = [
    {
      header: "User Details",
      accessor: (row: UserRecord) => (
        <div className="flex items-center gap-2">
          <div className="avatar w-8 h-8 text-xs shrink-0">{row.fullName.charAt(0)}</div>
          <div>
            <p className="font-bold text-xs text-[var(--on-surface)]">{row.fullName}</p>
            <p className="text-[11px] text-[var(--on-surface-variant)]">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "System Role",
      accessor: (row: UserRecord) => (
        <span className={`badge ${row.role === "Student" ? "badge-accent" : row.role === "HOD/Dean" ? "badge-danger" : row.role === "Guest Lecturer" ? "badge-warning" : "badge-gray"}`}>
          {row.role}
        </span>
      ),
    },
    {
      header: "Department / Batch",
      accessor: (row: UserRecord) => (
        <div className="text-xs text-[var(--on-surface-variant)]">
          <p className="font-semibold text-[var(--on-surface)]">{row.department || "—"}</p>
          {row.batch && <p className="text-[10px] opacity-80">Batch: {row.batch}</p>}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row: UserRecord) => (
        <span className={`badge ${row.status === "Active" ? "badge-success" : "badge-danger"}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row: UserRecord) => (
        <button
          onClick={() => setEditingUser(row)}
          className="btn-secondary text-xs !py-1 flex items-center gap-1"
        >
          <i className="ti ti-edit"></i> Edit Profile & Role
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full space-y-6">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[var(--surface-container-highest)] border border-[var(--tertiary)] text-[var(--on-surface)] px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
            <i className="ti ti-check text-[var(--tertiary)] text-lg"></i>
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
              User Management & Accounts
            </h1>
            <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm">
              Role assignment, single/bulk CSV user registration, and account lock controls.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
            >
              <option value="All roles">Filter: All Roles</option>
              {VALID_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs shadow-md shrink-0 whitespace-nowrap">
              <i className="ti ti-user-plus mr-1"></i> Add / Bulk Import
            </button>
          </div>
        </div>

        <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
          <DataTable data={filteredUsers} columns={columns} searchPlaceholder="Search users by name, email or department..." pageSize={10} />
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-xl w-full p-6 space-y-4 animate-scaleIn bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">Add User or Bulk Import</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--on-surface-variant)]">
                <i className="ti ti-x text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleAddSingleUser} className="space-y-3 pb-3 border-b border-[var(--outline-variant)]">
              <p className="text-xs font-bold text-[var(--on-surface)]">Single User Registration:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] font-semibold"
                >
                  {VALID_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Department"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                />
              </div>

              <button type="submit" className="btn-primary text-xs w-full justify-center shadow-sm">
                Add Single User
              </button>
            </form>

            <div className="space-y-3 pt-1">
              <p className="text-xs font-bold text-[var(--on-surface)]">CSV Bulk Importer:</p>
              <FileDropzone accept=".csv" maxSizeMB={5} multiple={false} onFilesSelected={handleCsvFilesSelected} />

              {parsedRows && (
                <div className="space-y-2 border-t border-[var(--outline-variant)] pt-3">
                  <p className="text-xs font-bold text-[var(--on-surface)]">CSV Validation Preview ({parsedRows.length} Rows):</p>
                  <div className="max-h-44 overflow-y-auto border border-[var(--outline-variant)] rounded-xl text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] sticky top-0">
                        <tr>
                          <th className="p-2">Row</th>
                          <th className="p-2">Name / Email</th>
                          <th className="p-2">Role</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--outline-variant)]">
                        {parsedRows.map((r) => (
                          <tr key={r.rowNumber} className="hover:bg-[var(--surface-container-low)]/50">
                            <td className="p-2 font-mono">{r.rowNumber}</td>
                            <td className="p-2">
                              <p className="font-bold">{r.fullName || "—"}</p>
                              <p className="text-[10px] text-[var(--on-surface-variant)]">{r.email}</p>
                            </td>
                            <td className="p-2">{r.role}</td>
                            <td className="p-2">
                              {r.isValid ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">Valid</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600">{r.errorMessage}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={handleConfirmBulkImport} disabled={parsedRows.filter((r) => r.isValid).length === 0} className="btn-primary text-xs w-full justify-center disabled:opacity-40">
                    Confirm Import ({parsedRows.filter((r) => r.isValid).length} Valid Users)
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--outline-variant)]">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 space-y-4 animate-scaleIn bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">Edit User Account</h3>
              <button onClick={() => setEditingUser(null)} className="text-[var(--on-surface-variant)]">
                <i className="ti ti-x text-lg"></i>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--on-surface)]">Full Name</label>
                <input
                  type="text"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--on-surface)]">Reassign Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] font-semibold"
                >
                  {VALID_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)]">
                <div>
                  <p className="font-bold text-xs text-[var(--on-surface)]">Account Status Lock</p>
                  <p className="text-[10px] text-[var(--on-surface-variant)]">Prevent user login access</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser({ ...editingUser, status: editingUser.status === "Active" ? "Locked" : "Active" })}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${editingUser.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"}`}
                >
                  {editingUser.status}
                </button>
              </div>

              <button
                type="button"
                onClick={handleTriggerPasswordReset}
                className="btn-secondary text-xs w-full justify-center !py-2"
              >
                <i className="ti ti-key mr-1"></i> Trigger Password Reset Email
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--outline-variant)]">
              <button onClick={() => setEditingUser(null)} className="btn-secondary text-xs">Cancel</button>
              <button onClick={handleSaveEdit} className="btn-primary text-xs shadow-md">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
