package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.LecturerRequest;
import com.unilearn.server.dto.response.CourseOfferingResponse;
import com.unilearn.server.dto.response.LecturerResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Lecturer;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.repository.LecturerRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.service.LecturerService;
import com.unilearn.server.util.mapper.CourseOfferingMapper;
import com.unilearn.server.util.mapper.LecturerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LecturerServiceImpl implements LecturerService {

    private final LecturerRepository lecturerRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final LecturerMapper lecturerMapper;
    private final CourseOfferingMapper courseOfferingMapper;

    @Override
    @Transactional
    public LecturerResponse createLecturer(LecturerRequest request) {
        if (request == null) {
            throw new ValidationException("Lecturer request cannot be null");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getUserId()));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        Lecturer lecturer = lecturerMapper.toLecturer(request, user, department);
        Lecturer saved = lecturerRepository.save(lecturer);
        return lecturerMapper.toLecturerResponse(saved);
    }

    @Override
    @Transactional
    public LecturerResponse updateLecturer(Long lecturerId, LecturerRequest request) {
        if (lecturerId == null) {
            throw new ValidationException("Lecturer ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Lecturer request cannot be null");
        }

        Lecturer lecturer = lecturerRepository.findById(lecturerId)
                .orElseThrow(() -> new EntryNotFoundException("Lecturer not found with ID: " + lecturerId));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        lecturer.setDepartment(department);
        lecturer.setDesignation(request.getDesignation());
        if (request.getIsGuest() != null) {
            lecturer.setIsGuest(request.getIsGuest());
        }
        lecturer.setContractEndDate(request.getContractEndDate());

        Lecturer updated = lecturerRepository.save(lecturer);
        return lecturerMapper.toLecturerResponse(updated);
    }

    @Override
    @Transactional
    public void deleteLecturer(Long lecturerId) {
        if (lecturerId == null) {
            throw new ValidationException("Lecturer ID cannot be null");
        }
        if (!lecturerRepository.existsById(lecturerId)) {
            throw new EntryNotFoundException("Lecturer not found with ID: " + lecturerId);
        }
        lecturerRepository.deleteById(lecturerId);
    }

    @Override
    public LecturerResponse getLecturerById(Long lecturerId) {
        if (lecturerId == null) {
            throw new ValidationException("Lecturer ID cannot be null");
        }
        Lecturer lecturer = lecturerRepository.findById(lecturerId)
                .orElseThrow(() -> new EntryNotFoundException("Lecturer not found with ID: " + lecturerId));
        return lecturerMapper.toLecturerResponse(lecturer);
    }

    @Override
    public PageResponseDTO<LecturerResponse> getLecturersByDepartment(Long departmentId, Pageable pageable) {
        if (departmentId == null) {
            throw new ValidationException("Department ID cannot be null");
        }
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        if (!departmentRepository.existsById(departmentId)) {
            throw new EntryNotFoundException("Department not found with ID: " + departmentId);
        }

        Page<Lecturer> page = lecturerRepository.findByDepartment_DepartmentId(departmentId, pageable);
        List<LecturerResponse> content = page.getContent()
                .stream()
                .map(lecturerMapper::toLecturerResponse)
                .toList();

        return PageResponseDTO.<LecturerResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }

    @Override
    public List<CourseOfferingResponse> getCourseOfferingsForLecturer(Long lecturerId) {
        if (lecturerId == null) {
            throw new ValidationException("Lecturer ID cannot be null");
        }
        if (!lecturerRepository.existsById(lecturerId)) {
            throw new EntryNotFoundException("Lecturer not found with ID: " + lecturerId);
        }

        return courseOfferingRepository.findByPrimaryLecturer_LecturerId(lecturerId)
                .stream()
                .map(courseOfferingMapper::toCourseOfferingResponse)
                .toList();
    }

    @Override
    public List<com.unilearn.server.dto.response.lecturer.LecturerOptionDTO> getLecturerOptions(Long departmentId, String searchText) {
        String filter = (searchText == null) ? "" : searchText.trim().toLowerCase();
        List<Lecturer> lecturers = (departmentId != null)
                ? lecturerRepository.findByDepartment_DepartmentId(departmentId)
                : lecturerRepository.findAll();

        return lecturers.stream()
                .filter(l -> filter.isEmpty() || (l.getUser() != null && l.getUser().getFullName() != null && l.getUser().getFullName().toLowerCase().contains(filter)))
                .map(lecturerMapper::toLecturerOptionDTO)
                .toList();
    }
}
