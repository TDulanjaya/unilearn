package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.StudentRequest;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.StudentResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Batch;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Student;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.BatchRepository;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.repository.EnrollmentRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.service.StudentService;
import com.unilearn.server.util.mapper.StudentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final BatchRepository batchRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentMapper studentMapper;
    private final com.unilearn.server.security.OwnershipValidator ownershipValidator;

    @Override
    @Transactional
    public StudentResponse createStudent(StudentRequest request) {
        if (request == null) {
            throw new ValidationException("Student request cannot be null");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getUserId()));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new EntryNotFoundException("Batch not found with ID: " + request.getBatchId()));

        if (studentRepository.existsByStudentNo(request.getStudentNo())) {
            throw new com.unilearn.server.exception.DuplicateEntryException("Student number already exists: " + request.getStudentNo());
        }

        Student student = studentMapper.toStudent(request, user, department, batch);
        Student saved = studentRepository.save(student);
        return studentMapper.toStudentResponse(saved);
    }

    @Override
    @Transactional
    public StudentResponse updateStudent(Long studentId, StudentRequest request) {
        if (studentId == null) {
            throw new ValidationException("Student ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Student request cannot be null");
        }

        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_STUDENT".equalsIgnoreCase(a.getAuthority()))) {
            ownershipValidator.checkStudentOwnership(studentId);
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + studentId));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new EntryNotFoundException("Batch not found with ID: " + request.getBatchId()));

        if (!student.getStudentNo().equalsIgnoreCase(request.getStudentNo()) && studentRepository.existsByStudentNo(request.getStudentNo())) {
            throw new com.unilearn.server.exception.DuplicateEntryException("Student number already exists: " + request.getStudentNo());
        }

        student.setStudentNo(request.getStudentNo());
        student.setDepartment(department);
        student.setBatch(batch);
        if (request.getEnrollmentYear() != null) {
            student.setEnrollmentYear(request.getEnrollmentYear());
        }

        Student updated = studentRepository.save(student);
        return studentMapper.toStudentResponse(updated);
    }

    @Override
    @Transactional
    public void deleteStudent(Long studentId) {
        if (studentId == null) {
            throw new ValidationException("Student ID cannot be null");
        }

        if (!studentRepository.existsById(studentId)) {
            throw new EntryNotFoundException("Student not found with ID: " + studentId);
        }

        if (!enrollmentRepository.findByStudent_StudentId(studentId).isEmpty()) {
            throw new com.unilearn.server.exception.IllegalStateException("Cannot delete a student with existing enrollments");
        }

        studentRepository.deleteById(studentId);
    }

    @Override
    public StudentResponse getStudentById(Long studentId) {
        if (studentId == null) {
            throw new ValidationException("Student ID cannot be null");
        }
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_STUDENT".equalsIgnoreCase(a.getAuthority()))) {
            ownershipValidator.checkStudentOwnership(studentId);
        }
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + studentId));
        return studentMapper.toStudentResponse(student);
    }

    @Override
    public PageResponseDTO<StudentResponse> getStudentsByBatch(Long batchId, Pageable pageable) {
        if (batchId == null) {
            throw new ValidationException("Batch ID cannot be null");
        }
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        if (!batchRepository.existsById(batchId)) {
            throw new EntryNotFoundException("Batch not found with ID: " + batchId);
        }

        Page<Student> page = studentRepository.findByBatch_BatchId(batchId, pageable);
        List<StudentResponse> content = page.getContent()
                .stream()
                .map(studentMapper::toStudentResponse)
                .toList();

        return PageResponseDTO.<StudentResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }

    @Override
    public PageResponseDTO<StudentResponse> getStudentsByDepartment(Long departmentId, Pageable pageable) {
        if (departmentId == null) {
            throw new ValidationException("Department ID cannot be null");
        }
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        ownershipValidator.checkHodDepartmentAccess(departmentId);
        if (!departmentRepository.existsById(departmentId)) {
            throw new EntryNotFoundException("Department not found with ID: " + departmentId);
        }

        Page<Student> page = studentRepository.findByDepartment_DepartmentId(departmentId, pageable);
        List<StudentResponse> content = page.getContent()
                .stream()
                .map(studentMapper::toStudentResponse)
                .toList();

        return PageResponseDTO.<StudentResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }

    @Override
    public PageResponseDTO<com.unilearn.server.dto.response.student.StudentListItemDTO> getStudentListItemsByBatch(Long batchId, Pageable pageable) {
        if (batchId == null) {
            throw new ValidationException("Batch ID cannot be null");
        }
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        if (!batchRepository.existsById(batchId)) {
            throw new EntryNotFoundException("Batch not found with ID: " + batchId);
        }

        Page<Student> page = studentRepository.findByBatch_BatchId(batchId, pageable);
        List<com.unilearn.server.dto.response.student.StudentListItemDTO> content = page.getContent()
                .stream()
                .map(studentMapper::toStudentListItemDTO)
                .toList();

        return PageResponseDTO.<com.unilearn.server.dto.response.student.StudentListItemDTO>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }

    @Override
    public List<com.unilearn.server.dto.response.student.StudentOptionDTO> getStudentOptions(Long batchId, String searchText) {
        String filter = (searchText == null) ? "" : searchText.trim().toLowerCase();
        List<Student> students = (batchId != null)
                ? studentRepository.findByBatch_BatchId(batchId)
                : studentRepository.findAll();

        return students.stream()
                .filter(s -> filter.isEmpty() 
                        || (s.getUser() != null && s.getUser().getFullName() != null && s.getUser().getFullName().toLowerCase().contains(filter))
                        || (s.getStudentNo() != null && s.getStudentNo().toLowerCase().contains(filter)))
                .map(studentMapper::toStudentOptionDTO)
                .toList();
    }
}
