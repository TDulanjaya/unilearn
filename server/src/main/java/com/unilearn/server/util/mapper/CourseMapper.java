package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.CourseRequest;
import com.unilearn.server.dto.response.CourseResponse;
import com.unilearn.server.dto.response.course.CourseOptionDTO;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Course;
import com.unilearn.server.model.Department;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {

    public Course toCourse(CourseRequest request, Department department) {
        if (request == null) {
            throw new ValidationException("Course request cannot be null");
        }
        return Course.builder()
                .code(request.getCode())
                .title(request.getTitle())
                .creditHours(request.getCreditHours())
                .description(request.getDescription())
                .syllabusVersion(request.getSyllabusVersion() != null ? request.getSyllabusVersion() : "v1")
                .department(department)
                .build();
    }

    public CourseResponse toCourseResponse(Course course) {
        if (course == null) {
            throw new ValidationException("Course cannot be null");
        }
        return CourseResponse.builder()
                .courseId(course.getCourseId())
                .code(course.getCode())
                .title(course.getTitle())
                .name(course.getTitle())
                .creditHours(course.getCreditHours())
                .credits(course.getCreditHours())
                .description(course.getDescription())
                .syllabusVersion(course.getSyllabusVersion())
                .departmentId(course.getDepartment() != null ? course.getDepartment().getDepartmentId() : null)
                .departmentName(course.getDepartment() != null ? course.getDepartment().getName() : null)
                .createdAt(course.getCreatedAt())
                .build();
    }

    public CourseOptionDTO toCourseOptionDTO(Course course) {
        if (course == null) {
            throw new ValidationException("Course cannot be null");
        }
        return CourseOptionDTO.builder()
                .courseId(course.getCourseId())
                .code(course.getCode())
                .title(course.getTitle())
                .build();
    }
}
