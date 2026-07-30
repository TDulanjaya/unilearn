package com.unilearn.server.repository;

import com.unilearn.server.model.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.util.List;

@EnableJpaRepositories
public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {

    List<TimetableSlot> findByCourseOffering_OfferingId(Long offeringId);

    List<TimetableSlot> findByCourseOffering_Batch_BatchId(Long batchId);

    List<TimetableSlot> findByVenue(String venue);

    List<TimetableSlot> findByDayOfWeek(String dayOfWeek);

    List<TimetableSlot> findByVenueAndDayOfWeek(String venue, String dayOfWeek);
}
