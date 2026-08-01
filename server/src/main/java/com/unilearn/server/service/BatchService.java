package com.unilearn.server.service;

import com.unilearn.server.dto.request.BatchRequest;
import com.unilearn.server.dto.response.BatchResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.dto.response.StudentResponse;
import com.unilearn.server.dto.response.batch.BatchOptionDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for managing batches.
 */
public interface BatchService {

    BatchResponse createBatch(BatchRequest request);

    BatchResponse updateBatch(Long batchId, BatchRequest request);

    void deleteBatch(Long batchId);

    BatchResponse getBatchById(Long batchId);

    List<BatchResponse> getBatchesByDepartment(Long departmentId);

    PageResponseDTO<StudentResponse> getStudentsInBatch(Long batchId, Pageable pageable);

    List<BatchOptionDTO> getBatchOptions(Long departmentId, String searchText);
}
