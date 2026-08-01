package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.ExamRequest;
import com.unilearn.server.dto.request.exam.ExamFinalCreateRequestDTO;
import com.unilearn.server.dto.request.exam.ExamInClassCreateRequestDTO;
import com.unilearn.server.dto.response.ExamResponse;
import com.unilearn.server.dto.response.exam.ExamListItemDTO;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Exam;
import com.unilearn.server.model.TimetableSlot;
import com.unilearn.server.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;

@Component
public class ExamMapper {

    public Exam toExam(ExamRequest request, CourseOffering offering, User scheduledBy, TimetableSlot slot) {
        if (request == null) {
            throw new ValidationException("Exam request cannot be null");
        }
        LocalDate date = request.getExamDate() != null ? request.getExamDate() : (request.getScheduledAt() != null ? request.getScheduledAt().toLocalDate() : LocalDate.now());
        LocalTime start = request.getStartTime() != null ? request.getStartTime() : (request.getScheduledAt() != null ? request.getScheduledAt().toLocalTime() : LocalTime.of(9, 0));
        LocalTime end = request.getEndTime() != null ? request.getEndTime() : start.plusMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 120);

        return Exam.builder()
                .courseOffering(offering)
                .examType(request.getExamType())
                .scheduledBy(scheduledBy)
                .linkedSlot(slot)
                .examDate(date)
                .startTime(start)
                .endTime(end)
                .venue(request.getVenue())
                .durationMinutes(request.getDurationMinutes())
                .status(request.getStatus() != null ? request.getStatus() : "published")
                .build();
    }

    public Exam toFinalExam(ExamFinalCreateRequestDTO request, CourseOffering offering, User scheduledBy) {
        if (request == null) {
            throw new ValidationException("Exam request cannot be null");
        }
        LocalDate date = request.getExamDate() != null ? request.getExamDate() : LocalDate.now();
        LocalTime start = request.getStartTime() != null ? request.getStartTime() : LocalTime.of(9, 0);
        LocalTime end = request.getEndTime() != null ? request.getEndTime() : start.plusMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 120);

        return Exam.builder()
                .courseOffering(offering)
                .examType("final")
                .scheduledBy(scheduledBy)
                .examDate(date)
                .startTime(start)
                .endTime(end)
                .venue(request.getVenue())
                .durationMinutes(request.getDurationMinutes())
                .status("published")
                .build();
    }

    public Exam toInClassExam(ExamInClassCreateRequestDTO request, CourseOffering offering, User scheduledBy, TimetableSlot slot) {
        if (request == null) {
            throw new ValidationException("Exam request cannot be null");
        }
        return Exam.builder()
                .courseOffering(offering)
                .examType("in_class")
                .scheduledBy(scheduledBy)
                .linkedSlot(slot)
                .durationMinutes(request.getDurationMinutes())
                .status("published")
                .build();
    }

    public ExamResponse toExamResponse(Exam exam) {
        if (exam == null) {
            throw new ValidationException("Exam cannot be null");
        }
        return ExamResponse.builder()
                .examId(exam.getExamId())
                .offeringId(exam.getCourseOffering() != null ? exam.getCourseOffering().getOfferingId() : null)
                .courseCode(exam.getCourseOffering() != null && exam.getCourseOffering().getCourse() != null ? exam.getCourseOffering().getCourse().getCode() : null)
                .examType(exam.getExamType())
                .scheduledAt(exam.getExamDate() != null && exam.getStartTime() != null ? exam.getExamDate().atTime(exam.getStartTime()) : null)
                .examDate(exam.getExamDate())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .durationMinutes(exam.getDurationMinutes())
                .venue(exam.getVenue())
                .linkedSlotId(exam.getLinkedSlot() != null ? exam.getLinkedSlot().getSlotId() : null)
                .status(exam.getStatus())
                .scheduledById(exam.getScheduledBy() != null ? exam.getScheduledBy().getUserId() : null)
                .scheduledByName(exam.getScheduledBy() != null ? exam.getScheduledBy().getFullName() : null)
                .examAttempts(Collections.emptyList())
                .examResults(Collections.emptyList())
                .build();
    }

    public ExamListItemDTO toExamListItemDTO(Exam exam) {
        if (exam == null) {
            throw new ValidationException("Exam cannot be null");
        }
        String courseName = exam.getCourseOffering() != null && exam.getCourseOffering().getCourse() != null ? exam.getCourseOffering().getCourse().getTitle() : null;
        return ExamListItemDTO.builder()
                .examId(exam.getExamId())
                .examType(exam.getExamType())
                .offeringCourseName(courseName)
                .examDate(exam.getExamDate())
                .venue(exam.getVenue())
                .status(exam.getStatus())
                .build();
    }
}
