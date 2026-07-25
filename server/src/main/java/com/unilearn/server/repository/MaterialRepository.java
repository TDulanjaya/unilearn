package com.unilearn.server.repository;

import com.unilearn.server.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;

@EnableJpaRepositories
public interface MaterialRepository extends JpaRepository<Material, Long> {

    List<Material> findByCourseOffering_OfferingId(Long offeringId);

    List<Material> findByCourseOffering_OfferingIdAndResourceType(Long offeringId, String resourceType);

    List<Material> findByUploadedBy_LecturerId(Long lecturerId);
}
