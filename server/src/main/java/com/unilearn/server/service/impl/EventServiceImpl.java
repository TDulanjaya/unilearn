package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.EventRequest;
import com.unilearn.server.dto.response.EventResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Event;
import com.unilearn.server.model.Faculty;
import com.unilearn.server.model.StaffAdmin;
import com.unilearn.server.repository.EventRepository;
import com.unilearn.server.repository.FacultyRepository;
import com.unilearn.server.repository.StaffAdminRepository;
import com.unilearn.server.service.EventService;
import com.unilearn.server.util.mapper.EventMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final StaffAdminRepository staffAdminRepository;
    private final FacultyRepository facultyRepository;
    private final EventMapper eventMapper;

    @Override
    @Transactional
    public EventResponse createEvent(EventRequest request) {
        if (request == null) {
            throw new ValidationException("Event request cannot be null");
        }

        StaffAdmin createdBy = staffAdminRepository.findById(request.getCreatedByStaffId())
                .orElseThrow(() -> new EntryNotFoundException("StaffAdmin not found with ID: " + request.getCreatedByStaffId()));

        Faculty faculty = null;
        if (request.getFacultyId() != null) {
            faculty = facultyRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new EntryNotFoundException("Faculty not found with ID: " + request.getFacultyId()));
        }

        Event event = eventMapper.toEvent(request, createdBy, faculty);
        Event saved = eventRepository.save(event);
        return eventMapper.toEventResponse(saved);
    }

    @Override
    @Transactional
    public EventResponse updateEvent(Long eventId, EventRequest request) {
        if (eventId == null) {
            throw new ValidationException("Event ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Event request cannot be null");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntryNotFoundException("Event not found with ID: " + eventId));

        StaffAdmin createdBy = staffAdminRepository.findById(request.getCreatedByStaffId())
                .orElseThrow(() -> new EntryNotFoundException("StaffAdmin not found with ID: " + request.getCreatedByStaffId()));

        Faculty faculty = null;
        if (request.getFacultyId() != null) {
            faculty = facultyRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new EntryNotFoundException("Faculty not found with ID: " + request.getFacultyId()));
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setVenue(request.getVenue());
        event.setEventDate(request.getEventDate());
        event.setFaculty(faculty);
        event.setCreatedBy(createdBy);

        Event updated = eventRepository.save(event);
        return eventMapper.toEventResponse(updated);
    }

    @Override
    @Transactional
    public void deleteEvent(Long eventId) {
        if (eventId == null) {
            throw new ValidationException("Event ID cannot be null");
        }
        if (!eventRepository.existsById(eventId)) {
            throw new EntryNotFoundException("Event not found with ID: " + eventId);
        }
        eventRepository.deleteById(eventId);
    }

    @Override
    public EventResponse getEventById(Long eventId) {
        if (eventId == null) {
            throw new ValidationException("Event ID cannot be null");
        }
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntryNotFoundException("Event not found with ID: " + eventId));
        return eventMapper.toEventResponse(event);
    }

    @Override
    public PageResponseDTO<EventResponse> getUpcomingEvents(Pageable pageable) {
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }

        Page<Event> page = eventRepository.findByEventDateAfter(LocalDateTime.now(), pageable);
        List<EventResponse> content = page.getContent()
                .stream()
                .map(eventMapper::toEventResponse)
                .toList();

        return PageResponseDTO.<EventResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }
}
