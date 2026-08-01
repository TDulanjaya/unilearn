package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.BatchRequest;
import com.unilearn.server.dto.response.BatchResponse;
import com.unilearn.server.dto.response.batch.BatchOptionDTO;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.AcademicYear;
import com.unilearn.server.model.Batch;
import com.unilearn.server.model.Department;
import org.springframework.stereotype.Component;

@Component
public class BatchMapper {

    public Batch toBatch(BatchRequest request, Department department, AcademicYear academicYear) {
        if (request == null) {
            throw new ValidationException("Batch request cannot be null");
        }
        return Batch.builder()
                .name(request.getName())
                .department(department)
                .academicYear(academicYear)
                .build();
    }

    public BatchResponse toBatchResponse(Batch batch) {
        if (batch == null) {
            throw new ValidationException("Batch cannot be null");
        }
        return BatchResponse.builder()
                .batchId(batch.getBatchId())
                .name(batch.getName())
                .departmentId(batch.getDepartment() != null ? batch.getDepartment().getDepartmentId() : null)
                .departmentName(batch.getDepartment() != null ? batch.getDepartment().getName() : null)
                .academicYearId(batch.getAcademicYear() != null ? batch.getAcademicYear().getAcademicYearId() : null)
                .academicYearLabel(batch.getAcademicYear() != null ? batch.getAcademicYear().getYearLabel() : null)
                .build();
    }

    public BatchOptionDTO toBatchOptionDTO(Batch batch) {
        if (batch == null) {
            throw new ValidationException("Batch cannot be null");
        }
        return BatchOptionDTO.builder()
                .batchId(batch.getBatchId())
                .name(batch.getName())
                .build();
    }
}
