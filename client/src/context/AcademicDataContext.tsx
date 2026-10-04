"use client";
import React, { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export interface CourseOffering {
  offeringId: number;
  courseCode: string;
  courseTitle: string;
  departmentName?: string;
  batchName: string;
  semesterName: string;
  lecturerIds: number[];
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
  isLoadingOfferings: boolean;
  isLoadingSlots: boolean;
  isErrorOfferings: boolean;
  isErrorSlots: boolean;
  offeringsError: Error | null;
  slotsError: Error | null;
  refetchOfferings: () => void;
  refetchSlots: () => void;
  addOffering: (offering: Omit<CourseOffering, "offeringId">) => void;
  assignLecturer: (offeringId: number, lecturerId: number, lecturerName: string) => Promise<void>;
  removeLecturer: (offeringId: number, lecturerId: number) => Promise<void>;
  addSlot: (slot: Omit<TimetableSlot, "slotId">) => void;
  updateSlot: (slotId: number, updated: Partial<TimetableSlot>) => void;
  deleteSlot: (slotId: number) => void;
}

const AcademicDataContext = createContext<AcademicDataContextType | undefined>(undefined);

function mapOfferingDto(dto: any): CourseOffering {
  const lecturerNames = dto.lecturerNames || (dto.primaryLecturerName ? [dto.primaryLecturerName] : []);
  const lecturerIds = dto.lecturerIds || (dto.primaryLecturerId ? [dto.primaryLecturerId] : []);
  return {
    offeringId: dto.offeringId,
    courseCode: dto.courseCode || "",
    courseTitle: dto.courseName || dto.courseTitle || "",
    departmentName: dto.departmentName || dto.department || "",
    batchName: dto.batchName || "",
    semesterName: dto.semesterName || dto.semesterLabel || "",
    lecturerIds: lecturerIds,
    lecturerNames: lecturerNames,
    enrollmentCount: dto.enrollmentCount ?? (dto.enrollments ? dto.enrollments.length : 0),
    capacity: dto.capacity ?? 50,
  };
}

function mapSlotDto(dto: any): TimetableSlot {
  return {
    slotId: dto.slotId,
    offeringId: dto.offeringId,
    courseCode: dto.courseCode || "",
    courseName: dto.courseName || "",
    dayOfWeek: dto.dayOfWeek || "",
    startTime: typeof dto.startTime === "string" ? dto.startTime : String(dto.startTime || ""),
    endTime: typeof dto.endTime === "string" ? dto.endTime : String(dto.endTime || ""),
    venue: dto.venue || "",
    slotType: dto.slotType || "Lecture",
    batchName: dto.batchName || "",
  };
}

export function AcademicDataProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const {
    data: rawOfferings = [],
    isLoading: isLoadingOfferings,
    isError: isErrorOfferings,
    error: offeringsError,
    refetch: refetchOfferings,
  } = useQuery({
    queryKey: ["courseOfferings"],
    queryFn: () => api.get<any[]>("/api/v1/course-offerings"),
    enabled: !!token,
  });

  const {
    data: rawSlots = [],
    isLoading: isLoadingSlots,
    isError: isErrorSlots,
    error: slotsError,
    refetch: refetchSlots,
  } = useQuery({
    queryKey: ["timetableSlots"],
    queryFn: () => api.get<any[]>("/api/v1/timetable-slots"),
    enabled: !!token,
  });

  const offerings: CourseOffering[] = Array.isArray(rawOfferings)
    ? rawOfferings.map(mapOfferingDto)
    : [];

  const slots: TimetableSlot[] = Array.isArray(rawSlots)
    ? rawSlots.map(mapSlotDto)
    : [];

  const addOfferingMutation = useMutation({
    mutationFn: (offeringData: Omit<CourseOffering, "offeringId">) =>
      api.post("/api/v1/course-offerings", offeringData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseOfferings"] });
    },
  });

  const addSlotMutation = useMutation({
    mutationFn: (slotData: Omit<TimetableSlot, "slotId">) =>
      api.post("/api/v1/timetable-slots", slotData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetableSlots"] });
    },
  });

  const updateSlotMutation = useMutation({
    mutationFn: ({ slotId, updated }: { slotId: number; updated: Partial<TimetableSlot> }) =>
      api.put(`/api/v1/timetable-slots/${slotId}`, updated),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetableSlots"] });
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: (slotId: number) => api.delete(`/api/v1/timetable-slots/${slotId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetableSlots"] });
    },
  });

  const addOffering = (offeringData: Omit<CourseOffering, "offeringId">) => {
    addOfferingMutation.mutate(offeringData);
  };

  // server wants the lecturer id in the URL; errors go back to the page
  const assignLecturer = async (offeringId: number, lecturerId: number, lecturerName: string) => {
    try {
      await api.post(`/api/v1/course-offerings/${offeringId}/lecturers/${lecturerId}`);
    } finally {
      queryClient.invalidateQueries({ queryKey: ["courseOfferings"] });
    }
  };

  const removeLecturer = async (offeringId: number, lecturerId: number) => {
    try {
      await api.delete(`/api/v1/course-offerings/${offeringId}/lecturers/${lecturerId}`);
    } finally {
      queryClient.invalidateQueries({ queryKey: ["courseOfferings"] });
    }
  };

  const addSlot = (slotData: Omit<TimetableSlot, "slotId">) => {
    addSlotMutation.mutate(slotData);
  };

  const updateSlot = (slotId: number, updated: Partial<TimetableSlot>) => {
    updateSlotMutation.mutate({ slotId, updated });
  };

  const deleteSlot = (slotId: number) => {
    deleteSlotMutation.mutate(slotId);
  };

  return (
    <AcademicDataContext.Provider
      value={{
        offerings,
        slots,
        isLoadingOfferings,
        isLoadingSlots,
        isErrorOfferings,
        isErrorSlots,
        offeringsError: (offeringsError as Error) || null,
        slotsError: (slotsError as Error) || null,
        refetchOfferings: () => { refetchOfferings(); },
        refetchSlots: () => { refetchSlots(); },
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
