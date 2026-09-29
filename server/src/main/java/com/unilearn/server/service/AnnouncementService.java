package com.unilearn.server.service;

import com.unilearn.server.dto.request.AnnouncementRequest;
import com.unilearn.server.dto.response.AnnouncementResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import org.springframework.data.domain.Pageable;

// Announcements service
public interface AnnouncementService {

    AnnouncementResponse createAnnouncement(AnnouncementRequest request);

    AnnouncementResponse updateAnnouncement(Long announcementId, AnnouncementRequest request);

    void deleteAnnouncement(Long announcementId);

    AnnouncementResponse getAnnouncementById(Long announcementId);

    PageResponseDTO<AnnouncementResponse> getAnnouncementsByScope(String scope, Long scopeId, Pageable pageable);
}
