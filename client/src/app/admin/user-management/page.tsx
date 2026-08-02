"use client";
import { useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";

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
  { id: "u-1", fullName: "Nadeesha Silva", email: "nadeesha.s@uni.edu", phone: "0771234567", role: "Student", department: "Software Eng.", batch: "CS2023-A", studentNumber: "SE/2023/042", status: "Active" },
  { id: "u-2", fullName: "Dr. K. Perera", email: "k.perera@uni.edu", phone: "0719876543", role: "Lecturer", department: "Software Eng.", designation: "Senior Lecturer", assignedCourses: ["SE308.3", "SE309.3"], status: "Active" },
  { id: "u-3", fullName: "Prof. A. Fernando", email: "a.fernando@uni.edu", phone: "0701122334", role: "Examiner", department: "Computing", status: "Active" },
  { id: "u-4", fullName: "Dr. S. Wickramasinghe", email: "s.wick@uni.edu", phone: "0755544332", role: "HOD/Dean", department: "Software Eng.", scopeLevel: "Department", status: "Active" },
  { id: "u-5", fullName: "T. Bandara", email: "t.guest@uni.edu", phone: "0723344556", role: "Guest Lecturer", department: "Computing", assignedCourses: ["SE202.2"], engagementEndDate: "2026-12-31", status: "Active" },
  { id: "u-6", fullName: "R. Jayawardena", email: "r.jaya@uni.edu", phone: "0788877665", role: "Staff/Admin", scopeLevel: "Institution-wide", status: "Active" },
];

const VALID_ROLES = [
  "Student",
  "Lecturer",
  "Guest Lecturer",
  "Examiner",
  "HOD/Dean",
  "Staff/Admin",
];

const DEPARTMENTS = [
  "Software Eng.",
  "Computer Science",
  "Business",
  "Engineering",
];

const BATCHES = ["CS2023-A", "CS2023-B", "CS2026-A"];
const DESIGNATIONS = ["Lecturer", "Senior Lecturer", "Professor"];
const AVAILABLE_COURSES = ["SE308.3", "SE202.2", "SE309.3", "SE201.2"];

