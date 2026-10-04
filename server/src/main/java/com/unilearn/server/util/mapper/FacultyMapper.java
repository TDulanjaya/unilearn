package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.FacultyRequest;
import com.unilearn.server.dto.response.FacultyResponse;
import com.unilearn.server.dto.response.faculty.FacultyOptionDTO;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Faculty;
import com.unilearn.server.model.User;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class FacultyMapper {

    public Faculty toFaculty(FacultyRequest request, User dean) {
        if (request == null) {
            throw new ValidationException("Faculty request cannot be null");
        }
        return Faculty.builder()
                .name(request.getName())
                .code(request.getCode())
                .dean(dean)
                .build();
    }

    public FacultyResponse toFacultyResponse(Faculty faculty) {
        if (faculty == null) {
            throw new ValidationException("Faculty cannot be null");
        }
        return FacultyResponse.builder()
                .facultyId(faculty.getFacultyId())
                .name(faculty.getName())
                .code(faculty.getCode())
                .headUserId(faculty.getDean() != null ? faculty.getDean().getUserId() : null)
                .headUserName(faculty.getDean() != null ? faculty.getDean().getFullName() : null)
                .createdAt(faculty.getCreatedAt())
                .departments(Collections.emptyList())
                .build();
    }

    public FacultyOptionDTO toFacultyOptionDTO(Faculty faculty) {
        if (faculty == null) {
            throw new ValidationException("Faculty cannot be null");
        }
        return FacultyOptionDTO.builder()
                .facultyId(faculty.getFacultyId())
                .name(faculty.getName())
                .build();
    }

    public com.unilearn.server.dto.response.FacultyPublicResponse toFacultyPublicResponse(Faculty faculty) {
        if (faculty == null) {
            throw new ValidationException("Faculty cannot be null");
        }
        // Don't add "Faculty of" again if the name already has it
        String name = faculty.getName() == null ? "" : faculty.getName().trim();
        String title = name.toLowerCase().startsWith("faculty") ? name : "Faculty of " + name;
        return com.unilearn.server.dto.response.FacultyPublicResponse.builder()
                .name(faculty.getName())
                .code(faculty.getCode())
                .description(title + ", dedicated to higher academic learning and research.")
                .build();
    }
}
