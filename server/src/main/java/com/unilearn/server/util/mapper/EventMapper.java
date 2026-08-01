package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.EventRequest;
import com.unilearn.server.dto.response.EventResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Event;
import com.unilearn.server.model.Faculty;
import com.unilearn.server.model.StaffAdmin;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    public Event toEvent(EventRequest request, StaffAdmin createdBy, Faculty faculty) {
        if (request == null) {
            throw new ValidationException("Event request cannot be null");
        }
        return Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .venue(request.getVenue())
                .eventDate(request.getEventDate())
                .faculty(faculty)
                .createdBy(createdBy)
                .build();
    }

    public EventResponse toEventResponse(Event event) {
        if (event == null) {
            throw new ValidationException("Event cannot be null");
        }
        return EventResponse.builder()
                .eventId(event.getEventId())
                .name(event.getTitle())
                .title(event.getTitle())
                .description(event.getDescription())
                .venue(event.getVenue())
                .eventDate(event.getEventDate())
                .startDateTime(event.getEventDate())
                .endDateTime(event.getEventDate() != null ? event.getEventDate().plusHours(2) : null)
                .facultyId(event.getFaculty() != null ? event.getFaculty().getFacultyId() : null)
                .facultyName(event.getFaculty() != null ? event.getFaculty().getName() : null)
                .createdById(event.getCreatedBy() != null ? event.getCreatedBy().getStaffId() : null)
                .createdByName(event.getCreatedBy() != null && event.getCreatedBy().getUser() != null ? event.getCreatedBy().getUser().getFullName() : null)
                .build();
    }
}
