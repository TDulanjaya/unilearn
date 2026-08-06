package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.TimetableSlotRequest;
import com.unilearn.server.dto.response.TimetableSlotResponse;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.ValidationException;
import com.unilearn.server.model.CourseOffering;
import com.unilearn.server.model.TimetableSlot;
import com.unilearn.server.repository.CourseOfferingRepository;
import com.unilearn.server.repository.TimetableSlotRepository;
import com.unilearn.server.service.TimetableSlotService;
import com.unilearn.server.util.mapper.TimetableSlotMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TimetableSlotServiceImpl implements TimetableSlotService {

    private final TimetableSlotRepository timetableSlotRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final TimetableSlotMapper timetableSlotMapper;

    @Override
    @Transactional
    public TimetableSlotResponse createSlot(TimetableSlotRequest request) {
        if (request == null) {
            throw new ValidationException("TimetableSlot request cannot be null");
        }

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        checkVenueOverlap(request.getVenue(), request.getDayOfWeek(), request.getStartTime(), request.getEndTime(), null);

        TimetableSlot slot = timetableSlotMapper.toTimetableSlot(request, offering);
        TimetableSlot saved = timetableSlotRepository.save(slot);
        return timetableSlotMapper.toTimetableSlotResponse(saved);
    }

    @Override
    @Transactional
    public TimetableSlotResponse updateSlot(Long slotId, TimetableSlotRequest request) {
        if (slotId == null) {
            throw new ValidationException("Slot ID cannot be null");
        }
        if (request == null) {
            throw new ValidationException("TimetableSlot request cannot be null");
        }

        TimetableSlot slot = timetableSlotRepository.findById(slotId)
                .orElseThrow(() -> new EntryNotFoundException("TimetableSlot not found with ID: " + slotId));

        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new EntryNotFoundException("CourseOffering not found with ID: " + request.getOfferingId()));

        checkVenueOverlap(request.getVenue(), request.getDayOfWeek(), request.getStartTime(), request.getEndTime(), slotId);

        slot.setCourseOffering(offering);
        slot.setDayOfWeek(request.getDayOfWeek());
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setVenue(request.getVenue());
        if (request.getSlotType() != null) {
            slot.setSlotType(request.getSlotType());
        }

        TimetableSlot updated = timetableSlotRepository.save(slot);
        return timetableSlotMapper.toTimetableSlotResponse(updated);
    }

    @Override
    @Transactional
    public void deleteSlot(Long slotId) {
        if (slotId == null) {
            throw new ValidationException("Slot ID cannot be null");
        }
        if (!timetableSlotRepository.existsById(slotId)) {
            throw new EntryNotFoundException("TimetableSlot not found with ID: " + slotId);
        }
        timetableSlotRepository.deleteById(slotId);
    }

    @Override
    public TimetableSlotResponse getSlotById(Long slotId) {
        if (slotId == null) {
            throw new ValidationException("Slot ID cannot be null");
        }
        TimetableSlot slot = timetableSlotRepository.findById(slotId)
                .orElseThrow(() -> new EntryNotFoundException("TimetableSlot not found with ID: " + slotId));
        return timetableSlotMapper.toTimetableSlotResponse(slot);
    }

    @Override
    public List<TimetableSlotResponse> getSlotsByOffering(Long offeringId) {
        if (offeringId == null) {
            throw new ValidationException("Offering ID cannot be null");
        }
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new EntryNotFoundException("CourseOffering not found with ID: " + offeringId);
        }

        return timetableSlotRepository.findByCourseOffering_OfferingId(offeringId)
                .stream()
                .map(timetableSlotMapper::toTimetableSlotResponse)
                .toList();
    }

    @Override
    public List<TimetableSlotResponse> getAllSlots() {
        return timetableSlotRepository.findAll()
                .stream()
                .map(timetableSlotMapper::toTimetableSlotResponse)
                .toList();
    }

    private void checkVenueOverlap(String venue, String dayOfWeek, LocalTime startTime, LocalTime endTime, Long currentSlotId) {
        if (venue == null || dayOfWeek == null || startTime == null || endTime == null) {
            return;
        }
        List<TimetableSlot> existingSlots = timetableSlotRepository.findByVenueAndDayOfWeek(venue, dayOfWeek);
        for (TimetableSlot existing : existingSlots) {
            if (currentSlotId != null && existing.getSlotId().equals(currentSlotId)) {
                continue;
            }
            if (startTime.isBefore(existing.getEndTime()) && endTime.isAfter(existing.getStartTime())) {
                throw new com.unilearn.server.exception.IllegalStateException("Timetable slot overlaps with another scheduled class in this room");
            }
        }
    }
}
