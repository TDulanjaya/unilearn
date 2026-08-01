package com.unilearn.server.service;

import com.unilearn.server.dto.request.ExamRequest;
import com.unilearn.server.dto.request.exam.ExamFinalCreateRequestDTO;
import com.unilearn.server.dto.request.exam.ExamInClassCreateRequestDTO;
import com.unilearn.server.dto.response.ExamResponse;
import com.unilearn.server.dto.response.exam.ExamListItemDTO;

import java.util.List;

/**
 * Service interface for managing exams.
 */
public interface ExamService {

    ExamResponse createExam(ExamRequest request);

    ExamResponse createFinalExam(ExamFinalCreateRequestDTO request);

    ExamResponse createInClassExam(ExamInClassCreateRequestDTO request);

    ExamResponse updateExam(Long examId, ExamRequest request);

    void deleteExam(Long examId);

    ExamResponse getExamById(Long examId);

    List<ExamResponse> getExamsByOffering(Long offeringId);

    List<ExamListItemDTO> getExamListItemsByOffering(Long offeringId);
}
