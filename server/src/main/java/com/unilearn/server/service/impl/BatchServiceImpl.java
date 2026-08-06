package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.BatchRequest;
import com.unilearn.server.dto.response.BatchResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.StudentResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AcademicYear;
import com.unilearn.server.model.Batch;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Student;
import com.unilearn.server.repository.AcademicYearRepository;
import com.unilearn.server.repository.BatchRepository;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.service.BatchService;
import com.unilearn.server.util.mapper.BatchMapper;
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
public class BatchServiceImpl implements BatchService {

    private final BatchRepository batchRepository;
    private final DepartmentRepository departmentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final StudentRepository studentRepository;
    private final BatchMapper batchMapper;
    private final StudentMapper studentMapper;

    @Override
    @Transactional
    public BatchResponse createBatch(BatchRequest request) {
        if (request == null) {
            throw new ValidationException("Batch request cannot be null");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        AcademicYear academicYear = academicYearRepository.findById(request.getAcademicYearId())
                .orElseThrow(() -> new EntryNotFoundException("AcademicYear not found with ID: " + request.getAcademicYearId()));

        Batch batch = batchMapper.toBatch(request, department, academicYear);
        Batch saved = batchRepository.save(batch);
        return batchMapper.toBatchResponse(saved);
    }

    @Override
    @Transactional
    public BatchResponse updateBatch(Long batchId, BatchRequest request) {
        if (batchId == null) {
            throw new ValidationException("Batch ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Batch request cannot be null");
        }

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new EntryNotFoundException("Batch not found with ID: " + batchId));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        AcademicYear academicYear = academicYearRepository.findById(request.getAcademicYearId())
                .orElseThrow(() -> new EntryNotFoundException("AcademicYear not found with ID: " + request.getAcademicYearId()));

        batch.setName(request.getName());
        batch.setDepartment(department);
        batch.setAcademicYear(academicYear);

        Batch updated = batchRepository.save(batch);
        return batchMapper.toBatchResponse(updated);
    }

    @Override
    @Transactional
    public void deleteBatch(Long batchId) {
        if (batchId == null) {
            throw new ValidationException("Batch ID cannot be null");
        }
        if (!batchRepository.existsById(batchId)) {
            throw new EntryNotFoundException("Batch not found with ID: " + batchId);
        }
        batchRepository.deleteById(batchId);
    }

    @Override
    public BatchResponse getBatchById(Long batchId) {
        if (batchId == null) {
            throw new ValidationException("Batch ID cannot be null");
        }
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new EntryNotFoundException("Batch not found with ID: " + batchId));
        return batchMapper.toBatchResponse(batch);
    }

    @Override
    public List<BatchResponse> getBatchesByDepartment(Long departmentId) {
        if (departmentId == null) {
            throw new ValidationException("Department ID cannot be null");
        }
        if (!departmentRepository.existsById(departmentId)) {
            throw new EntryNotFoundException("Department not found with ID: " + departmentId);
        }

        return batchRepository.findByDepartment_DepartmentId(departmentId)
                .stream()
                .map(batchMapper::toBatchResponse)
                .toList();
    }

    @Override
    public PageResponseDTO<StudentResponse> getStudentsInBatch(Long batchId, Pageable pageable) {
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
    public List<com.unilearn.server.dto.response.batch.BatchOptionDTO> getBatchOptions(Long departmentId, String searchText) {
        String filter = (searchText == null) ? "" : searchText.trim().toLowerCase();
        List<Batch> batches = (departmentId != null)
                ? batchRepository.findByDepartment_DepartmentId(departmentId)
                : batchRepository.findAll();

        return batches.stream()
                .filter(b -> filter.isEmpty() || b.getName().toLowerCase().contains(filter))
                .map(batchMapper::toBatchOptionDTO)
                .toList();
    }

    @Override
    public List<BatchResponse> getAllBatches() {
        return batchRepository.findAll()
                .stream()
                .map(batchMapper::toBatchResponse)
                .toList();
    }
}
