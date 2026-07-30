package com.unilearn.server.service;

import com.unilearn.server.dto.request.ExaminerRequest;
import com.unilearn.server.dto.response.ExaminerResponse;

import java.util.List;

/**
 * Service interface for managing examiners.
 */
public interface ExaminerService {

    ExaminerResponse createExaminer(ExaminerRequest request);

    ExaminerResponse updateExaminer(Long examinerId, ExaminerRequest request);

    void deleteExaminer(Long examinerId);

    ExaminerResponse getExaminerById(Long examinerId);

    List<ExaminerResponse> getExaminersByDepartment(Long departmentId);

    void assignExaminerToExam(Long examinerId, Long examId);
}
