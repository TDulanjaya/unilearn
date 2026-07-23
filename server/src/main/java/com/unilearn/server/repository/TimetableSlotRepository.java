package com.unilearn.server.repository;

import com.unilearn.server.model.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {

    List<TimetableSlot> findByCourseOffering_OfferingId(Long offeringId);

    List<TimetableSlot> findByCourseOffering_Batch_BatchId(Long batchId);

    List<TimetableSlot> findByVenue(String venue);

    List<TimetableSlot> findByDayOfWeek(String dayOfWeek);
}
