package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.ProctoringFlagRequest;
import com.unilearn.server.dto.response.ProctoringFlagResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.ExamAttempt;
import com.unilearn.server.model.ProctoringFlag;
import com.unilearn.server.repository.ExamAttemptRepository;
import com.unilearn.server.repository.ProctoringFlagRepository;
import com.unilearn.server.service.ProctoringFlagService;
import com.unilearn.server.util.ProctoringFlagMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProctoringFlagServiceImpl implements ProctoringFlagService {

    private final ProctoringFlagRepository proctoringFlagRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final ProctoringFlagMapper proctoringFlagMapper;

    @Override
    @Transactional
    public ProctoringFlagResponse flagAttempt(ProctoringFlagRequest request) {
        if (request == null) {
            throw new ValidationException("ProctoringFlag request cannot be null");
        }

        ExamAttempt attempt = examAttemptRepository.findById(request.getAttemptId())
                .orElseThrow(() -> new EntryNotFoundException("ExamAttempt not found with ID: " + request.getAttemptId()));

        ProctoringFlag flag = proctoringFlagMapper.toProctoringFlag(request, attempt);
        ProctoringFlag saved = proctoringFlagRepository.save(flag);

        attempt.setStatus("flagged");
        examAttemptRepository.save(attempt);

        return proctoringFlagMapper.toProctoringFlagResponse(saved);
    }

    @Override
    public List<ProctoringFlagResponse> getFlagsByAttempt(Long attemptId) {
        if (attemptId == null) {
            throw new ValidationException("Attempt ID cannot be null");
        }
        if (!examAttemptRepository.existsById(attemptId)) {
            throw new EntryNotFoundException("ExamAttempt not found with ID: " + attemptId);
        }

        return proctoringFlagRepository.findByAttempt_AttemptId(attemptId)
                .stream()
                .map(proctoringFlagMapper::toProctoringFlagResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProctoringFlagResponse resolveFlag(Long flagId, String reviewNotes, Boolean falsePositive) {
        if (flagId == null) {
            throw new ValidationException("Flag ID cannot be null");
        }

        ProctoringFlag flag = proctoringFlagRepository.findById(flagId)
                .orElseThrow(() -> new EntryNotFoundException("ProctoringFlag not found with ID: " + flagId));

        flag.setReviewed(true);
        flag.setReviewNotes(reviewNotes);
        flag.setFalsePositive(falsePositive != null ? falsePositive : false);

        ProctoringFlag updated = proctoringFlagRepository.save(flag);
        return proctoringFlagMapper.toProctoringFlagResponse(updated);
    }
}
