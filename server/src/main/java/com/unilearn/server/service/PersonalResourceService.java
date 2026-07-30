package com.unilearn.server.service;

import com.unilearn.server.dto.request.PersonalResourceRequest;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.PersonalResourceResponse;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for managing personal resources.
 */
public interface PersonalResourceService {

    PersonalResourceResponse createPersonalResource(PersonalResourceRequest request);

    PersonalResourceResponse updatePersonalResource(Long resourceId, PersonalResourceRequest request);

    void deletePersonalResource(Long resourceId);

    PersonalResourceResponse getResourceById(Long resourceId);

    PageResponseDTO<PersonalResourceResponse> getResourcesByUser(Long userId, Pageable pageable);
}
