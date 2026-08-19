"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";
import { useAcademicData } from "@/context/AcademicDataContext";
import CalendarEntityPanel, { FieldConfig } from "@/components/CalendarEntityPanel";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface LecturerOption {
  lecturerId: number;
  fullName: string;
}

interface Course {
  courseId?: number;
  code: string;
  title: string;
  credits: number;
  version: string;
  department: string;
  departmentId?: number;
}

interface AcademicYearItem {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

interface SemesterItem {
  id: string;
  name: string;
  academicYearId?: number;
  academicYear: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

interface BatchItem {
  id: string;
  name: string;
  departmentId?: number;
  department: string;
  academicYearId?: number;
  academicYear: string;
  intakeYear: number;
  studentCount: number;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const FALLBACK_DEPARTMENTS = ["Software Engineering", "Computer Science", "Information Technology"];

function formatTimeTo24h(timeStr: string): string {
  if (!timeStr) return "09:00:00";
  const trimmed = timeStr.trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const min = match[2];
    const ampm = (match[3] || "").toUpperCase();
    if (ampm === "PM" && hour < 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${min}:00`;
  }
  return trimmed;
}

export default function Page() {
  useInteractive();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("fac");

  // --- Toast Notification State ---
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const {
    offerings,
    slots,
    assignLecturer,
    removeLecturer,
    isLoadingOfferings,
    isLoadingSlots,
    isErrorOfferings,
    isErrorSlots,
    offeringsError,
    slotsError,
    refetchOfferings,
    refetchSlots,
  } = useAcademicData();

  // ==========================================
  // 1. ALL DEPARTMENTS & FACULTIES (Database)
  // ==========================================
  const { data: allDeptsData } = useQuery({
    queryKey: ["allDepartments"],
    queryFn: () => api.get<any>("/api/v1/departments?size=100"),
  });
  const allDepartments: any[] =
    allDeptsData?.content ||
    allDeptsData?.dataList ||
    (Array.isArray(allDeptsData) ? allDeptsData : []);

  const departmentOptions = allDepartments.length > 0
    ? allDepartments.map((d: any) => d.name)
    : FALLBACK_DEPARTMENTS;

  const { data: facultiesData, isLoading: isLoadingFaculties } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => api.get<any>("/api/v1/faculties?size=100"),
  });
  const faculties: any[] = facultiesData?.dataList || facultiesData?.content || [];

  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  const [showAddFacultyForm, setShowAddFacultyForm] = useState(false);
  const [newFacultyName, setNewFacultyName] = useState("");
  const [newFacultyCode, setNewFacultyCode] = useState("");
  const [showAddDeptForm, setShowAddDeptForm] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");

  useEffect(() => {
    if (faculties.length > 0 && selectedFacultyId === null) {
      setSelectedFacultyId(faculties[0].facultyId);
    }
  }, [faculties, selectedFacultyId]);

  const { data: departmentsData, isLoading: isLoadingDepts } = useQuery({
    queryKey: ["departments", selectedFacultyId],
    queryFn: () => api.get<any>(`/api/v1/departments/faculty/${selectedFacultyId}`),
    enabled: !!selectedFacultyId,
  });
  const departments: any[] = Array.isArray(departmentsData)
    ? departmentsData
    : departmentsData?.dataList || departmentsData?.content || [];

  const createFacultyMutation = useMutation({
    mutationFn: (body: { name: string; code: string }) => api.post("/api/v1/faculties", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setShowAddFacultyForm(false);
      setNewFacultyName("");
      setNewFacultyCode("");
      showToast("Faculty created successfully.");
    },
    onError: (err: any) => showToast(err.message || "Failed to create faculty", "error"),
  });

  const createDeptMutation = useMutation({
    mutationFn: (body: { name: string; code: string; facultyId: number }) =>
      api.post("/api/v1/departments", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments", selectedFacultyId] });
      queryClient.invalidateQueries({ queryKey: ["allDepartments"] });
      setShowAddDeptForm(false);
      setNewDeptName("");
      setNewDeptCode("");
      showToast("Department created successfully.");
    },
    onError: (err: any) => showToast(err.message || "Failed to create department", "error"),
  });

  const selectedFaculty = faculties.find((f: any) => f.facultyId === selectedFacultyId);

  // ==========================================
  // 2. COURSES (Database)
  // ==========================================
  const { data: rawCoursesData } = useQuery({
    queryKey: ["courses"],
    queryFn: () => api.get<any>("/api/v1/courses?size=100"),
  });

  const courses: Course[] = rawCoursesData?.content || rawCoursesData?.dataList
    ? (rawCoursesData.content || rawCoursesData.dataList).map((c: any) => ({
        courseId: c.courseId || c.id,
        code: c.code || c.courseCode || "SE101",
        title: c.name || c.title || c.courseName || "Untitled Course",
        credits: c.credits || c.creditHours || 4,
        version: c.syllabusVersion || c.version || "v1",
        department: c.departmentName || "Software Engineering",
        departmentId: c.departmentId,
      }))
    : [];

  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseCredits, setNewCourseCredits] = useState("4");
  const [newCourseDept, setNewCourseDept] = useState(departmentOptions[0] || "Software Engineering");
  const [newCourseVersion, setNewCourseVersion] = useState("v1");
  const [editingCourseCode, setEditingCourseCode] = useState<string | null>(null);
  const [editCourseDept, setEditCourseDept] = useState(departmentOptions[0] || "Software Engineering");

  const createCourseMutation = useMutation({
    mutationFn: (body: any) => api.post("/api/v1/courses", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setNewCourseCode("");
      setNewCourseTitle("");
      setNewCourseCredits("4");
      showToast("Course created successfully.");
    },
    onError: (err: any) => showToast(err.message || "Failed to create course", "error"),
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      api.put(`/api/v1/courses/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setEditingCourseCode(null);
      showToast("Course updated successfully.");
    },
    onError: (err: any) => showToast(err.message || "Failed to update course", "error"),
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseTitle.trim()) return;

    const matchedDept = allDepartments.find((d: any) => d.name === newCourseDept) || allDepartments[0];
    const deptId = matchedDept ? matchedDept.departmentId : 1;

    createCourseMutation.mutate({
      code: newCourseCode.trim(),
      name: newCourseTitle.trim(),
      title: newCourseTitle.trim(),
      creditHours: parseInt(newCourseCredits) || 4,
      departmentId: deptId,
      syllabusVersion: newCourseVersion.trim() || "v1",
    });
  };

