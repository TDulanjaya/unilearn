package com.unilearn.server.service;

import com.unilearn.server.dto.request.MaterialRequest;
import com.unilearn.server.dto.response.MaterialResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import org.springframework.data.domain.Pageable;

// Course materials service
public interface MaterialService {

    MaterialResponse createMaterial(MaterialRequest request);

    MaterialResponse updateMaterial(Long materialId, MaterialRequest request);

    void deleteMaterial(Long materialId);

    MaterialResponse getMaterialById(Long materialId);

    PageResponseDTO<MaterialResponse> getMaterialsByOffering(Long offeringId, Pageable pageable);
}
