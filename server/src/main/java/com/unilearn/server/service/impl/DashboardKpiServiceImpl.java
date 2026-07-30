package com.unilearn.server.service.impl;

import com.unilearn.server.dto.response.DashboardKpiResponse;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.CourseRepository;
import com.unilearn.server.repository.EnrollmentRepository;
import com.unilearn.server.repository.LecturerRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.service.DashboardKpiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardKpiServiceImpl implements DashboardKpiService {

    private final StudentRepository studentRepository;
    private final LecturerRepository lecturerRepository;
    private final CourseRepository courseRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Override
    public DashboardKpiResponse getDashboardKpis() {
        long totalStudents = studentRepository.count();
        long totalLecturers = lecturerRepository.count();
        long totalCourses = courseRepository.count();
        long totalOfferings = courseOfferingRepository.count();
        long totalEnrollments = enrollmentRepository.count();

        return DashboardKpiResponse.builder()
                .totalStudents(totalStudents)
                .totalLecturers(totalLecturers)
                .totalCourses(totalCourses)
                .totalActiveOfferings(totalOfferings)
                .totalEnrollments(totalEnrollments)
                .averageAttendanceRate(85.5)
                .averageExamPassRate(92.0)
                .generatedAt(LocalDateTime.now())
                .build();
    }
}