  const handleUpdateCourseDept = (code: string, newDeptName: string) => {
    const course = courses.find((c) => c.code === code);
    if (!course || !course.courseId) return;

    const matchedDept = allDepartments.find((d: any) => d.name === newDeptName);
    const deptId = matchedDept ? matchedDept.departmentId : course.departmentId;

    updateCourseMutation.mutate({
      id: course.courseId,
      body: {
        code: course.code,
        name: course.title,
        title: course.title,
        creditHours: course.credits,
        departmentId: deptId,
        syllabusVersion: course.version,
      },
    });
  };

  // ==========================================
  // 3. ACADEMIC CALENDAR (Database)
  // ==========================================
  // --- Academic Years ---
  const { data: rawYearsData } = useQuery({
    queryKey: ["academicYears"],
    queryFn: () => api.get<any>("/api/v1/academic-years?size=100"),
  });

  const academicYears: AcademicYearItem[] = (
    rawYearsData?.content ||
    rawYearsData?.dataList ||
    (Array.isArray(rawYearsData) ? rawYearsData : [])
  ).map((ay: any) => ({
    id: String(ay.academicYearId),
    year: ay.yearLabel || "",
    startDate: ay.startDate || "",
    endDate: ay.endDate || "",
    isCurrent: !!ay.isCurrent,
  }));

