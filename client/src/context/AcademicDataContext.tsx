"use client";
import React, { createContext, useContext, useState } from "react";

export interface CourseOffering {
  offeringId: number;
  courseCode: string;
  courseTitle: string;
  departmentName?: string;
  batchName: string;
  semesterName: string;
  lecturerIds: number[]; // supports multiple lecturers per offering
  lecturerNames: string[];
  enrollmentCount: number;
  capacity?: number;
}

export interface TimetableSlot {
  slotId: number;
  offeringId: number;
  courseCode: string;
  courseName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  venue: string;
  slotType: string;
  batchName?: string;
}

interface AcademicDataContextType {
  offerings: CourseOffering[];
  slots: TimetableSlot[];
  addOffering: (offering: Omit<CourseOffering, "offeringId">) => void;
  assignLecturer: (offeringId: number, lecturerId: number, lecturerName: string) => void;
  removeLecturer: (offeringId: number, lecturerName: string) => void;
  addSlot: (slot: Omit<TimetableSlot, "slotId">) => void;
  updateSlot: (slotId: number, updated: Partial<TimetableSlot>) => void;
  deleteSlot: (slotId: number) => void;
}

const INITIAL_OFFERINGS: CourseOffering[] = [
  {
    offeringId: 1,
    courseCode: "SE308.3",
    courseTitle: "Software Process Management",
    departmentName: "Software Engineering",
    batchName: "CS2023-A",
    semesterName: "Semester 1",
    lecturerIds: [1, 3],
    lecturerNames: ["Dr. K. Perera", "Prof. A. Fernando"],
    enrollmentCount: 42,
    capacity: 50,
  },
  {
    offeringId: 2,
    courseCode: "SE202.2",
    courseTitle: "Database Systems",
    departmentName: "Computer Science",
    batchName: "CS2023-B",
    semesterName: "Semester 1",
    lecturerIds: [2],
    lecturerNames: ["Dr. M. Rathnayake"],
    enrollmentCount: 38,
    capacity: 45,
  },
  {
    offeringId: 3,
    courseCode: "SE309.3",
    courseTitle: "Software Verification & Validation",
    departmentName: "Software Engineering",
    batchName: "CS2023-A",
    semesterName: "Semester 2",
    lecturerIds: [3, 1],
    lecturerNames: ["Prof. A. Fernando", "Dr. K. Perera"],
    enrollmentCount: 45,
    capacity: 50,
  },
];

const INITIAL_SLOTS: TimetableSlot[] = [
  {
    slotId: 1,
    offeringId: 1,
    courseCode: "SE308.3",
    courseName: "Software Process Management",
    batchName: "CS2023-A",
    dayOfWeek: "Monday",
    startTime: "09:00 AM",
    endTime: "11:00 AM",
    venue: "Main Hall A",
    slotType: "Lecture",
  },
  {
    slotId: 2,
    offeringId: 2,
    courseCode: "SE202.2",
    courseName: "Database Systems",
    batchName: "CS2023-B",
    dayOfWeek: "Tuesday",
    startTime: "01:30 PM",
    endTime: "03:30 PM",
    venue: "Computing Lab 04",
    slotType: "Lab",
  },
  {
    slotId: 3,
    offeringId: 3,
    courseCode: "SE309.3",
    courseName: "Software Verification & Validation",
    batchName: "CS2023-A",
    dayOfWeek: "Wednesday",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    venue: "Auditorium B",
    slotType: "Lecture",
  },
  {
    slotId: 4,
    offeringId: 1,
    courseCode: "SE308.3",
    courseName: "Software Process Management",
    batchName: "CS2023-A",
    dayOfWeek: "Thursday",
    startTime: "02:00 PM",
    endTime: "04:00 PM",
    venue: "Tutorial Room 02",
    slotType: "Tutorial",
  },
];

const AcademicDataContext = createContext<AcademicDataContextType | undefined>(undefined);

export function AcademicDataProvider({ children }: { children: React.ReactNode }) {
  const [offerings, setOfferings] = useState<CourseOffering[]>(INITIAL_OFFERINGS);
  const [slots, setSlots] = useState<TimetableSlot[]>(INITIAL_SLOTS);

  const addOffering = (offeringData: Omit<CourseOffering, "offeringId">) => {
    const newOffering: CourseOffering = {
      ...offeringData,
      offeringId: Date.now(),
    };
    setOfferings((prev) => [newOffering, ...prev]);
  };

  const assignLecturer = (offeringId: number, lecturerId: number, lecturerName: string) => {
    setOfferings((prev) =>
      prev.map((off) => {
        if (off.offeringId !== offeringId) return off;
        if (off.lecturerNames.includes(lecturerName)) return off;
        return {
          ...off,
          lecturerIds: [...off.lecturerIds, lecturerId],
          lecturerNames: [...off.lecturerNames, lecturerName],
        };
      })
    );
  };

  const removeLecturer = (offeringId: number, lecturerName: string) => {
    setOfferings((prev) =>
      prev.map((off) => {
        if (off.offeringId !== offeringId) return off;
        const idx = off.lecturerNames.indexOf(lecturerName);
        if (idx === -1) return off;
        const newNames = [...off.lecturerNames];
        const newIds = [...off.lecturerIds];
        newNames.splice(idx, 1);
        newIds.splice(idx, 1);
        return { ...off, lecturerNames: newNames, lecturerIds: newIds };
      })
    );
  };

  const addSlot = (slotData: Omit<TimetableSlot, "slotId">) => {
    const newSlot: TimetableSlot = {
      ...slotData,
      slotId: Date.now(),
    };
    setSlots((prev) => [...prev, newSlot]);
  };

  const updateSlot = (slotId: number, updated: Partial<TimetableSlot>) => {
    setSlots((prev) => prev.map((s) => (s.slotId === slotId ? { ...s, ...updated } : s)));
  };

  const deleteSlot = (slotId: number) => {
    setSlots((prev) => prev.filter((s) => s.slotId !== slotId));
  };

  return (
    <AcademicDataContext.Provider
      value={{
        offerings,
        slots,
        addOffering,
        assignLecturer,
        removeLecturer,
        addSlot,
        updateSlot,
        deleteSlot,
      }}
    >
      {children}
    </AcademicDataContext.Provider>
  );
}

export function useAcademicData() {
  const context = useContext(AcademicDataContext);
  if (!context) {
    throw new Error("useAcademicData must be used within an AcademicDataProvider");
  }
  return context;
}
