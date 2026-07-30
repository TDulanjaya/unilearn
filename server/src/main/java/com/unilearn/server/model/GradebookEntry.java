package com.unilearn.server.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Entity
@Table(name = "gradebook_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class GradebookEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long gradebookId;

    @ManyToOne
    @JoinColumn(name = "offering_id", nullable = false)
    private CourseOffering courseOffering;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 30)
    private String component; // assignment, midterm_inclass, final, attendance

    private Integer componentRefId;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal weightPct;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal score;
}
