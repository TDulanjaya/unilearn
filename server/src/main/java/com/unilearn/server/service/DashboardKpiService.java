package com.unilearn.server.service;

import com.unilearn.server.dto.response.DashboardKpiResponse;

/**
 * Service interface for gathering dashboard KPI metrics.
 */
public interface DashboardKpiService {

    DashboardKpiResponse getDashboardKpis();
}
