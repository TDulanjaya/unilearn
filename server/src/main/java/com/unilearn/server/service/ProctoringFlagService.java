package com.unilearn.server.service;

import com.unilearn.server.dto.request.ProctoringFlagRequest;
import com.unilearn.server.dto.response.ProctoringFlagResponse;

import java.util.List;

// Proctoring flags service
public interface ProctoringFlagService {

    ProctoringFlagResponse flagAttempt(ProctoringFlagRequest request);

    List<ProctoringFlagResponse> getFlagsByAttempt(Long attemptId);

    ProctoringFlagResponse resolveFlag(Long flagId, String reviewNotes, Boolean falsePositive);
}
