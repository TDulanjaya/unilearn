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
  // role exactly as the server has it
  rawRole?: string;
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
  departmentId?: number;
  batchId?: number;
  isValid: boolean;
  errorMessage?: string;
}

interface ImportResult {
  success: number;
  failed: number;
  failures: { rowNumber: number; email: string; message: string }[];
}

const PAGE_SIZE = 20;

// split one csv line, commas inside "quotes" are kept
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

const INITIAL_USERS: UserRecord[] = [];

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";

const VALID_ROLES = ["Student", "Lecturer", "Guest Lecturer", "HOD/Dean", "Staff/Admin"];
const FILTER_ROLES = ["Super Admin", "Staff/Admin", "Student", "Lecturer", "Guest Lecturer", "HOD/Dean"];

function roleToBackend(r: string): string {
  if (!r) return "STUDENT";
  const normalized = r.trim().toUpperCase().replace(/[\s\/-]+/g, "_");
  switch (normalized) {
    case "HOD":
    case "DEAN": return "HOD_DEAN";
    case "ADMIN":
    case "STAFF": return "STAFF_ADMIN";
    default: return normalized;
  }
}

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

  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // wait a bit after typing before asking the server
  useEffect(() => {
    const t = setTimeout(() => {
      const next = searchInput.trim();
      if (next !== search) {
        setSearch(next);
        setPage(0);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, search]);

  const usersQueryString = (() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(PAGE_SIZE));
    params.set("sort", "fullName,asc");
    if (search) params.set("search", search);
    if (roleFilter !== "All roles") params.set("role", roleToBackend(roleFilter));
    if (statusFilter !== "all") params.set("status", statusFilter);
    return params.toString();
  })();

  const { data: usersResponse, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users", "list", usersQueryString],
    queryFn: () => api.get<any>(`/api/v1/users?${usersQueryString}`),
    placeholderData: keepPreviousData,
  });

  const totalUsers: number = usersResponse?.dataCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));

  // go back a page if the last user on this page was removed
  useEffect(() => {
    if (usersResponse && page > totalPages - 1) setPage(totalPages - 1);
  }, [usersResponse, page, totalPages]);

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
        rawRole: u.role,
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
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [conflictMessage, setConflictMessage] = useState("");

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

  const reactivateMutation = useMutation({
    mutationFn: (userId: number) =>
      api.patch(`/api/v1/users/${userId}/active?active=true`, {}),
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
    mutationFn: (data: { id: number; fullName: string; email: string; role: string; phone?: string; password?: string }) =>
      api.put(`/api/v1/users/${data.id}`, {
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        phone: data.phone,
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

  const findDepartment = (value: string): any | null => {
    const v = value.trim().toLowerCase();
    if (!v) return null;
    return (
      departmentsList.find(
        (d: any) =>
          String(d.departmentId) === v ||
          (d.name || "").toLowerCase() === v ||
          (d.code || "").toLowerCase() === v
      ) || null
    );
  };

  const findBatch = (value: string, departmentId?: number): any | null => {
    const v = value.trim().toLowerCase();
    if (!v) return null;
    const matches = batchesList.filter(
      (b: any) => String(b.batchId) === v || (b.name || "").toLowerCase() === v
    );
    // same batch name can be in many departments, prefer the row's department
    return matches.find((b: any) => departmentId && b.departmentId === departmentId) || matches[0] || null;
  };

  const handleCsvFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    setImportResult(null);

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return;
      const rows: CsvValidationRow[] = [];
      const seenEmails = new Set<string>(users.map((u) => u.email.toLowerCase()));

      // read columns by header name when there is a header row
      let col = { name: 0, email: 1, role: 2, department: 3, batch: 4 };
      const hasHeader = lines[0].toLowerCase().includes("email");
      if (hasHeader) {
        const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[\s_]+/g, ""));
        const idx = (names: string[], fallback: number) => {
          const i = headers.findIndex((h) => names.includes(h));
          return i >= 0 ? i : fallback;
        };
        col = {
          name: idx(["fullname", "name"], 0),
          email: idx(["email", "emailaddress"], 1),
          role: idx(["role"], 2),
          department: idx(["department", "departmentcode", "dept"], -1),
          batch: idx(["batch", "batchname"], -1),
        };
      }

      const startIdx = hasHeader ? 1 : 0;
      for (let i = startIdx; i < lines.length; i++) {
        const parts = splitCsvLine(lines[i]).map((p) => p.replace(/^["']|["']$/g, ""));
        const get = (c: number) => (c >= 0 ? parts[c] || "" : "");
        const fullName = get(col.name);
        const email = get(col.email);
        const role = get(col.role) || "Student";
        const department = get(col.department);
        const batch = get(col.batch);
        const backendRole = roleToBackend(role);

        let isValid = true;
        let errorMessage = "";
        const dept = findDepartment(department);
        const batchObj = findBatch(batch, dept?.departmentId);

        if (!fullName) {
          isValid = false;
          errorMessage = "Missing Full Name";
        } else if (!email.includes("@")) {
          isValid = false;
          errorMessage = "Invalid Email";
        } else if (seenEmails.has(email.toLowerCase())) {
          isValid = false;
          errorMessage = "Duplicate Email";
        } else if (!["STUDENT", "LECTURER", "GUEST_LECTURER", "HOD_DEAN", "STAFF_ADMIN"].includes(backendRole)) {
          isValid = false;
          errorMessage = "Unknown Role";
        } else if (department && !dept) {
          isValid = false;
          errorMessage = `Unknown Department "${department}"`;
        } else if ((backendRole === "STUDENT" || backendRole === "HOD_DEAN") && !dept) {
          isValid = false;
          errorMessage = "Department is required";
        } else if (backendRole === "STUDENT" && !batch) {
          isValid = false;
          errorMessage = "Batch is required";
        } else if (batch && !batchObj) {
          isValid = false;
          errorMessage = `Unknown Batch "${batch}"`;
        }

        if (isValid) seenEmails.add(email.toLowerCase());

        rows.push({
          rowNumber: i + 1,
          fullName,
          email,
          role,
          department,
          batch,
          departmentId: dept ? Number(dept.departmentId) : undefined,
          batchId: batchObj ? Number(batchObj.batchId) : undefined,
          isValid,
          errorMessage,
        });
      }

      setParsedRows(rows);
    };

    reader.readAsText(file);
  };

  const handleDownloadCsvTemplate = () => {
    const sample =
      "fullName,email,role,department,batch\n" +
      "Nimal Perera,nimal@example.com,Student,SE,2024 Batch A\n" +
      "Kamala Silva,kamala@example.com,Lecturer,SE,\n";
    const blob = new Blob([sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmBulkImport = async () => {
    if (!parsedRows) return;
    const validRows = parsedRows.filter((r) => r.isValid);
    let successCount = 0;
    const failures: ImportResult["failures"] = [];
    const created: { email: string; password: string }[] = [];
    setIsImporting(true);
    for (const r of validRows) {
      const backendRole = roleToBackend(r.role);
      const payload: any = {
        fullName: r.fullName,
        email: r.email,
        role: backendRole,
      };
      if (r.departmentId) payload.departmentId = r.departmentId;
      if (backendRole === "STUDENT" && r.batchId) payload.batchId = r.batchId;
      if (backendRole === "STAFF_ADMIN") payload.scopeType = "INSTITUTION";
      if (backendRole === "HOD_DEAN") payload.scopeType = "department";
      try {
        const res: any = await createMutation.mutateAsync(payload);
        if (res?.temporaryPassword) created.push({ email: r.email, password: res.temporaryPassword });
        successCount++;
      } catch (err: any) {
        failures.push({ rowNumber: r.rowNumber, email: r.email, message: err?.message || "Server error" });
      }
    }
    setIsImporting(false);

    // download the new users' temporary passwords so the admin can share them
    if (created.length > 0) {
      const csv = "email,temporaryPassword\n" + created.map((c) => `${c.email},${c.password}`).join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "imported-users-passwords.csv";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // rows that failed the preview check count as failed too
    const invalidRows = parsedRows.filter((r) => !r.isValid);
    const allFailures = [
      ...invalidRows.map((r) => ({ rowNumber: r.rowNumber, email: r.email, message: r.errorMessage || "Invalid row" })),
      ...failures,
    ].sort((a, b) => a.rowNumber - b.rowNumber);

    setParsedRows(null);
    setImportResult({ success: successCount, failed: allFailures.length, failures: allFailures });
    queryClient.invalidateQueries({ queryKey: ["users"] });
    showToast(`${successCount} imported, ${allFailures.length} failed.`);
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
          // role can't change, send the one the server already has
          role: editingUser.rawRole || mapRoleToBackend(editingUser.role),
          phone: editingUser.phone && editingUser.phone !== "N/A" ? editingUser.phone : undefined,
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
          setConflictMessage(err.message || "");
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

  const handleReactivateUser = async (user: UserRecord) => {
    const numericId = Number(user.id);
    if (!isNaN(numericId)) {
      try {
        await reactivateMutation.mutateAsync(numericId);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: "Active" } : u))
        );
        showToast(`User ${user.fullName} reactivated.`);
      } catch (err: any) {
        showToast(`Error: ${err.message || "Failed to reactivate user."}`);
      }
    }
  };

  const handleTriggerPasswordReset = () => {
    if (!editingUser) return;
    showToast(`Password reset link dispatched to ${editingUser.email}.`);
  };

  // role, status and search are done by the server
  const filteredUsers = users;

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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
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
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/25">
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
              <i className="ti ti-edit"></i> Edit Profile
            </button>
            {row.status === "Active" ? (
              <button
                onClick={() => handleDeactivateUser(row)}
                className="px-2.5 py-1 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 text-xs font-bold transition-colors flex items-center gap-1"
                title="Deactivate Account (Recommended)"
              >
                <i className="ti ti-power"></i> Deactivate
              </button>
            ) : (
              <button
                onClick={() => handleReactivateUser(row)}
                disabled={reactivateMutation.isPending}
                className="px-2.5 py-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold transition-colors flex items-center gap-1 disabled:opacity-50"
                title="Reactivate Account"
              >
                <i className="ti ti-player-play"></i> Reactivate
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

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name or email..."
              className="text-xs px-3 py-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
            />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
            >
              <option value="All roles">Filter: All Roles</option>
              {FILTER_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs shadow-md shrink-0 whitespace-nowrap">
              <i className="ti ti-user-plus mr-1"></i> Add / Bulk Import
            </button>
          </div>
        </div>

        <div className="card p-6 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
          {isError ? (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-xs flex items-center justify-between gap-2">
              <span>Could not load users: {(error as any)?.message || "Server error"}</span>
              <button onClick={() => refetch()} className="btn-secondary text-xs">Retry</button>
            </div>
          ) : (
            <DataTable
              data={filteredUsers}
              columns={columns}
              searchPlaceholder="Filter this page..."
              pageSize={PAGE_SIZE}
              pageSizeOptions={[PAGE_SIZE]}
            />
          )}

          {/* server pages */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-xs text-[var(--on-surface-variant)]">
            <span>
              {isLoading
                ? "Loading users..."
                : totalUsers === 0
                ? "No users found"
                : `Showing ${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, totalUsers)} of ${totalUsers} users`}
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary text-xs !py-1 disabled:opacity-40"
              >
                <i className="ti ti-chevron-left"></i> Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 2)
                .map((i, idx, arr) => (
                  <span key={i} className="flex items-center gap-1">
                    {idx > 0 && i - arr[idx - 1] > 1 && <span className="px-1">...</span>}
                    <button
                      onClick={() => setPage(i)}
                      className={`text-xs !py-1 px-2.5 rounded-lg ${i === page ? "btn-primary" : "btn-secondary"}`}
                    >
                      {i + 1}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn-secondary text-xs !py-1 disabled:opacity-40"
              >
                Next <i className="ti ti-chevron-right"></i>
              </button>
            </div>
          </div>
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
                    <p className="text-[11px] font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                      <i className="ti ti-shield-lock text-sm"></i> Staff Administrator Scope & Faculty Assignment
                    </p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
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
              <div className="text-[11px] text-[var(--on-surface-variant)] space-y-1">
                <p>
                  Columns: <span className="font-mono">fullName, email, role, department, batch</span>
                </p>
                <p>
                  Role is Student, Lecturer, Guest Lecturer, HOD/Dean or Staff/Admin. Department can be the name or the code.
                  Students need a department and a batch (batch name as shown in Academic Structure).
                </p>
                <button type="button" onClick={handleDownloadCsvTemplate} className="text-[var(--tertiary)] font-semibold hover:underline">
                  <i className="ti ti-download"></i> Download CSV template
                </button>
              </div>
              <FileDropzone accept=".csv" maxSizeMB={5} multiple={false} onFilesSelected={handleCsvFilesSelected} />

              {importResult && (
                <div className={`p-3 rounded-xl border text-xs space-y-1 ${importResult.failed > 0 ? "border-amber-500/30 bg-amber-500/10" : "border-emerald-500/30 bg-emerald-500/10"}`}>
                  <p className="font-bold text-[var(--on-surface)]">
                    {importResult.success} imported, {importResult.failed} failed
                  </p>
                  {importResult.failures.slice(0, 5).map((f) => (
                    <p key={f.rowNumber} className="text-[11px] text-[var(--on-surface-variant)]">
                      Row {f.rowNumber} ({f.email || "no email"}): {f.message}
                    </p>
                  ))}
                  {importResult.failures.length > 5 && (
                    <p className="text-[11px] text-[var(--on-surface-variant)]">...and {importResult.failures.length - 5} more</p>
                  )}
                </div>
              )}

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
                            <td className="p-2">
                              <p>{r.role}</p>
                              {(r.department || r.batch) && (
                                <p className="text-[10px] text-[var(--on-surface-variant)]">
                                  {[r.department, r.batch].filter(Boolean).join(" / ")}
                                </p>
                              )}
                            </td>
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
                  <button onClick={handleConfirmBulkImport} disabled={isImporting || parsedRows.filter((r) => r.isValid).length === 0} className="btn-primary text-xs w-full justify-center disabled:opacity-40">
                    {isImporting ? "Importing..." : `Confirm Import (${parsedRows.filter((r) => r.isValid).length} Valid Users)`}
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
                  {/* department is not saved from here */}
                  <input
                    type="text"
                    value={editingUser.department || ""}
                    readOnly
                    disabled
                    className="w-full p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] opacity-70 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[var(--on-surface)]">System Role</label>
                {editingUser.role === "Super Admin" ? (
                  <div className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400 font-bold text-xs flex items-center gap-1.5">
                    <i className="ti ti-crown"></i> Super Administrator (Fixed Role)
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={editingUser.role}
                      readOnly
                      disabled
                      className="w-full p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] font-semibold opacity-70 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-[var(--on-surface-variant)] mt-1">
                      Role can't be changed. Create a new account for a different role.
                    </p>
                  </>
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
              {conflictMessage && (
                <p className="text-[11px]">{conflictMessage}</p>
              )}
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
