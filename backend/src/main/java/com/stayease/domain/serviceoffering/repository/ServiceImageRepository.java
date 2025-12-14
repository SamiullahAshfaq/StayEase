package com.stayease.domain.serviceoffering.repository;

import com.stayease.domain.serviceoffering.entity.ServiceImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceImageRepository extends JpaRepository<ServiceImage, Long> {

    List<ServiceImage> findByServiceOfferingIdOrderByDisplayOrderAsc(Long serviceOfferingId);

    Optional<ServiceImage> findByServiceOfferingIdAndIsPrimaryTrue(Long serviceOfferingId);

    void deleteByServiceOfferingId(Long serviceOfferingId);
}
