package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.AttendanceBulkMarkRequest;
import com.unilearn.server.dto.request.AttendanceRecordRequest;
import com.unilearn.server.dto.response.AttendanceRecordResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AttendanceRecord;
import com.unilearn.server.model.AttendanceSession;
import com.unilearn.server.model.Student;
import com.unilearn.server.repository.AttendanceRecordRepository;
import com.unilearn.server.repository.AttendanceSessionRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.service.AttendanceRecordService;
import com.unilearn.server.util.AttendanceRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceRecordServiceImpl implements AttendanceRecordService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository attendanceSessionRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRecordMapper attendanceRecordMapper;

    @Override
    @Transactional
    public AttendanceRecordResponse markAttendance(AttendanceRecordRequest request) {
        if (request == null) {
            throw new ValidationException("AttendanceRecord request cannot be null");
        }

        AttendanceSession session = attendanceSessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new EntryNotFoundException("AttendanceSession not found with ID: " + request.getSessionId()));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + request.getStudentId()));

        Optional<AttendanceRecord> existingOpt = attendanceRecordRepository.findBySession_SessionIdAndStudent_StudentId(request.getSessionId(), request.getStudentId());

        AttendanceRecord record;
        if (existingOpt.isPresent()) {
            record = existingOpt.get();
            record.setStatus(request.getStatus());
        } else {
            record = attendanceRecordMapper.toAttendanceRecord(request, session, student);
        }

        AttendanceRecord saved = attendanceRecordRepository.save(record);
        return attendanceRecordMapper.toAttendanceRecordResponse(saved);
    }

    @Override
    @Transactional
    public List<AttendanceRecordResponse> bulkMarkAttendance(AttendanceBulkMarkRequest request) {
        if (request == null) {
            throw new ValidationException("AttendanceBulkMark request cannot be null");
        }

        AttendanceSession session = attendanceSessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new EntryNotFoundException("AttendanceSession not found with ID: " + request.getSessionId()));

        List<AttendanceRecordResponse> responses = new ArrayList<>();

        if (request.getRecords() != null) {
            for (AttendanceBulkMarkRequest.StudentAttendanceItem item : request.getRecords()) {
                Student student = studentRepository.findById(item.getStudentId())
                        .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + item.getStudentId()));

                Optional<AttendanceRecord> existingOpt = attendanceRecordRepository.findBySession_SessionIdAndStudent_StudentId(request.getSessionId(), item.getStudentId());

                AttendanceRecord record;
                if (existingOpt.isPresent()) {
                    record = existingOpt.get();
                    record.setStatus(item.getStatus());
                } else {
                    record = AttendanceRecord.builder()
                            .session(session)
                            .student(student)
                            .status(item.getStatus())
                            .build();
                }

                AttendanceRecord saved = attendanceRecordRepository.save(record);
                responses.add(attendanceRecordMapper.toAttendanceRecordResponse(saved));
            }
        }

        return responses;
    }

    @Override
    public List<AttendanceRecordResponse> getAttendanceForSession(Long sessionId) {
        if (sessionId == null) {
            throw new ValidationException("Session ID cannot be null");
        }
        if (!attendanceSessionRepository.existsById(sessionId)) {
            throw new EntryNotFoundException("AttendanceSession not found with ID: " + sessionId);
        }

        return attendanceRecordRepository.findBySession_SessionId(sessionId)
                .stream()
                .map(attendanceRecordMapper::toAttendanceRecordResponse)
                .toList();
    }

    @Override
    public List<AttendanceRecordResponse> getAttendanceForStudent(Long studentId) {
        if (studentId == null) {
            throw new ValidationException("Student ID cannot be null");
        }
        if (!studentRepository.existsById(studentId)) {
            throw new EntryNotFoundException("Student not found with ID: " + studentId);
        }

        return attendanceRecordRepository.findByStudent_StudentId(studentId)
                .stream()
                .map(attendanceRecordMapper::toAttendanceRecordResponse)
                .toList();
    }
}
