import {
  Course,
  MaterialItem,
  Assignment,
  MCQQuestion,
  StructuredQA,
  Resource,
} from "@/types/course";

export const COURSES: Record<string, Course> = {};

export const INITIAL_MATERIALS: MaterialItem[] = [];

export const INITIAL_ASSIGNMENTS: Assignment[] = [];

export const MCQ_BANKS: Record<string, MCQQuestion[]> = {};

export const STRUCTURED_BANKS: Record<string, StructuredQA[]> = {};

export const INITIAL_RESOURCES: Resource[] = [];
