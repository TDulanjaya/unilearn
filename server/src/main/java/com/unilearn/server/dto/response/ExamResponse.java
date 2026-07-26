package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class ExamResponse {
    private Long examId;
    private Long offeringId;
    private String courseCode;
    private String examType;
    private LocalDateTime scheduledAt;
    private LocalDate examDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;
    private String venue;
    private Long linkedSlotId;
    private String status;
    private Long scheduledById;
    private String scheduledByName;
    private List<ExamAttemptResponse> examAttempts;
    private List<ExamResultResponse> examResults;
}
