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
import com.unilearn.server.security.OwnershipValidator;
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
    private final OwnershipValidator ownershipValidator;

    @Override
    @Transactional
    public QuestionBankResponse createQuestionBank(QuestionBankRequest request) {
        if (request == null) {
            throw new ValidationException("QuestionBank request cannot be null");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new EntryNotFoundException("Course not found with ID: " + request.getCourseId()));

        ownershipValidator.checkQuestionBankAccess(course, null);

        // the creator is the logged in user, not the id sent by the browser
        User user = ownershipValidator.getCurrentUser()
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("User not authenticated"));
        request.setCreatedByLecturerId(user.getUserId());

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

        ownershipValidator.checkQuestionBankAccess(bank.getCourse(), creatorId(bank));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new EntryNotFoundException("Course not found with ID: " + request.getCourseId()));
        // moving the bank to another course needs access to that course too
        if (bank.getCourse() == null || !course.getCourseId().equals(bank.getCourse().getCourseId())) {
            ownershipValidator.checkQuestionBankAccess(course, null);
        }

        // the creator stays the same
        bank.setCourse(course);

        QuestionBank updated = questionBankRepository.save(bank);
        return questionBankMapper.toQuestionBankResponse(updated);
    }

    @Override
    @Transactional
    public void deleteQuestionBank(Long bankId) {
        if (bankId == null) {
            throw new ValidationException("Bank ID cannot be null");
        }
        QuestionBank bank = questionBankRepository.findById(bankId)
                .orElseThrow(() -> new EntryNotFoundException("QuestionBank not found with ID: " + bankId));
        ownershipValidator.checkQuestionBankAccess(bank.getCourse(), creatorId(bank));
        questionBankRepository.delete(bank);
    }

    @Override
    public QuestionBankResponse getBankById(Long bankId) {
        if (bankId == null) {
            throw new ValidationException("Bank ID cannot be null");
        }
        QuestionBank bank = questionBankRepository.findById(bankId)
                .orElseThrow(() -> new EntryNotFoundException("QuestionBank not found with ID: " + bankId));
        ownershipValidator.checkQuestionBankAccess(bank.getCourse(), creatorId(bank));
        return questionBankMapper.toQuestionBankResponse(bank);
    }

    @Override
    public List<QuestionBankResponse> getBanksByCourse(Long courseId) {
        if (courseId == null) {
            throw new ValidationException("Course ID cannot be null");
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntryNotFoundException("Course not found with ID: " + courseId));

        List<QuestionBank> banks = questionBankRepository.findByCourse_CourseId(courseId);

        // a lecturer who doesn't teach the course only sees banks they made
        if (ownershipValidator.isLecturer() && !ownershipValidator.isStaffOrSuperAdmin()) {
            User me = ownershipValidator.getCurrentUser()
                    .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("User not authenticated"));
            if (!ownershipValidator.lecturerTeachesCourse(courseId, me.getUserId())) {
                banks = banks.stream()
                        .filter(b -> me.getUserId().equals(creatorId(b)))
                        .toList();
            }
        } else {
            ownershipValidator.checkQuestionBankAccess(course, null);
        }

        return banks.stream()
                .map(questionBankMapper::toQuestionBankResponse)
                .toList();
    }

    private Long creatorId(QuestionBank bank) {
        return bank.getCreatedBy() != null ? bank.getCreatedBy().getUserId() : null;
    }
}
