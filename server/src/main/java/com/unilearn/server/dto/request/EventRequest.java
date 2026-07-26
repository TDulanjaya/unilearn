package com.unilearn.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class EventRequest {

    @NotBlank(message = "Event title is required")
    @Size(max = 200, message = "Event title must not exceed 200 characters")
    private String title;

    private String description;

    @Size(max = 100, message = "Venue must not exceed 100 characters")
    private String venue;

    @NotNull(message = "Event date/time is required")
    private LocalDateTime eventDate;

    private Long facultyId;

    @NotNull(message = "Creator staff ID is required")
    private Long createdByStaffId;
}
