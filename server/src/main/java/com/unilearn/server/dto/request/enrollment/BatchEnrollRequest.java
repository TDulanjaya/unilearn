package com.unilearn.server.dto.request.enrollment;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

// Request body for enrolling a batch into multiple offerings
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BatchEnrollRequest {

    @NotEmpty(message = "At least one offering ID is required")
    private List<Long> offeringIds;
}
