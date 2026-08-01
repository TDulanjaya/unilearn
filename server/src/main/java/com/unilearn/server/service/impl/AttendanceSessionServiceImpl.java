package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.AttendanceSessionRequest;
import com.unilearn.server.dto.response.AttendanceSessionResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AttendanceSession;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Lecturer;
import com.unilearn.server.repository.AttendanceSessionRepository;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.LecturerRepository;
import com.unilearn.server.service.AttendanceSessionService;
import com.unilearn.server.util.mapper.AttendanceSessionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceSessionServiceImpl implements AttendanceSessionService {

    private final AttendanceSessionRepository attendanceSessionRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final LecturerRepository lecturerRepository;
    private final AttendanceSessionMapper attendanceSessionMapper;

    @Override
    @Transactional
    public AttendanceSessionResponse createSession(AttendanceSessionRequest request) {
        if (request == null) {
            throw new ValidationException("AttendanceSession request cannot be null");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        Lecturer lecturer = lecturerRepository.findById(request.getMarkedByLecturerId())
                .orElseThrow(() -> new EntryNotFoundException("Lecturer not found with ID: " + request.getMarkedByLecturerId()));

        if (request.getSessionDate() != null && attendanceSessionRepository.existsByCourseOffering_OfferingIdAndSessionDate(request.getOfferingId(), request.getSessionDate())) {
            throw new com.unilearn.server.exception.DuplicateEntryException("Attendance session already exists for offering ID " + request.getOfferingId() + " on date " + request.getSessionDate());
        }

        AttendanceSession session = attendanceSessionMapper.toAttendanceSession(request, offering, lecturer);
        AttendanceSession saved = attendanceSessionRepository.save(session);
        return attendanceSessionMapper.toAttendanceSessionResponse(saved);
    }

    @Override
    @Transactional
    public AttendanceSessionResponse updateSession(Long sessionId, AttendanceSessionRequest request) {
        if (sessionId == null) {
            throw new ValidationException("Session ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("AttendanceSession request cannot be null");
        }

        AttendanceSession session = attendanceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntryNotFoundException("AttendanceSession not found with ID: " + sessionId));

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        Lecturer lecturer = lecturerRepository.findById(request.getMarkedByLecturerId())
                .orElseThrow(() -> new EntryNotFoundException("Lecturer not found with ID: " + request.getMarkedByLecturerId()));

        session.setCourseOffering(offering);
        session.setSessionDate(request.getSessionDate());
        session.setMarkedBy(lecturer);

        AttendanceSession updated = attendanceSessionRepository.save(session);
        return attendanceSessionMapper.toAttendanceSessionResponse(updated);
    }

    @Override
    @Transactional
    public void deleteSession(Long sessionId) {
        if (sessionId == null) {
            throw new ValidationException("Session ID cannot be null");
        }
        if (!attendanceSessionRepository.existsById(sessionId)) {
            throw new EntryNotFoundException("AttendanceSession not found with ID: " + sessionId);
        }
        attendanceSessionRepository.deleteById(sessionId);
    }

    @Override
    public AttendanceSessionResponse getSessionById(Long sessionId) {
        if (sessionId == null) {
            throw new ValidationException("Session ID cannot be null");
        }
        AttendanceSession session = attendanceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntryNotFoundException("AttendanceSession not found with ID: " + sessionId));
        return attendanceSessionMapper.toAttendanceSessionResponse(session);
    }

    @Override
    public List<AttendanceSessionResponse> getSessionsByOffering(Long offeringId) {
        if (offeringId == null) {
            throw new ValidationException("Offering ID cannot be null");
        }
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new EntryNotFoundException("CourseOffering not found with ID: " + offeringId);
        }

        return attendanceSessionRepository.findByCourseOffering_OfferingId(offeringId)
                .stream()
                .map(attendanceSessionMapper::toAttendanceSessionResponse)
                .toList();
    }

    @Override
    public List<AttendanceSessionResponse> getSessionsByOfferingAndDate(Long offeringId, LocalDate date) {
        if (offeringId == null || date == null) {
            throw new ValidationException("Offering ID and Date cannot be null");
        }
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new EntryNotFoundException("CourseOffering not found with ID: " + offeringId);
        }

        return attendanceSessionRepository.findByCourseOffering_OfferingIdAndSessionDate(offeringId, date)
                .stream()
                .map(attendanceSessionMapper::toAttendanceSessionResponse)
                .toList();
    }
}
