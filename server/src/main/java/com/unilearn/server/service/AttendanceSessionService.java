package com.unilearn.server.service;

import com.unilearn.server.dto.request.AttendanceSessionRequest;
import com.unilearn.server.dto.response.AttendanceSessionResponse;

import java.time.LocalDate;
import java.util.List;

// Attendance sessions service
public interface AttendanceSessionService {

    AttendanceSessionResponse createSession(AttendanceSessionRequest request);

    AttendanceSessionResponse updateSession(Long sessionId, AttendanceSessionRequest request);

    void deleteSession(Long sessionId);

    AttendanceSessionResponse getSessionById(Long sessionId);

    List<AttendanceSessionResponse> getSessionsByOffering(Long offeringId);

    List<AttendanceSessionResponse> getSessionsByOfferingAndDate(Long offeringId, LocalDate date);
}
