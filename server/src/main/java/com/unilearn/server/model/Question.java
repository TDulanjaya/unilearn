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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long questionId;

    @ManyToOne
    @JoinColumn(name = "bank_id", nullable = false)
    private QuestionBank questionBank;

    @Lob
    @Column(nullable = false)
    private String questionText;

    @Column(nullable = false, length = 20)
    private String questionType; // mcq, essay, short_answer

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "options")
    private String options; // JSON string for PostgreSQL JSONB

    @Lob
    private String correctAnswer;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal marks;

    @Column(length = 10)
    private String difficulty; // easy, medium, hard

    @Column(length = 100)
    private String topic;
}
