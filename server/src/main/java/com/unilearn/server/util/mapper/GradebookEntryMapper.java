package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.GradebookEntryRequest;
import com.unilearn.server.dto.response.GradebookEntryResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.GradebookEntry;
import com.unilearn.server.model.Student;
import org.springframework.stereotype.Component;

@Component
public class GradebookEntryMapper {

    public GradebookEntry toGradebookEntry(GradebookEntryRequest request, CourseOffering offering, Student student) {
        if (request == null) {
            throw new ValidationException("GradebookEntry request cannot be null");
        }
        return GradebookEntry.builder()
                .courseOffering(offering)
                .student(student)
                .component(request.getComponent())
                .componentRefId(request.getComponentRefId())
                .weightPct(request.getWeightPct())
                .score(request.getScore())
                .build();
    }

    public GradebookEntryResponse toGradebookEntryResponse(GradebookEntry entry) {
        if (entry == null) {
            throw new ValidationException("GradebookEntry cannot be null");
        }
        return GradebookEntryResponse.builder()
                .entryId(entry.getGradebookId())
                .gradebookId(entry.getGradebookId())
                .studentId(entry.getStudent() != null ? entry.getStudent().getStudentId() : null)
                .studentName(entry.getStudent() != null && entry.getStudent().getUser() != null ? entry.getStudent().getUser().getFullName() : null)
                .offeringId(entry.getCourseOffering() != null ? entry.getCourseOffering().getOfferingId() : null)
                .itemType(entry.getComponent())
                .component(entry.getComponent())
                .itemId(entry.getComponentRefId())
                .componentRefId(entry.getComponentRefId())
                .weightPct(entry.getWeightPct())
                .score(entry.getScore())
                .build();
    }
}
