package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.QuestionRequest;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.QuestionResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Question;
import com.unilearn.server.model.QuestionBank;
import com.unilearn.server.repository.QuestionBankRepository;
import com.unilearn.server.repository.QuestionRepository;
import com.unilearn.server.service.QuestionService;
import com.unilearn.server.util.mapper.QuestionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionBankRepository questionBankRepository;
    private final QuestionMapper questionMapper;

    @Override
    @Transactional
    public QuestionResponse createQuestion(QuestionRequest request) {
        if (request == null) {
            throw new ValidationException("Question request cannot be null");
        }

        QuestionBank bank = questionBankRepository.findById(request.getBankId())
                .orElseThrow(() -> new EntryNotFoundException("QuestionBank not found with ID: " + request.getBankId()));

        Question question = questionMapper.toQuestion(request, bank);
        Question saved = questionRepository.save(question);
        return questionMapper.toQuestionResponse(saved);
    }

    @Override
    @Transactional
    public QuestionResponse updateQuestion(Long questionId, QuestionRequest request) {
        if (questionId == null) {
            throw new ValidationException("Question ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("Question request cannot be null");
        }

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new EntryNotFoundException("Question not found with ID: " + questionId));

        QuestionBank bank = questionBankRepository.findById(request.getBankId())
                .orElseThrow(() -> new EntryNotFoundException("QuestionBank not found with ID: " + request.getBankId()));

        question.setQuestionBank(bank);
        question.setQuestionText(request.getQuestionText());
        question.setQuestionType(request.getQuestionType());
        question.setOptions(request.getOptions());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setMarks(request.getMarks());
        question.setDifficulty(request.getDifficulty());
        question.setTopic(request.getTopic());

        Question updated = questionRepository.save(question);
        return questionMapper.toQuestionResponse(updated);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long questionId) {
        if (questionId == null) {
            throw new ValidationException("Question ID cannot be null");
        }
        if (!questionRepository.existsById(questionId)) {
            throw new EntryNotFoundException("Question not found with ID: " + questionId);
        }
        questionRepository.deleteById(questionId);
    }

    @Override
    public QuestionResponse getQuestionById(Long questionId) {
        if (questionId == null) {
            throw new ValidationException("Question ID cannot be null");
        }
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new EntryNotFoundException("Question not found with ID: " + questionId));
        return questionMapper.toQuestionResponse(question);
    }

    @Override
    public PageResponseDTO<QuestionResponse> getQuestionsByBank(Long bankId, Pageable pageable) {
        if (bankId == null) {
            throw new ValidationException("Bank ID cannot be null");
        }
        if (pageable == null) {
            throw new ValidationException("Pageable parameter cannot be null");
        }
        if (!questionBankRepository.existsById(bankId)) {
            throw new EntryNotFoundException("QuestionBank not found with ID: " + bankId);
        }

        Page<Question> page = questionRepository.findByQuestionBank_BankId(bankId, pageable);
        List<QuestionResponse> content = page.getContent()
                .stream()
                .map(questionMapper::toQuestionResponse)
                .toList();

        return PageResponseDTO.<QuestionResponse>builder()
                .dataCount((int) page.getTotalElements())
                .dataList(content)
                .build();
    }
}
