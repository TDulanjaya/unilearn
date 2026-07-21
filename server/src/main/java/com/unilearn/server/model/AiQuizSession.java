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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_quiz_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class AiQuizSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sessionId;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "offering_id", nullable = false)
    private CourseOffering courseOffering;

    @Column(nullable = false, length = 20)
    private String questionType; // mcq, structured

    @Column(nullable = false)
    private Integer questionCount;

    @Column(nullable = false, length = 20)
    private String sourceScope; // full_course, ongoing_topics

    private LocalDateTime createdAt = LocalDateTime.now();
}
