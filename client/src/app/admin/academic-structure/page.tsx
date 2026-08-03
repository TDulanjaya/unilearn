"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useInteractive } from "@/lib/useInteractive";
import { useAcademicData } from "@/context/AcademicDataContext";
import CalendarEntityPanel, { FieldConfig } from "@/components/CalendarEntityPanel";

interface LecturerOption {
  lecturerId: number;
  fullName: string;
}

interface Course {
  code: string;
  title: string;
  credits: number;
  version: string;
  department: string;
}

const LECTURERS: LecturerOption[] = [
  { lecturerId: 1, fullName: "Dr. K. Perera" },
  { lecturerId: 2, fullName: "Dr. M. Rathnayake" },
  { lecturerId: 3, fullName: "Prof. A. Fernando" },
];

const INITIAL_COURSES: Course[] = [
  { code: "SE308.3", title: "Software Process Management", credits: 4, version: "v2", department: "Software Engineering" },
  { code: "SE202.2", title: "Database Systems", credits: 4, version: "v3", department: "Computer Science" },
  { code: "SE309.3", title: "Software Verification & Validation", credits: 4, version: "v3", department: "Software Engineering" },
  { code: "SE201.2", title: "Data Structures & Algorithms", credits: 4, version: "v1", department: "Software Engineering" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DEPARTMENTS = ["Software Engineering", "Computer Science", "Information Technology"];

export default function Page() {
  useInteractive();
  const { offerings, slots, addOffering, assignLecturer, removeLecturer, addSlot } = useAcademicData();

  /* Local Form States */
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);

  // New Course Form State
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseCredits, setNewCourseCredits] = useState("4");
  const [newCourseDept, setNewCourseDept] = useState("Software Engineering");
  const [newCourseVersion, setNewCourseVersion] = useState("v1");
  const [editingCourseCode, setEditingCourseCode] = useState<string | null>(null);
  const [editCourseDept, setEditCourseDept] = useState("Software Engineering");

  // Dynamic Academic Calendar States
  const [academicYears, setAcademicYears] = useState([
    { id: "ay-1", year: "2025/2026", isCurrent: true },
    { id: "ay-2", year: "2026/2027", isCurrent: false },
  ]);
  const [semesters, setSemesters] = useState([
    { id: "sem-1", name: "Semester 1", academicYear: "2025/2026", startDate: "2025-09-01", endDate: "2026-01-31", isCurrent: true },
    { id: "sem-2", name: "Semester 2", academicYear: "2025/2026", startDate: "2026-02-15", endDate: "2026-06-30", isCurrent: false },
  ]);
  const [batches, setBatches] = useState([
    { id: "b-1", name: "CS2023-A", department: "Computer Science", intakeYear: 2023, studentCount: 42 },
    { id: "b-2", name: "CS2023-B", department: "Computer Science", intakeYear: 2023, studentCount: 38 },
    { id: "b-3", name: "SE2024-A", department: "Software Engineering", intakeYear: 2024, studentCount: 45 },
  ]);

  // Offering creation form state
  const [newOffCourseCode, setNewOffCourseCode] = useState(INITIAL_COURSES[0].code);
  const [newOffBatch, setNewOffBatch] = useState("CS2023-A");
  const [newOffSemester, setNewOffSemester] = useState("Semester 1");
  const [newOffLecturer, setNewOffLecturer] = useState(LECTURERS[0].fullName);
  const [newOffCapacity, setNewOffCapacity] = useState("50");
  const [showAllDeptsForOffering, setShowAllDeptsForOffering] = useState(false);

  // Managing Lecturers panel
  const [managingOfferingId, setManagingOfferingId] = useState<number | null>(null);
  const [selectedLecturerToAdd, setSelectedLecturerToAdd] = useState(LECTURERS[0].fullName);

  // Timetable creation form state
  const [newSlotOfferingId, setNewSlotOfferingId] = useState<number>(offerings[0]?.offeringId || 1);
  const [newSlotDay, setNewSlotDay] = useState<string>("Monday");
  const [newSlotStartTime, setNewSlotStartTime] = useState("09:00 AM");
  const [newSlotEndTime, setNewSlotEndTime] = useState("11:00 AM");
  const [newSlotVenue, setNewSlotVenue] = useState("Main Hall A");
  const [newSlotType, setNewSlotType] = useState<string>("Lecture");

  // Timetable filter
  const [timetableBatchFilter, setTimetableBatchFilter] = useState("All batches");
  const [selectedDayMobile, setSelectedDayMobile] = useState<string>("Monday");

  // Offering batch filtering by course department
  const selectedCourseForOffering = courses.find((c) => c.code === newOffCourseCode) || courses[0];
  const filteredBatchesForOffering = showAllDeptsForOffering
    ? batches
    : batches.filter((b) => b.department === selectedCourseForOffering?.department);

  useEffect(() => {
    if (filteredBatchesForOffering.length > 0) {
      if (!filteredBatchesForOffering.some((b) => b.name === newOffBatch)) {
        setNewOffBatch(filteredBatchesForOffering[0].name);
      }
    }
  }, [newOffCourseCode, showAllDeptsForOffering, batches]);

  /* Course Handlers */
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseTitle.trim()) return;

    const created: Course = {
      code: newCourseCode.trim(),
      title: newCourseTitle.trim(),
      credits: parseInt(newCourseCredits) || 4,
      version: newCourseVersion.trim() || "v1",
      department: newCourseDept,
    };

    setCourses((prev) => [created, ...prev]);
    setNewCourseCode("");
    setNewCourseTitle("");
    setNewCourseCredits("4");
  };

  const handleUpdateCourseDept = (code: string, newDept: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.code === code ? { ...c, department: newDept } : c))
    );
    setEditingCourseCode(null);
  };

  /* Current Flag Handlers */
  const handleSetCurrentYear = (id: string) => {
    setAcademicYears((prev) => prev.map((ay) => ({ ...ay, isCurrent: ay.id === id })));
  };

  const handleSetCurrentSem = (id: string) => {
    setSemesters((prev) => prev.map((s) => ({ ...s, isCurrent: s.id === id })));
  };

  /* Academic Years Config & Handlers */
  const yearFields: FieldConfig[] = [
    { key: "startYear", label: "Start Year", type: "number", required: true, placeholder: "e.g. 2025" },
    { key: "endYear", label: "End Year", type: "number", required: true, placeholder: "e.g. 2026" },
  ];

  const validateYear = (vals: Record<string, any>, editingItem: any) => {
    const start = Number(vals.startYear);
    const end = Number(vals.endYear);
    if (isNaN(start) || isNaN(end)) return "Please enter valid start and end years.";
    if (end <= start) return "End year must be greater than start year.";
    const yearStr = `${start}/${end}`;
    const dup = academicYears.some((ay) => ay.id !== editingItem?.id && ay.year === yearStr);
    if (dup) return `Academic Year ${yearStr} already exists.`;
    return null;
  };

  const handleSaveYear = (vals: Record<string, any>, editingItem: any) => {
    const yearStr = `${vals.startYear}/${vals.endYear}`;
    if (editingItem) {
      setAcademicYears((prev) => prev.map((ay) => (ay.id === editingItem.id ? { ...ay, year: yearStr } : ay)));
    } else {
      setAcademicYears((prev) => [...prev, { id: "ay-" + Date.now(), year: yearStr, isCurrent: false }]);
    }
  };

  const handleDeleteYear = (id: string) => {
    setAcademicYears((prev) => {
      const filtered = prev.filter((ay) => ay.id !== id);
      if (filtered.length > 0 && !filtered.some((ay) => ay.isCurrent)) {
        filtered[0].isCurrent = true;
      }
      return filtered;
    });
  };

  /* Semesters Config & Handlers */
  const semFields: FieldConfig[] = [
    { key: "name", label: "Semester Name", type: "text", required: true, placeholder: "e.g. Semester 3" },
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
    const dup = semesters.some(
      (s) => s.id !== editingItem?.id && s.name.toLowerCase().trim() === name.toLowerCase() && s.academicYear === vals.academicYear
    );
    if (dup) return `"${name}" already exists in Academic Year ${vals.academicYear}.`;
    return null;
  };

  const handleSaveSem = (vals: Record<string, any>, editingItem: any) => {
    if (editingItem) {
      setSemesters((prev) =>
        prev.map((s) =>
          s.id === editingItem.id
            ? {
                ...s,
                name: vals.name.trim(),
                academicYear: vals.academicYear,
                startDate: vals.startDate,
                endDate: vals.endDate,
              }
            : s
        )
      );
    } else {
      setSemesters((prev) => [
        ...prev,
        {
          id: "sem-" + Date.now(),
          name: vals.name.trim(),
          academicYear: vals.academicYear,
          startDate: vals.startDate || "2026-09-01",
          endDate: vals.endDate || "2027-01-31",
          isCurrent: false,
        },
      ]);
    }
  };

  const handleDeleteSem = (id: string) => {
    setSemesters((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length > 0 && !filtered.some((s) => s.isCurrent)) {
        filtered[0].isCurrent = true;
      }
      return filtered;
    });
  };

  /* Batches Config & Handlers */
  const batchFields: FieldConfig[] = [
    { key: "name", label: "Batch Name", type: "text", required: true, placeholder: "e.g. CS2026-A" },
    {
      key: "department",
      label: "Department",
      type: "select",
      options: DEPARTMENTS.map((d) => ({ value: d, label: d })),
      required: true,
    },
    { key: "intakeYear", label: "Intake Year", type: "number", required: true, placeholder: "2026" },
    { key: "studentCount", label: "Student Count", type: "number", required: true, placeholder: "30" },
  ];

  const validateBatch = (vals: Record<string, any>, editingItem: any) => {
    const name = vals.name?.trim();
    if (!name) return "Please enter a batch name.";
    const dup = batches.some((b) => b.id !== editingItem?.id && b.name.toLowerCase().trim() === name.toLowerCase());
    if (dup) return `Batch "${name}" already exists.`;
    return null;
  };

  const handleSaveBatch = (vals: Record<string, any>, editingItem: any) => {
    if (editingItem) {
      setBatches((prev) =>
        prev.map((b) =>
          b.id === editingItem.id
            ? {
                ...b,
                name: vals.name.trim(),
                department: vals.department,
                intakeYear: Number(vals.intakeYear) || b.intakeYear,
                studentCount: Number(vals.studentCount) || b.studentCount,
              }
            : b
        )
      );
    } else {
      setBatches((prev) => [
        ...prev,
        {
          id: "b-" + Date.now(),
          name: vals.name.trim(),
          department: vals.department,
          intakeYear: Number(vals.intakeYear) || 2026,
          studentCount: Number(vals.studentCount) || 30,
        },
      ]);
    }
  };

  const handleDeleteBatch = (id: string) => {
    setBatches((prev) => prev.filter((b) => b.id !== id));
  };

  /* Handlers */
  const selectedOffering = offerings.find((o) => o.offeringId === Number(newSlotOfferingId)) || offerings[0];
  const distinctBatches = Array.from(new Set(offerings.map((o) => o.batchName)));

  const handleCreateOffering = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.code === newOffCourseCode);
    if (!course) return;

    const lecObj = LECTURERS.find((l) => l.fullName === newOffLecturer) || LECTURERS[0];

    addOffering({
      courseCode: course.code,
      courseTitle: course.title,
      departmentName: course.department,
      batchName: newOffBatch,
      semesterName: newOffSemester,
      lecturerIds: [lecObj.lecturerId],
      lecturerNames: [lecObj.fullName],
      enrollmentCount: 0,
      capacity: parseInt(newOffCapacity) || 50,
    });
  };

  const handleAddLecturerToOffering = (offeringId: number) => {
    if (!selectedLecturerToAdd) return;
    const lecObj = LECTURERS.find((l) => l.fullName === selectedLecturerToAdd) || LECTURERS[0];
    assignLecturer(offeringId, lecObj.lecturerId, lecObj.fullName);
  };

  const handleRemoveLecturerFromOffering = (offeringId: number, lecturerName: string) => {
    removeLecturer(offeringId, lecturerName);
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffering) return;

    addSlot({
      offeringId: selectedOffering.offeringId,
      courseCode: selectedOffering.courseCode,
      courseName: selectedOffering.courseTitle,
      batchName: selectedOffering.batchName,
      dayOfWeek: newSlotDay,
      startTime: newSlotStartTime,
      endTime: newSlotEndTime,
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
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            Academic Structure
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm">
            Faculties, departments, courses, course offerings, lecturer assignments, and timetable scheduling.
          </p>
        </div>

        {/* Tab Group */}
        <div className="flex gap-2 mb-6 border-b border-[var(--outline-variant)] overflow-x-auto" data-tabgroup="acs">
          <span className="tab-btn active" data-tab="fac">Faculties & departments</span>
          <span className="tab-btn" data-tab="courses">Courses</span>
          <span className="tab-btn" data-tab="cal">Academic calendar</span>
          <span className="tab-btn" data-tab="offerings">Course Offerings</span>
          <span className="tab-btn" data-tab="timetable">Timetable</span>
        </div>

        {/* Panel 1: Faculties */}
        <div id="acs-fac" data-tabpanel="acs">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--outline-variant)]">
                <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">Faculties</h3>
                <button className="btn-secondary text-xs !py-1.5"><i className="ti ti-plus"></i> Add</button>
              </div>
              <div className="space-y-2.5">
                <div className="border border-[var(--outline-variant)] bg-[var(--surface-container)] rounded-xl px-4 py-3 text-sm font-semibold text-[var(--tertiary)] shadow-sm">
                  Faculty of Computing
                </div>
                <div className="border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm font-semibold text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  Faculty of Business
                </div>
                <div className="border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm font-semibold text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  Faculty of Engineering
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--outline-variant)]">
                <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                  Departments — Faculty of Computing
                </h3>
                <button className="btn-secondary text-xs !py-1.5"><i className="ti ti-plus"></i> Add</button>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  <span className="font-semibold">Software Engineering</span>
                  <select className="w-48 !py-1 text-xs"><option>Dr. S. Wickramasinghe</option></select>
                </div>
                <div className="flex items-center justify-between border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors">
                  <span className="font-semibold">Computer Science</span>
                  <select className="w-48 !py-1 text-xs"><option>Dr. M. Rathnayake</option></select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Courses */}
        <div id="acs-courses" data-tabpanel="acs" className="hidden">
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
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
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
              <button type="submit" className="btn-primary text-xs shadow-md">
                <i className="ti ti-plus mr-1"></i> Save course
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
                              {DEPARTMENTS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="badge bg-[var(--surface-container-high)] text-[var(--on-surface)] text-[10px]">
                              {c.department}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[var(--on-surface-variant)]">{c.credits}</td>
                        <td className="py-3 px-3"><span className="badge badge-accent">{c.version}</span></td>
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

        {/* Panel 3: Academic Calendar */}
        <div id="acs-cal" data-tabpanel="acs" className="hidden">
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
                if (!item) return { startYear: 2027, endYear: 2028 };
                const parts = item.year.split("/");
                return { startYear: Number(parts[0]), endYear: Number(parts[1]) };
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
                        className="text-[10px] text-[var(--outline)] hover:text-[var(--tertiary)] opacity-0 group-hover:opacity-100 transition-opacity"
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
                if (!item) return { name: "", academicYear: academicYears[0]?.year || "", startDate: "", endDate: "" };
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
                      {sem.isCurrent ? (
                        <button
                          type="button"
                          onClick={() => handleSetCurrentSem(sem.id)}
                          className="badge badge-success text-[10px] cursor-pointer"
                          title="Click to toggle current"
                        >
                          Current
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCurrentSem(sem.id)}
                          className="text-[10px] text-[var(--outline)] hover:text-[var(--tertiary)] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Mark Current
                        </button>
                      )}
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
                if (!item) return { name: "", department: DEPARTMENTS[0], intakeYear: 2026, studentCount: 30 };
                return {
                  name: item.name,
                  department: item.department,
                  intakeYear: item.intakeYear,
                  studentCount: item.studentCount,
                };
              }}
              renderItem={(batch, { onEdit, onDelete }) => (
                <div className="group flex items-center justify-between border border-[var(--outline-variant)] rounded-xl px-4 py-2.5 text-sm hover:bg-[var(--surface-container-low)] transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--on-surface)]">{batch.name}</span>
                      <span className="badge badge-accent text-[10px]">{batch.studentCount} students</span>
                    </div>
                    <p className="text-[10px] text-[var(--on-surface-variant)]">
                      {batch.department} · Intake {batch.intakeYear}
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

        {/* Panel 4: Course Offerings */}
        <div id="acs-offerings" data-tabpanel="acs" className="hidden">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Create Offering Form */}
            <div className="card p-6 lg:col-span-1">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Create Course Offering
              </h3>
              <form onSubmit={handleCreateOffering} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">Course Module</label>
                  <select
                    value={newOffCourseCode}
                    onChange={(e) => setNewOffCourseCode(e.target.value)}
                    className="w-full text-xs"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} — {c.title}</option>
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[var(--on-surface)]">Batch</label>
                    </div>
                    <select
                      value={newOffBatch}
                      onChange={(e) => setNewOffBatch(e.target.value)}
                      className="w-full text-xs"
                    >
                      {filteredBatchesForOffering.length === 0 ? (
                        <option value="" disabled>No matching batches</option>
                      ) : (
                        filteredBatchesForOffering.map((b) => (
                          <option key={b.id} value={b.name}>{b.name} ({b.department})</option>
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
                      {semesters.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">Primary Lecturer</label>
                  <select
                    value={newOffLecturer}
                    onChange={(e) => setNewOffLecturer(e.target.value)}
                    className="w-full text-xs"
                  >
                    {LECTURERS.map((l) => <option key={l.lecturerId} value={l.fullName}>{l.fullName}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">Student Capacity</label>
                  <input
                    type="number"
                    value={newOffCapacity}
                    onChange={(e) => setNewOffCapacity(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full text-xs"
                  />
                </div>

                <button type="submit" className="btn-primary w-full justify-center shadow-md">
                  <i className="ti ti-plus mr-1"></i> Create Offering
                </button>
              </form>
            </div>

            {/* Offerings Table & Lecturer Management */}
            <div className="card p-6 lg:col-span-2">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Active Course Offerings ({offerings.length})
              </h3>
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
                            <span className="badge badge-accent text-[10px] mb-1 block w-fit">{off.courseCode}</span>
                            <span className="font-semibold text-[var(--on-surface)] text-sm">{off.courseTitle}</span>
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
                                  <i className="ti ti-star-filled mr-1 text-[9px]"></i>{off.lecturerNames[0]}
                                </span>
                              )}
                              {off.lecturerNames.slice(1).map((lec) => (
                                <span key={lec} className="badge bg-[var(--surface-container-high)] text-[var(--on-surface)] text-[10px] flex items-center gap-1">
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

              {/* Manage Lecturers Expanded Panel */}
              {managingOfferingId && (
                <div className="mt-4 p-4 rounded-xl border border-[var(--tertiary)] bg-[var(--surface-container-low)] animate-fadeIn">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-xs text-[var(--on-surface)] flex items-center gap-1">
                      <i className="ti ti-user-plus text-[var(--tertiary)] text-base"></i>
                      Assign Additional Co-Lecturers
                    </h4>
                    <button onClick={() => setManagingOfferingId(null)} className="text-xs text-[var(--outline)] hover:text-[var(--on-surface)]">
                      Close
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedLecturerToAdd}
                      onChange={(e) => setSelectedLecturerToAdd(e.target.value)}
                      className="text-xs flex-1"
                    >
                      {LECTURERS.map((l) => (
                        <option key={l.lecturerId} value={l.fullName}>{l.fullName}</option>
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
            </div>
          </div>
        </div>

        {/* Panel 5: Timetable */}
        <div id="acs-timetable" data-tabpanel="acs" className="hidden">
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Create Slot Form */}
            <div className="card p-6 lg:col-span-1">
              <h3 className="font-display font-bold text-lg text-[var(--on-surface)] mb-4 pb-3 border-b border-[var(--outline-variant)]">
                Schedule Timetable Slot
              </h3>
              <form onSubmit={handleCreateSlot} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">Target Course Offering</label>
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
                        Batch: <b className="text-[var(--on-surface)]">{selectedOffering.batchName}</b> · Semester: <b className="text-[var(--on-surface)]">{selectedOffering.semesterName}</b>
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">Day of Week</label>
                  <select
                    value={newSlotDay}
                    onChange={(e) => setNewSlotDay(e.target.value)}
                    className="w-full text-xs"
                  >
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">Start Time</label>
                    <input
                      type="text"
                      value={newSlotStartTime}
                      onChange={(e) => setNewSlotStartTime(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">End Time</label>
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
                    <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">Venue</label>
                    <input
                      type="text"
                      value={newSlotVenue}
                      onChange={(e) => setNewSlotVenue(e.target.value)}
                      placeholder="Lab 04"
                      className="w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface)] mb-1">Slot Type</label>
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

                <button type="submit" className="btn-primary w-full justify-center shadow-md">
                  <i className="ti ti-calendar-plus mr-1"></i> Add Timetable Slot
                </button>
              </form>
            </div>

            {/* Weekly Timetable Grid & Batch Filter */}
            <div className="card p-6 lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-[var(--outline-variant)]">
                <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
                  <i className="ti ti-calendar-time text-[var(--tertiary)] text-xl"></i>
                  Weekly Timetable Schedule
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--on-surface-variant)] font-semibold">Filter Batch:</span>
                  <select
                    value={timetableBatchFilter}
                    onChange={(e) => setTimetableBatchFilter(e.target.value)}
                    className="text-xs !py-1"
                  >
                    <option value="All batches">All batches</option>
                    {distinctBatches.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Mobile Day Selector (Small Screens) */}
              <div className="block sm:hidden mb-4">
                <div className="flex gap-1 overflow-x-auto pb-2 border-b border-[var(--outline-variant)]">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDayMobile(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${selectedDayMobile === d ? "bg-[var(--tertiary)] text-white" : "bg-[var(--surface-container)] text-[var(--on-surface)]"}`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
                <div className="space-y-3 mt-3">
                  {filteredSlots.filter((s) => s.dayOfWeek === selectedDayMobile).length === 0 ? (
                    <p className="text-xs text-[var(--on-surface-variant)] italic text-center py-4">No slots scheduled for {selectedDayMobile}.</p>
                  ) : (
                    filteredSlots
                      .filter((s) => s.dayOfWeek === selectedDayMobile)
                      .map((s) => (
                        <div key={s.slotId} className="p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="badge badge-accent text-[10px]">{s.courseCode}</span>
                            <span className={`badge ${s.slotType === "Lecture" ? "badge-success" : s.slotType === "Lab" ? "badge-warning" : "badge-accent"} text-[10px]`}>{s.slotType}</span>
                          </div>
                          <p className="font-bold text-xs text-[var(--on-surface)]">{s.courseName}</p>
                          <p className="text-[11px] text-[var(--on-surface-variant)]">{s.startTime} - {s.endTime} · <b>{s.venue}</b> ({s.batchName})</p>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Desktop 5-Column Grid View */}
              <div className="hidden sm:grid grid-cols-5 gap-3">
                {DAYS.map((d) => {
                  const daySlots = filteredSlots.filter((s) => s.dayOfWeek === d);
                  return (
                    <div key={d} className="border border-[var(--outline-variant)] rounded-xl p-3 bg-[var(--surface-container-lowest)] min-h-[300px]">
                      <h4 className="font-display font-bold text-xs text-center pb-2 border-b border-[var(--outline-variant)] text-[var(--on-surface)] mb-2">
                        {d}
                      </h4>
                      <div className="space-y-2">
                        {daySlots.length === 0 ? (
                          <p className="text-[10px] text-[var(--on-surface-variant)] text-center pt-6 italic">No slots</p>
                        ) : (
                          daySlots.map((s) => (
                            <div
                              key={s.slotId}
                              className={`p-2.5 rounded-lg border text-xs space-y-1 transition-all ${s.slotType === "Lecture" ? "bg-[var(--secondary-container)] border-[var(--secondary)] text-[var(--on-secondary-container)]" : s.slotType === "Lab" ? "bg-[var(--tertiary-container)] border-[var(--tertiary)] text-[var(--on-tertiary-container)]" : "bg-[var(--surface-container-high)] border-[var(--outline-variant)] text-[var(--on-surface)]"}`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span>{s.courseCode}</span>
                                <span className="opacity-80">{s.slotType}</span>
                              </div>
                              <p className="font-semibold text-[11px] leading-tight line-clamp-2">{s.courseName}</p>
                              <p className="text-[10px] opacity-90">{s.startTime} - {s.endTime}</p>
                              <p className="text-[10px] font-bold">{s.venue} <span className="opacity-75">({s.batchName})</span></p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
