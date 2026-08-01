package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.PersonalResourceRequest;
import com.unilearn.server.dto.response.PersonalResourceResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.PersonalResource;
import com.unilearn.server.model.Student;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class PersonalResourceMapper {

    public PersonalResource toPersonalResource(PersonalResourceRequest request, Student student, CourseOffering offering) {
        if (request == null) {
            throw new ValidationException("PersonalResource request cannot be null");
        }
        return PersonalResource.builder()
                .student(student)
                .courseOffering(offering)
                .title(request.getTitle())
                .fileUrl(request.getFileUrl())
                .fileSizeKb(request.getFileSizeKb())
                .uploadedAt(LocalDateTime.now())
                .build();
    }

    public PersonalResourceResponse toPersonalResourceResponse(PersonalResource resource) {
        if (resource == null) {
            throw new ValidationException("PersonalResource cannot be null");
        }
        return PersonalResourceResponse.builder()
                .resourceId(resource.getResourceId())
                .studentId(resource.getStudent() != null ? resource.getStudent().getStudentId() : null)
                .offeringId(resource.getCourseOffering() != null ? resource.getCourseOffering().getOfferingId() : null)
                .courseCode(resource.getCourseOffering() != null && resource.getCourseOffering().getCourse() != null ? resource.getCourseOffering().getCourse().getCode() : null)
                .fileName(resource.getTitle())
                .title(resource.getTitle())
                .fileUrl(resource.getFileUrl())
                .fileSizeKb(resource.getFileSizeKb())
                .fileSizeBytes(resource.getFileSizeKb() != null ? resource.getFileSizeKb() * 1024L : null)
                .uploadedAt(resource.getUploadedAt())
                .build();
    }
}
