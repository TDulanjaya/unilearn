package com.unilearn.server.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "material_chunks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class MaterialChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "offering_id", nullable = false)
    private Long offeringId;

    @Column(name = "material_id")
    private Long materialId;

    @Column(name = "personal_resource_id")
    private Long personalResourceId;

    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "owner_student_id")
    private Long ownerStudentId;

    @Builder.Default
    @Column(name = "source_type", length = 20, nullable = false)
    private String sourceType = "LECTURER";

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(name = "source_title", nullable = false, length = 255)
    private String sourceTitle;

    @Lob
    @Column(name = "content", nullable = false, columnDefinition = "MEDIUMTEXT")
    private String content;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
