package com.unilearn.server.service;

import com.unilearn.server.dto.request.QuestionBankRequest;
import com.unilearn.server.dto.response.QuestionBankResponse;

import java.util.List;

/**
 * Service interface for managing question banks.
 */
public interface QuestionBankService {

    QuestionBankResponse createQuestionBank(QuestionBankRequest request);

    QuestionBankResponse updateQuestionBank(Long bankId, QuestionBankRequest request);

    void deleteQuestionBank(Long bankId);

    QuestionBankResponse getBankById(Long bankId);

    List<QuestionBankResponse> getBanksByCourse(Long courseId);
}
