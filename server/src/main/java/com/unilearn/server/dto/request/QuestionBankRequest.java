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
public class QuestionBankRequest {

    @NotNull(message = "Course ID is required")
    private Long courseId;

    // set by the server from the logged in user
    private Long createdByLecturerId;
}
