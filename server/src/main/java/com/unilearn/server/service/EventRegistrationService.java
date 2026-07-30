package com.unilearn.server.service;

import com.unilearn.server.dto.request.EventRegistrationRequest;
import com.unilearn.server.dto.response.EventRegistrationResponse;

import java.util.List;

/**
 * Service interface for managing event registrations.
 */
public interface EventRegistrationService {

    EventRegistrationResponse registerForEvent(EventRegistrationRequest request);

    void cancelRegistration(Long eventId, Long studentId);

    List<EventRegistrationResponse> getRegistrationsByEvent(Long eventId);

    List<EventRegistrationResponse> getRegistrationsByUser(Long studentId);
}
