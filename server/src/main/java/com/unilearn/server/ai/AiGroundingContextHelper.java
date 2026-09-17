package com.unilearn.server.ai;

import com.unilearn.server.model.Material;
import com.unilearn.server.model.PersonalResource;
import com.unilearn.server.repository.MaterialRepository;
import com.unilearn.server.repository.PersonalResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AiGroundingContextHelper {

    private final MaterialRepository materialRepository;
    private final PersonalResourceRepository personalResourceRepository;

    public String fetchCourseContext(Long offeringId, String sourceScope) {
        return fetchCourseContext(offeringId, null, sourceScope);
    }

    public String fetchCourseContext(Long offeringId, Long studentId, String sourceScope) {
        if (offeringId == null) {
            return "General Course Study";
        }

        List<Material> materials = materialRepository.findByCourseOffering_OfferingId(offeringId);
        List<Material> filteredMaterials = materials != null ? materials : Collections.emptyList();

        // Scope distinction: "ongoing_topics" vs "full_course"
        if ("ongoing_topics".equalsIgnoreCase(sourceScope) && !filteredMaterials.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            filteredMaterials = filteredMaterials.stream()
                    .filter(m -> m.getUploadedAt() == null || !m.getUploadedAt().isAfter(now))
                    .sorted(Comparator.comparing(Material::getUploadedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                    .toList();
        }

        List<PersonalResource> personalResources = Collections.emptyList();
        if (studentId != null) {
            personalResources = personalResourceRepository
                    .findByStudent_StudentIdAndCourseOffering_OfferingId(studentId, offeringId);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Course Offering ID: ").append(offeringId).append("\n");
        sb.append("Scope: ").append(sourceScope != null ? sourceScope : "full_course").append("\n\n");

        sb.append("=== SECTION 1: OFFICIAL COURSE MATERIALS (Uploaded by Lecturer) ===\n");
        if (filteredMaterials.isEmpty()) {
            sb.append("No official lecturer materials uploaded for this offering yet.\n");
        } else {
            for (int i = 0; i < filteredMaterials.size(); i++) {
                Material m = filteredMaterials.get(i);
                sb.append(i + 1).append(". ").append(m.getTitle())
                        .append(" [Type: ").append(m.getResourceType()).append("]");
                if (m.getFileUrl() != null && !m.getFileUrl().isBlank()) {
                    sb.append(" (File: ").append(m.getFileUrl()).append(")");
                }
                if (m.getLinkUrl() != null && !m.getLinkUrl().isBlank()) {
                    sb.append(" (Link: ").append(m.getLinkUrl()).append(")");
                }
                sb.append("\n");
            }
        }
        sb.append("\n");

        sb.append("=== SECTION 2: STUDENT PERSONAL STUDY RESOURCES (Uploaded by Student) ===\n");
        if (personalResources == null || personalResources.isEmpty()) {
            sb.append("No personal study resources uploaded by the student for this course.\n");
        } else {
            for (int i = 0; i < personalResources.size(); i++) {
                PersonalResource pr = personalResources.get(i);
                sb.append(i + 1).append(". Title: ").append(pr.getTitle());
                if (pr.getFileUrl() != null && !pr.getFileUrl().isBlank()) {
                    sb.append(" (File: ").append(pr.getFileUrl()).append(")");
                }
                if (pr.getFileSizeKb() != null) {
                    sb.append(" [Size: ").append(pr.getFileSizeKb()).append(" KB]");
                }
                sb.append("\n");
            }
        }

        return sb.toString();
    }
}
