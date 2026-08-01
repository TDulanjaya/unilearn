package com.unilearn.server.service;

import com.unilearn.server.dto.request.eventregistration.EventRegistrationCreateRequestDTO;
import com.unilearn.server.dto.response.EventRegistrationResponse;

import java.util.List;

/**
 * Service interface for managing event registrations.
 */
public interface EventRegistrationService {

    EventRegistrationResponse registerForEvent(EventRegistrationCreateRequestDTO request);

    void cancelRegistration(Long eventId, Long studentId);

    List<EventRegistrationResponse> getRegistrationsByEvent(Long eventId);

    List<EventRegistrationResponse> getRegistrationsByUser(Long studentId);
}
