package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class AcademicYearResponse {
    private Long academicYearId;
    private String yearLabel;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCurrent;
}
