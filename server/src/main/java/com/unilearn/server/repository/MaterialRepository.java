package com.unilearn.server.repository;

import com.unilearn.server.model.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.util.List;

@EnableJpaRepositories
public interface MaterialRepository extends JpaRepository<Material, Long> {

    List<Material> findByCourseOffering_OfferingId(Long offeringId);

    Page<Material> findByCourseOffering_OfferingId(Long offeringId, Pageable pageable);

    List<Material> findByCourseOffering_OfferingIdAndResourceType(Long offeringId, String resourceType);

    List<Material> findByUploadedBy_LecturerId(Long lecturerId);

    @org.springframework.data.jpa.repository.Query("SELECT m FROM Material m WHERE m.fileUrl LIKE CONCAT('%', :fileUrl, '%')")
    List<Material> findAllByFileUrlLike(@org.springframework.data.repository.query.Param("fileUrl") String fileUrl);

    default java.util.Optional<Material> findFirstByFileUrlContaining(String fileUrl) {
        List<Material> list = findAllByFileUrlLike(fileUrl);
        return list.isEmpty() ? java.util.Optional.empty() : java.util.Optional.of(list.get(0));
    }
}
