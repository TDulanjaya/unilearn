package com.unilearn.server.util.mapper;

import com.unilearn.server.dto.request.AnnouncementRequest;
import com.unilearn.server.dto.response.AnnouncementResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.Announcement;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.Department;
import com.unilearn.server.model.Faculty;
import com.unilearn.server.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AnnouncementMapper {

    public Announcement toAnnouncement(AnnouncementRequest request, User user, CourseOffering offering, Department department, Faculty faculty) {
        if (request == null) {
            throw new ValidationException("Announcement request cannot be null");
        }
        return Announcement.builder()
                .scope(request.getScope())
                .courseOffering(offering)
                .department(department)
                .faculty(faculty)
                .title(request.getTitle())
                .content(request.getContent())
                .postedBy(user)
                .postedAt(LocalDateTime.now())
                .build();
    }

    public AnnouncementResponse toAnnouncementResponse(Announcement announcement) {
        if (announcement == null) {
            throw new ValidationException("Announcement cannot be null");
        }
        return AnnouncementResponse.builder()
                .announcementId(announcement.getAnnouncementId())
                .scope(announcement.getScope())
                .offeringId(announcement.getCourseOffering() != null ? announcement.getCourseOffering().getOfferingId() : null)
                .departmentId(announcement.getDepartment() != null ? announcement.getDepartment().getDepartmentId() : null)
                .facultyId(announcement.getFaculty() != null ? announcement.getFaculty().getFacultyId() : null)
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .postedBy(announcement.getPostedBy() != null ? announcement.getPostedBy().getUserId() : null)
                .postedByName(announcement.getPostedBy() != null ? announcement.getPostedBy().getFullName() : null)
                .createdAt(announcement.getPostedAt())
                .postedAt(announcement.getPostedAt())
                .build();
    }
}
