package com.unilearn.server.service.impl;

import com.unilearn.server.dto.response.DashboardKpiResponse;
import com.unilearn.server.dto.response.report.LabeledCountDTO;
import com.unilearn.server.model.HodDeanAssignment;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.CourseRepository;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.repository.EnrollmentRepository;
import com.unilearn.server.repository.HodDeanAssignmentRepository;
import com.unilearn.server.repository.LecturerRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.security.OwnershipValidator;
import com.unilearn.server.service.DashboardKpiService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardKpiServiceImpl implements DashboardKpiService {

    private final StudentRepository studentRepository;
    private final LecturerRepository lecturerRepository;
    private final CourseRepository courseRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final HodDeanAssignmentRepository hodDeanAssignmentRepository;
    private final OwnershipValidator ownershipValidator;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public DashboardKpiResponse getDashboardKpis(Long departmentId) {
        List<Long> deptIds = resolveDepartments(departmentId);

        // whole institution
        if (deptIds == null) {
            long totalStudents = studentRepository.count();
            long totalLecturers = lecturerRepository.count();
            long totalCourses = courseRepository.count();
            long totalOfferings = courseOfferingRepository.count();
            long totalEnrollments = enrollmentRepository.count();
            Rate attendance = attendanceRate(null);
            Rate exams = examPassRate(null);

            List<LabeledCountDTO> usersByRole = Arrays.asList(
                    LabeledCountDTO.builder().label("student").count(totalStudents).build(),
                    LabeledCountDTO.builder().label("lecturer").count(totalLecturers).build(),
                    LabeledCountDTO.builder().label("admin").count(userRepository.count() - (totalStudents + totalLecturers)).build()
            );

            return DashboardKpiResponse.builder()
                    .totalStudents(totalStudents)
                    .totalLecturers(totalLecturers)
                    .totalCourses(totalCourses)
                    .totalActiveOfferings(totalOfferings)
                    .totalEnrollments(totalEnrollments)
                    .averageAttendanceRate(attendance.rate())
                    .averageExamPassRate(exams.rate())
                    .attendanceRecordCount(attendance.count())
                    .examResultCount(exams.count())
                    .generatedAt(LocalDateTime.now())
                    .usersByRole(usersByRole)
                    .build();
        }

        // HOD with no department gets empty numbers
        if (deptIds.isEmpty()) {
            return DashboardKpiResponse.builder()
                    .totalStudents(0L)
                    .totalLecturers(0L)
                    .totalCourses(0L)
                    .totalActiveOfferings(0L)
                    .totalEnrollments(0L)
                    .averageAttendanceRate(0.0)
                    .averageExamPassRate(0.0)
                    .attendanceRecordCount(0L)
                    .examResultCount(0L)
                    .generatedAt(LocalDateTime.now())
                    .usersByRole(new ArrayList<>())
                    .build();
        }

        long totalStudents = count("SELECT COUNT(s) FROM Student s WHERE s.department.departmentId IN :deptIds", deptIds);
        long totalLecturers = count("SELECT COUNT(l) FROM Lecturer l WHERE l.department.departmentId IN :deptIds", deptIds);
        long totalCourses = count("SELECT COUNT(c) FROM Course c WHERE c.department.departmentId IN :deptIds", deptIds);
        long totalOfferings = count("SELECT COUNT(o) FROM CourseOffering o WHERE o.course.department.departmentId IN :deptIds", deptIds);
        long totalEnrollments = count("SELECT COUNT(e) FROM Enrollment e WHERE e.courseOffering.course.department.departmentId IN :deptIds", deptIds);
        Rate attendance = attendanceRate(deptIds);
        Rate exams = examPassRate(deptIds);

        List<LabeledCountDTO> usersByRole = Arrays.asList(
                LabeledCountDTO.builder().label("student").count(totalStudents).build(),
                LabeledCountDTO.builder().label("lecturer").count(totalLecturers).build()
        );

        return DashboardKpiResponse.builder()
                .totalStudents(totalStudents)
                .totalLecturers(totalLecturers)
                .totalCourses(totalCourses)
                .totalActiveOfferings(totalOfferings)
                .totalEnrollments(totalEnrollments)
                .averageAttendanceRate(attendance.rate())
                .averageExamPassRate(exams.rate())
                .attendanceRecordCount(attendance.count())
                .examResultCount(exams.count())
                .generatedAt(LocalDateTime.now())
                .usersByRole(usersByRole)
                .build();
    }

    // null = all departments, empty list = nothing
    private List<Long> resolveDepartments(Long departmentId) {
        boolean hodOnly = ownershipValidator.isHodDean() && !ownershipValidator.isStaffOrSuperAdmin();
        if (!hodOnly) {
            return departmentId == null ? null : List.of(departmentId);
        }
        if (departmentId != null) {
            ownershipValidator.checkHodDepartmentAccess(departmentId);
            return List.of(departmentId);
        }

        // no department given, so use every department the HOD/Dean looks after
        Set<Long> ids = new LinkedHashSet<>();
        User user = ownershipValidator.getCurrentUser().orElse(null);
        if (user == null) {
            return new ArrayList<>();
        }
        for (HodDeanAssignment a : hodDeanAssignmentRepository.findByUser_UserId(user.getUserId())) {
            if (Boolean.FALSE.equals(a.getActive())) {
                continue;
            }
            if (a.getDepartment() != null) {
                ids.add(a.getDepartment().getDepartmentId());
            } else if (a.getFaculty() != null) {
                departmentRepository.findByFaculty_FacultyId(a.getFaculty().getFacultyId())
                        .forEach(d -> ids.add(d.getDepartmentId()));
            }
        }
        departmentRepository.findByHod_UserId(user.getUserId()).ifPresent(d -> ids.add(d.getDepartmentId()));
        return new ArrayList<>(ids);
    }

    private long count(String jpql, List<Long> deptIds) {
        TypedQuery<Long> q = entityManager.createQuery(jpql, Long.class);
        q.setParameter("deptIds", deptIds);
        Long result = q.getSingleResult();
        return result == null ? 0L : result;
    }

    // present + late out of all attendance records, 0 when there are none
    private Rate attendanceRate(List<Long> deptIds) {
        String jpql = "SELECT LOWER(ar.status) FROM AttendanceRecord ar"
                + (deptIds != null ? " WHERE ar.session.courseOffering.course.department.departmentId IN :deptIds" : "");
        TypedQuery<String> q = entityManager.createQuery(jpql, String.class);
        if (deptIds != null) {
            q.setParameter("deptIds", deptIds);
        }
        List<String> statuses = q.getResultList();
        if (statuses.isEmpty()) {
            return new Rate(0.0, 0L);
        }
        long attended = statuses.stream().filter(s -> "present".equals(s) || "late".equals(s)).count();
        return new Rate(round(attended * 100.0 / statuses.size()), (long) statuses.size());
    }

    // results with at least half of the exam's total marks, 0 when there are none
    private Rate examPassRate(List<Long> deptIds) {
        String jpql = "SELECT er.exam.examId, er.score FROM ExamResult er"
                + (deptIds != null ? " WHERE er.exam.courseOffering.course.department.departmentId IN :deptIds" : "");
        TypedQuery<Object[]> q = entityManager.createQuery(jpql, Object[].class);
        if (deptIds != null) {
            q.setParameter("deptIds", deptIds);
        }
        List<Object[]> results = q.getResultList();
        if (results.isEmpty()) {
            return new Rate(0.0, 0L);
        }

        // total marks of each exam from its questions
        Map<Long, BigDecimal> totals = new HashMap<>();
        List<Object[]> questionRows = entityManager.createQuery(
                "SELECT eq.exam.examId, eq.marksOverride, eq.question.marks FROM ExamQuestion eq", Object[].class)
                .getResultList();
        for (Object[] row : questionRows) {
            Long examId = (Long) row[0];
            BigDecimal marks = row[1] != null ? (BigDecimal) row[1] : (BigDecimal) row[2];
            if (examId != null && marks != null) {
                totals.merge(examId, marks, BigDecimal::add);
            }
        }

        long passed = 0;
        for (Object[] row : results) {
            Long examId = (Long) row[0];
            BigDecimal score = (BigDecimal) row[1];
            if (score == null) {
                continue;
            }
            BigDecimal total = totals.get(examId);
            // no questions means we treat the score as out of 100
            BigDecimal passMark = (total != null && total.signum() > 0)
                    ? total.divide(BigDecimal.valueOf(2))
                    : BigDecimal.valueOf(50);
            if (score.compareTo(passMark) >= 0) {
                passed++;
            }
        }
        return new Rate(round(passed * 100.0 / results.size()), (long) results.size());
    }

    // a percentage and how many rows it was made from
    private record Rate(double rate, long count) {
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
