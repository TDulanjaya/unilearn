package com.unilearn.server.util;

import com.unilearn.server.dto.request.StaffAdminRequest;
import com.unilearn.server.dto.response.StaffAdminResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Faculty;
import com.unilearn.server.model.StaffAdmin;
import com.unilearn.server.model.User;
import org.springframework.stereotype.Component;

@Component
public class StaffAdminMapper {

    public StaffAdmin toStaffAdmin(StaffAdminRequest request, User user, Faculty faculty, Department department) {
        if (request == null) {
            throw new ValidationException("StaffAdmin request cannot be null");
        }
        return StaffAdmin.builder()
                .user(user)
                .scopeLevel(request.getScopeLevel())
                .faculty(faculty)
                .department(department)
                .build();
    }

    public StaffAdminResponse toStaffAdminResponse(StaffAdmin staffAdmin) {
        if (staffAdmin == null) {
            throw new ValidationException("StaffAdmin cannot be null");
        }
        return StaffAdminResponse.builder()
                .staffId(staffAdmin.getStaffId())
                .userId(staffAdmin.getUser() != null ? staffAdmin.getUser().getUserId() : null)
                .fullName(staffAdmin.getUser() != null ? staffAdmin.getUser().getFullName() : null)
                .email(staffAdmin.getUser() != null ? staffAdmin.getUser().getEmail() : null)
                .scopeLevel(staffAdmin.getScopeLevel())
                .facultyId(staffAdmin.getFaculty() != null ? staffAdmin.getFaculty().getFacultyId() : null)
                .facultyName(staffAdmin.getFaculty() != null ? staffAdmin.getFaculty().getName() : null)
                .departmentId(staffAdmin.getDepartment() != null ? staffAdmin.getDepartment().getDepartmentId() : null)
                .departmentName(staffAdmin.getDepartment() != null ? staffAdmin.getDepartment().getName() : null)
                .build();
    }
}
