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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "ai_quiz_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class AiQuizQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long questionId;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private AiQuizSession quizSession;

    @Column(nullable = false)
    private Integer orderNo;

    @Lob
    @Column(nullable = false)
    private String questionText;

    @Column(nullable = false, length = 20)
    private String questionType; // mcq, structured

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "options")
    private String options;

    @Lob
    @Column(nullable = false)
    private String correctAnswer;

    @Lob
    private String studentAnswer;

    private Boolean isCorrect;
    private Boolean answerRevealed = false;
}
