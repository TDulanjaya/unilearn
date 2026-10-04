package com.unilearn.server.service;

import com.unilearn.server.dto.response.DashboardKpiResponse;

// Dashboard kpi metrics service
public interface DashboardKpiService {

    // departmentId is optional, HODs are limited to their own departments
    DashboardKpiResponse getDashboardKpis(Long departmentId);
}
