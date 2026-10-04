package com.unilearn.server.security;

import com.unilearn.server.model.HodDeanAssignment;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.CourseOfferingLecturerRepository;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.repository.HodDeanAssignmentRepository;
import com.unilearn.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OwnershipValidator {

    private final UserRepository userRepository;
    private final CourseOfferingLecturerRepository courseOfferingLecturerRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final HodDeanAssignmentRepository hodDeanAssignmentRepository;
    private final DepartmentRepository departmentRepository;
    private final com.unilearn.server.repository.NotificationRepository notificationRepository;

    public Optional<User> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        return userRepository.findByEmail(auth.getName());
    }

    public boolean isStudent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_STUDENT".equalsIgnoreCase(a.getAuthority()));
    }

    public boolean isLecturer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_LECTURER".equalsIgnoreCase(a.getAuthority()) || "ROLE_GUEST_LECTURER".equalsIgnoreCase(a.getAuthority()));
    }

    public boolean isHodDean() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_HOD_DEAN".equalsIgnoreCase(a.getAuthority()));
    }

    public boolean isStaffOrSuperAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_STAFF_ADMIN".equalsIgnoreCase(a.getAuthority()) || "ROLE_SUPER_ADMIN".equalsIgnoreCase(a.getAuthority()));
    }

    // Check student ownership
    public void checkStudentOwnership(Long studentUserId) {
        if (studentUserId == null) return;
        if (isStudent()) {
            User user = getCurrentUser()
                    .orElseThrow(() -> new AccessDeniedException("User not authenticated"));
            if (!studentUserId.equals(user.getUserId())) {
                throw new AccessDeniedException("Access denied: You may only access your own data (User ID: " + user.getUserId() + ")");
            }
        }
    }

    // Check if current user owns this user id
    public boolean isUserOwner(Long userId, String email) {
        if (userId == null || email == null) return false;
        return userRepository.findById(userId)
                .map(u -> u.getEmail().equalsIgnoreCase(email))
                .orElse(false);
    }

    // Check if notification belongs to this email
    public boolean isNotificationOwner(Long notificationId, String email) {
        if (notificationId == null || email == null) return false;
        return notificationRepository.findById(notificationId)
                .map(n -> n.getUser() != null && n.getUser().getEmail().equalsIgnoreCase(email))
                .orElse(false);
    }

    // Block reading someone else's data
    public void checkUserOwnership(Long targetUserId) {
        if (targetUserId == null) return;
        User user = getCurrentUser()
                .orElseThrow(() -> new AccessDeniedException("User not authenticated"));
        if (!targetUserId.equals(user.getUserId())) {
            throw new AccessDeniedException("Access denied: You may only access your own notifications (User ID: " + user.getUserId() + ")");
        }
    }

    // Ensure lecturer is assigned to this course offering
    public void checkLecturerOfferingAccess(Long offeringId) {
        if (offeringId == null) return;
        if (isLecturer() && !isStaffOrSuperAdmin()) {
            User user = getCurrentUser()
                    .orElseThrow(() -> new AccessDeniedException("User not authenticated"));
            boolean assigned = courseOfferingLecturerRepository
                    .existsById(new com.unilearn.server.model.CourseOfferingLecturer.CourseOfferingLecturerId(offeringId, user.getUserId()));
            // the main lecturer of the offering is allowed too
            if (!assigned) {
                assigned = courseOfferingRepository.findById(offeringId)
                        .map(o -> o.getPrimaryLecturer() != null
                                && user.getUserId().equals(o.getPrimaryLecturer().getLecturerId()))
                        .orElse(false);
            }
            if (!assigned) {
                throw new AccessDeniedException("Access denied: You are not assigned to course offering #" + offeringId);
            }
        }
    }

    // true if the lecturer teaches any offering of this course (main or co-lecturer)
    public boolean lecturerTeachesCourse(Long courseId, Long lecturerId) {
        if (courseId == null || lecturerId == null) return false;
        return courseOfferingRepository.existsByCourse_CourseIdAndPrimaryLecturer_LecturerId(courseId, lecturerId)
                || courseOfferingLecturerRepository.countByCourseAndLecturer(courseId, lecturerId) > 0;
    }

    // Ensure lecturer teaches an offering of this course
    public void checkLecturerCourseAccess(Long courseId) {
        if (courseId == null) return;
        if (isLecturer() && !isStaffOrSuperAdmin()) {
            User user = getCurrentUser()
                    .orElseThrow(() -> new AccessDeniedException("User not authenticated"));
            if (!lecturerTeachesCourse(courseId, user.getUserId())) {
                throw new AccessDeniedException("Access denied: You do not teach course #" + courseId);
            }
        }
    }

    // question banks: staff admins, HOD of the course's department,
    // lecturers of the course and the bank's creator
    public void checkQuestionBankAccess(com.unilearn.server.model.Course course, Long creatorUserId) {
        if (isStaffOrSuperAdmin()) return;
        if (course == null) {
            throw new AccessDeniedException("Access denied: Course not found for this question bank");
        }
        if (isHodDean()) {
            Long departmentId = course.getDepartment() != null ? course.getDepartment().getDepartmentId() : null;
            if (departmentId == null) {
                throw new AccessDeniedException("Access denied: Department not found for this course");
            }
            checkHodDepartmentAccess(departmentId);
            return;
        }
        if (isLecturer()) {
            User user = getCurrentUser()
                    .orElseThrow(() -> new AccessDeniedException("User not authenticated"));
            if (creatorUserId != null && creatorUserId.equals(user.getUserId())) return;
            checkLecturerCourseAccess(course.getCourseId());
            return;
        }
        throw new AccessDeniedException("Access denied: You cannot use this question bank");
    }

    // Ensure HOD only accesses their own department
    public void checkHodDepartmentAccess(Long departmentId) {
        if (departmentId == null) return;
        if (isHodDean() && !isStaffOrSuperAdmin()) {
            User user = getCurrentUser()
                    .orElseThrow(() -> new AccessDeniedException("User not authenticated"));
            List<HodDeanAssignment> assignments = hodDeanAssignmentRepository.findByUser_UserId(user.getUserId());

            boolean hasAccess = assignments.stream().anyMatch(a -> {
                if (a.getDepartment() != null && a.getDepartment().getDepartmentId().equals(departmentId)) {
                    return true;
                }
                if (a.getFaculty() != null) {
                    var dept = departmentRepository.findById(departmentId).orElse(null);
                    return dept != null && dept.getFaculty() != null
                            && dept.getFaculty().getFacultyId().equals(a.getFaculty().getFacultyId());
                }
                return false;
            });

            if (!hasAccess) {
                throw new AccessDeniedException("Access denied: HOD/Dean is not assigned to department #" + departmentId);
            }
        }
    }
}
