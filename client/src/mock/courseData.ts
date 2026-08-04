import {
  Course,
  MaterialItem,
  Assignment,
  MCQQuestion,
  StructuredQA,
  Resource,
} from "@/types/course";

export const COURSES: Record<string, Course> = {
  "1": { code: "SE308.3", title: "Software Process Management", lecturer: "Dr. K. Perera", dept: "Software Eng.", progress: 75 },
  "2": { code: "SE202.2", title: "Database Systems", lecturer: "Dr. M. Rathnayake", dept: "Computer Science", progress: 90 },
  "3": { code: "SE309.3", title: "Software Verification & Validation", lecturer: "Prof. A. Fernando", dept: "Software Eng.", progress: 50 },
};

export const INITIAL_MATERIALS: MaterialItem[] = [
  {
    id: 1,
    title: "Lecture 01 — Introduction to Software Processes",
    type: "PDF",
    module: "Module 1",
    date: "Jul 10, 2026",
    size: "2.4 MB",
    summary: "Overview of software engineering process life cycles, classic waterfall vs evolutionary models.",
    attachments: [
      { id: 101, title: "Lecture 01 Presentation Slides", type: "PDF", size: "2.4 MB", summary: "Official slides covering SDLC life cycles." },
      { id: 102, title: "Lecture 01 Recorded Video Session", type: "VIDEO", size: "140 MB", linkUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", summary: "Full video recording of the introduction session." },
      { id: 103, title: "SDLC Comparison Matrix & Worksheet", type: "DOCX", size: "1.1 MB", summary: "Class activity worksheet comparing Agile, Waterfall, and Spiral models." },
      { id: 104, title: "IEEE Software Engineering Standards Handbook", type: "LINK", size: "Web Link", linkUrl: "https://ieee.org", summary: "Direct link to IEEE software engineering standards portal." },
    ]
  },
  { id: 2, title: "Lecture 02 — CMMI & Process Maturity Models", type: "PDF", module: "Module 1", date: "Jul 17, 2026", size: "3.1 MB", summary: "Capability Maturity Model Integration (CMMI) levels 1 through 5 and process assessment frameworks." },
  { id: 3, title: "Tutorial 01 — SDLC Comparison Worksheet", type: "DOCX", module: "Module 2", date: "Jul 20, 2026", size: "1.1 MB", summary: "Hands-on comparison exercise evaluating Agile vs Spiral vs V-Model for critical embedded systems." },
  { id: 4, title: "Lecture 03 — Agile Frameworks & Scrum", type: "PPTX", module: "Module 2", date: "Jul 24, 2026", size: "5.8 MB", summary: "Scrum roles, sprint planning, daily stand-up dynamics, velocity tracking, and retrospective best practices." },
  { id: 5, title: "Lecture Video — Agile Ceremonies & Sprint Dynamics (Recorded Session)", type: "VIDEO", module: "Module 2", date: "Jul 26, 2026", size: "185 MB", summary: "Recording of the live lecture on Scrum ceremonies, velocity metrics, and burndown chart analysis.", linkUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { id: 6, title: "Lecture 04 — Software Verification & Metrics", type: "PDF", module: "Module 3", date: "Jul 31, 2026", size: "4.2 MB", summary: "Static analysis, code coverage metrics, and defect density estimations." },
  { id: 7, title: "External Reference — IEEE Standard for Software Test Documentation (IEEE 829)", type: "LINK", module: "Module 3", date: "Aug 01, 2026", size: "External Web Link", summary: "Industry standard specification guidelines for software test plans, test design specifications, and test incident reports.", linkUrl: "https://ieee.org" },
  { id: 8, title: "Lab Exercises & Code Artifacts Starter Package", type: "ZIP", module: "Module 3", date: "Aug 02, 2026", size: "12.5 MB", summary: "JUnit test suite starter templates, sample code bases, and automated build scripts." },
  { id: 9, title: "Course Syllabus & Assessment Policies", type: "TXT", module: "Module 1", date: "Jul 08, 2026", size: "18 KB", summary: "Official course policy, grading rubric breakdown, and assignment submission deadlines." },
  { id: 10, title: "Effort Estimation & Function Point Model Sheet", type: "XLSX", module: "Module 2", date: "Jul 25, 2026", size: "850 KB", summary: "Spreadsheet template for calculating function points, COCOMO II estimations, and team velocity." },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  { 
    id: 1, 
    title: "Assignment 1: SDLC Case Study Analysis", 
    due: "Aug 05, 2026", 
    status: "Submitted", 
    grade: "A-", 
    maxScore: 100,
    description: "Analyze the attached case study for HealthPlus EHR system. Select an appropriate software process model and justify your architectural choice with risk assessment matrices.",
    submittedFile: "Nadeesha_Silva_SDLC_CaseStudy_v2.pdf",
    submittedAt: "Aug 03, 2026 10:14 AM",
    feedback: "Excellent depth in risk identification and trade-off analysis. Minor omission in sprint retrospective cadence.",
    attempts: [
      { version: 1, fileName: "Nadeesha_Silva_SDLC_Draft1.pdf", timestamp: "Aug 01, 2026 04:20 PM", status: "Draft", notes: "Initial rough layout" },
      { version: 2, fileName: "Nadeesha_Silva_SDLC_CaseStudy_v2.pdf", timestamp: "Aug 03, 2026 10:14 AM", status: "Submitted", notes: "Final submission with risk matrix" },
    ]
  },
  { 
    id: 2, 
    title: "Assignment 2: Test Case Design Document", 
    due: "Aug 18, 2026", 
    status: "Draft", 
    grade: null, 
    maxScore: 100,
    description: "Formulate a comprehensive test suite using boundary value analysis and equivalence partitioning for the online banking transaction module.",
    attempts: [
      { version: 1, fileName: "Draft_Banking_TestCases.docx", timestamp: "Aug 04, 2026 09:10 AM", status: "Draft", notes: "Outline draft saved" }
    ]
  },
  { 
    id: 3, 
    title: "Lab Report: Unit Testing with JUnit", 
    due: "Jul 28, 2026", 
    status: "Graded", 
    grade: "B+", 
    maxScore: 100,
    description: "Implement automated unit tests with JUnit 5 and Mockito for the payment gateway service with at least 85% branch coverage.",
    submittedFile: "JUnit_LabReport_Nadeesha.zip",
    submittedAt: "Jul 27, 2026 04:45 PM",
    feedback: "Good coverage metrics and test isolation. Code formatting could be cleaned up in test fixture classes.",
    attempts: [
      { version: 1, fileName: "JUnit_LabReport_Nadeesha.zip", timestamp: "Jul 27, 2026 04:45 PM", status: "Graded", notes: "Submitted on time" }
    ]
  },
  {
    id: 4,
    title: "Refinement Project — Architecture Review",
    due: "Jul 20, 2026",
    status: "Late",
    grade: "B-",
    maxScore: 100,
    description: "Submit late post-deadline architecture review document.",
    submittedFile: "Late_Arch_Review.pdf",
    submittedAt: "Jul 22, 2026 08:30 AM",
    attempts: [
      { version: 1, fileName: "Late_Arch_Review.pdf", timestamp: "Jul 22, 2026 08:30 AM", status: "Late", notes: "Submitted 2 days after deadline" }
    ]
  }
];

export const MCQ_BANKS: Record<string, MCQQuestion[]> = {
  "SE308.3": [
    { id: 1, question: "What is the primary goal of black-box testing?", options: ["To test internal implementation logic", "To verify functionality against software requirements", "To measure code coverage metrics", "To optimize memory usage"], correctIndex: 1 },
    { id: 2, question: "Which SDLC model incorporates risk analysis in every iteration?", options: ["Waterfall Model", "V-Model", "Spiral Model", "Big Bang Model"], correctIndex: 2 },
    { id: 3, question: "In Agile methodology, what is a Sprint Backlog?", options: ["List of all product features requested by customer", "Set of tasks selected for the current iteration", "Log of all fixed software bugs", "Documentation of software architecture"], correctIndex: 1 },
  ],
  "SE202.2": [
    { id: 1, question: "What does ACID stand for in database transactions?", options: ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Integrity, Design", "Atomicity, Concurrency, Isolation, Design", "Access, Consistency, Integrity, Durability"], correctIndex: 0 },
    { id: 2, question: "Which normal form eliminates transitive dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], correctIndex: 2 },
    { id: 3, question: "What type of join returns all rows from both tables?", options: ["INNER JOIN", "LEFT JOIN", "FULL OUTER JOIN", "CROSS JOIN"], correctIndex: 2 },
  ],
  "SE309.3": [
    { id: 1, question: "What is boundary value analysis?", options: ["Testing random inputs", "Testing values at the edges of input ranges", "Testing all possible inputs", "Testing only valid inputs"], correctIndex: 1 },
    { id: 2, question: "Which testing level verifies interactions between integrated modules?", options: ["Unit testing", "Integration testing", "System testing", "Acceptance testing"], correctIndex: 1 },
    { id: 3, question: "What is mutation testing?", options: ["Testing UI changes", "Introducing small faults to evaluate test effectiveness", "Testing database mutations", "Testing API endpoints"], correctIndex: 1 },
  ],
};

export const STRUCTURED_BANKS: Record<string, StructuredQA[]> = {
  "SE308.3": [
    { id: 1, question: "Explain the difference between Verification and Validation in software quality assurance.", answer: "Verification checks whether software is built according to specified requirements ('Are we building the product right?'). Validation checks whether software fulfills customer needs ('Are we building the right product?')." },
    { id: 2, question: "Define Code Coverage and state two common types.", answer: "Code Coverage measures the degree to which source code is executed when a test suite runs. Two common types are Statement Coverage and Branch/Decision Coverage." },
  ],
  "SE202.2": [
    { id: 1, question: "What is database normalization and why is it important?", answer: "Database normalization organizes data to reduce redundancy and improve data integrity. It decomposes tables into smaller, well-structured tables linked by relationships." },
    { id: 2, question: "Explain the difference between clustered and non-clustered indexes.", answer: "A clustered index determines the physical order of data in a table (one per table). A non-clustered index creates a separate structure pointing to data rows (multiple allowed)." },
  ],
  "SE309.3": [
    { id: 1, question: "What is equivalence partitioning?", answer: "Equivalence partitioning divides input data into groups (partitions) where all values in a partition are expected to behave the same way, reducing the number of test cases needed." },
    { id: 2, question: "Explain the concept of test coverage criteria.", answer: "Test coverage criteria define measurable goals for testing completeness, such as statement coverage, branch coverage, and path coverage, helping determine when testing is sufficient." },
  ],
};

export const INITIAL_RESOURCES: Resource[] = [
  { id: 1, fileName: "Chapter4_Notes.pdf", uploadedAt: "Jul 28, 2026" },
  { id: 2, fileName: "PastPaper_2025_Final.pdf", uploadedAt: "Jul 30, 2026" },
  { id: 3, fileName: "StudyGuide_Midterm.pdf", uploadedAt: "Aug 01, 2026" },
];
