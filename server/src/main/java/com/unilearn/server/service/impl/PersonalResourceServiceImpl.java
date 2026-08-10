package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.PersonalResourceRequest;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.PersonalResourceResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.PersonalResource;
import com.unilearn.server.model.Student;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.PersonalResourceRepository;
import com.unilearn.server.repository.StudentRepository;
import com.unilearn.server.service.PersonalResourceService;
import com.unilearn.server.util.mapper.PersonalResourceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PersonalResourceServiceImpl implements PersonalResourceService {

    private final PersonalResourceRepository personalResourceRepository;
    private final StudentRepository studentRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final PersonalResourceMapper personalResourceMapper;

    @Override
    @Transactional
    public PersonalResourceResponse createPersonalResource(PersonalResourceRequest request) {
        if (request == null) {
            throw new ValidationException("PersonalResource request cannot be null");
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + request.getStudentId()));

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        PersonalResource resource = personalResourceMapper.toPersonalResource(request, student, offering);
        PersonalResource saved = personalResourceRepository.save(resource);
        return personalResourceMapper.toPersonalResourceResponse(saved);
    }

    @Override
    @Transactional
    public PersonalResourceResponse updatePersonalResource(Long resourceId, PersonalResourceRequest request) {
        if (resourceId == null) {
            throw new ValidationException("Resource ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("PersonalResource request cannot be null");
        }

        PersonalResource resource = personalResourceRepository.findById(resourceId)
                .orElseThrow(() -> new EntryNotFoundException("PersonalResource not found with ID: " + resourceId));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntryNotFoundException("Student not found with ID: " + request.getStudentId()));

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        resource.setStudent(student);
        resource.setCourseOffering(offering);
        resource.setTitle(request.getTitle());
        resource.setFileUrl(request.getFileUrl());
        resource.setFileSizeKb(request.getFileSizeKb());

        PersonalResource updated = personalResourceRepository.save(resource);
        return personalResourceMapper.toPersonalResourceResponse(updated);
    }

    @Override
    @Transactional
    public void deletePersonalResource(Long resourceId, Long currentUserId) {
        if (resourceId == null) {
            throw new ValidationException("Resource ID cannot be null");
        }
        PersonalResource resource = personalResourceRepository.findById(resourceId)
                .orElseThrow(() -> new EntryNotFoundException("PersonalResource not found with ID: " + resourceId));
        if (currentUserId != null && resource.getStudent() != null
                && !currentUserId.equals(resource.getStudent().getStudentId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You do not own this resource");
        }
        personalResourceRepository.delete(resource);
    }

    @Override
    public PersonalResourceResponse getResourceById(Long resourceId) {
        if (resourceId == null) {
            throw new ValidationException("Resource ID cannot be null");
        }
        PersonalResource resource = personalResourceRepository.findById(resourceId)
                .orElseThrow(() -> new EntryNotFoundException("PersonalResource not found with ID: " + resourceId));
        return personalResourceMapper.toPersonalResourceResponse(resource);
    }

    @Override
    public PageResponseDTO<PersonalResourceResponse> getResourcesByUser(Long userId, Pageable pageable) {
        if (userId == null) {
            throw new ValidationException("User ID cannot be null");
        }
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        if (!studentRepository.existsById(userId)) {
            throw new EntryNotFoundException("Student not found with ID: " + userId);
        }

        Page<PersonalResource> page = personalResourceRepository.findByStudent_StudentId(userId, pageable);
        List<PersonalResourceResponse> content = page.getContent()
                .stream()
                .map(personalResourceMapper::toPersonalResourceResponse)
                .toList();

        return PageResponseDTO.<PersonalResourceResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }
}
