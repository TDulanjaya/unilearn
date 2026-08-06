package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.CourseOfferingRequest;
import com.unilearn.server.dto.response.CourseOfferingResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Batch;
import com.unilearn.server.model.Course;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Lecturer;
import com.unilearn.server.model.Semester;
import com.unilearn.server.repository.BatchRepository;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.CourseRepository;
import com.unilearn.server.repository.LecturerRepository;
import com.unilearn.server.repository.SemesterRepository;
import com.unilearn.server.service.CourseOfferingService;
import com.unilearn.server.util.mapper.CourseOfferingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseOfferingServiceImpl implements CourseOfferingService {

    private final CourseOfferingRepository courseOfferingRepository;
    private final CourseRepository courseRepository;
    private final BatchRepository batchRepository;
    private final SemesterRepository semesterRepository;
    private final LecturerRepository lecturerRepository;
    private final CourseOfferingMapper courseOfferingMapper;

    @Override
    @Transactional
    public CourseOfferingResponse createCourseOffering(CourseOfferingRequest request) {
        if (request == null) {
            throw new ValidationException("Course offering request cannot be null");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new EntryNotFoundException("Course not found with ID: " + request.getCourseId()));

        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new EntryNotFoundException("Batch not found with ID: " + request.getBatchId()));

        Semester semester = semesterRepository.findById(request.getSemesterId())
                .orElseThrow(() -> new EntryNotFoundException("Semester not found with ID: " + request.getSemesterId()));

        Lecturer lecturer = lecturerRepository.findById(request.getPrimaryLecturerId())
                .orElseThrow(() -> new EntryNotFoundException("Lecturer not found with ID: " + request.getPrimaryLecturerId()));

        boolean exists = courseOfferingRepository.findByCourse_CourseIdAndBatch_BatchIdAndSemester_SemesterId(
                request.getCourseId(), request.getBatchId(), request.getSemesterId()).isPresent();

        if (exists) {
            throw new com.unilearn.server.exception.DuplicateEntryException("This course is already offered to this batch in this semester");
        }

        CourseOffering offering = courseOfferingMapper.toCourseOffering(request, course, batch, semester, lecturer);
        CourseOffering saved = courseOfferingRepository.save(offering);
        return courseOfferingMapper.toCourseOfferingResponse(saved);
    }

    @Override
    @Transactional
    public CourseOfferingResponse updateCourseOffering(Long offeringId, CourseOfferingRequest request) {
        if (offeringId == null) {
            throw new ValidationException("Offering ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Course offering request cannot be null");
        }

        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + offeringId));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new EntryNotFoundException("Course not found with ID: " + request.getCourseId()));

        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new EntryNotFoundException("Batch not found with ID: " + request.getBatchId()));

        Semester semester = semesterRepository.findById(request.getSemesterId())
                .orElseThrow(() -> new EntryNotFoundException("Semester not found with ID: " + request.getSemesterId()));

        Lecturer lecturer = lecturerRepository.findById(request.getPrimaryLecturerId())
                .orElseThrow(() -> new EntryNotFoundException("Lecturer not found with ID: " + request.getPrimaryLecturerId()));

        offering.setCourse(course);
        offering.setBatch(batch);
        offering.setSemester(semester);
        offering.setPrimaryLecturer(lecturer);
        if (request.getCapacity() != null) {
            offering.setCapacity(request.getCapacity());
        }

        CourseOffering updated = courseOfferingRepository.save(offering);
        return courseOfferingMapper.toCourseOfferingResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCourseOffering(Long offeringId) {
        if (offeringId == null) {
            throw new ValidationException("Offering ID cannot be null");
        }
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new EntryNotFoundException("CourseOffering not found with ID: " + offeringId);
        }
        courseOfferingRepository.deleteById(offeringId);
    }

    @Override
    public CourseOfferingResponse getCourseOfferingById(Long offeringId) {
        if (offeringId == null) {
            throw new ValidationException("Offering ID cannot be null");
        }
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + offeringId));
        return courseOfferingMapper.toCourseOfferingResponse(offering);
    }

    @Override
    public List<CourseOfferingResponse> getOfferingsByCourse(Long courseId) {
        if (courseId == null) {
            throw new ValidationException("Course ID cannot be null");
        }
        if (!courseRepository.existsById(courseId)) {
            throw new EntryNotFoundException("Course not found with ID: " + courseId);
        }
        return courseOfferingRepository.findByCourse_CourseId(courseId)
                .stream()
                .map(courseOfferingMapper::toCourseOfferingResponse)
                .toList();
    }

    @Override
    public List<CourseOfferingResponse> getOfferingsByBatch(Long batchId) {
        if (batchId == null) {
            throw new ValidationException("Batch ID cannot be null");
        }
        if (!batchRepository.existsById(batchId)) {
            throw new EntryNotFoundException("Batch not found with ID: " + batchId);
        }
        return courseOfferingRepository.findByBatch_BatchId(batchId)
                .stream()
                .map(courseOfferingMapper::toCourseOfferingResponse)
                .toList();
    }

    @Override
    public List<CourseOfferingResponse> getOfferingsBySemester(Long semesterId) {
        if (semesterId == null) {
            throw new ValidationException("Semester ID cannot be null");
        }
        if (!semesterRepository.existsById(semesterId)) {
            throw new EntryNotFoundException("Semester not found with ID: " + semesterId);
        }
        return courseOfferingRepository.findBySemester_SemesterId(semesterId)
                .stream()
                .map(courseOfferingMapper::toCourseOfferingResponse)
                .toList();
    }

    @Override
    public List<CourseOfferingResponse> getOfferingsByLecturer(Long lecturerId) {
        if (lecturerId == null) {
            throw new ValidationException("Lecturer ID cannot be null");
        }
        if (!lecturerRepository.existsById(lecturerId)) {
            throw new EntryNotFoundException("Lecturer not found with ID: " + lecturerId);
        }
        return courseOfferingRepository.findByPrimaryLecturer_LecturerId(lecturerId)
                .stream()
                .map(courseOfferingMapper::toCourseOfferingResponse)
                .toList();
    }

    @Override
    public long getEnrollmentCount(Long offeringId) {
        if (offeringId == null) {
            throw new ValidationException("Offering ID cannot be null");
        }
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new EntryNotFoundException("CourseOffering not found with ID: " + offeringId);
        }
        return courseOfferingRepository.countEnrollmentsByOfferingId(offeringId);
    }

    @Override
    public List<com.unilearn.server.dto.response.courseoffering.CourseOfferingListItemDTO> getOfferingListItemsByBatch(Long batchId) {
        if (batchId == null) {
            throw new ValidationException("Batch ID cannot be null");
        }
        if (!batchRepository.existsById(batchId)) {
            throw new EntryNotFoundException("Batch not found with ID: " + batchId);
        }

        return courseOfferingRepository.findByBatch_BatchId(batchId)
                .stream()
                .map(offering -> {
                    long count = courseOfferingRepository.countEnrollmentsByOfferingId(offering.getOfferingId());
                    return courseOfferingMapper.toCourseOfferingListItemDTO(offering, count);
                })
                .toList();
    }

    @Override
    public List<CourseOfferingResponse> getAllCourseOfferings() {
        return courseOfferingRepository.findAll()
                .stream()
                .map(courseOfferingMapper::toCourseOfferingResponse)
                .toList();
    }
}
