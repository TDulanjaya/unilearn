package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.ProctoringFlagRequest;
import com.unilearn.server.dto.response.ProctoringFlagResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.ExamAttempt;
import com.unilearn.server.model.ProctoringFlag;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ProctoringFlagMapper {

    public ProctoringFlag toProctoringFlag(ProctoringFlagRequest request, ExamAttempt attempt) {
        if (request == null) {
            throw new ValidationException("ProctoringFlag request cannot be null");
        }
        return ProctoringFlag.builder()
                .attempt(attempt)
                .flagType(request.getFlagType())
                .notes(request.getNotes())
                .flaggedAt(LocalDateTime.now())
                .reviewed(false)
                .falsePositive(false)
                .build();
    }

    public ProctoringFlagResponse toProctoringFlagResponse(ProctoringFlag flag) {
        if (flag == null) {
            throw new ValidationException("ProctoringFlag cannot be null");
        }
        return ProctoringFlagResponse.builder()
                .flagId(flag.getFlagId())
                .attemptId(flag.getAttempt() != null ? flag.getAttempt().getAttemptId() : null)
                .flagType(flag.getFlagType())
                .description(flag.getNotes())
                .notes(flag.getNotes())
                .flaggedAt(flag.getFlaggedAt())
                .reviewed(flag.getReviewed())
                .reviewNotes(flag.getReviewNotes())
                .falsePositive(flag.getFalsePositive())
                .build();
    }
}
