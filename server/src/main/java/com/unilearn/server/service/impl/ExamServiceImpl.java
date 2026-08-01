package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.ExamRequest;
import com.unilearn.server.dto.request.exam.ExamFinalCreateRequestDTO;
import com.unilearn.server.dto.request.exam.ExamInClassCreateRequestDTO;
import com.unilearn.server.dto.response.ExamResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Exam;
import com.unilearn.server.model.TimetableSlot;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.ExamRepository;
import com.unilearn.server.repository.TimetableSlotRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.service.ExamService;
import com.unilearn.server.util.mapper.ExamMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final UserRepository userRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final ExamMapper examMapper;

    @Override
    @Transactional
    public ExamResponse createExam(ExamRequest request) {
        if (request == null) {
            throw new ValidationException("Exam request cannot be null");
        }

        LocalDate date = request.getExamDate() != null ? request.getExamDate() : (request.getScheduledAt() != null ? request.getScheduledAt().toLocalDate() : null);
        if (date != null && date.isBefore(LocalDate.now())) {
            throw new com.unilearn.server.exception.IllegalStateException("Exam date cannot be in the past");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        User scheduledBy = userRepository.findById(request.getScheduledById())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getScheduledById()));

        TimetableSlot slot = null;
        if (request.getLinkedSlotId() != null) {
            slot = timetableSlotRepository.findById(request.getLinkedSlotId())
                    .orElseThrow(() -> new EntryNotFoundException("TimetableSlot not found with ID: " + request.getLinkedSlotId()));
        }

        Exam exam = examMapper.toExam(request, offering, scheduledBy, slot);
        Exam saved = examRepository.save(exam);
        return examMapper.toExamResponse(saved);
    }

    @Override
    @Transactional
    public ExamResponse createFinalExam(ExamFinalCreateRequestDTO request) {
        if (request == null) {
            throw new ValidationException("Exam request cannot be null");
        }

        if (request.getExamDate() != null && request.getExamDate().isBefore(LocalDate.now())) {
            throw new com.unilearn.server.exception.IllegalStateException("Exam date cannot be in the past");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        User scheduledBy = userRepository.findById(request.getScheduledById())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getScheduledById()));

        Exam exam = examMapper.toFinalExam(request, offering, scheduledBy);
        Exam saved = examRepository.save(exam);
        return examMapper.toExamResponse(saved);
    }

    @Override
    @Transactional
    public ExamResponse createInClassExam(ExamInClassCreateRequestDTO request) {
        if (request == null) {
            throw new ValidationException("Exam request cannot be null");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        User scheduledBy = userRepository.findById(request.getScheduledById())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getScheduledById()));

        TimetableSlot slot = null;
        if (request.getLinkedSlotId() != null) {
            slot = timetableSlotRepository.findById(request.getLinkedSlotId())
                    .orElseThrow(() -> new EntryNotFoundException("TimetableSlot not found with ID: " + request.getLinkedSlotId()));
        }

        Exam exam = examMapper.toInClassExam(request, offering, scheduledBy, slot);
        Exam saved = examRepository.save(exam);
        return examMapper.toExamResponse(saved);
    }

    @Override
    @Transactional
    public ExamResponse updateExam(Long examId, ExamRequest request) {
        if (examId == null) {
            throw new ValidationException("Exam ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Exam request cannot be null");
        }

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new EntryNotFoundException("Exam not found with ID: " + examId));

        LocalDate date = request.getExamDate() != null ? request.getExamDate() : (request.getScheduledAt() != null ? request.getScheduledAt().toLocalDate() : null);
        if (date != null && date.isBefore(LocalDate.now())) {
            throw new com.unilearn.server.exception.IllegalStateException("Exam date cannot be in the past");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        User scheduledBy = userRepository.findById(request.getScheduledById())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getScheduledById()));

        TimetableSlot slot = null;
        if (request.getLinkedSlotId() != null) {
            slot = timetableSlotRepository.findById(request.getLinkedSlotId())
                    .orElseThrow(() -> new EntryNotFoundException("TimetableSlot not found with ID: " + request.getLinkedSlotId()));
        }

        LocalTime start = request.getStartTime() != null ? request.getStartTime() : (request.getScheduledAt() != null ? request.getScheduledAt().toLocalTime() : exam.getStartTime());
        LocalTime end = request.getEndTime() != null ? request.getEndTime() : start.plusMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : exam.getDurationMinutes());

        exam.setCourseOffering(offering);
        exam.setExamType(request.getExamType());
        exam.setScheduledBy(scheduledBy);
        exam.setLinkedSlot(slot);
        exam.setExamDate(date != null ? date : exam.getExamDate());
        exam.setStartTime(start);
        exam.setEndTime(end);
        exam.setVenue(request.getVenue());
        exam.setDurationMinutes(request.getDurationMinutes());
        if (request.getStatus() != null) {
            exam.setStatus(request.getStatus());
        }

        Exam updated = examRepository.save(exam);
        return examMapper.toExamResponse(updated);
    }

    @Override
    @Transactional
    public void deleteExam(Long examId) {
        if (examId == null) {
            throw new ValidationException("Exam ID cannot be null");
        }
        if (!examRepository.existsById(examId)) {
            throw new EntryNotFoundException("Exam not found with ID: " + examId);
        }
        examRepository.deleteById(examId);
    }

    @Override
    public ExamResponse getExamById(Long examId) {
        if (examId == null) {
            throw new ValidationException("Exam ID cannot be null");
        }
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new EntryNotFoundException("Exam not found with ID: " + examId));
        return examMapper.toExamResponse(exam);
    }

    @Override
    public List<ExamResponse> getExamsByOffering(Long offeringId) {
        if (offeringId == null) {
            throw new ValidationException("Offering ID cannot be null");
        }
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new EntryNotFoundException("CourseOffering not found with ID: " + offeringId);
        }

        return examRepository.findByCourseOffering_OfferingId(offeringId)
                .stream()
                .map(examMapper::toExamResponse)
                .toList();
    }

    @Override
    public List<com.unilearn.server.dto.response.exam.ExamListItemDTO> getExamListItemsByOffering(Long offeringId) {
        if (offeringId == null) {
            throw new ValidationException("Offering ID cannot be null");
        }
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new EntryNotFoundException("CourseOffering not found with ID: " + offeringId);
        }

        return examRepository.findByCourseOffering_OfferingId(offeringId)
                .stream()
                .map(examMapper::toExamListItemDTO)
                .toList();
    }
}
