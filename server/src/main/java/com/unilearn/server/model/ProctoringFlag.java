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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "proctoring_flags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ProctoringFlag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long flagId;

    @ManyToOne
    @JoinColumn(name = "attempt_id", nullable = false)
    private ExamAttempt attempt;

    @Column(nullable = false, length = 50)
    private String flagType;

    private LocalDateTime flaggedAt = LocalDateTime.now();

    @Lob
    private String notes;
}
