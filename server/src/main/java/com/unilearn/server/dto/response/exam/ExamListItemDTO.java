package com.unilearn.server.dto.response.exam;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExamListItemDTO {

    private Long examId;
    private String examType;
    private String offeringCourseName;
    private LocalDate examDate;
    private String venue;
    private String status;
}
