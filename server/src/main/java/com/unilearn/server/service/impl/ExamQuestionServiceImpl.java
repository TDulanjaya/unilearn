package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.ExamQuestionRequest;
import com.unilearn.server.dto.response.ExamQuestionResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Exam;
import com.unilearn.server.model.ExamQuestion;
import com.unilearn.server.model.ExamQuestion.ExamQuestionId;
import com.unilearn.server.model.Question;
import com.unilearn.server.repository.ExamQuestionRepository;
import com.unilearn.server.repository.ExamRepository;
import com.unilearn.server.repository.QuestionRepository;
import com.unilearn.server.service.ExamQuestionService;
import com.unilearn.server.util.ExamQuestionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExamQuestionServiceImpl implements ExamQuestionService {

    private final ExamQuestionRepository examQuestionRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final ExamQuestionMapper examQuestionMapper;

    @Override
    @Transactional
    public ExamQuestionResponse addQuestionToExam(ExamQuestionRequest request) {
        if (request == null) {
            throw new ValidationException("ExamQuestion request cannot be null");
        }

        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new EntryNotFoundException("Exam not found with ID: " + request.getExamId()));

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new EntryNotFoundException("Question not found with ID: " + request.getQuestionId()));

        ExamQuestionId id = new ExamQuestionId(request.getExamId(), request.getQuestionId());
        if (examQuestionRepository.existsById(id)) {
            throw new com.unilearn.server.exception.IllegalStateException("Question is already added to this exam");
        }

        List<ExamQuestion> existing = examQuestionRepository.findByExam_ExamId(request.getExamId());
        int nextOrder = existing.size() + 1;

        ExamQuestion eq = examQuestionMapper.toExamQuestion(request, exam, question);
        eq.setQuestionOrder(nextOrder);
        ExamQuestion saved = examQuestionRepository.save(eq);
        return examQuestionMapper.toExamQuestionResponse(saved);
    }

    @Override
    @Transactional
    public void removeQuestionFromExam(Long examId, Long questionId) {
        if (examId == null || questionId == null) {
            throw new ValidationException("Exam ID and Question ID cannot be null");
        }

        ExamQuestionId id = new ExamQuestionId(examId, questionId);
        if (!examQuestionRepository.existsById(id)) {
            throw new EntryNotFoundException("ExamQuestion mapping not found");
        }

        examQuestionRepository.deleteById(id);
    }

    @Override
    public List<ExamQuestionResponse> getQuestionsForExam(Long examId) {
        if (examId == null) {
            throw new ValidationException("Exam ID cannot be null");
        }
        if (!examRepository.existsById(examId)) {
            throw new EntryNotFoundException("Exam not found with ID: " + examId);
        }

        return examQuestionRepository.findByExam_ExamId(examId)
                .stream()
                .map(examQuestionMapper::toExamQuestionResponse)
                .toList();
    }

    @Override
    @Transactional
    public List<ExamQuestionResponse> reorderQuestions(Long examId, List<Long> questionIdsInOrder) {
        if (examId == null) {
            throw new ValidationException("Exam ID cannot be null");
        }
        if (questionIdsInOrder == null || questionIdsInOrder.isEmpty()) {
            throw new ValidationException("Question IDs list cannot be empty");
        }
        if (!examRepository.existsById(examId)) {
            throw new EntryNotFoundException("Exam not found with ID: " + examId);
        }

        List<ExamQuestionResponse> responses = new ArrayList<>();
        for (int i = 0; i < questionIdsInOrder.size(); i++) {
            Long qId = questionIdsInOrder.get(i);
            ExamQuestionId id = new ExamQuestionId(examId, qId);
            ExamQuestion eq = examQuestionRepository.findById(id)
                    .orElseThrow(() -> new EntryNotFoundException("Question ID " + qId + " not found in Exam ID " + examId));
            eq.setQuestionOrder(i + 1);
            ExamQuestion saved = examQuestionRepository.save(eq);
            responses.add(examQuestionMapper.toExamQuestionResponse(saved));
        }

        return responses;
    }
}
