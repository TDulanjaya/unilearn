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

    @Override
    @Transactional
    public MaterialResponse createMaterial(MaterialRequest request) {
        if (request == null) {
            throw new ValidationException("Material request cannot be null");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        Lecturer lecturer = lecturerRepository.findById(request.getUploadedById())
                .orElseThrow(() -> new EntryNotFoundException("Lecturer not found with ID: " + request.getUploadedById()));

        Material material = materialMapper.toMaterial(request, offering, lecturer);
        Material saved = materialRepository.save(material);
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

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        Lecturer lecturer = lecturerRepository.findById(request.getUploadedById())
                .orElseThrow(() -> new EntryNotFoundException("Lecturer not found with ID: " + request.getUploadedById()));

        material.setCourseOffering(offering);
        material.setTitle(request.getTitle());
        material.setResourceType(request.getResourceType());
        material.setFileUrl(request.getFileUrl());
        material.setLinkUrl(request.getLinkUrl());
        material.setUploadedBy(lecturer);

        Material updated = materialRepository.save(material);
        return materialMapper.toMaterialResponse(updated);
    }

    @Override
    @Transactional
    public void deleteMaterial(Long materialId) {
        if (materialId == null) {
            throw new ValidationException("Material ID cannot be null");
        }
        if (!materialRepository.existsById(materialId)) {
            throw new EntryNotFoundException("Material not found with ID: " + materialId);
        }
        materialRepository.deleteById(materialId);
    }

    @Override
    public MaterialResponse getMaterialById(Long materialId) {
        if (materialId == null) {
            throw new ValidationException("Material ID cannot be null");
        }
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new EntryNotFoundException("Material not found with ID: " + materialId));
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
}
