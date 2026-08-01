package com.unilearn.server.controller;

import com.unilearn.server.dto.response.DashboardKpiResponse;
import com.unilearn.server.service.DashboardKpiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STAFF_ADMIN', 'HOD_DEAN')")
public class DashboardKpiController {

    private final DashboardKpiService dashboardKpiService;

    @GetMapping
    public ResponseEntity<DashboardKpiResponse> getInstitutionKpis() {
        return ResponseEntity.ok(dashboardKpiService.getDashboardKpis());
    }
}
