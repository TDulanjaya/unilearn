package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.FacultyRequest;
import com.unilearn.server.dto.response.FacultyResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.exception.DuplicateEntryException;
import com.unilearn.server.exception.EntryNotFoundException;

import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Faculty;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.repository.FacultyRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.service.FacultyService;
import com.unilearn.server.util.mapper.FacultyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FacultyServiceImpl implements FacultyService {

    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final FacultyMapper facultyMapper;

    @Override
    @Transactional
    public FacultyResponse createFaculty(FacultyRequest request) {
        if (request == null) {
            throw new ValidationException("Faculty request cannot be null");
        }

        if (facultyRepository.existsByCode(request.getCode())) {
            throw new DuplicateEntryException("Faculty code already exists: " + request.getCode());
        }

        User dean = null;
        if (request.getDeanUserId() != null) {
            dean = userRepository.findById(request.getDeanUserId())
                    .orElseThrow(
                            () -> new EntryNotFoundException("User not found with ID: " + request.getDeanUserId()));
        }

        Faculty faculty = facultyMapper.toFaculty(request, dean);
        Faculty savedFaculty = facultyRepository.save(faculty);
        return facultyMapper.toFacultyResponse(savedFaculty);
    }

    @Override
    @Transactional
    public FacultyResponse updateFaculty(Long facultyId, FacultyRequest request) {
        if (facultyId == null) {
            throw new ValidationException("Faculty ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Faculty request cannot be null");
        }

        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new EntryNotFoundException("Faculty not found with ID: " + facultyId));

        if (!faculty.getCode().equalsIgnoreCase(request.getCode())
                && facultyRepository.existsByCode(request.getCode())) {
            throw new DuplicateEntryException("Faculty code already exists: " + request.getCode());
        }

        User dean = null;
        if (request.getDeanUserId() != null) {
            dean = userRepository.findById(request.getDeanUserId())
                    .orElseThrow(
                            () -> new EntryNotFoundException("User not found with ID: " + request.getDeanUserId()));
        }

        faculty.setName(request.getName());
        faculty.setCode(request.getCode());
        faculty.setDean(dean);

        Faculty updatedFaculty = facultyRepository.save(faculty);
        return facultyMapper.toFacultyResponse(updatedFaculty);
    }

    @Override
    @Transactional
    public void deleteFaculty(Long facultyId) {
        if (facultyId == null) {
            throw new ValidationException("Faculty ID cannot be null");
        }

        if (!facultyRepository.existsById(facultyId)) {
            throw new EntryNotFoundException("Faculty not found with ID: " + facultyId);
        }

        if (departmentRepository.existsByFaculty_FacultyId(facultyId)) {
            throw new com.unilearn.server.exception.IllegalStateException(
                    "Cannot delete a faculty that still has departments");
        }

        facultyRepository.deleteById(facultyId);
    }

    @Override
    public FacultyResponse getFacultyById(Long facultyId) {
        if (facultyId == null) {
            throw new ValidationException("Faculty ID cannot be null");
        }

        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new EntryNotFoundException("Faculty not found with ID: " + facultyId));
        return facultyMapper.toFacultyResponse(faculty);
    }

    @Override
    public FacultyResponse getFacultyByCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new ValidationException("Faculty code cannot be empty");
        }

        Faculty faculty = facultyRepository.findByCode(code)
                .orElseThrow(() -> new EntryNotFoundException("Faculty not found with code: " + code));
        return facultyMapper.toFacultyResponse(faculty);
    }

    @Override
    public PageResponseDTO<FacultyResponse> getAllFaculties(Pageable pageable) {
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }

        Page<Faculty> page = facultyRepository.findAll(pageable);
        List<FacultyResponse> content = page.getContent()
                .stream()
                .map(facultyMapper::toFacultyResponse)
                .toList();

        return PageResponseDTO.<FacultyResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }

    @Override
    public List<com.unilearn.server.dto.response.faculty.FacultyOptionDTO> getFacultyOptions(String searchText) {
        String filter = (searchText == null) ? "" : searchText.trim().toLowerCase();
        return facultyRepository.findAll().stream()
                .filter(f -> filter.isEmpty() || f.getName().toLowerCase().contains(filter)
                        || f.getCode().toLowerCase().contains(filter))
                .map(facultyMapper::toFacultyOptionDTO)
                .toList();
    }
}