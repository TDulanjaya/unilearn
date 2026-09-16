package com.unilearn.server.service;

import com.unilearn.server.dto.request.eventregistration.EventRegistrationCreateRequestDTO;
import com.unilearn.server.dto.response.EventRegistrationResponse;

import java.util.List;

public interface EventRegistrationService {

    EventRegistrationResponse registerForEvent(EventRegistrationCreateRequestDTO request, Long studentId);

    void cancelRegistration(Long eventId, Long studentId);

    List<EventRegistrationResponse> getRegistrationsByEvent(Long eventId);

    List<EventRegistrationResponse> getRegistrationsByUser(Long studentId);
}
