package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.MaterialRequest;
import com.unilearn.server.dto.response.MaterialResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Lecturer;
import com.unilearn.server.model.Material;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.LecturerRepository;
import com.unilearn.server.repository.MaterialRepository;
import com.unilearn.server.service.MaterialService;
import com.unilearn.server.util.mapper.MaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final LecturerRepository lecturerRepository;
    private final MaterialMapper materialMapper;
    private final com.unilearn.server.security.OwnershipValidator ownershipValidator;
    private final com.unilearn.server.repository.EnrollmentRepository enrollmentRepository;
    private final com.unilearn.server.ai.MaterialChunkService materialChunkService;

    @Override
    @Transactional
    public MaterialResponse createMaterial(MaterialRequest request) {
        if (request == null) {
            throw new ValidationException("Material request cannot be null");
        }
        ownershipValidator.checkLecturerOfferingAccess(request.getOfferingId());

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        Lecturer lecturer = currentLecturer();
        request.setUploadedById(lecturer.getLecturerId());

        Material material = materialMapper.toMaterial(request, offering, lecturer);
        Material saved = materialRepository.save(material);
        materialChunkService.processMaterial(saved);
        return materialMapper.toMaterialResponse(saved);
    }

    @Override
    @Transactional
    public MaterialResponse updateMaterial(Long materialId, MaterialRequest request) {
        if (materialId == null) {
            throw new ValidationException("Material ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Material request cannot be null");
        }

        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new EntryNotFoundException("Material not found with ID: " + materialId));

        if (material.getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(material.getCourseOffering().getOfferingId());
        }
        ownershipValidator.checkLecturerOfferingAccess(request.getOfferingId());

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        // keep the original uploader
        Lecturer lecturer = material.getUploadedBy() != null ? material.getUploadedBy() : currentLecturer();

        material.setCourseOffering(offering);
        material.setTitle(request.getTitle());
        material.setResourceType(request.getResourceType());
        material.setFileUrl(request.getFileUrl());
        material.setLinkUrl(request.getLinkUrl());
        material.setUploadedBy(lecturer);

        Material updated = materialRepository.save(material);
        materialChunkService.processMaterial(updated);
        return materialMapper.toMaterialResponse(updated);
    }

    @Override
    @Transactional
    public void deleteMaterial(Long materialId) {
        if (materialId == null) {
            throw new ValidationException("Material ID cannot be null");
        }
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new EntryNotFoundException("Material not found with ID: " + materialId));

        if (material.getCourseOffering() != null) {
            ownershipValidator.checkLecturerOfferingAccess(material.getCourseOffering().getOfferingId());
        }

        materialChunkService.deleteChunksForMaterial(materialId);
        materialRepository.delete(material);
    }

    @Override
    public MaterialResponse getMaterialById(Long materialId) {
        if (materialId == null) {
            throw new ValidationException("Material ID cannot be null");
        }
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new EntryNotFoundException("Material not found with ID: " + materialId));

        if (material.getCourseOffering() != null) {
            Long offId = material.getCourseOffering().getOfferingId();
            if (ownershipValidator.isLecturer()) {
                ownershipValidator.checkLecturerOfferingAccess(offId);
            } else if (ownershipValidator.isStudent()) {
                var currentUser = ownershipValidator.getCurrentUser();
                if (currentUser.isPresent() && !enrollmentRepository.existsByStudent_StudentIdAndCourseOffering_OfferingId(currentUser.get().getUserId(), offId)) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not enrolled in this course offering");
                }
            }
        }

        return materialMapper.toMaterialResponse(material);
    }

    @Override
    public PageResponseDTO<MaterialResponse> getMaterialsByOffering(Long offeringId, Pageable pageable) {
        if (offeringId == null) {
            throw new ValidationException("Offering ID cannot be null");
        }
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new EntryNotFoundException("CourseOffering not found with ID: " + offeringId);
        }

        if (ownershipValidator.isLecturer()) {
            ownershipValidator.checkLecturerOfferingAccess(offeringId);
        } else if (ownershipValidator.isStudent()) {
            var currentUser = ownershipValidator.getCurrentUser();
            if (currentUser.isPresent() && !enrollmentRepository.existsByStudent_StudentIdAndCourseOffering_OfferingId(currentUser.get().getUserId(), offeringId)) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not enrolled in this course offering");
            }
        }

        Page<Material> page = materialRepository.findByCourseOffering_OfferingId(offeringId, pageable);
        List<MaterialResponse> content = page.getContent()
                .stream()
                .map(materialMapper::toMaterialResponse)
                .toList();

        return PageResponseDTO.<MaterialResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }

    // the logged in lecturer, not the id sent by the browser
    private Lecturer currentLecturer() {
        com.unilearn.server.model.User user = ownershipValidator.getCurrentUser()
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("User not authenticated"));
        return lecturerRepository.findById(user.getUserId())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Only lecturers can do this"));
    }
}