  const saveYearMutation = useMutation({
    mutationFn: ({ id, body }: { id?: string; body: any }) =>
      id ? api.put(`/api/v1/academic-years/${id}`, body) : api.post("/api/v1/academic-years", body),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["academicYears"] });
      showToast(vars.id ? "Academic year updated." : "Academic year created.");
    },
    onError: (err: any) => showToast(err.message || "Failed to save academic year", "error"),
  });

  const deleteYearMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/academic-years/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academicYears"] });
      showToast("Academic year deleted.");
    },
    onError: (err: any) => showToast(err.message || "Failed to delete academic year", "error"),
  });

  const setCurrentYearMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/v1/academic-years/${id}/set-current`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academicYears"] });
      showToast("Academic year marked as current.");
    },
    onError: (err: any) => showToast(err.message || "Failed to set current year", "error"),
  });

  const handleSetCurrentYear = (id: string) => {
    setCurrentYearMutation.mutate(id);
  };

  const yearFields: FieldConfig[] = [
    { key: "yearLabel", label: "Year Label (e.g. 2025/2026)", type: "text", required: true, placeholder: "2025/2026" },
    { key: "startDate", label: "Start Date", type: "date", required: true },
    { key: "endDate", label: "End Date", type: "date", required: true },
  ];

  const validateYear = (vals: Record<string, any>, editingItem: any) => {
    const label = vals.yearLabel?.trim();
    if (!label) return "Please enter a valid year label.";
    if (!vals.startDate || !vals.endDate) return "Please enter start and end dates.";
    if (new Date(vals.endDate) <= new Date(vals.startDate)) return "End date must be after start date.";
    const dup = academicYears.some((ay) => ay.id !== editingItem?.id && ay.year === label);
    if (dup) return `Academic Year "${label}" already exists.`;
    return null;
  };

  const handleSaveYear = (vals: Record<string, any>, editingItem: any) => {
    const payload = {
      yearLabel: vals.yearLabel.trim(),
      startDate: vals.startDate,
      endDate: vals.endDate,
      isCurrent: editingItem ? editingItem.isCurrent : false,
    };
    saveYearMutation.mutate({ id: editingItem?.id, body: payload });
  };

  const handleDeleteYear = (id: string) => {
    deleteYearMutation.mutate(id);
  };

  // --- Semesters ---
  const { data: rawSemestersData } = useQuery({
    queryKey: ["semesters"],
    queryFn: () => api.get<any>("/api/v1/semesters"),
  });

  const semesters: SemesterItem[] = (
    Array.isArray(rawSemestersData)
      ? rawSemestersData
      : rawSemestersData?.content || rawSemestersData?.dataList || []
  ).map((s: any) => ({
    id: String(s.semesterId),
    name: s.name || "",
    academicYearId: s.academicYearId,
    academicYear:
      s.academicYearLabel ||
      s.academicYearName ||
      academicYears.find((ay) => ay.id === String(s.academicYearId))?.year ||
      "",
    startDate: s.startDate || "",
    endDate: s.endDate || "",
    isCurrent: false,
  }));

  const saveSemMutation = useMutation({
    mutationFn: ({ id, body }: { id?: string; body: any }) =>
      id ? api.put(`/api/v1/semesters/${id}`, body) : api.post("/api/v1/semesters", body),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
      showToast(vars.id ? "Semester updated." : "Semester created.");
    },
    onError: (err: any) => showToast(err.message || "Failed to save semester", "error"),
  });

  const deleteSemMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/semesters/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
      showToast("Semester deleted.");
    },
    onError: (err: any) => showToast(err.message || "Failed to delete semester", "error"),
  });

  const semFields: FieldConfig[] = [
    { key: "name", label: "Semester Name", type: "text", required: true, placeholder: "e.g. Semester 1" },
    {
      key: "academicYear",
      label: "Academic Year",
      type: "select",
      options: academicYears.map((ay) => ({ value: ay.year, label: ay.year })),
      required: true,
    },
    { key: "startDate", label: "Start Date", type: "date", required: true },
    { key: "endDate", label: "End Date", type: "date", required: true },
  ];

  const validateSem = (vals: Record<string, any>, editingItem: any) => {
    const name = vals.name?.trim();
    if (!name) return "Please enter a semester name.";
    if (!vals.academicYear) return "Please select an academic year.";
    if (!vals.startDate || !vals.endDate) return "Please select start and end dates.";
    if (new Date(vals.endDate) <= new Date(vals.startDate)) return "End date must be after start date.";
    const dup = semesters.some(
      (s) =>
        s.id !== editingItem?.id &&
        s.name.toLowerCase().trim() === name.toLowerCase() &&
        s.academicYear === vals.academicYear
    );
    if (dup) return `"${name}" already exists in Academic Year ${vals.academicYear}.`;
    return null;
  };

  const handleSaveSem = (vals: Record<string, any>, editingItem: any) => {
    const matchedYear = academicYears.find((ay) => ay.year === vals.academicYear) || academicYears[0];
    const yearId = matchedYear ? Number(matchedYear.id) : 1;

    const payload = {
      academicYearId: yearId,
      name: vals.name.trim(),
      startDate: vals.startDate,
      endDate: vals.endDate,
    };
    saveSemMutation.mutate({ id: editingItem?.id, body: payload });
  };

  const handleDeleteSem = (id: string) => {
    deleteSemMutation.mutate(id);
  };

  // --- Batches ---
  const { data: rawBatchesData } = useQuery({
    queryKey: ["batches"],
    queryFn: () => api.get<any>("/api/v1/batches"),
  });

  const batches: BatchItem[] = (
    Array.isArray(rawBatchesData)
      ? rawBatchesData
      : rawBatchesData?.content || rawBatchesData?.dataList || []
  ).map((b: any) => ({
    id: String(b.batchId),
    name: b.name || "",
    departmentId: b.departmentId,
    department:
      b.departmentName ||
      allDepartments.find((d: any) => d.departmentId === b.departmentId)?.name ||
      "Software Engineering",
    academicYearId: b.academicYearId,
    academicYear:
      b.academicYearLabel ||
      b.academicYearName ||
      academicYears.find((ay) => ay.id === String(b.academicYearId))?.year ||
      "",
    intakeYear: b.enrollmentYear || 2026,
    studentCount: 0,
  }));

  const saveBatchMutation = useMutation({
    mutationFn: ({ id, body }: { id?: string; body: any }) =>
      id ? api.put(`/api/v1/batches/${id}`, body) : api.post("/api/v1/batches", body),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      showToast(vars.id ? "Batch updated." : "Batch created.");
    },
    onError: (err: any) => showToast(err.message || "Failed to save batch", "error"),
  });

  const deleteBatchMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/batches/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      showToast("Batch deleted.");
    },
    onError: (err: any) => showToast(err.message || "Failed to delete batch", "error"),
  });

  const batchFields: FieldConfig[] = [
    { key: "name", label: "Batch Name", type: "text", required: true, placeholder: "e.g. CS2026-A" },
    {
      key: "department",
      label: "Department",
      type: "select",
      options: departmentOptions.map((d: string) => ({ value: d, label: d })),
      required: true,
    },
    {
      key: "academicYear",
      label: "Academic Year",
      type: "select",
      options: academicYears.map((ay: any) => ({ value: ay.year, label: ay.year })),
      required: true,
    },
  ];

  const validateBatch = (vals: Record<string, any>, editingItem: any) => {
    const name = vals.name?.trim();
    if (!name) return "Please enter a batch name.";
    if (!vals.department) return "Please select a department.";
    if (!vals.academicYear) return "Please select an academic year.";
    const dup = batches.some(
      (b: any) => b.id !== editingItem?.id && b.name.toLowerCase().trim() === name.toLowerCase()
    );
    if (dup) return `Batch "${name}" already exists.`;
    return null;
  };

  const handleSaveBatch = (vals: Record<string, any>, editingItem: any) => {
    const matchedDept = allDepartments.find((d: any) => d.name === vals.department) || allDepartments[0];
    const deptId = matchedDept ? matchedDept.departmentId : 1;

    const matchedYear = academicYears.find((ay: any) => ay.year === vals.academicYear) || academicYears[0];
    const yearId = matchedYear ? Number(matchedYear.id) : 1;

    const payload = {
      departmentId: deptId,
      academicYearId: yearId,
      name: vals.name.trim(),
    };
    saveBatchMutation.mutate({ id: editingItem?.id, body: payload });
  };

  const handleDeleteBatch = (id: string) => {
    deleteBatchMutation.mutate(id);
  };

  // ==========================================
  // 4. USERS / LECTURERS (Database)
  // ==========================================
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get<any>("/api/v1/users?size=100"),
  });
  const allUsers: any[] =
    usersData?.content ||
    usersData?.dataList ||
    (Array.isArray(usersData) ? usersData : []);

  const lecturers: LecturerOption[] = allUsers
    .filter(
      (u: any) =>
        (u.role || "").toLowerCase() === "lecturer" ||
        (u.role || "").toLowerCase() === "guest_lecturer"
    )
    .map((u: any) => ({
      lecturerId: u.userId || u.id,
      fullName: u.fullName || u.name,
    }));

  // ==========================================
  // 5. COURSE OFFERINGS & TIMETABLE (Database)
  // ==========================================
  const [newOffCourseCode, setNewOffCourseCode] = useState("");
  const [newOffBatch, setNewOffBatch] = useState("");
  const [newOffSemester, setNewOffSemester] = useState("");
  const [newOffLecturer, setNewOffLecturer] = useState("");
  const [newOffCapacity, setNewOffCapacity] = useState("50");
  const [showAllDeptsForOffering, setShowAllDeptsForOffering] = useState(false);

  const [managingOfferingId, setManagingOfferingId] = useState<number | null>(null);
  const [selectedLecturerToAdd, setSelectedLecturerToAdd] = useState("");

  const [newSlotOfferingId, setNewSlotOfferingId] = useState<number>(0);
  const [newSlotDay, setNewSlotDay] = useState<string>("Monday");
  const [newSlotStartTime, setNewSlotStartTime] = useState("09:00 AM");
  const [newSlotEndTime, setNewSlotEndTime] = useState("11:00 AM");
  const [newSlotVenue, setNewSlotVenue] = useState("Main Hall A");
  const [newSlotType, setNewSlotType] = useState<string>("Lecture");

  const [timetableBatchFilter, setTimetableBatchFilter] = useState("All batches");
  const [selectedDayMobile, setSelectedDayMobile] = useState<string>("Monday");

  // Sync default form dropdown values
  useEffect(() => {
    if (courses.length > 0 && !newOffCourseCode) setNewOffCourseCode(courses[0].code);
    if (batches.length > 0 && !newOffBatch) setNewOffBatch(batches[0].name);
    if (semesters.length > 0 && !newOffSemester) setNewOffSemester(semesters[0].name);
    if (lecturers.length > 0 && !newOffLecturer) setNewOffLecturer(lecturers[0].fullName);
    if (lecturers.length > 0 && !selectedLecturerToAdd) setSelectedLecturerToAdd(lecturers[0].fullName);
    if (offerings.length > 0 && newSlotOfferingId === 0) setNewSlotOfferingId(offerings[0].offeringId);
  }, [courses, batches, semesters, lecturers, offerings, newOffCourseCode, newOffBatch, newOffSemester, newOffLecturer, selectedLecturerToAdd, newSlotOfferingId]);

  const selectedCourseForOffering = courses.find((c) => c.code === newOffCourseCode) || courses[0] || null;
  const filteredBatchesForOffering = showAllDeptsForOffering
    ? batches
    : batches.filter((b: any) => b.department === selectedCourseForOffering?.department);

  useEffect(() => {
    if (filteredBatchesForOffering.length > 0) {
      if (!filteredBatchesForOffering.some((b: any) => b.name === newOffBatch)) {
        setNewOffBatch(filteredBatchesForOffering[0].name);
      }
    }
  }, [newOffCourseCode, showAllDeptsForOffering, batches]);

  const createOfferingMutation = useMutation({
    mutationFn: (body: any) => api.post("/api/v1/course-offerings", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseOfferings"] });
      showToast("Course offering created successfully.");
    },
    onError: (err: any) => showToast(err.message || "Failed to create course offering", "error"),
  });

  const handleCreateOffering = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.code === newOffCourseCode);
    const batch = batches.find((b) => b.name === newOffBatch);
    const sem = semesters.find((s) => s.name === newOffSemester);
    const lec = lecturers.find((l) => l.fullName === newOffLecturer) || lecturers[0];

    if (!course || !course.courseId) {
      showToast("Please select a valid course module.", "error");
      return;
    }
    if (!batch) {
      showToast("Please select a valid batch.", "error");
      return;
    }
    if (!sem) {
      showToast("Please select a valid semester.", "error");
      return;
    }
    if (!lec) {
      showToast("Please select a primary lecturer.", "error");
      return;
    }

    createOfferingMutation.mutate({
      courseId: course.courseId,
      batchId: Number(batch.id),
      semesterId: Number(sem.id),
      primaryLecturerId: lec.lecturerId,
      capacity: parseInt(newOffCapacity) || 50,
    });
  };

  const handleAddLecturerToOffering = (offeringId: number) => {
    if (!selectedLecturerToAdd) return;
    const lecObj = lecturers.find((l) => l.fullName === selectedLecturerToAdd) || lecturers[0] || null;
    if (lecObj) {
      assignLecturer(offeringId, lecObj.lecturerId, lecObj.fullName);
      showToast(`Assigned ${lecObj.fullName} to course offering.`);
    }
  };

  const handleRemoveLecturerFromOffering = (offeringId: number, lecturerName: string) => {
    removeLecturer(offeringId, lecturerName);
    showToast(`Removed ${lecturerName} from course offering.`);
  };

  const createSlotMutation = useMutation({
    mutationFn: (body: any) => api.post("/api/v1/timetable-slots", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetableSlots"] });
      showToast("Timetable slot created successfully.");
    },
    onError: (err: any) => showToast(err.message || "Failed to create timetable slot", "error"),
  });

  const selectedOffering = offerings.find((o) => o.offeringId === Number(newSlotOfferingId)) || offerings[0] || null;
  const distinctBatches = Array.from(new Set(offerings.map((o) => o.batchName)));

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffering) {
      showToast("Please select a target course offering.", "error");
      return;
    }

    createSlotMutation.mutate({
      offeringId: selectedOffering.offeringId,
      dayOfWeek: newSlotDay,
      startTime: formatTimeTo24h(newSlotStartTime),
      endTime: formatTimeTo24h(newSlotEndTime),
      venue: newSlotVenue,
      slotType: newSlotType,
    });
  };

  const filteredSlots = slots.filter((s) => {
    if (timetableBatchFilter === "All batches") return true;
    const slotOffering = offerings.find((o) => o.offeringId === s.offeringId);
    const slotBatch = slotOffering ? slotOffering.batchName : s.batchName;
    return slotBatch === timetableBatchFilter;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)] text-[var(--on-background)]">
      <Sidebar role="admin" name="R. Jayawardena" sub="Staff Admin · Institution-wide" />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] w-full">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce ${
              toastType === "error"
                ? "bg-gradient-to-r from-red-600 to-rose-600"
                : "bg-gradient-to-r from-emerald-600 to-teal-600"
            }`}
            style={{ minWidth: "320px", boxShadow: toastType === "error" ? "0 8px 32px rgba(239,68,68,0.4)" : "0 8px 32px rgba(16,185,129,0.4)" }}
          >
            <i className={`ti ${toastType === "error" ? "ti-alert-triangle" : "ti-circle-check"} text-white text-2xl`}></i>
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
        )}

        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Academic Structure
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Faculties, departments, courses, course offerings, lecturer assignments, and timetable scheduling.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[var(--outline-variant)] overflow-x-auto">
          <span className={`tab-btn ${activeTab === "fac" ? "active" : ""}`} onClick={() => setActiveTab("fac")}>
            Faculties & departments
          </span>
          <span className={`tab-btn ${activeTab === "courses" ? "active" : ""}`} onClick={() => setActiveTab("courses")}>
            Courses
          </span>
          <span className={`tab-btn ${activeTab === "cal" ? "active" : ""}`} onClick={() => setActiveTab("cal")}>
            Academic calendar
          </span>
          <span className={`tab-btn ${activeTab === "offerings" ? "active" : ""}`} onClick={() => setActiveTab("offerings")}>
            Course Offerings
          </span>
          <span className={`tab-btn ${activeTab === "timetable" ? "active" : ""}`} onClick={() => setActiveTab("timetable")}>
            Timetable
          </span>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: FACULTIES & DEPARTMENTS                       */}
        {/* ---------------------------------------------------- */}
        <div id="acs-fac" className={activeTab !== "fac" ? "hidden" : ""}>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Faculties Panel */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--outline-variant)]">
                <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">Faculties</h3>
                <button
                  className="btn-secondary text-xs !py-1.5"
                  onClick={() => setShowAddFacultyForm(!showAddFacultyForm)}
                >
                  <i className="ti ti-plus"></i> Add
                </button>
              </div>

              {showAddFacultyForm && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newFacultyName.trim() && newFacultyCode.trim()) {
                      createFacultyMutation.mutate({
                        name: newFacultyName.trim(),
                        code: newFacultyCode.trim(),
                      });
                    }
                  }}
                  className="mb-4 p-3 rounded-xl border border-[var(--tertiary)]/30 bg-[var(--surface-container-low)] space-y-2"
                >
                  <input
                    type="text"
                    placeholder="Faculty name (e.g. Faculty of Computing)"
                    value={newFacultyName}
                    onChange={(e) => setNewFacultyName(e.target.value)}
                    className="w-full text-xs"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Code (e.g. FOC)"
                    value={newFacultyCode}
                    onChange={(e) => setNewFacultyCode(e.target.value)}
                    className="w-full text-xs"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="btn-primary text-xs shadow-md"
                      disabled={createFacultyMutation.isPending}
                    >
                      {createFacultyMutation.isPending ? "Saving..." : "Save Faculty"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                      onClick={() => setShowAddFacultyForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5">
                {isLoadingFaculties && (
                  <p className="text-xs text-[var(--on-surface-variant)]">Loading faculties...</p>
                )}
                {faculties.map((fac: any) => (
                  <div
                    key={fac.facultyId}
                    onClick={() => setSelectedFacultyId(fac.facultyId)}
                    className={`border rounded-xl px-4 py-3 text-sm font-semibold cursor-pointer transition-colors ${
                      selectedFacultyId === fac.facultyId
                        ? "border-[var(--outline-variant)] bg-[var(--surface-container)] text-[var(--tertiary)] shadow-sm"
                        : "border-[var(--outline-variant)] text-[var(--on-surface)] hover:bg-[var(--surface-container-low)]"
                    }`}
                  >
                    {fac.name}
                    {fac.code && <span className="ml-2 text-[10px] opacity-60">({fac.code})</span>}
                  </div>
                ))}
                {!isLoadingFaculties && faculties.length === 0 && (
                  <p className="text-xs text-[var(--on-surface-variant)] italic">
                    No faculties found. Add one above.
                  </p>
                )}
              </div>
            </div>

            {/* Departments Panel */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--outline-variant)]">
                <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                  Departments{selectedFaculty ? ` — ${selectedFaculty.name}` : ""}
                </h3>
                {selectedFacultyId && (
                  <button
                    className="btn-secondary text-xs !py-1.5"
                    onClick={() => setShowAddDeptForm(!showAddDeptForm)}
                  >
                    <i className="ti ti-plus"></i> Add
                  </button>
                )}
              </div>

              {showAddDeptForm && selectedFacultyId && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newDeptName.trim() && newDeptCode.trim()) {
                      createDeptMutation.mutate({
                        name: newDeptName.trim(),
                        code: newDeptCode.trim(),
                        facultyId: selectedFacultyId,
                      });
                    }
                  }}
                  className="mb-4 p-3 rounded-xl border border-[var(--tertiary)]/30 bg-[var(--surface-container-low)] space-y-2"
                >
                  <input
                    type="text"
                    placeholder="Department name (e.g. Software Engineering)"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="w-full text-xs"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Code (e.g. SE)"
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    className="w-full text-xs"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="btn-primary text-xs shadow-md"
                      disabled={createDeptMutation.isPending}
                    >
                      {createDeptMutation.isPending ? "Saving..." : "Save Department"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                      onClick={() => setShowAddDeptForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5">
                {isLoadingDepts && (
                  <p className="text-xs text-[var(--on-surface-variant)]">Loading departments...</p>
                )}
                {departments.map((dept: any) => (
                  <div
                    key={dept.departmentId}
                    className="flex items-center justify-between border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors"
                  >
                    <span className="font-semibold">{dept.name}</span>
                    <span className="text-xs text-[var(--on-surface-variant)]">
                      {dept.hodUserName || "No HOD assigned"}
                    </span>
                  </div>
                ))}
                {!isLoadingDepts && departments.length === 0 && selectedFacultyId && (
                  <p className="text-xs text-[var(--on-surface-variant)] italic">
                    No departments in this faculty. Add one above.
                  </p>
                )}
                {!selectedFacultyId && (
                  <p className="text-xs text-[var(--on-surface-variant)] italic">
                    Select a faculty to view its departments.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 2: COURSES                                       */}
        {/* ---------------------------------------------------- */}
        <div id="acs-courses" className={activeTab !== "courses" ? "hidden" : ""}>
          <div className="card p-6">
            <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
              Course Catalog ({courses.length})
            </h3>
            <form onSubmit={handleCreateCourse} className="mb-6 space-y-3">
              <div className="grid sm:grid-cols-5 gap-3">
                <input
                  type="text"
                  placeholder="Course code (e.g. SE401.1)"
                  required
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  className="text-xs"
                />
                <input
                  type="text"
                  placeholder="Title"
                  required
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="sm:col-span-2 text-xs"
                />
                <select
                  value={newCourseDept}
                  onChange={(e) => setNewCourseDept(e.target.value)}
                  className="text-xs"
                >
                  {departmentOptions.map((d: string) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Credits"
                  value={newCourseCredits}
                  onChange={(e) => setNewCourseCredits(e.target.value)}
                  className="text-xs"
                />
              </div>
              <button
                type="submit"
                className="btn-primary text-xs shadow-md"
                disabled={createCourseMutation.isPending}
              >
                <i className="ti ti-plus mr-1"></i> {createCourseMutation.isPending ? "Saving..." : "Save course"}
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                    <th className="pb-3 px-3 font-semibold">Code</th>
                    <th className="pb-3 px-3 font-semibold">Title</th>
                    <th className="pb-3 px-3 font-semibold">Department</th>
                    <th className="pb-3 px-3 font-semibold">Credits</th>
                    <th className="pb-3 px-3 font-semibold">Version</th>
                    <th className="pb-3 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline-variant)]">
                  {courses.map((c) => {
                    const isEditing = editingCourseCode === c.code;
                    return (
                      <tr key={c.code} className="table-row transition-colors">
                        <td className="py-3 px-3 font-semibold text-[var(--on-surface)]">{c.code}</td>
                        <td className="py-3 px-3 text-[var(--on-surface)]">{c.title}</td>
                        <td className="py-3 px-3">
                          {isEditing ? (
                            <select
                              value={editCourseDept}
                              onChange={(e) => handleUpdateCourseDept(c.code, e.target.value)}
                              className="text-xs !py-1"
                            >
                              {departmentOptions.map((d: string) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="badge bg-[var(--surface-container-high)] text-[var(--on-surface)] text-[10px]">
                              {c.department}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[var(--on-surface-variant)]">{c.credits}</td>
                        <td className="py-3 px-3">
                          <span className="badge badge-accent">{c.version}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditing) {
                                setEditingCourseCode(null);
                              } else {
                                setEditingCourseCode(c.code);
                                setEditCourseDept(c.department);
                              }
                            }}
                            className="btn-secondary text-[11px] !py-1 !px-2"
                          >
                            {isEditing ? "Done" : "Edit Dept"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 3: ACADEMIC CALENDAR (Years, Semesters, Batches) */}
        {/* ---------------------------------------------------- */}
        <div id="acs-cal" className={activeTab !== "cal" ? "hidden" : ""}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Academic Years Panel */}
            <CalendarEntityPanel
              title="Academic Years"
              label="year"
              items={academicYears}
              fields={yearFields}
              validate={validateYear}
              onSave={handleSaveYear}
              onDelete={handleDeleteYear}
              getInitialFormValues={(item) => {
                if (!item) return { yearLabel: "", startDate: "2025-09-01", endDate: "2026-06-30" };
                return {
                  yearLabel: item.year,
                  startDate: item.startDate || "2025-09-01",
                  endDate: item.endDate || "2026-06-30",
                };
              }}
              renderItem={(ay, { onEdit, onDelete }) => (
                <div className="group flex items-center justify-between border border-[var(--outline-variant)] rounded-xl px-4 py-2.5 font-medium text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  <div className="flex items-center gap-2">
                    <span>{ay.year}</span>
                    {ay.isCurrent ? (
                      <button
                        type="button"
                        onClick={() => handleSetCurrentYear(ay.id)}
                        className="badge badge-success text-[10px] cursor-pointer"
                        title="Click to toggle current"
                      >
                        Current
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCurrentYear(ay.id)}
                        className="text-[10px] text-[var(--outline)] hover:text-[var(--tertiary)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        Mark Current
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={onEdit}
                      className="p-1 hover:text-[var(--tertiary)] text-xs"
                      title="Edit year"
                    >
                      <i className="ti ti-pencil"></i>
                    </button>
                    <button
                      type="button"
                      onClick={onDelete}
                      className="p-1 hover:text-[var(--error)] text-xs"
                      title="Delete year"
                    >
                      <i className="ti ti-trash"></i>
                    </button>
                  </div>
                </div>
              )}
            />

            {/* Semesters Panel */}
            <CalendarEntityPanel
              title="Semesters"
              label="semester"
              items={semesters}
              fields={semFields}
              validate={validateSem}
              onSave={handleSaveSem}
              onDelete={handleDeleteSem}
              getInitialFormValues={(item) => {
                if (!item)
                  return {
                    name: "",
                    academicYear: academicYears[0]?.year || "",
                    startDate: "2025-09-01",
                    endDate: "2026-01-31",
                  };
                return {
                  name: item.name,
                  academicYear: item.academicYear,
                  startDate: item.startDate,
                  endDate: item.endDate,
                };
              }}
              renderItem={(sem, { onEdit, onDelete }) => (
                <div className="group flex items-center justify-between border border-[var(--outline-variant)] rounded-xl px-4 py-2.5 text-sm hover:bg-[var(--surface-container-low)] transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--on-surface)]">{sem.name}</span>
                    </div>
                    <p className="text-[10px] text-[var(--on-surface-variant)]">
                      {sem.academicYear} · {sem.startDate} to {sem.endDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={onEdit}
                      className="p-1 hover:text-[var(--tertiary)] text-xs"
                      title="Edit semester"
                    >
                      <i className="ti ti-pencil"></i>
                    </button>
                    <button
                      type="button"
                      onClick={onDelete}
                      className="p-1 hover:text-[var(--error)] text-xs"
                      title="Delete semester"
                    >
                      <i className="ti ti-trash"></i>
                    </button>
                  </div>
                </div>
              )}
            />

            {/* Batches Panel */}
            <CalendarEntityPanel
              title="Batches"
              label="batch"
              items={batches}
              fields={batchFields}
              validate={validateBatch}
              onSave={handleSaveBatch}
              onDelete={handleDeleteBatch}
              getInitialFormValues={(item) => {
                if (!item)
                  return {
                    name: "",
                    department: departmentOptions[0] || "Software Engineering",
                    academicYear: academicYears[0]?.year || "",
                  };
                return {
                  name: item.name,
                  department: item.department,
                  academicYear: item.academicYear || academicYears[0]?.year || "",
                };
              }}
              renderItem={(batch, { onEdit, onDelete }) => (
                <div className="group flex items-center justify-between border border-[var(--outline-variant)] rounded-xl px-4 py-2.5 text-sm hover:bg-[var(--surface-container-low)] transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--on-surface)]">{batch.name}</span>
                    </div>
                    <p className="text-[10px] text-[var(--on-surface-variant)]">
                      {batch.department} · {batch.academicYear || `Intake ${batch.intakeYear}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={onEdit}
                      className="p-1 hover:text-[var(--tertiary)] text-xs"
                      title="Edit batch"
                    >
                      <i className="ti ti-pencil"></i>
                    </button>
                    <button
                      type="button"
                      onClick={onDelete}
                      className="p-1 hover:text-[var(--error)] text-xs"
                      title="Delete batch"
                    >
                      <i className="ti ti-trash"></i>
                    </button>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 4: COURSE OFFERINGS                              */}
        {/* ---------------------------------------------------- */}
        <div id="acs-offerings" className={activeTab !== "offerings" ? "hidden" : ""}>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-1">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Create Course Offering
              </h3>
              <form onSubmit={handleCreateOffering} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">
                    Course Module
                  </label>
                  <select
                    value={newOffCourseCode}
                    onChange={(e) => setNewOffCourseCode(e.target.value)}
                    className="w-full text-xs"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.title}
                      </option>
                    ))}
                  </select>
                  {selectedCourseForOffering && (
                    <p className="text-[11px] text-[var(--on-surface-variant)] mt-1.5 flex items-center gap-1.5 font-medium">
                      <i className="ti ti-building text-[var(--tertiary)] text-xs"></i>
                      Department: <b className="text-[var(--on-surface)]">{selectedCourseForOffering.department}</b>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">Batch</label>
                    <select
                      value={newOffBatch}
                      onChange={(e) => setNewOffBatch(e.target.value)}
                      className="w-full text-xs"
                    >
                      {filteredBatchesForOffering.length === 0 ? (
                        <option value="" disabled>
                          No matching batches
                        </option>
                      ) : (
                        filteredBatchesForOffering.map((b: any) => (
                          <option key={b.id} value={b.name}>
                            {b.name} ({b.department})
                          </option>
                        ))
                      )}
                    </select>
                    <label className="flex items-center gap-1.5 text-[10px] text-[var(--on-surface-variant)] mt-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showAllDeptsForOffering}
                        onChange={(e) => setShowAllDeptsForOffering(e.target.checked)}
                      />
                      Show all departments
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">Semester</label>
                    <select
                      value={newOffSemester}
                      onChange={(e) => setNewOffSemester(e.target.value)}
                      className="w-full text-xs"
                    >
                      {semesters.map((s: any) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">
                    Primary Lecturer
                  </label>
                  <select
                    value={newOffLecturer}
                    onChange={(e) => setNewOffLecturer(e.target.value)}
                    className="w-full text-xs"
                  >
                    {lecturers.map((l) => (
                      <option key={l.lecturerId} value={l.fullName}>
                        {l.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">
                    Student Capacity
                  </label>
                  <input
                    type="number"
                    value={newOffCapacity}
                    onChange={(e) => setNewOffCapacity(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full justify-center shadow-md"
                  disabled={createOfferingMutation.isPending}
                >
                  <i className="ti ti-plus mr-1"></i>{" "}
                  {createOfferingMutation.isPending ? "Creating..." : "Create Offering"}
                </button>
              </form>
            </div>

            <div className="card p-6 lg:col-span-2">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Active Course Offerings ({offerings.length})
              </h3>
              {isLoadingOfferings ? (
                <div className="p-8 text-center text-xs text-[var(--on-surface-variant)] flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-[var(--tertiary)] border-t-transparent rounded-full animate-spin"></div>
                  Loading course offerings from backend...
                </div>
              ) : isErrorOfferings ? (
                <div className="p-4 bg-[var(--error-container)]/30 border border-[var(--error)]/30 rounded-xl text-xs text-[var(--error)] flex items-center justify-between gap-3">
                  <span>Failed to load offerings: {offeringsError?.message || "Server Error"}</span>
                  <button onClick={refetchOfferings} className="btn-secondary text-[11px] !py-1 !px-2 shrink-0">
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[550px]">
                      <thead>
                        <tr className="border-b border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-xs uppercase tracking-wider">
                          <th className="pb-3 px-3 font-semibold">Course & Offering</th>
                          <th className="pb-3 px-3 font-semibold">Department</th>
                          <th className="pb-3 px-3 font-semibold">Batch & Term</th>
                          <th className="pb-3 px-3 font-semibold">Assigned Lecturers</th>
                          <th className="pb-3 px-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--outline-variant)]">
                        {offerings.map((off) => {
                          const isManaging = managingOfferingId === off.offeringId;
                          const deptName =
                            off.departmentName ||
                            courses.find((c) => c.code === off.courseCode)?.department ||
                            "Software Engineering";
                          return (
                            <tr key={off.offeringId} className="table-row transition-colors">
                              <td className="py-3.5 px-3">
                                <span className="badge badge-accent text-[10px] mb-1 block w-fit">
                                  {off.courseCode}
                                </span>
                                <span className="font-semibold text-[var(--on-surface)] text-sm">
                                  {off.courseTitle}
                                </span>
                              </td>
                              <td className="py-3.5 px-3">
                                <span className="badge bg-[var(--surface-container-high)] text-[var(--on-surface)] text-[10px]">
                                  {deptName}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-xs text-[var(--on-surface-variant)]">
                                <b className="text-[var(--on-surface)]">{off.batchName}</b> <br />
                                <span>{off.semesterName}</span>
                              </td>
                              <td className="py-3.5 px-3">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {off.lecturerNames.length > 0 && (
                                    <span className="badge badge-success text-[10px]" title="Primary Lecturer">
                                      <i className="ti ti-star-filled mr-1 text-[9px]"></i>
                                      {off.lecturerNames[0]}
                                    </span>
                                  )}
                                  {off.lecturerNames.slice(1).map((lec) => (
                                    <span
                                      key={lec}
                                      className="badge bg-[var(--surface-container-high)] text-[var(--on-surface)] text-[10px] flex items-center gap-1"
                                    >
                                      {lec}
                                      {isManaging && (
                                        <button
                                          onClick={() => handleRemoveLecturerFromOffering(off.offeringId, lec)}
                                          className="hover:text-[var(--error)] font-bold ml-0.5"
                                          title="Remove co-lecturer"
                                        >
                                          ×
                                        </button>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-right">
                                <button
                                  onClick={() => setManagingOfferingId(isManaging ? null : off.offeringId)}
                                  className="btn-secondary text-xs !py-1"
                                >
                                  <i className="ti ti-users"></i> {isManaging ? "Done" : "Manage"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {managingOfferingId && (
                    <div className="mt-4 p-4 rounded-xl border border-[var(--tertiary)] bg-[var(--surface-container-low)] animate-fadeIn">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-xs text-[var(--on-surface)] flex items-center gap-1">
                          <i className="ti ti-user-plus text-[var(--tertiary)] text-base"></i>
                          Assign Additional Co-Lecturers
                        </h4>
                        <button
                          onClick={() => setManagingOfferingId(null)}
                          className="text-xs text-[var(--outline)] hover:text-[var(--on-surface)]"
                        >
                          Close
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedLecturerToAdd}
                          onChange={(e) => setSelectedLecturerToAdd(e.target.value)}
                          className="text-xs flex-1"
                        >
                          {lecturers.map((l) => (
                            <option key={l.lecturerId} value={l.fullName}>
                              {l.fullName}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAddLecturerToOffering(managingOfferingId)}
                          className="btn-primary text-xs !py-1.5 shrink-0"
                        >
                          <i className="ti ti-plus"></i> Assign
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 5: TIMETABLE                                     */}
        {/* ---------------------------------------------------- */}
        <div id="acs-timetable" className={activeTab !== "timetable" ? "hidden" : ""}>
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="card p-6 lg:col-span-1">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Schedule Timetable Slot
              </h3>
              <form onSubmit={handleCreateSlot} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">
                    Target Course Offering
                  </label>
                  <select
                    value={newSlotOfferingId}
                    onChange={(e) => setNewSlotOfferingId(Number(e.target.value))}
                    className="w-full text-xs"
                  >
                    {offerings.map((o) => (
                      <option key={o.offeringId} value={o.offeringId}>
                        {o.courseCode} — {o.batchName} — {o.semesterName}
                      </option>
                    ))}
                  </select>
                  {selectedOffering && (
                    <div className="mt-2 px-3 py-2 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-xs text-[var(--on-surface-variant)] flex items-center gap-2">
                      <i className="ti ti-info-circle text-[var(--tertiary)] text-sm shrink-0"></i>
                      <span>
                        Batch: <b className="text-[var(--on-surface)]">{selectedOffering.batchName}</b> · Semester:{" "}
                        <b className="text-[var(--on-surface)]">{selectedOffering.semesterName}</b>
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">
                    Day of Week
                  </label>
                  <select
                    value={newSlotDay}
                    onChange={(e) => setNewSlotDay(e.target.value)}
                    className="w-full text-xs"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">
                      Start Time
                    </label>
                    <input
                      type="text"
                      value={newSlotStartTime}
                      onChange={(e) => setNewSlotStartTime(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">
                      End Time
                    </label>
                    <input
                      type="text"
                      value={newSlotEndTime}
                      onChange={(e) => setNewSlotEndTime(e.target.value)}
                      placeholder="11:00 AM"
                      className="w-full text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">
                      Venue
                    </label>
                    <input
                      type="text"
                      value={newSlotVenue}
                      onChange={(e) => setNewSlotVenue(e.target.value)}
                      placeholder="Lab 04"
                      className="w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">
                      Slot Type
                    </label>
                    <select
                      value={newSlotType}
                      onChange={(e) => setNewSlotType(e.target.value)}
                      className="w-full text-xs"
                    >
                      <option value="Lecture">Lecture</option>
                      <option value="Lab">Lab</option>
                      <option value="Tutorial">Tutorial</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full justify-center shadow-md"
                  disabled={createSlotMutation.isPending}
                >
                  <i className="ti ti-calendar-plus mr-1"></i>{" "}
                  {createSlotMutation.isPending ? "Scheduling..." : "Add Timetable Slot"}
                </button>
              </form>
            </div>

            <div className="card p-6 lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-[var(--outline-variant)]">
                <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
                  <i className="ti ti-calendar-time text-[var(--tertiary)] text-xl"></i>
                  Weekly Timetable Schedule
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--on-surface-variant)] font-semibold">
                    Filter Batch:
                  </span>
                  <select
                    value={timetableBatchFilter}
                    onChange={(e) => setTimetableBatchFilter(e.target.value)}
                    className="text-xs !py-1"
                  >
                    <option value="All batches">All batches</option>
                    {distinctBatches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isLoadingSlots ? (
                <div className="p-8 text-center text-xs text-[var(--on-surface-variant)] flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-[var(--tertiary)] border-t-transparent rounded-full animate-spin"></div>
                  Loading timetable slots from backend...
                </div>
              ) : isErrorSlots ? (
                <div className="p-4 bg-[var(--error-container)]/30 border border-[var(--error)]/30 rounded-xl text-xs text-[var(--error)] flex items-center justify-between gap-3">
                  <span>Failed to load slots: {slotsError?.message || "Server Error"}</span>
                  <button onClick={refetchSlots} className="btn-secondary text-[11px] !py-1 !px-2 shrink-0">
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <div className="block sm:hidden mb-4">
                    <div className="flex gap-1 overflow-x-auto pb-2 border-b border-[var(--outline-variant)]">
                      {DAYS.map((d) => (
                        <button
                          key={d}
                          onClick={() => setSelectedDayMobile(d)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                            selectedDayMobile === d
                              ? "bg-[var(--tertiary)] text-white"
                              : "bg-[var(--surface-container)] text-[var(--on-surface)]"
                          }`}
                        >
                          {d.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-3 mt-3">
                      {filteredSlots.filter((s) => s.dayOfWeek === selectedDayMobile).length === 0 ? (
                        <p className="text-xs text-[var(--on-surface-variant)] italic text-center py-4">
                          No slots scheduled for {selectedDayMobile}.
                        </p>
                      ) : (
                        filteredSlots
                          .filter((s) => s.dayOfWeek === selectedDayMobile)
                          .map((s) => (
                            <div
                              key={s.slotId}
                              className="p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="badge badge-accent text-[10px]">{s.courseCode}</span>
                                <span
                                  className={`badge ${
                                    s.slotType === "Lecture"
                                      ? "badge-success"
                                      : s.slotType === "Lab"
                                      ? "badge-warning"
                                      : "badge-accent"
                                  } text-[10px]`}
                                >
                                  {s.slotType}
                                </span>
                              </div>
                              <p className="font-bold text-xs text-[var(--on-surface)]">{s.courseName}</p>
                              <p className="text-[11px] text-[var(--on-surface-variant)]">
                                {s.startTime} - {s.endTime} · <b>{s.venue}</b> ({s.batchName})
                              </p>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  <div className="hidden sm:grid grid-cols-5 gap-3">
                    {DAYS.map((d) => {
                      const daySlots = filteredSlots.filter((s) => s.dayOfWeek === d);
                      return (
                        <div
                          key={d}
                          className="border border-[var(--outline-variant)] rounded-xl p-3 bg-[var(--surface-container-lowest)] min-h-[300px]"
                        >
                          <h4 className="font-display font-bold text-xs text-center pb-2 border-b border-[var(--outline-variant)] text-[var(--on-surface)] mb-2">
                            {d}
                          </h4>
                          <div className="space-y-2">
                            {daySlots.length === 0 ? (
                              <p className="text-[10px] text-[var(--on-surface-variant)] text-center pt-6 italic">
                                No slots
                              </p>
                            ) : (
                              daySlots.map((s) => (
                                <div
                                  key={s.slotId}
                                  className={`p-2.5 rounded-lg border text-xs space-y-1 transition-all ${
                                    s.slotType === "Lecture"
                                      ? "bg-[var(--secondary-container)] border-[var(--secondary)] text-[var(--on-secondary-container)]"
                                      : s.slotType === "Lab"
                                      ? "bg-[var(--tertiary-container)] border-[var(--tertiary)] text-[var(--on-tertiary-container)]"
                                      : "bg-[var(--surface-container-high)] border-[var(--outline-variant)] text-[var(--on-surface)]"
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-[10px] font-bold">
                                    <span>{s.courseCode}</span>
                                    <span className="opacity-80">{s.slotType}</span>
                                  </div>
                                  <p className="font-semibold text-[11px] leading-tight line-clamp-2">
                                    {s.courseName}
                                  </p>
                                  <p className="text-[10px] opacity-90">
                                    {s.startTime} - {s.endTime}
                                  </p>
                                  <p className="text-[10px] font-bold">
                                    {s.venue} <span className="opacity-75">({s.batchName})</span>
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
