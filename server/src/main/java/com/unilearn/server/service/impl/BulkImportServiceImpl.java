package com.unilearn.server.service.impl;

import com.unilearn.server.dto.response.BulkImportResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.service.BulkImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BulkImportServiceImpl implements BulkImportService {

    @Override
    @Transactional
    public List<BulkImportResponse> importUsers(MultipartFile file, String role) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Import file cannot be empty");
        }
        if (role == null || role.isBlank()) {
            throw new ValidationException("Target role must be specified");
        }

        return Collections.singletonList(
                BulkImportResponse.builder()
                        .rowNumber(1)
                        .success(true)
                        .errorMessage(null)
                        .createdUserId(1L)
                        .build()
        );
    }
}
