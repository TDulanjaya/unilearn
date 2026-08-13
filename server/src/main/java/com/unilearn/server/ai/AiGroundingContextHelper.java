package com.unilearn.server.ai;

import com.unilearn.server.model.Material;
import com.unilearn.server.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AiGroundingContextHelper {

    private final MaterialRepository materialRepository;

    public String fetchCourseContext(Long offeringId, String sourceScope) {
        if (offeringId == null) {
            return "General Course Study";
        }

        List<Material> materials = materialRepository.findByCourseOffering_OfferingId(offeringId);
        if (materials == null || materials.isEmpty()) {
            return "Course Offering ID " + offeringId + " - No explicit course materials uploaded yet.";
        }

        // Scope distinction: "ongoing_topics" vs "full_course"
        List<Material> filteredMaterials = materials;
        if ("ongoing_topics".equalsIgnoreCase(sourceScope)) {
            LocalDateTime now = LocalDateTime.now();
            filteredMaterials = materials.stream()
                    .filter(m -> m.getUploadedAt() == null || !m.getUploadedAt().isAfter(now))
                    .sorted(Comparator.comparing(Material::getUploadedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                    .toList();
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Course Offering ID: ").append(offeringId).append("\n");
        sb.append("Scope: ").append(sourceScope != null ? sourceScope : "full_course").append("\n");
        sb.append("Relevant Course Materials:\n");

        for (int i = 0; i < filteredMaterials.size(); i++) {
            Material m = filteredMaterials.get(i);
            sb.append(i + 1).append(". Title: ").append(m.getTitle())
                    .append(" [Type: ").append(m.getResourceType()).append("]");
            if (m.getFileUrl() != null && !m.getFileUrl().isBlank()) {
                sb.append(" (File: ").append(m.getFileUrl()).append(")");
            }
            if (m.getLinkUrl() != null && !m.getLinkUrl().isBlank()) {
                sb.append(" (Link: ").append(m.getLinkUrl()).append(")");
            }
            sb.append("\n");
        }

        return sb.toString();
    }
}
