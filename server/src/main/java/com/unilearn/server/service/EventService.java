package com.unilearn.server.service;

import com.unilearn.server.dto.request.EventRequest;
import com.unilearn.server.dto.response.EventResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for managing events.
 */
public interface EventService {

    EventResponse createEvent(EventRequest request);

    EventResponse updateEvent(Long eventId, EventRequest request);

    void deleteEvent(Long eventId);

    EventResponse getEventById(Long eventId);

    PageResponseDTO<EventResponse> getUpcomingEvents(Pageable pageable);
}
