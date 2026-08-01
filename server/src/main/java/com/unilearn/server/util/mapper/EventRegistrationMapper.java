package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.eventregistration.EventRegistrationCreateRequestDTO;
import com.unilearn.server.dto.response.EventRegistrationResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Event;
import com.unilearn.server.model.EventRegistration;
import com.unilearn.server.model.Student;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class EventRegistrationMapper {

    public EventRegistration toEventRegistration(EventRegistrationCreateRequestDTO request, Event event, Student student) {
        if (request == null) {
            throw new ValidationException("EventRegistration request cannot be null");
        }
        return EventRegistration.builder()
                .event(event)
                .student(student)
                .registeredAt(LocalDateTime.now())
                .build();
    }

    public EventRegistrationResponse toEventRegistrationResponse(EventRegistration reg) {
        if (reg == null) {
            throw new ValidationException("EventRegistration cannot be null");
        }
        return EventRegistrationResponse.builder()
                .registrationId(reg.getRegistrationId())
                .eventId(reg.getEvent() != null ? reg.getEvent().getEventId() : null)
                .studentId(reg.getStudent() != null ? reg.getStudent().getStudentId() : null)
                .studentName(reg.getStudent() != null && reg.getStudent().getUser() != null ? reg.getStudent().getUser().getFullName() : null)
                .rsvpStatus("registered")
                .registeredAt(reg.getRegisteredAt())
                .build();
    }
}
