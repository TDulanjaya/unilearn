package com.unilearn.server.security;

import com.unilearn.server.model.Course;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.StaffAdmin;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.repository.StaffAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

// checks that HODs and staff admins only change things inside their own area
@Component
@RequiredArgsConstructor
public class AdminScopeValidator {

    private final OwnershipValidator ownershipValidator;
    private final StaffAdminRepository staffAdminRepository;
    private final DepartmentRepository departmentRepository;

    // staff admin, but not a super admin
    public boolean isStaffAdminOnly() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        boolean staff = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_STAFF_ADMIN".equalsIgnoreCase(a.getAuthority()));
        boolean superAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_SUPER_ADMIN".equalsIgnoreCase(a.getAuthority()));
        return staff && !superAdmin;
    }

    // use this before creating, editing or deleting anything that belongs to a department
    public void checkDepartmentWriteAccess(Long departmentId) {
        if (departmentId == null) {
            return;
        }
        ownershipValidator.checkHodDepartmentAccess(departmentId);
        checkStaffDepartmentScope(departmentId);
    }

    // same check, using the department of the course
    public void checkCourseWriteAccess(Course course) {
        if (course == null || course.getDepartment() == null) {
            return;
        }
        checkDepartmentWriteAccess(course.getDepartment().getDepartmentId());
    }

    // same check, using the department of the offering's course
    public void checkOfferingWriteAccess(CourseOffering offering) {
        if (offering == null) {
            return;
        }
        checkCourseWriteAccess(offering.getCourse());
    }

    // staff admin scope check for a department
    public void checkStaffDepartmentScope(Long departmentId) {
        if (departmentId == null) {
            return;
        }
        StaffAdmin staffAdmin = currentStaffAdmin();
        if (staffAdmin == null || isInstitution(staffAdmin)) {
            return;
        }
        String scope = staffAdmin.getScopeLevel().toLowerCase();
        if ("department".equals(scope)) {
            if (staffAdmin.getDepartment() != null
                    && departmentId.equals(staffAdmin.getDepartment().getDepartmentId())) {
                return;
            }
        } else if ("faculty".equals(scope)) {
            Department department = departmentRepository.findById(departmentId).orElse(null);
            if (staffAdmin.getFaculty() != null && department != null && department.getFaculty() != null
                    && staffAdmin.getFaculty().getFacultyId().equals(department.getFaculty().getFacultyId())) {
                return;
            }
        }
        throw new AccessDeniedException("Access denied: department #" + departmentId + " is outside your admin scope");
    }

    // staff admin scope check for a whole faculty (department admins can't change faculties)
    public void checkStaffFacultyScope(Long facultyId) {
        if (facultyId == null) {
            return;
        }
        StaffAdmin staffAdmin = currentStaffAdmin();
        if (staffAdmin == null || isInstitution(staffAdmin)) {
            return;
        }
        if ("faculty".equalsIgnoreCase(staffAdmin.getScopeLevel())
                && staffAdmin.getFaculty() != null
                && facultyId.equals(staffAdmin.getFaculty().getFacultyId())) {
            return;
        }
        throw new AccessDeniedException("Access denied: faculty #" + facultyId + " is outside your admin scope");
    }

    // only institution level staff admins can add new faculties
    public void checkStaffInstitutionScope() {
        StaffAdmin staffAdmin = currentStaffAdmin();
        if (staffAdmin == null || isInstitution(staffAdmin)) {
            return;
        }
        throw new AccessDeniedException("Access denied: only institution level admins can do this");
    }

    // returns null when the caller is not a limited staff admin
    private StaffAdmin currentStaffAdmin() {
        if (!isStaffAdminOnly()) {
            return null;
        }
        User user = ownershipValidator.getCurrentUser().orElse(null);
        if (user == null) {
            return null;
        }
        // no staff_admins row means institution scope, so nobody gets locked out
        return staffAdminRepository.findById(user.getUserId()).orElse(null);
    }

    private boolean isInstitution(StaffAdmin staffAdmin) {
        return staffAdmin.getScopeLevel() == null || "institution".equalsIgnoreCase(staffAdmin.getScopeLevel());
    }
}
