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
    private final com.unilearn.server.security.OwnershipValidator ownershipValidator;
    private final com.unilearn.server.repository.EnrollmentRepository enrollmentRepository;

    @Override
    @Transactional
    public ExamResponse createExam(ExamRequest request) {
        if (request == null) {
            throw new ValidationException("Exam request cannot be null");
        }
        ownershipValidator.checkLecturerOfferingAccess(request.getOfferingId());

        LocalDate date = request.getExamDate() != null ? request.getExamDate() : (request.getScheduledAt() != null ? request.getScheduledAt().toLocalDate() : null);
        if (date != null && date.isBefore(LocalDate.now())) {
            throw new com.unilearn.server.exception.IllegalStateException("Exam date cannot be in the past");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        User scheduledBy = resolveScheduledBy(request.getScheduledById());

        TimetableSlot slot = null;
        if (request.getLinkedSlotId() != null) {
            slot = timetableSlotRepository.findById(request.getLinkedSlotId())
                    .orElseThrow(() -> new EntryNotFoundException("TimetableSlot not found with ID: " + request.getLinkedSlotId()));
        }

        request.setExamType(normalizeExamType(request.getExamType()));
        if ("midterm_inclass".equals(request.getExamType()) && slot == null) {
            throw new ValidationException("A linked class slot is required for an in-class exam");
        }
        if ("final".equals(request.getExamType()) && date == null) {
            throw new ValidationException("Exam date is required for a final exam");
        }

        Exam exam = examMapper.toExam(request, offering, scheduledBy, slot);
        checkBatchClash(exam);
        Exam saved = examRepository.save(exam);
        return examMapper.toExamResponse(saved);
    }

    @Override
    @Transactional
    public ExamResponse createFinalExam(ExamFinalCreateRequestDTO request) {
        if (request == null) {
            throw new ValidationException("Exam request cannot be null");
        }
        ownershipValidator.checkLecturerOfferingAccess(request.getOfferingId());

        if (request.getExamDate() == null) {
            throw new ValidationException("Exam date is required for a final exam");
        }
        if (request.getExamDate().isBefore(LocalDate.now())) {
            throw new com.unilearn.server.exception.IllegalStateException("Exam date cannot be in the past");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        User scheduledBy = resolveScheduledBy(request.getScheduledById());

        Exam exam = examMapper.toFinalExam(request, offering, scheduledBy);
        checkBatchClash(exam);
        Exam saved = examRepository.save(exam);
        return examMapper.toExamResponse(saved);
    }

    @Override
    @Transactional
    public ExamResponse createInClassExam(ExamInClassCreateRequestDTO request) {
        if (request == null) {
            throw new ValidationException("Exam request cannot be null");
        }
        ownershipValidator.checkLecturerOfferingAccess(request.getOfferingId());

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        User scheduledBy = resolveScheduledBy(request.getScheduledById());

        if (request.getLinkedSlotId() == null) {
            throw new ValidationException("A linked class slot is required for an in-class exam");
        }
        TimetableSlot slot = timetableSlotRepository.findById(request.getLinkedSlotId())
                .orElseThrow(() -> new EntryNotFoundException("TimetableSlot not found with ID: " + request.getLinkedSlotId()));

        // the slot must be a class of this offering
        if (slot.getCourseOffering() == null || !offering.getOfferingId().equals(slot.getCourseOffering().getOfferingId())) {
            throw new ValidationException("The selected class slot does not belong to this course offering");
        }

        if (request.getExamDate() == null) {
            throw new ValidationException("Exam date is required for an in-class exam");
        }
        if (request.getExamDate().isBefore(LocalDate.now())) {
            throw new com.unilearn.server.exception.IllegalStateException("Exam date cannot be in the past");
        }

        // the date should fall on the same weekday as the slot (slot days are Mon, Tue ...)
        String slotDay = slot.getDayOfWeek();
        if (slotDay != null && slotDay.length() >= 3) {
            String dateDay = request.getExamDate().getDayOfWeek().name().substring(0, 3);
            if (!dateDay.equalsIgnoreCase(slotDay.substring(0, 3))) {
                throw new ValidationException("Exam date must be on a " + slotDay + " to match the selected class slot");
            }
        }

        Exam exam = examMapper.toInClassExam(request, offering, scheduledBy, slot);
        checkBatchClash(exam);
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

        if (exam.getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(exam.getCourseOffering().getOfferingId());
        }
        ownershipValidator.checkLecturerOfferingAccess(request.getOfferingId());

        LocalDate date = request.getExamDate() != null ? request.getExamDate() : (request.getScheduledAt() != null ? request.getScheduledAt().toLocalDate() : null);
        if (date != null && date.isBefore(LocalDate.now())) {
            throw new com.unilearn.server.exception.IllegalStateException("Exam date cannot be in the past");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        // keep who first scheduled it, the request can't change that
        User scheduledBy = exam.getScheduledBy() != null ? exam.getScheduledBy() : resolveScheduledBy(request.getScheduledById());

        TimetableSlot slot = null;
        if (request.getLinkedSlotId() != null) {
            slot = timetableSlotRepository.findById(request.getLinkedSlotId())
                    .orElseThrow(() -> new EntryNotFoundException("TimetableSlot not found with ID: " + request.getLinkedSlotId()));
        }

        LocalTime start = request.getStartTime() != null ? request.getStartTime() : (request.getScheduledAt() != null ? request.getScheduledAt().toLocalTime() : exam.getStartTime());
        LocalTime end = request.getEndTime() != null ? request.getEndTime() : start.plusMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : exam.getDurationMinutes());

        String examType = normalizeExamType(request.getExamType());
        // keep the old slot if the update doesn't send one
        if (slot == null && "midterm_inclass".equals(examType)) {
            slot = exam.getLinkedSlot();
            if (slot == null) {
                throw new ValidationException("A linked class slot is required for an in-class exam");
            }
        }

        exam.setCourseOffering(offering);
        exam.setExamType(examType);
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
        if ("final".equals(examType) && exam.getExamDate() == null) {
            throw new ValidationException("Exam date is required for a final exam");
        }
        checkBatchClash(exam);

        Exam updated = examRepository.save(exam);
        return examMapper.toExamResponse(updated);
    }

    @Override
    @Transactional
    public void deleteExam(Long examId) {
        if (examId == null) {
            throw new ValidationException("Exam ID cannot be null");
        }
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new EntryNotFoundException("Exam not found with ID: " + examId));

        if (exam.getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(exam.getCourseOffering().getOfferingId());
        }

        examRepository.delete(exam);
    }

    @Override
    public ExamResponse getExamById(Long examId) {
        if (examId == null) {
            throw new ValidationException("Exam ID cannot be null");
        }
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new EntryNotFoundException("Exam not found with ID: " + examId));

        if (exam.getCourseOffering() != null) {
            Long offId = exam.getCourseOffering().getOfferingId();
            if (ownershipValidator.isLecturer()) {
                ownershipValidator.checkLecturerOfferingAccess(offId);
            } else if (ownershipValidator.isStudent()) {
                var currentUser = ownershipValidator.getCurrentUser();
                if (currentUser.isPresent() && !enrollmentRepository.existsByStudent_StudentIdAndCourseOffering_OfferingId(currentUser.get().getUserId(), offId)) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not enrolled in this course offering");
                }
            }
        }

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

        if (ownershipValidator.isLecturer()) {
            ownershipValidator.checkLecturerOfferingAccess(offeringId);
        } else if (ownershipValidator.isStudent()) {
            var currentUser = ownershipValidator.getCurrentUser();
            if (currentUser.isPresent() && !enrollmentRepository.existsByStudent_StudentIdAndCourseOffering_OfferingId(currentUser.get().getUserId(), offeringId)) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not enrolled in this course offering");
            }
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

        if (ownershipValidator.isLecturer()) {
            ownershipValidator.checkLecturerOfferingAccess(offeringId);
        } else if (ownershipValidator.isStudent()) {
            var currentUser = ownershipValidator.getCurrentUser();
            if (currentUser.isPresent() && !enrollmentRepository.existsByStudent_StudentIdAndCourseOffering_OfferingId(currentUser.get().getUserId(), offeringId)) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not enrolled in this course offering");
            }
        }

        return examRepository.findByCourseOffering_OfferingId(offeringId)
                .stream()
                .map(examMapper::toExamListItemDTO)
                .toList();
    }

    // use the logged in user, fall back to the id in the request
    private User resolveScheduledBy(Long requestedId) {
        User current = ownershipValidator.getCurrentUser().orElse(null);
        if (current != null) {
            return current;
        }
        if (requestedId == null) {
            throw new ValidationException("Scheduled by user is required");
        }
        return userRepository.findById(requestedId)
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + requestedId));
    }

    // a batch can't sit two exams at the same time on the same day
    private void checkBatchClash(Exam exam) {
        if (exam.getExamDate() == null || exam.getStartTime() == null || exam.getEndTime() == null) {
            return;
        }
        if ("cancelled".equalsIgnoreCase(exam.getStatus())) {
            return;
        }
        CourseOffering offering = exam.getCourseOffering();
        if (offering == null || offering.getBatch() == null || offering.getBatch().getBatchId() == null) {
            return;
        }
        Long batchId = offering.getBatch().getBatchId();

        for (Exam other : examRepository.findByExamDate(exam.getExamDate())) {
            // skip the exam we are editing
            if (exam.getExamId() != null && exam.getExamId().equals(other.getExamId())) {
                continue;
            }
            if ("cancelled".equalsIgnoreCase(other.getStatus())) {
                continue;
            }
            CourseOffering otherOffering = other.getCourseOffering();
            if (otherOffering == null || otherOffering.getBatch() == null
                    || !batchId.equals(otherOffering.getBatch().getBatchId())) {
                continue;
            }
            if (other.getStartTime() == null || other.getEndTime() == null) {
                continue;
            }
            boolean overlaps = exam.getStartTime().isBefore(other.getEndTime())
                    && exam.getEndTime().isAfter(other.getStartTime());
            if (overlaps) {
                String code = otherOffering.getCourse() != null ? otherOffering.getCourse().getCode() : "another course";
                throw new ValidationException("Exam clash: this batch already has the " + code + " exam (#"
                        + other.getExamId() + ") on " + other.getExamDate() + " from "
                        + other.getStartTime() + " to " + other.getEndTime());
            }
        }
    }

    // only 'final' and 'midterm_inclass' are allowed in the database
    private String normalizeExamType(String examType) {
        if (examType == null || examType.isBlank()) {
            throw new ValidationException("Exam type is required");
        }
        String type = examType.trim().toLowerCase().replace('-', '_').replace(' ', '_');
        if (type.equals("final")) {
            return "final";
        }
        if (type.equals("midterm_inclass") || type.equals("in_class") || type.equals("inclass") || type.equals("midterm")) {
            return "midterm_inclass";
        }
        throw new ValidationException("Exam type must be 'final' or 'midterm_inclass'");
    }

    @Override
    public List<ExamResponse> getAllExams() {
        return examRepository.findAll()
                .stream()
                .map(examMapper::toExamResponse)
                .toList();
    }
}
