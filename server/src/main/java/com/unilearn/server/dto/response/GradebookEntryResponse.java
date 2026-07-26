package com.unilearn.server.dto.response;

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
public class GradebookEntryResponse {
    private Long entryId;
    private Long gradebookId;
    private Long studentId;
    private String studentName;
    private Long offeringId;
    private String itemType;
    private String component;
    private Integer itemId;
    private Integer componentRefId;
    private BigDecimal weightPct;
    private BigDecimal score;
    private BigDecimal maxScore;
}
