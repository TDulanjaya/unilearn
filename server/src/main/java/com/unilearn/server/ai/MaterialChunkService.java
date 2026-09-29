package com.unilearn.server.ai;

import com.unilearn.server.model.Material;
import com.unilearn.server.model.MaterialChunk;
import com.unilearn.server.model.PersonalResource;

import java.util.List;

public interface MaterialChunkService {

    void processMaterial(Material material);

    void processPersonalResource(PersonalResource resource);

    void deleteChunksForMaterial(Long materialId);

    void deleteChunksForPersonalResource(Long personalResourceId);

    List<MaterialChunk> findRelevantChunks(Long offeringId, Long studentId, String scope, String query, int limit);

    default List<MaterialChunk> findRelevantChunks(Long offeringId, Long studentId, String query, int limit) {
        return findRelevantChunks(offeringId, studentId, "both", query, limit);
    }

    int backfillAllMaterials(Long offeringIdFilter);
}
