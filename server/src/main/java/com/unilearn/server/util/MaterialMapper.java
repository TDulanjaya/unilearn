package com.unilearn.server.util;

import com.unilearn.server.dto.request.MaterialRequest;
import com.unilearn.server.dto.response.MaterialResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Lecturer;
import com.unilearn.server.model.Material;
import org.springframework.stereotype.Component;

@Component
public class MaterialMapper {

    public Material toMaterial(MaterialRequest request, CourseOffering offering, Lecturer lecturer) {
        if (request == null) {
            throw new ValidationException("Material request cannot be null");
        }
        return Material.builder()
                .courseOffering(offering)
                .title(request.getTitle())
                .resourceType(request.getResourceType())
                .fileUrl(request.getFileUrl())
                .linkUrl(request.getLinkUrl())
                .uploadedBy(lecturer)
                .build();
    }

    public MaterialResponse toMaterialResponse(Material material) {
        if (material == null) {
            throw new ValidationException("Material cannot be null");
        }
        return MaterialResponse.builder()
                .materialId(material.getMaterialId())
                .offeringId(material.getCourseOffering() != null ? material.getCourseOffering().getOfferingId() : null)
                .title(material.getTitle())
                .resourceType(material.getResourceType())
                .fileUrl(material.getFileUrl())
                .linkUrl(material.getLinkUrl())
                .externalLink(material.getLinkUrl())
                .uploadedAt(material.getUploadedAt())
                .uploadedById(material.getUploadedBy() != null ? material.getUploadedBy().getLecturerId() : null)
                .uploadedByName(material.getUploadedBy() != null && material.getUploadedBy().getUser() != null ? material.getUploadedBy().getUser().getFullName() : null)
                .build();
    }
}
