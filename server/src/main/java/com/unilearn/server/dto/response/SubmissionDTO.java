package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class SubmissionDTO {
    private Long submissionId;
    private Long assignmentId;
    private Long studentId;
    private String studentName;
    private String fileUrl;
    private LocalDateTime submittedAt;
    private Boolean isResubmission;
    private BigDecimal score;
    private BigDecimal grade;
    private String feedback;
    private Long gradedById;
    private String gradedByName;
    private LocalDateTime gradedAt;
}
