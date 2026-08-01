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

import java.util.List;

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

        if (enrollmentRepository.existsByStudent_StudentIdAndCourseOffering_OfferingId(request.getStudentId(), request.getOfferingId())) {
            throw new com.unilearn.server.exception.DuplicateEntryException("Student is already enrolled in this course offering");
        }

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
    public void dropEnrollment(Long enrollmentId) {
        if (enrollmentId == null) {
            throw new ValidationException("Enrollment ID cannot be null");
        }
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new EntryNotFoundException("Enrollment not found with ID: " + enrollmentId));

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
}
