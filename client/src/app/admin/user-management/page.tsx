"use client";

import { useState, useEffect } from "react";
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
  status: "Active" | "Locked" | "Inactive";
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

const INITIAL_USERS: UserRecord[] = [];

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const VALID_ROLES = ["Student", "Lecturer", "Guest Lecturer", "HOD/Dean", "Staff/Admin"];

function formatRoleFromBackend(r: string): string {
  if (!r) return "Student";
  const normalized = r.trim().toUpperCase().replace(/[\s\/-]+/g, "_");
  switch (normalized) {
    case "STUDENT":
      return "Student";
    case "LECTURER":
      return "Lecturer";
    case "GUEST_LECTURER":
      return "Guest Lecturer";
    case "HOD_DEAN":
    case "HOD":
    case "DEAN":
      return "HOD/Dean";
    case "STAFF_ADMIN":
    case "ADMIN":
    case "STAFF":
      return "Staff/Admin";
    default:
      return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
  }
}

export default function UserManagementPage() {
  const queryClient = useQueryClient();

  const { data: usersResponse, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get<any>("/api/v1/users"),
  });

  const { data: deptsResponse } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get<any>("/api/v1/departments?size=100"),
  });

  const { data: batchesResponse } = useQuery({
    queryKey: ["batches"],
    queryFn: () => api.get<any>("/api/v1/batches"),
  });

  const { data: facultiesResponse } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => api.get<any>("/api/v1/faculties?size=100"),
  });

  const departmentsList = deptsResponse?.dataList || [];
  const batchesList = batchesResponse || [];
  const facultiesList = facultiesResponse?.dataList || [];

  const apiUsers: UserRecord[] = usersResponse?.dataList
    ? usersResponse.dataList.map((u: any) => ({
        id: String(u.userId),
        fullName: u.fullName || "",
        email: u.email || "",
        phone: u.phone || "N/A",
        role: formatRoleFromBackend(u.role),
        department: u.departmentName || "Software Eng.",
        status: u.active ? "Active" : "Locked",
      }))
    : INITIAL_USERS;

  const [users, setUsers] = useState<UserRecord[]>(apiUsers);

  useEffect(() => {
    if (apiUsers) setUsers(apiUsers);
  }, [usersResponse]);

  const [roleFilter, setRoleFilter] = useState("All roles");
  const [toastMessage, setToastMessage] = useState("");

  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [showEditPasswordText, setShowEditPasswordText] = useState(false);

  
