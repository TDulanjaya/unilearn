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
public class SemesterResponse {
    private Long semesterId;
    private Long academicYearId;
    private String academicYearLabel;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
}
