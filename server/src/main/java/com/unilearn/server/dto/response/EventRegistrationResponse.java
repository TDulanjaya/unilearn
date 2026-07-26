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
public class EventRegistrationResponse {
    private Long registrationId;
    private Long eventId;
    private Long studentId;
    private String studentName;
    private String rsvpStatus;
    private LocalDateTime registeredAt;
}