function generateSmartPassword(name: string, role: string): string {
  const cleanName = name.trim().replace(/[^a-zA-Z]/g, "");
  const baseName = cleanName.length > 0
    ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1, 6).toLowerCase()
    : "User";
  const roleCode = (role || "Student").replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase();
  const randomDigits = Math.floor(100 + Math.random() * 900);
  const symbols = ["@", "#", "!", "$", "%"];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  return `${baseName}${symbol}${roleCode}${randomDigits}`;
}

  
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [newRole, setNewRole] = useState("Student");
  
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [scopeType, setScopeType] = useState<string>("department");
  const [designation, setDesignation] = useState<string>("Senior Lecturer");

  useEffect(() => {
    if (departmentsList.length > 0 && !selectedDeptId) {
      setSelectedDeptId(String(departmentsList[0].departmentId));
    }
  }, [deptsResponse]);

  useEffect(() => {
    if (batchesList.length > 0 && !selectedBatchId) {
      setSelectedBatchId(String(batchesList[0].batchId));
    }
  }, [batchesResponse]);

  useEffect(() => {
    if (facultiesList.length > 0 && !selectedFacultyId) {
      setSelectedFacultyId(String(facultiesList[0].facultyId));
    }
  }, [facultiesResponse]);

  const handleGeneratePassword = (name = newFullName, role = newRole) => {
    const generated = generateSmartPassword(name, role);
    setNewPassword(generated);
  };

  
  const [parsedRows, setParsedRows] = useState<CsvValidationRow[] | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const mapRoleToBackend = (r: string) => {
    if (!r) return "STUDENT";
    const normalized = r.trim().toUpperCase().replace(/[\s\/-]+/g, "_");
    switch (normalized) {
      case "STUDENT": return "STUDENT";
      case "LECTURER": return "LECTURER";
      case "GUEST_LECTURER": return "GUEST_LECTURER";
      case "HOD_DEAN":
      case "HOD":
      case "DEAN": return "HOD_DEAN";
      case "STAFF_ADMIN":
      case "ADMIN":
      case "STAFF": return "STAFF_ADMIN";
      default: return normalized;
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => api.delete(`/api/v1/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId: number) =>
      api.patch(`/api/v1/users/${userId}/active?active=false`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      api.post("/api/v1/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; fullName: string; email: string; role: string; phone?: string; active: boolean; password?: string }) =>
      api.put(`/api/v1/users/${data.id}`, {
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        phone: data.phone,
        active: data.active,
        password: data.password || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { id: number; password: string }) =>
      api.patch(`/api/v1/users/${data.id}/password`, { password: data.password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleAddSingleUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) return;

    const finalPassword = newPassword.trim() || generateSmartPassword(newFullName, newRole);

    const payload: any = {
      fullName: newFullName.trim(),
      email: newEmail.trim(),
      password: finalPassword,
      role: mapRoleToBackend(newRole),
    };

    const roleName = mapRoleToBackend(newRole);
    if (roleName === "STUDENT") {
      payload.departmentId = Number(selectedDeptId) || null;
      payload.batchId = Number(selectedBatchId) || null;
    } else if (roleName === "LECTURER" || roleName === "GUEST_LECTURER") {
      payload.departmentId = Number(selectedDeptId) || null;
      payload.designation = designation;
    } else if (roleName === "STAFF_ADMIN") {
      payload.departmentId = Number(selectedDeptId) || null;
    } else if (roleName === "HOD_DEAN") {
      payload.scopeType = scopeType;
      if (scopeType === "department") {
        payload.departmentId = Number(selectedDeptId) || null;
      } else {
        payload.facultyId = Number(selectedFacultyId) || null;
      }
    }

    try {
      const createdRes: any = await createMutation.mutateAsync(payload);

      const deptObj = departmentsList.find((d: any) => String(d.departmentId) === String(selectedDeptId));
      const newUser: UserRecord = {
        id: String(createdRes?.userId || Date.now()),
        fullName: createdRes?.fullName || newFullName.trim(),
        email: createdRes?.email || newEmail.trim(),
        role: newRole,
        department: deptObj ? deptObj.name : "N/A",
        status: "Active",
      };

      setUsers([newUser, ...users]);
      setNewFullName("");
      setNewEmail("");
      setNewPassword("");
      setShowAddModal(false);
      showToast(`User ${newUser.fullName} created! Password: ${finalPassword}`);
    } catch (err: any) {
      console.error("Backend register user error:", err);
      showToast(`Registration failed: ${err.message || "Server error"}`);
    }
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

  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    const numericId = Number(editingUser.id);
    if (!isNaN(numericId)) {
      try {
        await updateMutation.mutateAsync({
          id: numericId,
          fullName: editingUser.fullName,
          email: editingUser.email,
          role: mapRoleToBackend(editingUser.role),
          phone: editingUser.phone,
          active: editingUser.status === "Active",
          password: editPassword.trim() || undefined,
        });
        if (editPassword.trim()) {
          showToast(`Updated details & password for ${editingUser.fullName} (${editingUser.role}).`);
        } else {
          showToast(`Updated user settings for ${editingUser.fullName}.`);
        }
      } catch (err: any) {
        console.error("Backend update user error:", err);
        showToast(`Error updating user: ${err.message || "Server error"}`);
        return;
      }
    }
    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setEditingUser(null);
    setEditPassword("");
  };

  const handleDeleteUser = async (user: UserRecord) => {
    const numericId = Number(user.id);
    if (!isNaN(numericId)) {
      try {
        await deleteMutation.mutateAsync(numericId);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setDeletingUser(null);
        showToast(`User ${user.fullName} deleted successfully from database.`);
      } catch (err: any) {
        console.error("Failed to delete user in backend:", err);
        showToast(`Error: ${err.message || "Failed to delete user."}`);
      }
    }
  };

  const handleDeactivateUser = async (user: UserRecord) => {
    const numericId = Number(user.id);
    if (!isNaN(numericId)) {
      try {
        await deactivateMutation.mutateAsync(numericId);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: "Inactive" } : u))
        );
        showToast(`User ${user.fullName} deactivated successfully.`);
      } catch (err: any) {
        console.error("Failed to deactivate user:", err);
        showToast(`Error: ${err.message || "Failed to deactivate user."}`);
      }
    }
  };

  const handleTriggerPasswordReset = () => {
    if (!editingUser) return;
    showToast(`Password reset link dispatched to ${editingUser.email}.`);
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter === "All roles" || roleFilter === "ALL") return true;
    return formatRoleFromBackend(u.role) === roleFilter;
  });

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
      accessor: (row: UserRecord) => {
        const displayRole = formatRoleFromBackend(row.role);
        return (
          <span
            className={`badge ${
              displayRole === "Student"
                ? "badge-accent"
                : displayRole === "HOD/Dean"
                ? "badge-danger"
                : displayRole === "Guest Lecturer"
                ? "badge-warning"
                : displayRole === "Lecturer"
                ? "badge-secondary"
                : "badge-gray"
            }`}
          >
            {displayRole}
          </span>
        );
      },
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingUser({ ...row, role: formatRoleFromBackend(row.role) })}
            className="btn-secondary text-xs !py-1 flex items-center gap-1"
          >
            <i className="ti ti-edit"></i> Edit Profile & Role
          </button>
          {row.status === "Active" && (
            <button
              onClick={() => handleDeactivateUser(row)}
              className="px-2.5 py-1 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 text-xs font-bold transition-colors flex items-center gap-1"
              title="Deactivate Account (Recommended)"
            >
              <i className="ti ti-power"></i> Deactivate
            </button>
          )}
          <button
            onClick={() => setDeletingUser(row)}
            className="px-2.5 py-1 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold transition-colors flex items-center gap-1"
            title="Delete User"
          >
            <i className="ti ti-trash"></i> Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full space-y-6">
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce" style={{ minWidth: '320px', boxShadow: '0 8px 32px rgba(16,185,129,0.4)' }}>
            <i className="ti ti-circle-check text-white text-2xl"></i>
            <span className="text-sm font-bold">{toastMessage}</span>
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
                <div>
                  <label className="block text-[11px] font-semibold mb-1 text-[var(--on-surface-variant)]">System Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] font-semibold"
                  >
                    {VALID_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {newRole === "HOD/Dean" && scopeType === "faculty" ? (
                  <div>
                    <label className="block text-[11px] font-semibold mb-1 text-[var(--on-surface-variant)]">Faculty</label>
                    <select
                      value={selectedFacultyId}
                      onChange={(e) => setSelectedFacultyId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] font-semibold"
                      required
                    >
                      <option value="">Select Faculty</option>
                      {facultiesList.map((f: any) => (
                        <option key={f.facultyId} value={f.facultyId}>
                          {f.name} ({f.code})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold mb-1 text-[var(--on-surface-variant)]">Department</label>
                    <select
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] font-semibold"
                      required
                    >
                      <option value="">Select Department</option>
                      {departmentsList.map((d: any) => (
                        <option key={d.departmentId} value={d.departmentId}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {newRole === "Student" && (
                <div className="p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)]/50 space-y-2">
                  <p className="text-[11px] font-bold text-[var(--tertiary)] flex items-center gap-1">
                    <i className="ti ti-id"></i> Student Specific Profile Information
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1 text-[var(--on-surface-variant)]">Batch</label>
                    <select
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] font-semibold"
                      required
                    >
                      <option value="">Select Batch</option>
                      {batchesList.map((b: any) => (
                        <option key={b.batchId} value={b.batchId}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {(newRole === "Lecturer" || newRole === "Guest Lecturer") && (
                <div className="p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)]/50 space-y-2">
                  <p className="text-[11px] font-bold text-[var(--tertiary)] flex items-center gap-1">
                    <i className="ti ti-school"></i> Academic Staff Profile Information
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Academic Designation (e.g. Senior Lecturer)"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                      required
                    />
                    <div className="flex items-center gap-2 p-2">
                      <input
                        type="checkbox"
                        id="isGuestCb"
                        checked={newRole === "Guest Lecturer"}
                        onChange={(e) => setNewRole(e.target.checked ? "Guest Lecturer" : "Lecturer")}
                        className="rounded"
                      />
                      <label htmlFor="isGuestCb" className="text-xs text-[var(--on-surface)]">Contract / Guest Visiting Status</label>
                    </div>
                  </div>
                </div>
              )}

              {newRole === "HOD/Dean" && (
                <div className="p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)]/50 space-y-2">
                  <p className="text-[11px] font-bold text-[var(--tertiary)] flex items-center gap-1">
                    <i className="ti ti-shield-check"></i> HOD / Dean Scope Level
                  </p>
                  <div className="flex gap-4 p-2 bg-[var(--surface-container-lowest)] rounded-xl border border-[var(--outline-variant)]">
                    <label className="flex items-center gap-1.5 text-xs text-[var(--on-surface)] cursor-pointer">
                      <input
                        type="radio"
                        name="hodDeanScopeType"
                        value="department"
                        checked={scopeType === "department"}
                        onChange={() => setScopeType("department")}
                        className="radio"
                      />
                      Department Level (HOD)
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-[var(--on-surface)] cursor-pointer">
                      <input
                        type="radio"
                        name="hodDeanScopeType"
                        value="faculty"
                        checked={scopeType === "faculty"}
                        onChange={() => setScopeType("faculty")}
                        className="radio"
                      />
                      Faculty Level (Dean)
                    </label>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-[var(--on-surface-variant)]">
                    User Password (derived from details or custom):
                  </label>
                  <button
                    type="button"
                    onClick={() => handleGeneratePassword()}
                    className="text-[11px] text-[var(--tertiary)] font-bold hover:underline flex items-center gap-1"
                  >
                    <i className="ti ti-wand"></i> Auto-Generate Unique Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPasswordText ? "text" : "password"}
                    placeholder="Enter or generate password..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs p-2.5 pr-10 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] flex items-center justify-center transition-colors"
                  >
                    <i className={`ti ${showPasswordText ? "ti-eye-off" : "ti-eye"} text-base`}></i>
                  </button>
                </div>
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
          <div className="card max-w-md w-full p-6 space-y-4 animate-scaleIn bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">Edit User Details</h3>
              <button onClick={() => setEditingUser(null)} className="text-[var(--on-surface-variant)]">
                <i className="ti ti-x text-lg"></i>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[var(--on-surface)]">Full Name</label>
                <input
                  type="text"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[var(--on-surface)]">Email Address</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--on-surface)]">Phone</label>
                  <input
                    type="text"
                    value={editingUser.phone || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--on-surface)]">Department</label>
                  <input
                    type="text"
                    value={editingUser.department || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[var(--on-surface)]">System Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] font-semibold"
                >
                  {VALID_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--tertiary)]/30 bg-[var(--surface-container-low)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-[var(--on-surface)] flex items-center gap-1.5">
                    <i className="ti ti-key text-[var(--tertiary)] text-base"></i> Reset / Change User Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const gen = generateSmartPassword(editingUser.fullName, editingUser.role);
                      setEditPassword(gen);
                    }}
                    className="text-[11px] text-[var(--tertiary)] font-bold hover:underline flex items-center gap-1"
                  >
                    <i className="ti ti-wand"></i> Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showEditPasswordText ? "text" : "password"}
                    placeholder="New password (leave blank to keep)"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full text-xs p-2.5 pr-10 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] font-mono text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)]/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPasswordText(!showEditPasswordText)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] flex items-center justify-center transition-colors"
                  >
                    <i className={`ti ${showEditPasswordText ? "ti-eye-off" : "ti-eye"} text-base`}></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--outline-variant)]">
              <button onClick={() => setEditingUser(null)} className="btn-secondary text-xs">Cancel</button>
              <button onClick={handleSaveEdit} className="btn-primary text-xs shadow-md">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-sm w-full p-6 space-y-4 animate-scaleIn bg-[var(--surface-container-lowest)] border border-red-500/30">
            <div className="flex items-center gap-3 text-red-500">
              <i className="ti ti-alert-triangle text-2xl"></i>
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">Confirm Delete User</h3>
            </div>
            <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
              Are you sure you want to permanently delete <b>{deletingUser.fullName}</b> ({deletingUser.email})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--outline-variant)]">
              <button onClick={() => setDeletingUser(null)} className="btn-secondary text-xs">Cancel</button>
              <button onClick={() => handleDeleteUser(deletingUser)} className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 shadow-md">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
