"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DataTable from "@/components/DataTable";
import FileDropzone from "@/components/FileDropzone";
import { useAuth } from "@/context/AuthContext";

interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  facultyName?: string;
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
const FILTER_ROLES = ["Super Admin", "Staff/Admin", "Student", "Lecturer", "Guest Lecturer", "HOD/Dean"];

function formatRoleFromBackend(r: string): string {
  if (!r) return "Student";
  const normalized = r.trim().toUpperCase().replace(/[\s\/-]+/g, "_");
  switch (normalized) {
    case "SUPER_ADMIN":
      return "Super Admin";
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
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role?.toLowerCase() === "super_admin";

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
        department: u.departmentName || (u.facultyName ? u.facultyName : (u.role?.toLowerCase() === "super_admin" ? "Institution Wide" : "—")),
        facultyName: u.facultyName,
        scopeLevel: u.scopeLevel,
        status: (u.active ?? (u.status?.toLowerCase() === "active")) ? "Active" : "Locked",
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
  const [tempPasswordNotice, setTempPasswordNotice] = useState<{ user: string; email: string; pass: string } | null>(null);
  const [copiedTempPassword, setCopiedTempPassword] = useState(false);

  
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [newRole, setNewRole] = useState("Student");
  const [adminScope, setAdminScope] = useState<"INSTITUTION" | "FACULTY">("INSTITUTION");
  
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

  const [parsedRows, setParsedRows] = useState<CsvValidationRow[] | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const mapRoleToBackend = (r: string) => {
    if (!r) return "STUDENT";
    const normalized = r.trim().toUpperCase().replace(/[\s\/-]+/g, "_");
    switch (normalized) {
      case "SUPER_ADMIN": return "SUPER_ADMIN";
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

    const payload: any = {
      fullName: newFullName.trim(),
      email: newEmail.trim(),
      role: mapRoleToBackend(newRole),
    };
    if (newPassword.trim()) {
      payload.password = newPassword.trim();
    }

    const roleName = mapRoleToBackend(newRole);
    if (roleName === "STUDENT") {
      payload.departmentId = Number(selectedDeptId) || null;
      payload.batchId = Number(selectedBatchId) || null;
    } else if (roleName === "LECTURER" || roleName === "GUEST_LECTURER") {
      payload.departmentId = Number(selectedDeptId) || null;
      payload.designation = designation;
    } else if (roleName === "STAFF_ADMIN") {
      if (adminScope === "FACULTY") {
        payload.facultyId = Number(selectedFacultyId) || null;
        payload.scopeType = "FACULTY";
      } else {
        payload.scopeType = "INSTITUTION";
      }
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

      const facultyObj = facultiesList.find((f: any) => String(f.facultyId) === String(selectedFacultyId));
      const deptObj = departmentsList.find((d: any) => String(d.departmentId) === String(selectedDeptId));
      const isStaffFaculty = roleName === "STAFF_ADMIN" && adminScope === "FACULTY";
      const newUser: UserRecord = {
        id: String(createdRes?.userId || Date.now()),
        fullName: createdRes?.fullName || newFullName.trim(),
        email: createdRes?.email || newEmail.trim(),
        role: newRole,
        department: isStaffFaculty && facultyObj ? facultyObj.name : (deptObj ? deptObj.name : "N/A"),
        facultyName: isStaffFaculty && facultyObj ? facultyObj.name : undefined,
        scopeLevel: roleName === "STAFF_ADMIN" ? adminScope : undefined,
        status: "Active",
      };

      setUsers([newUser, ...users]);
      setNewFullName("");
      setNewEmail("");
      setNewPassword("");
      setShowAddModal(false);

      if (createdRes?.temporaryPassword) {
        setTempPasswordNotice({
          user: newUser.fullName,
          email: newUser.email,
          pass: createdRes.temporaryPassword,
        });
      } else {
        showToast(`User ${newUser.fullName} created successfully!`);
      }
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

  const handleConfirmBulkImport = async () => {
    if (!parsedRows) return;
    const validRows = parsedRows.filter((r) => r.isValid);
    let successCount = 0;
    for (const r of validRows) {
      try {
        await createMutation.mutateAsync({
          fullName: r.fullName,
          email: r.email,
          role: mapRoleToBackend(r.role),
        });
        successCount++;
      } catch (err) {
        console.error("Failed to import user:", r.email, err);
      }
    }

    setParsedRows(null);
    setShowAddModal(false);
    queryClient.invalidateQueries({ queryKey: ["users"] });
    showToast(`Bulk imported ${successCount} users to database.`);
  };

  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);
  const [conflictUser, setConflictUser] = useState<UserRecord | null>(null);

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
        const isReferenced = err.message && (
          err.message.includes("references it") ||
          err.message.includes("Deactivate it instead") ||
          err.message.includes("can't be deleted") ||
          err.message.includes("409")
        );
        if (isReferenced) {
          setDeletingUser(null);
          setConflictUser(user);
        } else {
          showToast(`Error: ${err.message || "Failed to delete user."}`);
        }
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
        if (displayRole === "Super Admin") {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <i className="ti ti-crown text-xs"></i>
              Super Admin
            </span>
          );
        }
        if (displayRole === "Staff/Admin") {
          const facultyTag = row.facultyName
            ? `Admin (${row.facultyName})`
            : row.scopeLevel === "FACULTY"
            ? "Faculty Admin"
            : "Institution Admin";
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <i className="ti ti-shield text-xs"></i>
              {facultyTag}
            </span>
          );
        }
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
      accessor: (row: UserRecord) => {
        const isRowSuperAdmin = row.role === "Super Admin" || row.role?.toLowerCase() === "super_admin";
        if (isRowSuperAdmin) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-400 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/25">
              <i className="ti ti-lock"></i> Protected Account
            </span>
          );
        }
        return (
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
        );
      },
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="admin" />
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
              {FILTER_ROLES.map((r) => (
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="card max-w-xl w-full p-4 sm:p-6 space-y-4 animate-scaleIn bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">Add User or Bulk Import</h3>
              <button onClick={() => setShowAddModal(false)} className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]">
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
                    {(isSuperAdmin ? VALID_ROLES : VALID_ROLES.filter((r) => r !== "Staff/Admin")).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {newRole !== "Staff/Admin" && (
                  newRole === "HOD/Dean" && scopeType === "faculty" ? (
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
                  )
                )}
              </div>

              {!isSuperAdmin && (
                <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 text-[11px] font-medium flex items-center gap-2">
                  <i className="ti ti-shield-alert text-sm shrink-0"></i>
                  <span>Administrator provisioning is restricted to Super Administrator.</span>
                </div>
              )}

              {newRole === "Staff/Admin" && isSuperAdmin && (
                <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
                      <i className="ti ti-shield-lock text-sm"></i> Staff Administrator Scope & Faculty Assignment
                    </p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Super Admin Authorized
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-2.5 bg-[var(--surface-container-lowest)] rounded-xl border border-[var(--outline-variant)]">
                    <label className="flex items-center gap-1.5 text-xs text-[var(--on-surface)] cursor-pointer">
                      <input
                        type="radio"
                        name="adminScopeType"
                        value="INSTITUTION"
                        checked={adminScope === "INSTITUTION"}
                        onChange={() => setAdminScope("INSTITUTION")}
                        className="radio"
                      />
                      Institution Administrator (Campus-wide)
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-[var(--on-surface)] cursor-pointer">
                      <input
                        type="radio"
                        name="adminScopeType"
                        value="FACULTY"
                        checked={adminScope === "FACULTY"}
                        onChange={() => setAdminScope("FACULTY")}
                        className="radio"
                      />
                      Faculty Administrator
                    </label>
                  </div>

                  {adminScope === "FACULTY" && (
                    <div>
                      <label className="block text-[11px] font-semibold mb-1 text-[var(--on-surface-variant)]">
                        Target Faculty (e.g. Faculty of Computing)
                      </label>
                      <select
                        value={selectedFacultyId}
                        onChange={(e) => setSelectedFacultyId(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] font-semibold"
                        required
                      >
                        <option value="">Select Target Faculty</option>
                        {facultiesList.map((f: any) => (
                          <option key={f.facultyId} value={f.facultyId}>
                            {f.name} ({f.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

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
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-2.5 bg-[var(--surface-container-lowest)] rounded-xl border border-[var(--outline-variant)]">
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
                  <span className="text-[11px] text-[var(--on-surface-variant)]">
                    Auto-generated securely if blank
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPasswordText ? "text" : "password"}
                    placeholder="Temporary password (leave blank to auto-generate securely)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs p-2.5 pr-10 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] font-mono"
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
                  <div className="max-h-44 overflow-y-auto overflow-x-auto border border-[var(--outline-variant)] rounded-xl text-xs">
                    <table className="w-full text-left min-w-[340px]">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="card max-w-md w-full p-4 sm:p-6 space-y-4 animate-scaleIn bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">Edit User Details</h3>
              <button onClick={() => setEditingUser(null)} className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                {editingUser.role === "Super Admin" ? (
                  <div className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 font-bold text-xs flex items-center gap-1.5">
                    <i className="ti ti-crown"></i> Super Administrator (Fixed Role)
                  </div>
                ) : (
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] font-semibold"
                  >
                    {(isSuperAdmin ? VALID_ROLES : VALID_ROLES.filter((r) => r !== "Staff/Admin")).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--tertiary)]/30 bg-[var(--surface-container-low)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-[var(--on-surface)] flex items-center gap-1.5">
                    <i className="ti ti-key text-[var(--tertiary)] text-base"></i> Reset / Change User Password
                  </label>
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
          <div className="card max-w-md w-full p-6 space-y-4 animate-scaleIn bg-[var(--surface-container-lowest)] border border-red-500/30">
            <div className="flex items-center gap-3 text-red-500">
              <i className="ti ti-alert-triangle text-2xl"></i>
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">Manage User Account</h3>
            </div>
            <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
              Choose an action for <b>{deletingUser.fullName}</b> ({deletingUser.email}):
            </p>

            <div className="p-3.5 rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)]">
                <i className="ti ti-shield-check"></i> Recommended: Deactivate Account
              </div>
              <p className="text-[11px] text-[var(--on-surface-variant)] leading-relaxed">
                Deactivating immediately disables login and locks access while safely preserving all historical academic records (exams, grades, announcements).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-[var(--outline-variant)]">
              <button onClick={() => setDeletingUser(null)} className="btn-secondary text-xs">Cancel</button>
              <button
                onClick={() => {
                  const target = deletingUser;
                  setDeletingUser(null);
                  handleDeactivateUser(target);
                }}
                className="px-3.5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:opacity-90 shadow-sm flex items-center justify-center gap-1.5"
              >
                <i className="ti ti-user-off"></i> Deactivate Account
              </button>
              <button
                onClick={() => handleDeleteUser(deletingUser)}
                className="px-3.5 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 shadow-sm flex items-center justify-center gap-1.5"
              >
                <i className="ti ti-trash"></i> Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {conflictUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 space-y-4 animate-scaleIn bg-[var(--surface-container-lowest)] border border-amber-500/40">
            <div className="flex items-center gap-3 text-amber-500">
              <i className="ti ti-database-exclamation text-2xl"></i>
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">Linked Records Detected</h3>
            </div>
            <div className="text-xs text-[var(--on-surface-variant)] space-y-2 leading-relaxed">
              <p>
                <b>{conflictUser.fullName}</b> cannot be permanently deleted because active or historical academic records in the database still reference this account.
              </p>
              <p className="text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 p-2.5 rounded-lg border border-amber-500/20">
                To protect relational integrity and keep academic records intact, you can <b>Deactivate</b> this account instead. This immediately revokes system login privileges and locks the account.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--outline-variant)]">
              <button onClick={() => setConflictUser(null)} className="btn-secondary text-xs">Dismiss</button>
              <button
                onClick={() => {
                  const target = conflictUser;
                  setConflictUser(null);
                  handleDeactivateUser(target);
                }}
                className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:opacity-90 shadow-md flex items-center gap-1.5"
              >
                <i className="ti ti-user-off"></i> Deactivate Account Now
              </button>
            </div>
          </div>
        </div>
      )}

      {tempPasswordNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="card max-w-md w-full p-4 sm:p-6 space-y-4 animate-scaleIn bg-[var(--surface-container-lowest)] border border-[var(--primary)]/30 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-[var(--primary)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                <i className="ti ti-key text-xl"></i>
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[var(--on-surface)]">User Account Created</h3>
                <p className="text-[11px] text-[var(--on-surface-variant)]">One-Time Temporary Password</p>
              </div>
            </div>

            <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
              Account created for <b>{tempPasswordNotice.user}</b> (<span className="font-mono">{tempPasswordNotice.email}</span>).
              Please securely share this temporary password with the user.
            </p>

            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Temporary Password</span>
                <span className="text-[10px] text-amber-500/80">Shown once only</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono text-sm font-bold bg-[var(--surface-container-lowest)] p-2.5 rounded-lg border border-amber-500/20 text-[var(--on-surface)] select-all break-all">
                  {tempPasswordNotice.pass}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(tempPasswordNotice.pass);
                    setCopiedTempPassword(true);
                    setTimeout(() => setCopiedTempPassword(false), 2000);
                  }}
                  className="px-3 py-2.5 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1 shrink-0"
                >
                  <i className={`ti ${copiedTempPassword ? "ti-check" : "ti-copy"}`} />
                  <span>{copiedTempPassword ? "Copied!" : "Copy"}</span>
                </button>
              </div>
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                The user will be required to change this password immediately upon their first login.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--outline-variant)]">
              <button
                onClick={() => {
                  setTempPasswordNotice(null);
                  setCopiedTempPassword(false);
                }}
                className="btn-primary text-xs px-5 py-2.5 shadow-md"
              >
                I have noted the password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
