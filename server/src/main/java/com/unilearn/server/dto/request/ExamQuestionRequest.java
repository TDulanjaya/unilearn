package com.unilearn.server.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class ExamQuestionRequest {

    @NotNull(message = "Exam ID is required")
    private Long examId;

    @NotNull(message = "Question ID is required")
    private Long questionId;

    private BigDecimal marksOverride;
}
