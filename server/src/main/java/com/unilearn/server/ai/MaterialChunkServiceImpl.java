package com.unilearn.server.ai;

import com.unilearn.server.model.Material;
import com.unilearn.server.model.MaterialChunk;
import com.unilearn.server.model.PersonalResource;
import com.unilearn.server.repository.MaterialChunkRepository;
import com.unilearn.server.repository.MaterialRepository;
import com.unilearn.server.repository.PersonalResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaterialChunkServiceImpl implements MaterialChunkService {

    private final MaterialChunkRepository materialChunkRepository;
    private final DocumentTextExtractorService textExtractorService;
    private final TextChunker textChunker;
    private final MaterialRepository materialRepository;
    private final PersonalResourceRepository personalResourceRepository;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private javax.sql.DataSource dataSource;
    private volatile Boolean isMySql = null;

    private boolean isMySqlDatabase() {
        if (isMySql != null) {
            return isMySql;
        }
        if (dataSource == null) {
            return false;
        }
        try (var conn = dataSource.getConnection()) {
            String name = conn.getMetaData().getDatabaseProductName();
            isMySql = name != null && name.toLowerCase().contains("mysql");
        } catch (Exception e) {
            isMySql = false;
        }
        return isMySql;
    }

    @Override
    @Transactional
    public void processMaterial(Material material) {
        if (material == null || material.getMaterialId() == null) {
            return;
        }

        Long materialId = material.getMaterialId();
        Long offeringId = material.getCourseOffering() != null ? material.getCourseOffering().getOfferingId() : null;
        if (offeringId == null) {
            log.warn("Cannot chunk material {}: course offering is missing", materialId);
            return;
        }

        // remove old chunks if re-uploading
        materialChunkRepository.deleteByMaterialId(materialId);

        String fileUrl = material.getFileUrl();
        if (fileUrl == null || fileUrl.isBlank()) {
            log.info("Material {} has no file URL to extract text from.", materialId);
            return;
        }

        String extractedText = textExtractorService.extractTextFromUrl(fileUrl);
        if (extractedText == null || extractedText.isBlank()) {
            log.info("No text content could be extracted from material file: {}", fileUrl);
            return;
        }

        List<String> textChunks = textChunker.splitIntoChunks(extractedText);
        List<MaterialChunk> entities = new ArrayList<>();
        String sourceTitle = material.getTitle() != null && !material.getTitle().isBlank()
                ? material.getTitle()
                : "Course Material #" + materialId;

        for (int i = 0; i < textChunks.size(); i++) {
            entities.add(MaterialChunk.builder()
                    .offeringId(offeringId)
                    .materialId(materialId)
                    .personalResourceId(null)
                    .studentId(null)
                    .ownerStudentId(null)
                    .sourceType("LECTURER")
                    .chunkIndex(i)
                    .sourceTitle(sourceTitle)
                    .content(textChunks.get(i))
                    .build());
        }

        if (!entities.isEmpty()) {
            materialChunkRepository.saveAll(entities);
            log.info("Successfully extracted and stored {} chunks for lecturer material ID {} ('{}')",
                    entities.size(), materialId, sourceTitle);
        }
    }

    @Override
    @Transactional
    public void processPersonalResource(PersonalResource resource) {
        if (resource == null || resource.getResourceId() == null) {
            return;
        }

        Long resourceId = resource.getResourceId();
        Long offeringId = resource.getCourseOffering() != null ? resource.getCourseOffering().getOfferingId() : null;
        Long studentId = resource.getStudent() != null ? resource.getStudent().getStudentId() : null;

        if (offeringId == null || studentId == null) {
            log.warn("Cannot chunk personal resource {}: offeringId or studentId is missing", resourceId);
            return;
        }

        materialChunkRepository.deleteByPersonalResourceId(resourceId);

        String fileUrl = resource.getFileUrl();
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        String extractedText = textExtractorService.extractTextFromUrl(fileUrl);
        if (extractedText == null || extractedText.isBlank()) {
            log.info("No text content could be extracted from personal resource file: {}", fileUrl);
            return;
        }

        List<MaterialChunk> entities = new ArrayList<>();
        String sourceTitle = resource.getTitle() != null && !resource.getTitle().isBlank()
                ? resource.getTitle()
                : "Student Study Resource #" + resourceId;

        if ("text not available".equalsIgnoreCase(extractedText.trim())) {
            entities.add(MaterialChunk.builder()
                    .offeringId(offeringId)
                    .materialId(null)
                    .personalResourceId(resourceId)
                    .studentId(studentId)
                    .ownerStudentId(studentId)
                    .sourceType("PERSONAL")
                    .chunkIndex(0)
                    .sourceTitle(sourceTitle)
                    .content("text not available")
                    .build());
        } else {
            List<String> textChunks = textChunker.splitIntoChunks(extractedText);
            for (int i = 0; i < textChunks.size(); i++) {
                entities.add(MaterialChunk.builder()
                        .offeringId(offeringId)
                        .materialId(null)
                        .personalResourceId(resourceId)
                        .studentId(studentId)
                        .ownerStudentId(studentId)
                        .sourceType("PERSONAL")
                        .chunkIndex(i)
                        .sourceTitle(sourceTitle)
                        .content(textChunks.get(i))
                        .build());
            }
        }

        if (!entities.isEmpty()) {
            materialChunkRepository.saveAll(entities);
            log.info("Successfully stored {} chunks for student ID {} personal resource ID {} ('{}')",
                    entities.size(), studentId, resourceId, sourceTitle);
        }
    }

    @Override
    @Transactional
    public void deleteChunksForMaterial(Long materialId) {
        if (materialId != null) {
            materialChunkRepository.deleteByMaterialId(materialId);
        }
    }

    @Override
    @Transactional
    public void deleteChunksForPersonalResource(Long personalResourceId) {
        if (personalResourceId != null) {
            materialChunkRepository.deleteByPersonalResourceId(personalResourceId);
        }
    }

    @Override
    public List<MaterialChunk> findRelevantChunks(Long offeringId, Long studentId, String scope, String query, int limit) {
        if (offeringId == null) {
            return List.of();
        }

        String effectiveScope = normalizeScope(scope);
        int targetLimit = Math.max(1, Math.min(limit, 10));
        Map<Long, MaterialChunk> distinctMap = new LinkedHashMap<>();

        // try fulltext search first
        if (isMySqlDatabase() && query != null && !query.trim().isBlank()) {
            try {
                List<MaterialChunk> fulltextResults = materialChunkRepository.searchFulltext(
                        offeringId, studentId, effectiveScope, query.trim(), targetLimit);
                if (fulltextResults != null) {
                    for (MaterialChunk c : fulltextResults) {
                        distinctMap.put(c.getId(), c);
                        if (distinctMap.size() >= targetLimit) {
                            return new ArrayList<>(distinctMap.values());
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("FULLTEXT query failed (falling back to keyword/recent search): {}", e.getMessage());
            }

            // fall back to keyword search
            java.util.Set<String> stopWords = java.util.Set.of(
                    "what", "where", "when", "which", "who", "whom", "whose", "why", "how",
                    "the", "and", "for", "with", "from", "that", "this", "these", "those",
                    "are", "was", "were", "been", "being", "have", "has", "had", "does", "did",
                    "can", "could", "will", "would", "should", "tell", "explain", "describe", "about"
            );
            String[] tokens = query.replaceAll("[^a-zA-Z0-9\\s]", " ").split("\\s+");
            List<String> meaningfulTokens = new ArrayList<>();
            for (String token : tokens) {
                String cleanToken = token.trim().toLowerCase();
                if (cleanToken.length() >= 3 && !stopWords.contains(cleanToken)) {
                    meaningfulTokens.add(cleanToken);
                }
            }
            if (meaningfulTokens.isEmpty()) {
                for (String token : tokens) {
                    if (token.trim().length() >= 3) {
                        meaningfulTokens.add(token.trim().toLowerCase());
                    }
                }
            }

            for (String token : meaningfulTokens) {
                try {
                    List<MaterialChunk> keywordMatches = materialChunkRepository.searchKeyword(
                            offeringId, studentId, effectiveScope, token);
                    if (keywordMatches != null) {
                        for (MaterialChunk c : keywordMatches) {
                            distinctMap.put(c.getId(), c);
                            if (distinctMap.size() >= targetLimit) {
                                return new ArrayList<>(distinctMap.values());
                            }
                        }
                    }
                } catch (Exception ex) {
                    // ignore error
                }
            }
        }

        // fill remaining with course chunks
        try {
            List<MaterialChunk> allAccessible = materialChunkRepository.findAllAccessibleChunks(offeringId, studentId, effectiveScope);
            if (allAccessible != null) {
                for (MaterialChunk c : allAccessible) {
                    distinctMap.put(c.getId(), c);
                    if (distinctMap.size() >= targetLimit) {
                        break;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch accessible fallback chunks: {}", e.getMessage());
        }

        return new ArrayList<>(distinctMap.values());
    }

    private String normalizeScope(String scope) {
        if (scope == null || scope.isBlank()) {
            return "both";
        }
        String s = scope.trim().toLowerCase();
        if ("my_notes".equals(s) || "personal".equals(s) || "notes".equals(s)) {
            return "my_notes";
        }
        if ("course_materials".equals(s) || "lecturer".equals(s) || "materials".equals(s)) {
            return "course_materials";
        }
        return "both";
    }

    @Override
    @Transactional
    public int backfillAllMaterials(Long offeringIdFilter) {
        log.info("Starting one-time backfill of material chunks (offering filter: {})...", offeringIdFilter);
        int processedCount = 0;

        List<Material> materials = offeringIdFilter != null
                ? materialRepository.findByCourseOffering_OfferingId(offeringIdFilter)
                : materialRepository.findAll();

        if (materials != null) {
            for (Material m : materials) {
                if (m.getFileUrl() != null && !m.getFileUrl().isBlank()) {
                    if (!materialChunkRepository.existsByMaterialId(m.getMaterialId())) {
                        try {
                            processMaterial(m);
                            processedCount++;
                        } catch (Exception e) {
                            log.error("Failed to backfill material {}: {}", m.getMaterialId(), e.getMessage());
                        }
                    }
                }
            }
        }

        List<PersonalResource> personalResources = offeringIdFilter != null
                ? personalResourceRepository.findByCourseOffering_OfferingId(offeringIdFilter)
                : personalResourceRepository.findAll();

        if (personalResources != null) {
            for (PersonalResource pr : personalResources) {
                if (pr.getFileUrl() != null && !pr.getFileUrl().isBlank()) {
                    if (!materialChunkRepository.existsByPersonalResourceId(pr.getResourceId())) {
                        try {
                            processPersonalResource(pr);
                            processedCount++;
                        } catch (Exception e) {
                            log.error("Failed to backfill personal resource {}: {}", pr.getResourceId(), e.getMessage());
                        }
                    }
                }
            }
        }

        log.info("Backfill completed. Processed {} documents into material_chunks.", processedCount);
        return processedCount;
    }
}
