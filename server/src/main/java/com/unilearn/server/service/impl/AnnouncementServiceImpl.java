package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.AnnouncementRequest;
import com.unilearn.server.dto.response.AnnouncementResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Announcement;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Faculty;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.AnnouncementRepository;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.repository.FacultyRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.service.AnnouncementService;
import com.unilearn.server.util.AnnouncementMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;
    private final AnnouncementMapper announcementMapper;

    @Override
    @Transactional
    public AnnouncementResponse createAnnouncement(AnnouncementRequest request) {
        if (request == null) {
            throw new ValidationException("Announcement request cannot be null");
        }

        User postedBy = userRepository.findById(request.getPostedByUserId())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getPostedByUserId()));

        CourseOffering offering = null;
        if (request.getOfferingId() != null) {
            offering = courseOfferingRepository.findById(request.getOfferingId())
                    .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        }

        Faculty faculty = null;
        if (request.getFacultyId() != null) {
            faculty = facultyRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new EntryNotFoundException("Faculty not found with ID: " + request.getFacultyId()));
        }

        Announcement announcement = announcementMapper.toAnnouncement(request, postedBy, offering, department, faculty);
        Announcement saved = announcementRepository.save(announcement);
        return announcementMapper.toAnnouncementResponse(saved);
    }

    @Override
    @Transactional
    public AnnouncementResponse updateAnnouncement(Long announcementId, AnnouncementRequest request) {
        if (announcementId == null) {
            throw new ValidationException("Announcement ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Announcement request cannot be null");
        }

        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new EntryNotFoundException("Announcement not found with ID: " + announcementId));

        User postedBy = userRepository.findById(request.getPostedByUserId())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getPostedByUserId()));

        CourseOffering offering = null;
        if (request.getOfferingId() != null) {
            offering = courseOfferingRepository.findById(request.getOfferingId())
                    .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new EntryNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        }

        Faculty faculty = null;
        if (request.getFacultyId() != null) {
            faculty = facultyRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new EntryNotFoundException("Faculty not found with ID: " + request.getFacultyId()));
        }

        announcement.setScope(request.getScope());
        announcement.setCourseOffering(offering);
        announcement.setDepartment(department);
        announcement.setFaculty(faculty);
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        announcement.setPostedBy(postedBy);

        Announcement updated = announcementRepository.save(announcement);
        return announcementMapper.toAnnouncementResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAnnouncement(Long announcementId) {
        if (announcementId == null) {
            throw new ValidationException("Announcement ID cannot be null");
        }
        if (!announcementRepository.existsById(announcementId)) {
            throw new EntryNotFoundException("Announcement not found with ID: " + announcementId);
        }
        announcementRepository.deleteById(announcementId);
    }

    @Override
    public AnnouncementResponse getAnnouncementById(Long announcementId) {
        if (announcementId == null) {
            throw new ValidationException("Announcement ID cannot be null");
        }
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new EntryNotFoundException("Announcement not found with ID: " + announcementId));
        return announcementMapper.toAnnouncementResponse(announcement);
    }

    @Override
    public PageResponseDTO<AnnouncementResponse> getAnnouncementsByScope(String scope, Long scopeId, Pageable pageable) {
        if (scope == null || scope.isBlank()) {
            throw new ValidationException("Scope cannot be empty");
        }
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }

        Page<Announcement> page;
        if ("course".equalsIgnoreCase(scope) && scopeId != null) {
            page = announcementRepository.findByCourseOffering_OfferingId(scopeId, pageable);
        } else if ("department".equalsIgnoreCase(scope) && scopeId != null) {
            page = announcementRepository.findByDepartment_DepartmentId(scopeId, pageable);
        } else if ("faculty".equalsIgnoreCase(scope) && scopeId != null) {
            page = announcementRepository.findByFaculty_FacultyId(scopeId, pageable);
        } else {
            page = announcementRepository.findByScope(scope, pageable);
        }

        List<AnnouncementResponse> content = page.getContent()
                .stream()
                .map(announcementMapper::toAnnouncementResponse)
                .toList();

        return PageResponseDTO.<AnnouncementResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }
}
