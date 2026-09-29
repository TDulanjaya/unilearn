package com.unilearn.server.repository;

import com.unilearn.server.model.MaterialChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;

import java.util.List;

@EnableJpaRepositories
public interface MaterialChunkRepository extends JpaRepository<MaterialChunk, Long> {

    void deleteByMaterialId(Long materialId);

    void deleteByPersonalResourceId(Long personalResourceId);

    boolean existsByMaterialId(Long materialId);

    boolean existsByPersonalResourceId(Long personalResourceId);

    // all chunks matching scope with privacy enforcement
    @Query("SELECT c FROM MaterialChunk c WHERE c.offeringId = :offeringId " +
            "AND (" +
            "  (:scope = 'my_notes' AND :studentId IS NOT NULL AND (c.sourceType = 'PERSONAL' OR c.personalResourceId IS NOT NULL) AND (c.ownerStudentId = :studentId OR c.studentId = :studentId)) " +
            "  OR (:scope = 'course_materials' AND (c.sourceType = 'LECTURER' OR (c.sourceType IS NULL AND c.personalResourceId IS NULL))) " +
            "  OR (:scope NOT IN ('my_notes', 'course_materials') AND ((c.sourceType = 'LECTURER' OR (c.sourceType IS NULL AND c.personalResourceId IS NULL)) OR (:studentId IS NOT NULL AND (c.ownerStudentId = :studentId OR c.studentId = :studentId))))" +
            ") ORDER BY c.id ASC")
    List<MaterialChunk> findAllAccessibleChunks(
            @Param("offeringId") Long offeringId,
            @Param("studentId") Long studentId,
            @Param("scope") String scope);

    // native fulltext search with privacy enforcement
    @Query(value = "SELECT * FROM material_chunks " +
            "WHERE offering_id = :offeringId " +
            "AND (" +
            "  (:scope = 'my_notes' AND :studentId IS NOT NULL AND (source_type = 'PERSONAL' OR personal_resource_id IS NOT NULL) AND (owner_student_id = :studentId OR student_id = :studentId)) " +
            "  OR (:scope = 'course_materials' AND (source_type = 'LECTURER' OR (source_type IS NULL AND personal_resource_id IS NULL))) " +
            "  OR (:scope NOT IN ('my_notes', 'course_materials') AND ((source_type = 'LECTURER' OR (source_type IS NULL AND personal_resource_id IS NULL)) OR (:studentId IS NOT NULL AND (owner_student_id = :studentId OR student_id = :studentId))))" +
            ") " +
            "AND MATCH(content) AGAINST (:query IN NATURAL LANGUAGE MODE) " +
            "ORDER BY MATCH(content) AGAINST (:query IN NATURAL LANGUAGE MODE) DESC " +
            "LIMIT :limit", nativeQuery = true)
    List<MaterialChunk> searchFulltext(
            @Param("offeringId") Long offeringId,
            @Param("studentId") Long studentId,
            @Param("scope") String scope,
            @Param("query") String query,
            @Param("limit") int limit);

    // keyword search fallback with privacy enforcement
    @Query("SELECT c FROM MaterialChunk c WHERE c.offeringId = :offeringId " +
            "AND (" +
            "  (:scope = 'my_notes' AND :studentId IS NOT NULL AND (c.sourceType = 'PERSONAL' OR c.personalResourceId IS NOT NULL) AND (c.ownerStudentId = :studentId OR c.studentId = :studentId)) " +
            "  OR (:scope = 'course_materials' AND (c.sourceType = 'LECTURER' OR (c.sourceType IS NULL AND c.personalResourceId IS NULL))) " +
            "  OR (:scope NOT IN ('my_notes', 'course_materials') AND ((c.sourceType = 'LECTURER' OR (c.sourceType IS NULL AND c.personalResourceId IS NULL)) OR (:studentId IS NOT NULL AND (c.ownerStudentId = :studentId OR c.studentId = :studentId))))" +
            ") " +
            "AND c.content LIKE CONCAT('%', :keyword, '%')")
    List<MaterialChunk> searchKeyword(
            @Param("offeringId") Long offeringId,
            @Param("studentId") Long studentId,
            @Param("scope") String scope,
            @Param("keyword") String keyword);
}
