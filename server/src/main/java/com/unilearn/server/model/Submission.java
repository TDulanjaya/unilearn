package com.unilearn.server.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long submissionId;

    @ManyToOne
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(length = 500)
    private String fileUrl;

    @Builder.Default
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Builder.Default
    private Boolean isResubmission = false;

    @Builder.Default
    private Boolean isLate = false;

    @Column(precision = 6, scale = 2)
    private BigDecimal grade;

    @Lob
    private String feedback;

    @ManyToOne
    @JoinColumn(name = "graded_by")
    private Lecturer gradedBy;

    private LocalDateTime gradedAt;
}
