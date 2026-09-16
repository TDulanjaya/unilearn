package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.enrollment.EnrollmentCreateRequestDTO;
import com.unilearn.server.dto.response.EnrollmentResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Enrollment;
import com.unilearn.server.model.Student;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.EnrollmentRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.service.EnrollmentService;
import com.unilearn.server.util.mapper.EnrollmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final EnrollmentMapper enrollmentMapper;

    @Override
    @Transactional
    public EnrollmentResponse enrollStudent(EnrollmentCreateRequestDTO request) {
        if (request == null) {
            throw new ValidationException("Enrollment request cannot be null");
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + request.getStudentId()));

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        // Prevent duplicate enrollments
        if (enrollmentRepository.existsByStudent_StudentIdAndCourseOffering_OfferingId(request.getStudentId(), request.getOfferingId())) {
            throw new com.unilearn.server.exception.DuplicateEntryException("Student is already enrolled in this course offering");
        }

        if (offering.getBatch() != null && student.getBatch() != null
                && !offering.getBatch().getBatchId().equals(student.getBatch().getBatchId())) {
            throw new ValidationException("Student's batch does not match this course offering's batch");
        }

        // Check capacity limit
        if (offering.getCapacity() != null) {
            long currentCount = courseOfferingRepository.countEnrollmentsByOfferingId(request.getOfferingId());
            if (currentCount >= offering.getCapacity()) {
                throw new com.unilearn.server.exception.IllegalStateException("Course offering capacity has been reached");
            }
        }

        Enrollment enrollment = enrollmentMapper.toEnrollment(request, student, offering);
        Enrollment saved = enrollmentRepository.save(enrollment);
        return enrollmentMapper.toEnrollmentResponse(saved);
    }

    @Override
    @Transactional
    public void dropEnrollment(Long enrollmentId, Long currentUserId) {
        if (enrollmentId == null) {
            throw new ValidationException("Enrollment ID cannot be null");
        }
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new EntryNotFoundException("Enrollment not found with ID: " + enrollmentId));

        if (currentUserId != null && enrollment.getStudent() != null
                && !currentUserId.equals(enrollment.getStudent().getStudentId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: Enrollment belongs to another student");
        }

        enrollment.setStatus("dropped");
        enrollmentRepository.save(enrollment);
    }

    @Override
    public List<EnrollmentResponse> getEnrollmentsByStudent(Long studentId) {
        if (studentId == null) {
            throw new ValidationException("Student ID cannot be null");
        }
        if (!studentRepository.existsById(studentId)) {
            throw new EntryNotFoundException("Student not found with ID: " + studentId);
        }

        return enrollmentRepository.findByStudent_StudentId(studentId)
                .stream()
                .map(enrollmentMapper::toEnrollmentResponse)
                .toList();
    }

    @Override
    public PageResponseDTO<EnrollmentResponse> getEnrollmentsByOffering(Long offeringId, Pageable pageable) {
        if (offeringId == null) {
            throw new ValidationException("Offering ID cannot be null");
        }
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new EntryNotFoundException("CourseOffering not found with ID: " + offeringId);
        }

        Page<Enrollment> page = enrollmentRepository.findByCourseOffering_OfferingId(offeringId, pageable);
        List<EnrollmentResponse> content = page.getContent()
                .stream()
                .map(enrollmentMapper::toEnrollmentResponse)
                .toList();

        return PageResponseDTO.<EnrollmentResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }

    @Override
    @Transactional
    public EnrollmentResponse updateStatus(Long enrollmentId, String status) {
        if (enrollmentId == null) {
            throw new ValidationException("Enrollment ID cannot be null");
        }
        if (status == null || status.isBlank()) {
            throw new ValidationException("Status cannot be empty");
        }

        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new EntryNotFoundException("Enrollment not found with ID: " + enrollmentId));

        enrollment.setStatus(status);
        Enrollment updated = enrollmentRepository.save(enrollment);
        return enrollmentMapper.toEnrollmentResponse(updated);
    }

    @Override
    @Transactional
    public Map<String, Object> enrollBatch(Long batchId, Long offeringId) {
        if (offeringId == null) {
            throw new ValidationException("Offering ID is required");
        }
        return enrollBatchIntoOneOffering(batchId, offeringId);
    }

    @Override
    @Transactional
    public Map<String, Object> enrollBatchMultiple(Long batchId, List<Long> offeringIds) {
        if (batchId == null) {
            throw new ValidationException("Batch ID is required");
        }
        if (offeringIds == null || offeringIds.isEmpty()) {
            throw new ValidationException("At least one offering ID is required");
        }

        // Remove any duplicates while keeping selection order
        List<Long> distinctOfferingIds = offeringIds.stream().distinct().toList();

        List<Map<String, Object>> perOffering = new ArrayList<>();
        int totalStudents = 0;
        int newlyEnrolled = 0;
        int alreadyEnrolled = 0;
        int skippedCapacity = 0;

        for (Long offeringId : distinctOfferingIds) {
            Map<String, Object> result = enrollBatchIntoOneOffering(batchId, offeringId);
            perOffering.add(result);
            totalStudents = Math.max(totalStudents, (int) result.getOrDefault("totalStudents", 0));
            newlyEnrolled += (int) result.getOrDefault("newlyEnrolled", 0);
            alreadyEnrolled += (int) result.getOrDefault("alreadyEnrolled", 0);
            skippedCapacity += (int) result.getOrDefault("skippedCapacity", 0);
        }

        String message = distinctOfferingIds.size() == 1
                ? (String) perOffering.get(0).get("message")
                : String.format("Enrolled batch into %d offering(s): %d newly enrolled, %d already enrolled%s",
                        distinctOfferingIds.size(), newlyEnrolled, alreadyEnrolled,
                        skippedCapacity > 0 ? String.format(", %d skipped (capacity)", skippedCapacity) : "");

        Map<String, Object> aggregate = new LinkedHashMap<>();
        aggregate.put("totalOfferings", distinctOfferingIds.size());
        aggregate.put("totalStudents", totalStudents);
        aggregate.put("newlyEnrolled", newlyEnrolled);
        aggregate.put("alreadyEnrolled", alreadyEnrolled);
        aggregate.put("skippedCapacity", skippedCapacity);
        aggregate.put("message", message);
        aggregate.put("perOffering", perOffering);
        return aggregate;
    }

    // Helper to enroll all students of a batch into one offering with capacity check
    private Map<String, Object> enrollBatchIntoOneOffering(Long batchId, Long offeringId) {
        if (batchId == null || offeringId == null) {
            throw new ValidationException("Batch ID and Offering ID are required");
        }

        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new EntryNotFoundException("Course Offering not found with ID: " + offeringId));

        List<Student> students = studentRepository.findByBatch_BatchId(batchId);
        String courseLabel = offering.getCourse() != null ? offering.getCourse().getCode() : "offering #" + offeringId;

        if (students.isEmpty()) {
            Map<String, Object> empty = new LinkedHashMap<>();
            empty.put("offeringId", offeringId);
            empty.put("courseLabel", courseLabel);
            empty.put("totalStudents", 0);
            empty.put("newlyEnrolled", 0);
            empty.put("alreadyEnrolled", 0);
            empty.put("skippedCapacity", 0);
            empty.put("message", "No students found in the selected batch.");
            return empty;
        }

        long currentCount = offering.getCapacity() != null
                ? courseOfferingRepository.countEnrollmentsByOfferingId(offeringId)
                : 0;

        int newlyEnrolled = 0;
        int alreadyEnrolled = 0;
        int skippedCapacity = 0;

        for (Student student : students) {
            // Skip if student is already in this offering
            if (enrollmentRepository.existsByStudent_StudentIdAndCourseOffering_OfferingId(student.getStudentId(), offeringId)) {
                alreadyEnrolled++;
                continue;
            }

            // Stop enrolling if class is full
            if (offering.getCapacity() != null && currentCount >= offering.getCapacity()) {
                skippedCapacity++;
                continue;
            }

            Enrollment enrollment = Enrollment.builder()
                    .student(student)
                    .courseOffering(offering)
                    .enrollmentDate(java.time.LocalDate.now())
                    .status("active")
                    .build();
            enrollmentRepository.save(enrollment);
            newlyEnrolled++;
            currentCount++;
        }

        String message = skippedCapacity > 0
                ? String.format("Enrolled %d student(s) into %s (already enrolled: %d, skipped — capacity reached: %d)",
                        newlyEnrolled, courseLabel, alreadyEnrolled, skippedCapacity)
                : String.format("Successfully enrolled %d student(s) into %s (Already enrolled: %d)",
                        newlyEnrolled, courseLabel, alreadyEnrolled);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("offeringId", offeringId);
        result.put("courseLabel", courseLabel);
        result.put("totalStudents", students.size());
        result.put("newlyEnrolled", newlyEnrolled);
        result.put("alreadyEnrolled", alreadyEnrolled);
        result.put("skippedCapacity", skippedCapacity);
        result.put("message", message);
        return result;
    }
}
