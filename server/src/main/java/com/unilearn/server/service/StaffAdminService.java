package com.unilearn.server.service;

import com.unilearn.server.dto.request.StaffAdminRequest;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.StaffAdminResponse;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for managing staff admins.
 */
public interface StaffAdminService {

    StaffAdminResponse createStaffAdmin(StaffAdminRequest request);

    StaffAdminResponse updateStaffAdmin(Long staffId, StaffAdminRequest request);

    void deleteStaffAdmin(Long staffId);

    StaffAdminResponse getStaffAdminById(Long staffId);

    PageResponseDTO<StaffAdminResponse> getAllStaffAdmins(Pageable pageable);

    boolean canManageScope(Long staffId, String requiredScopeLevel);
}
