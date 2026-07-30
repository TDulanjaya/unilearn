package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.CourseRequest;
import com.unilearn.server.dto.response.CourseResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Course;
import com.unilearn.server.model.Department;
import com.unilearn.server.repository.CourseRepository;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.service.CourseService;
import com.unilearn.server.util.CourseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseMapper courseMapper;

    @Override
    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        if (request == null) {
            throw new ValidationException("Course request cannot be null");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        if (courseRepository.existsByCode(request.getCode())) {
            throw new com.unilearn.server.exception.IllegalStateException("Course code already exists: " + request.getCode());
        }

        Course course = courseMapper.toCourse(request, department);
        Course saved = courseRepository.save(course);
        return courseMapper.toCourseResponse(saved);
    }

    @Override
    @Transactional
    public CourseResponse updateCourse(Long courseId, CourseRequest request) {
        if (courseId == null) {
            throw new ValidationException("Course ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Course request cannot be null");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntryNotFoundException("Course not found with ID: " + courseId));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        if (!course.getCode().equalsIgnoreCase(request.getCode()) && courseRepository.existsByCode(request.getCode())) {
            throw new com.unilearn.server.exception.IllegalStateException("Course code already exists: " + request.getCode());
        }

        course.setCode(request.getCode());
        course.setTitle(request.getTitle());
        course.setCreditHours(request.getCreditHours());
        course.setDescription(request.getDescription());
        if (request.getSyllabusVersion() != null) {
            course.setSyllabusVersion(request.getSyllabusVersion());
        }
        course.setDepartment(department);

        Course updated = courseRepository.save(course);
        return courseMapper.toCourseResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCourse(Long courseId) {
        if (courseId == null) {
            throw new ValidationException("Course ID cannot be null");
        }
        if (!courseRepository.existsById(courseId)) {
            throw new EntryNotFoundException("Course not found with ID: " + courseId);
        }
        courseRepository.deleteById(courseId);
    }

    @Override
    public CourseResponse getCourseById(Long courseId) {
        if (courseId == null) {
            throw new ValidationException("Course ID cannot be null");
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntryNotFoundException("Course not found with ID: " + courseId));
        return courseMapper.toCourseResponse(course);
    }

    @Override
    public PageResponseDTO<CourseResponse> getCoursesByDepartment(Long departmentId, Pageable pageable) {
        if (departmentId == null) {
            throw new ValidationException("Department ID cannot be null");
        }
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        if (!departmentRepository.existsById(departmentId)) {
            throw new EntryNotFoundException("Department not found with ID: " + departmentId);
        }

        Page<Course> page = courseRepository.findByDepartment_DepartmentId(departmentId, pageable);
        List<CourseResponse> content = page.getContent()
                .stream()
                .map(courseMapper::toCourseResponse)
                .toList();

        return PageResponseDTO.<CourseResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }

    @Override
    public PageResponseDTO<CourseResponse> getAllCourses(Pageable pageable) {
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        Page<Course> page = courseRepository.findAll(pageable);
        List<CourseResponse> content = page.getContent()
                .stream()
                .map(courseMapper::toCourseResponse)
                .toList();

        return PageResponseDTO.<CourseResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }
}
