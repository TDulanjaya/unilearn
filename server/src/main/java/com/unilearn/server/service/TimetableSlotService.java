package com.unilearn.server.service;

import com.unilearn.server.dto.request.TimetableSlotRequest;
import com.unilearn.server.dto.response.TimetableSlotResponse;

import java.util.List;

/**
 * Service interface for managing timetable slots.
 */
public interface TimetableSlotService {

    TimetableSlotResponse createSlot(TimetableSlotRequest request);

    TimetableSlotResponse updateSlot(Long slotId, TimetableSlotRequest request);

    void deleteSlot(Long slotId);

    TimetableSlotResponse getSlotById(Long slotId);

    List<TimetableSlotResponse> getSlotsByOffering(Long offeringId);

    List<TimetableSlotResponse> getAllSlots();
}
