package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class ProctoringFlagResponse {
    private Long flagId;
    private Long attemptId;
    private String flagType;
    private String description;
    private String notes;
    private LocalDateTime flaggedAt;
    private Boolean reviewed;
    private String reviewNotes;
    private Boolean falsePositive;
}