export default function Page() {
  useInteractive();

  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");

  // Single User Registration Form State
  const [role, setRole] = useState<string>("Student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Role Specific Form Fields
  const [studentNumber, setStudentNumber] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [batch, setBatch] = useState(BATCHES[0]);
  const [designation, setDesignation] = useState(DESIGNATIONS[0]);
  const [assignedCourses, setAssignedCourses] = useState<string[]>([]);
  const [engagementEndDate, setEngagementEndDate] = useState("");
  const [scopeLevel, setScopeLevel] = useState("Department");
  const [adminScope, setAdminScope] = useState("Institution-wide");

  // Validation Error States
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // CSV Import State
  const [parsedRows, setParsedRows] = useState<CsvValidationRow[] | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [csvFileName, setCsvFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate fields based on role
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) errors.fullName = "Full name is required";
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!email.includes("@")) {
      errors.email = "Enter a valid email address";
    }
    if (!phone.trim()) errors.phone = "Phone number is required";

    if (role === "Student") {
      if (!studentNumber.trim()) errors.studentNumber = "Student number is required";
      if (!department) errors.department = "Department is required";
      if (!batch) errors.batch = "Batch selection is required";
    } else if (role === "Lecturer") {
      if (!department) errors.department = "Department is required";
      if (!designation) errors.designation = "Designation is required";
    } else if (role === "Guest Lecturer") {
      if (!department) errors.department = "Department is required";
      if (assignedCourses.length === 0) errors.assignedCourses = "At least one assigned course is required";
      if (!engagementEndDate) errors.engagementEndDate = "Engagement end date is required";
    } else if (role === "Examiner") {
      if (!department) errors.department = "Department is required";
    } else if (role === "HOD/Dean") {
      if (!department) errors.department = "Department / Faculty is required";
      if (!scopeLevel) errors.scopeLevel = "Scope level is required";
    } else if (role === "Staff/Admin") {
      if (!adminScope) errors.adminScope = "Scope level is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  // Toggle multi-select courses
  const toggleCourseSelection = (code: string) => {
    setAssignedCourses((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Reset Single User Registration Form
  const resetRegistrationForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setStudentNumber("");
    setDepartment(DEPARTMENTS[0]);
    setBatch(BATCHES[0]);
    setDesignation(DESIGNATIONS[0]);
    setAssignedCourses([]);
    setEngagementEndDate("");
    setScopeLevel("Department");
    setAdminScope("Institution-wide");
    setTouched({});
    setFormErrors({});
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    resetRegistrationForm();
  };

  // Single user submit handler
  const handleAddSingleUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    let newUser: UserRecord = {
      id: "u-" + Date.now(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      status: "Active",
    };

    if (role === "Student") {
      newUser = { ...newUser, studentNumber: studentNumber.trim(), department, batch };
    } else if (role === "Lecturer") {
      newUser = { ...newUser, department, designation, assignedCourses };
    } else if (role === "Guest Lecturer") {
      newUser = { ...newUser, department, assignedCourses, engagementEndDate };
    } else if (role === "Examiner") {
      newUser = { ...newUser, department };
    } else if (role === "HOD/Dean") {
      newUser = { ...newUser, department, scopeLevel };
    } else if (role === "Staff/Admin") {
      newUser = { ...newUser, scopeLevel: adminScope };
    }

    setUsers((prev) => [newUser, ...prev]);
    resetRegistrationForm();

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

      const startIdx = lines[0].toLowerCase().includes("name") || lines[0].toLowerCase().includes("email") ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        const rowName = parts[0] || "";
        const rowEmail = parts[1] || "";
        const rowRole = parts[2] || "";
        const rowDept = parts[3] || "";
        const rowBatch = parts[4] || "";

        let isValid = true;
        let errorMessage = "";

        if (!rowName) {
          isValid = false;
          errorMessage = "Missing full name";
        } else if (!rowEmail || !rowEmail.includes("@")) {
          isValid = false;
          errorMessage = "Invalid or missing email";
        } else if (seenEmails.has(rowEmail.toLowerCase())) {
          isValid = false;
          errorMessage = "Duplicate email address";
        } else if (!VALID_ROLES.map((r) => r.toLowerCase()).includes(rowRole.toLowerCase())) {
          isValid = false;
          errorMessage = `Invalid role "${rowRole}"`;
        } else if (!rowDept && rowRole.toLowerCase() !== "staff/admin") {
          isValid = false;
          errorMessage = "Missing department";
        }

        if (isValid) {
          seenEmails.add(rowEmail.toLowerCase());
        }

        rows.push({
          rowNumber: i + 1,
          fullName: rowName,
          email: rowEmail,
          role: rowRole,
          department: rowDept,
          batch: rowBatch,
          isValid,
          errorMessage,
        });
      }

      setParsedRows(rows);
      setIsParsing(false);
    };

    reader.readAsText(file);
  };

  const handleLoadSampleCsv = () => {
    const sampleCsv = `Full Name,Email,Role,Department,Batch
S. Karunaratne,nadeesha.s@uni.edu,Student,Software Eng.,CS2023-A
M. Rathnayake,m.rathnayake@uni.edu,Lecturer,Software Eng.,
D. Abeywickrama,d.abey@uni.edu,Student,Computer Science,CS2023-B
R. Perera,r.perera@uni.edu,InvalidRole,Engineering,CS2023-A
K. Wickrama,k.wick@uni.edu,Examiner,Computing,
`;
    const blob = new Blob([sampleCsv], { type: "text/csv" });
    const file = new File([blob], "sample_users.csv", { type: "text/csv" });
    handleFileUpload(file);
  };

  const handleConfirmImport = () => {
    if (!parsedRows) return;
    const validRows = parsedRows.filter((r) => r.isValid);
    const newUsers: UserRecord[] = validRows.map((r) => ({
      id: "u-" + Date.now() + "-" + r.rowNumber,
      fullName: r.fullName,
      email: r.email,
      role: VALID_ROLES.find((vr) => vr.toLowerCase() === r.role.toLowerCase()) || r.role,
      department: r.department,
      batch: r.batch || undefined,
      status: "Active",
    }));

    setUsers((prev) => [...newUsers, ...prev]);
    setParsedRows(null);
    setCsvFileName("");

    const modal = document.getElementById("add-user-modal");
    if (modal) modal.classList.add("hidden");
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
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
          Manage students, lecturers, guest lecturers, examiners, HOD/Dean, and staff accounts.
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
            <select className="w-44" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option>All roles</option>
              {VALID_ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[650px]">
              <thead>
                <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                  <th className="pb-3 px-3 font-semibold">Name & Contact</th>
                  <th className="pb-3 px-3 font-semibold">Role</th>
                  <th className="pb-3 px-3 font-semibold">Dept / Scope</th>
                  <th className="pb-3 px-3 font-semibold">Details</th>
                  <th className="pb-3 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-variant)]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="table-row transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="avatar w-8 h-8 text-xs">{u.fullName.charAt(0)}</div>
                        <div>
                          <p className="font-semibold text-[var(--on-surface)]">{u.fullName}</p>
                          <p className="text-xs text-[var(--on-surface-variant)]">{u.email} {u.phone && `· ${u.phone}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`badge ${u.role === "Student" ? "badge-accent" : u.role === "HOD/Dean" ? "badge-danger" : u.role === "Guest Lecturer" ? "badge-warning" : "badge-gray"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[var(--on-surface-variant)] text-xs">
                      <b>{u.department || u.scopeLevel || "—"}</b>
                      {u.batch && <span className="block text-[11px] opacity-80">Batch: {u.batch}</span>}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-[var(--on-surface-variant)]">
                      {u.studentNumber && <span>No: <b>{u.studentNumber}</b></span>}
                      {u.designation && <span>{u.designation}</span>}
                      {u.assignedCourses && u.assignedCourses.length > 0 && (
                        <span className="block text-[11px]">Courses: {u.assignedCourses.join(", ")}</span>
                      )}
                      {u.engagementEndDate && (
                        <span className="block text-[11px] text-[var(--tertiary)]">Until: {u.engagementEndDate}</span>
                      )}
                      {!u.studentNumber && !u.designation && (!u.assignedCourses || u.assignedCourses.length === 0) && "—"}
                    </td>
                    <td className="py-3.5 px-3"><span className="badge badge-success">{u.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add User & CSV Import */}
        <div id="add-user-modal" className="hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-xl p-6 bg-[var(--surface-container-lowest)] shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
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
                {/* 1. Target Role Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Select Target Role</label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full font-semibold text-xs"
                  >
                    {VALID_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Shared Fields for Every Role */}
                <div className="p-3.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] space-y-3">
                  <p className="text-xs font-bold text-[var(--on-surface)] flex items-center gap-1.5">
                    <i className="ti ti-id text-[var(--tertiary)] text-base"></i> General Information
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--on-surface-variant)] mb-0.5">Full Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={() => handleBlur("fullName")}
                      placeholder="e.g. Nadeesha Silva"
                      className="w-full text-xs"
                    />
                    {touched.fullName && formErrors.fullName && (
                      <p className="text-[11px] text-[var(--error)] mt-0.5 font-medium">{formErrors.fullName}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--on-surface-variant)] mb-0.5">Email *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => handleBlur("email")}
                        placeholder="email@uni.edu"
                        className="w-full text-xs"
                      />
                      {touched.email && formErrors.email && (
                        <p className="text-[11px] text-[var(--error)] mt-0.5 font-medium">{formErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--on-surface-variant)] mb-0.5">Phone *</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={() => handleBlur("phone")}
                        placeholder="e.g. 0771234567"
                        className="w-full text-xs"
                      />
                      {touched.phone && formErrors.phone && (
                        <p className="text-[11px] text-[var(--error)] mt-0.5 font-medium">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Role-Specific Field Sets */}
                <div className="p-3.5 rounded-xl border border-[var(--tertiary)] bg-[var(--surface-container-lowest)] space-y-3">
                  <p className="text-xs font-bold text-[var(--tertiary)] flex items-center gap-1.5">
                    <i className="ti ti-user-check text-base"></i> {role} Specific Fields
                  </p>

                  {/* Student Form */}
                  {role === "Student" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--on-surface-variant)] mb-0.5">Student Number *</label>
                        <input
                          type="text"
                          value={studentNumber}
                          onChange={(e) => setStudentNumber(e.target.value)}
                          onBlur={() => handleBlur("studentNumber")}
                          placeholder="e.g. SE/2023/042"
                          className="w-full text-xs"
                        />
                        {touched.studentNumber && formErrors.studentNumber && (
                          <p className="text-[11px] text-[var(--error)] mt-0.5 font-medium">{formErrors.studentNumber}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--on-surface-variant)] mb-0.5">Department *</label>
                          <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full text-xs"
                          >
                            {DEPARTMENTS.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--on-surface-variant)] mb-0.5">Batch *</label>
                          <select
                            value={batch}
                            onChange={(e) => setBatch(e.target.value)}
                            className="w-full text-xs"
                          >
                            {BATCHES.map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lecturer Form */}
                  {role === "Lecturer" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--on-surface-variant)] mb-0.5">Department *</label>
                          <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full text-xs"
                          >
                            {DEPARTMENTS.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--on-surface-variant)] mb-0.5">Designation *</label>
                          <select
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="w-full text-xs"
                          >
                            {DESIGNATIONS.map((des) => (
                              <option key={des} value={des}>{des}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--on-surface-variant)] mb-1">
                          Courses to Assign (Optional)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_COURSES.map((code) => {
                            const isSelected = assignedCourses.includes(code);
                            return (
                              <button
                                type="button"
                                key={code}
                                onClick={() => toggleCourseSelection(code)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${isSelected ? "bg-[var(--tertiary)] text-white border-[var(--tertiary)]" : "bg-[var(--surface-container)] text-[var(--on-surface)] border-[var(--outline-variant)]"}`}
                              >
                                {isSelected && <i className="ti ti-check mr-1"></i>}{code}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Guest Lecturer Form */}
                  {role === "Guest Lecturer" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--on-surface-variant)] mb-0.5">Department *</label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full text-xs"
                        >
                          {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--on-surface-variant)] mb-1">
                          Assigned Course(s) * (Required for Guest Lecturers)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_COURSES.map((code) => {
                            const isSelected = assignedCourses.includes(code);
                            return (
                              <button
                                type="button"
                                key={code}
                                onClick={() => toggleCourseSelection(code)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${isSelected ? "bg-[var(--tertiary)] text-white border-[var(--tertiary)]" : "bg-[var(--surface-container)] text-[var(--on-surface)] border-[var(--outline-variant)]"}`}
                              >
                                {isSelected && <i className="ti ti-check mr-1"></i>}{code}
                              </button>
                            );
                          })}
                        </div>
                        {touched.assignedCourses && formErrors.assignedCourses && (
                          <p className="text-[11px] text-[var(--error)] mt-1 font-medium">{formErrors.assignedCourses}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--on-surface-variant)] mb-0.5">Engagement End Date *</label>
                        <input
                          type="date"
                          value={engagementEndDate}
                          onChange={(e) => setEngagementEndDate(e.target.value)}
                          onBlur={() => handleBlur("engagementEndDate")}
                          className="w-full text-xs"
                        />
                        {touched.engagementEndDate && formErrors.engagementEndDate && (
                          <p className="text-[11px] text-[var(--error)] mt-0.5 font-medium">{formErrors.engagementEndDate}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Examiner Form */}
                  {role === "Examiner" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--on-surface-variant)] mb-0.5">Department *</label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full text-xs"
                        >
                          {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* HOD / Dean Form */}
                  {role === "HOD/Dean" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--on-surface-variant)] mb-0.5">Department / Faculty *</label>
                          <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full text-xs"
                          >
                            {DEPARTMENTS.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--on-surface-variant)] mb-0.5">Scope Level *</label>
                          <select
                            value={scopeLevel}
                            onChange={(e) => setScopeLevel(e.target.value)}
                            className="w-full text-xs"
                          >
                            <option value="Department">Department</option>
                            <option value="Faculty">Faculty</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Staff / Admin Form */}
                  {role === "Staff/Admin" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--on-surface-variant)] mb-0.5">Scope Level *</label>
                        <select
                          value={adminScope}
                          onChange={(e) => setAdminScope(e.target.value)}
                          className="w-full text-xs font-medium"
                        >
                          <option value="Institution-wide">Institution-wide</option>
                          <option value="Department-limited">Department-limited</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn-primary w-full justify-center shadow-md">
                  <i className="ti ti-user-check mr-1"></i> Register User ({role})
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
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                }}
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
                    <span className="text-[var(--secondary)]">{parsedRows.filter((r) => r.isValid).length} Valid</span>
                    <span className="text-[var(--error)]">{parsedRows.filter((r) => !r.isValid).length} Failed</span>
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
                disabled={!parsedRows || parsedRows.filter((r) => r.isValid).length === 0}
                onClick={handleConfirmImport}
                className="btn-primary w-full justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Import ({parsedRows ? parsedRows.filter((r) => r.isValid).length : 0} valid users)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
