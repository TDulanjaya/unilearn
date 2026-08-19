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
public class EventResponse {
    private Long eventId;
    private String name;
    private String title;
    private String description;
    private Long facultyId;
    private String facultyName;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private LocalDateTime eventDate;
    private String venue;
    private String posterUrl;
    private Long createdById;
    private String createdByName;
}
