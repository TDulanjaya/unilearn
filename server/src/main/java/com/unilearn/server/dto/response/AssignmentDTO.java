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
public class AssignmentDTO {
    private Long assignmentId;
    private Long offeringId;
    private String title;
    private String description;
    private LocalDateTime deadline;
    private BigDecimal maxScore;
    private Boolean allowResubmission;
    private Boolean resubmissionAllowed;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
}
