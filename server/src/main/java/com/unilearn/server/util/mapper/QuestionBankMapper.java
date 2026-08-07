package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.QuestionBankRequest;
import com.unilearn.server.dto.response.QuestionBankResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Course;
import com.unilearn.server.model.QuestionBank;
import com.unilearn.server.model.User;
import org.springframework.stereotype.Component;

@Component
public class QuestionBankMapper {

    public QuestionBank toQuestionBank(QuestionBankRequest request, Course course, User user) {
        if (request == null) {
            throw new ValidationException("QuestionBank request cannot be null");
        }
        return QuestionBank.builder()
                .course(course)
                .createdBy(user)
                .build();
    }

    public QuestionBankResponse toQuestionBankResponse(QuestionBank bank) {
        if (bank == null) {
            throw new ValidationException("QuestionBank cannot be null");
        }
        return QuestionBankResponse.builder()
                .bankId(bank.getBankId())
                .courseId(bank.getCourse() != null ? bank.getCourse().getCourseId() : null)
                .courseName(bank.getCourse() != null ? bank.getCourse().getTitle() : null)
                .courseCode(bank.getCourse() != null ? bank.getCourse().getCode() : null)
                .lecturerId(bank.getCreatedBy() != null ? bank.getCreatedBy().getUserId() : null)
                .lecturerName(bank.getCreatedBy() != null ? bank.getCreatedBy().getFullName() : null)
                .title(bank.getCourse() != null ? bank.getCourse().getCode() + " Question Bank" : "Question Bank")
                .build();
    }
}
