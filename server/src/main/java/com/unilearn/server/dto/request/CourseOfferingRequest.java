package com.unilearn.server.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class CourseOfferingRequest {

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotNull(message = "Batch ID is required")
    private Long batchId;

    @NotNull(message = "Semester ID is required")
    private Long semesterId;

    @NotNull(message = "Primary lecturer ID is required")
    private Long primaryLecturerId;

    private Integer capacity;
}
