package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.QuestionBankRequest;
import com.unilearn.server.dto.response.QuestionBankResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Course;
import com.unilearn.server.model.Course;
import com.unilearn.server.model.QuestionBank;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.CourseRepository;
import com.unilearn.server.repository.QuestionBankRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.service.QuestionBankService;
import com.unilearn.server.util.mapper.QuestionBankMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionBankServiceImpl implements QuestionBankService {

    private final QuestionBankRepository questionBankRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final QuestionBankMapper questionBankMapper;

    @Override
    @Transactional
    public QuestionBankResponse createQuestionBank(QuestionBankRequest request) {
        if (request == null) {
            throw new ValidationException("QuestionBank request cannot be null");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new EntryNotFoundException("Course not found with ID: " + request.getCourseId()));

        User user = userRepository.findById(request.getCreatedByLecturerId())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getCreatedByLecturerId()));

        QuestionBank bank = questionBankMapper.toQuestionBank(request, course, user);
        QuestionBank saved = questionBankRepository.save(bank);
        return questionBankMapper.toQuestionBankResponse(saved);
    }

    @Override
    @Transactional
    public QuestionBankResponse updateQuestionBank(Long bankId, QuestionBankRequest request) {
        if (bankId == null) {
            throw new ValidationException("Bank ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("QuestionBank request cannot be null");
        }

        QuestionBank bank = questionBankRepository.findById(bankId)
                .orElseThrow(() -> new EntryNotFoundException("QuestionBank not found with ID: " + bankId));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new EntryNotFoundException("Course not found with ID: " + request.getCourseId()));

        User user = userRepository.findById(request.getCreatedByLecturerId())
                .orElseThrow(() -> new EntryNotFoundException("User not found with ID: " + request.getCreatedByLecturerId()));

        bank.setCourse(course);
        bank.setCreatedBy(user);

        QuestionBank updated = questionBankRepository.save(bank);
        return questionBankMapper.toQuestionBankResponse(updated);
    }

    @Override
    @Transactional
    public void deleteQuestionBank(Long bankId) {
        if (bankId == null) {
            throw new ValidationException("Bank ID cannot be null");
        }
        if (!questionBankRepository.existsById(bankId)) {
            throw new EntryNotFoundException("QuestionBank not found with ID: " + bankId);
        }
        questionBankRepository.deleteById(bankId);
    }

    @Override
    public QuestionBankResponse getBankById(Long bankId) {
        if (bankId == null) {
            throw new ValidationException("Bank ID cannot be null");
        }
        QuestionBank bank = questionBankRepository.findById(bankId)
                .orElseThrow(() -> new EntryNotFoundException("QuestionBank not found with ID: " + bankId));
        return questionBankMapper.toQuestionBankResponse(bank);
    }

    @Override
    public List<QuestionBankResponse> getBanksByCourse(Long courseId) {
        if (courseId == null) {
            throw new ValidationException("Course ID cannot be null");
        }
        if (!courseRepository.existsById(courseId)) {
            throw new EntryNotFoundException("Course not found with ID: " + courseId);
        }

        return questionBankRepository.findByCourse_CourseId(courseId)
                .stream()
                .map(questionBankMapper::toQuestionBankResponse)
                .toList();
    }
}
