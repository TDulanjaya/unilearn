package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.ExaminerRequest;
import com.unilearn.server.dto.response.ExaminerResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Exam;
import com.unilearn.server.model.Examiner;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.repository.ExamRepository;
import com.unilearn.server.repository.ExaminerRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.service.ExaminerService;
import com.unilearn.server.util.mapper.ExaminerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExaminerServiceImpl implements ExaminerService {

    private final ExaminerRepository examinerRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ExamRepository examRepository;
    private final ExaminerMapper examinerMapper;

    @Override
    @Transactional
    public ExaminerResponse createExaminer(ExaminerRequest request) {
        if (request == null) {
            throw new ValidationException("Examiner request cannot be null");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getUserId()));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        Examiner examiner = examinerMapper.toExaminer(request, user, department);
        Examiner saved = examinerRepository.save(examiner);
        return examinerMapper.toExaminerResponse(saved);
    }

    @Override
    @Transactional
    public ExaminerResponse updateExaminer(Long examinerId, ExaminerRequest request) {
        if (examinerId == null) {
            throw new ValidationException("Examiner ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Examiner request cannot be null");
        }

        Examiner examiner = examinerRepository.findById(examinerId)
                .orElseThrow(() -> new EntryNotFoundException("Examiner not found with ID: " + examinerId));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        examiner.setDepartment(department);

        Examiner updated = examinerRepository.save(examiner);
        return examinerMapper.toExaminerResponse(updated);
    }

    @Override
    @Transactional
    public void deleteExaminer(Long examinerId) {
        if (examinerId == null) {
            throw new ValidationException("Examiner ID cannot be null");
        }
        if (!examinerRepository.existsById(examinerId)) {
            throw new EntryNotFoundException("Examiner not found with ID: " + examinerId);
        }
        examinerRepository.deleteById(examinerId);
    }

    @Override
    public ExaminerResponse getExaminerById(Long examinerId) {
        if (examinerId == null) {
            throw new ValidationException("Examiner ID cannot be null");
        }
        Examiner examiner = examinerRepository.findById(examinerId)
                .orElseThrow(() -> new EntryNotFoundException("Examiner not found with ID: " + examinerId));
        return examinerMapper.toExaminerResponse(examiner);
    }

    @Override
    public List<ExaminerResponse> getExaminersByDepartment(Long departmentId) {
        if (departmentId == null) {
            throw new ValidationException("Department ID cannot be null");
        }
        if (!departmentRepository.existsById(departmentId)) {
            throw new EntryNotFoundException("Department not found with ID: " + departmentId);
        }

        return examinerRepository.findByDepartment_DepartmentId(departmentId)
                .stream()
                .map(examinerMapper::toExaminerResponse)
                .toList();
    }

    @Override
    @Transactional
    public void assignExaminerToExam(Long examinerId, Long examId) {
        if (examinerId == null || examId == null) {
            throw new ValidationException("Examiner ID and Exam ID cannot be null");
        }

        Examiner examiner = examinerRepository.findById(examinerId)
                .orElseThrow(() -> new EntryNotFoundException("Examiner not found with ID: " + examinerId));

        Exam targetExam = examRepository.findById(examId)
                .orElseThrow(() -> new EntryNotFoundException("Exam not found with ID: " + examId));

        List<Exam> assignedExams = examRepository.findAll().stream()
                .filter(e -> e.getExaminer() != null && e.getExaminer().getExaminerId().equals(examinerId))
                .toList();

        if (targetExam.getExamDate() != null && targetExam.getStartTime() != null && targetExam.getEndTime() != null) {
            LocalDateTime targetStart = LocalDateTime.of(targetExam.getExamDate(), targetExam.getStartTime());
            LocalDateTime targetEnd = LocalDateTime.of(targetExam.getExamDate(), targetExam.getEndTime());

            for (Exam existing : assignedExams) {
                if (existing.getExamDate() != null && existing.getStartTime() != null && existing.getEndTime() != null) {
                    LocalDateTime existingStart = LocalDateTime.of(existing.getExamDate(), existing.getStartTime());
                    LocalDateTime existingEnd = LocalDateTime.of(existing.getExamDate(), existing.getEndTime());

                    if (targetStart.isBefore(existingEnd) && targetEnd.isAfter(existingStart)) {
                        throw new com.unilearn.server.exception.IllegalStateException("Examiner is already assigned to an overlapping exam");
                    }
                }
            }
        }

        targetExam.setExaminer(examiner);
        examRepository.save(targetExam);
    }
}
