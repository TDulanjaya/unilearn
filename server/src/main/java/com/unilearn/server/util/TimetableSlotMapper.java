package com.unilearn.server.util;

import com.unilearn.server.dto.request.TimetableSlotRequest;
import com.unilearn.server.dto.response.TimetableSlotResponse;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.TimetableSlot;
import org.springframework.stereotype.Component;

@Component
public class TimetableSlotMapper {

    public TimetableSlot toTimetableSlot(TimetableSlotRequest request, CourseOffering offering) {
        if (request == null) {
            throw new ValidationException("TimetableSlot request cannot be null");
        }
        return TimetableSlot.builder()
                .courseOffering(offering)
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .venue(request.getVenue())
                .slotType(request.getSlotType() != null ? request.getSlotType() : "lecture")
                .build();
    }

    public TimetableSlotResponse toTimetableSlotResponse(TimetableSlot slot) {
        if (slot == null) {
            throw new ValidationException("TimetableSlot cannot be null");
        }
        return TimetableSlotResponse.builder()
                .slotId(slot.getSlotId())
                .offeringId(slot.getCourseOffering() != null ? slot.getCourseOffering().getOfferingId() : null)
                .courseCode(slot.getCourseOffering() != null && slot.getCourseOffering().getCourse() != null ? slot.getCourseOffering().getCourse().getCode() : null)
                .courseName(slot.getCourseOffering() != null && slot.getCourseOffering().getCourse() != null ? slot.getCourseOffering().getCourse().getTitle() : null)
                .dayOfWeek(slot.getDayOfWeek())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .venue(slot.getVenue())
                .slotType(slot.getSlotType())
                .build();
    }
}
