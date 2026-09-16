package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.eventregistration.EventRegistrationCreateRequestDTO;
import com.unilearn.server.dto.response.EventRegistrationResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Event;
import com.unilearn.server.model.EventRegistration;
import com.unilearn.server.model.Student;
import com.unilearn.server.repository.EventRegistrationRepository;
import com.unilearn.server.repository.EventRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.service.EventRegistrationService;
import com.unilearn.server.util.mapper.EventRegistrationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventRegistrationServiceImpl implements EventRegistrationService {

    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventRepository eventRepository;
    private final StudentRepository studentRepository;
    private final EventRegistrationMapper eventRegistrationMapper;

    @Override
    @Transactional
    public EventRegistrationResponse registerForEvent(EventRegistrationCreateRequestDTO request, Long studentId) {
        if (request == null) {
            throw new ValidationException("EventRegistration request cannot be null");
        }
        if (studentId == null) {
            throw new ValidationException("Student ID is required");
        }

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EntryNotFoundException("Event not found with ID: " + request.getEventId()));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + studentId));

        if (eventRegistrationRepository.existsByEvent_EventIdAndStudent_StudentId(request.getEventId(), studentId)) {
            throw new com.unilearn.server.exception.DuplicateEntryException("Student is already registered for this event");
        }

        if (event.getCapacity() != null && eventRegistrationRepository.countByEvent_EventId(request.getEventId()) >= event.getCapacity()) {
            throw new com.unilearn.server.exception.IllegalStateException("Event capacity reached");
        }

        EventRegistration reg = eventRegistrationMapper.toEventRegistration(request, event, student);
        EventRegistration saved = eventRegistrationRepository.save(reg);
        return eventRegistrationMapper.toEventRegistrationResponse(saved);
    }

    @Override
    @Transactional
    public void cancelRegistration(Long eventId, Long studentId) {
        if (eventId == null || studentId == null) {
            throw new ValidationException("Event ID and Student ID cannot be null");
        }

        EventRegistration reg = eventRegistrationRepository.findByEvent_EventIdAndStudent_StudentId(eventId, studentId)
                .orElseThrow(() -> new EntryNotFoundException("Registration not found for event ID: " + eventId + " and student ID: " + studentId));

        eventRegistrationRepository.delete(reg);
    }

    @Override
    public List<EventRegistrationResponse> getRegistrationsByEvent(Long eventId) {
        if (eventId == null) {
            throw new ValidationException("Event ID cannot be null");
        }
        if (!eventRepository.existsById(eventId)) {
            throw new EntryNotFoundException("Event not found with ID: " + eventId);
        }

        return eventRegistrationRepository.findByEvent_EventId(eventId)
                .stream()
                .map(eventRegistrationMapper::toEventRegistrationResponse)
                .toList();
    }

    @Override
    public List<EventRegistrationResponse> getRegistrationsByUser(Long studentId) {
        if (studentId == null) {
            throw new ValidationException("Student ID cannot be null");
        }
        if (!studentRepository.existsById(studentId)) {
            throw new EntryNotFoundException("Student not found with ID: " + studentId);
        }

        return eventRegistrationRepository.findByStudent_StudentId(studentId)
                .stream()
                .map(eventRegistrationMapper::toEventRegistrationResponse)
                .toList();
    }
}
