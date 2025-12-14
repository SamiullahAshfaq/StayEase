package com.stayease.domain.admin.repository;

import com.stayease.domain.admin.entity.AdminAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AdminActionRepository extends JpaRepository<AdminAction, Long> {

    Page<AdminAction> findByAdminPublicId(UUID adminPublicId, Pageable pageable);

    Page<AdminAction> findByActionType(String actionType, Pageable pageable);

    Page<AdminAction> findByTargetEntity(String targetEntity, Pageable pageable);

    @Query("SELECT a FROM AdminAction a WHERE a.targetEntity = :targetEntity AND a.targetId = :targetId")
    List<AdminAction> findByTargetEntityAndId(@Param("targetEntity") String targetEntity,
            @Param("targetId") String targetId);

    @Query("SELECT a FROM AdminAction a WHERE a.createdAt BETWEEN :startDate AND :endDate")
    List<AdminAction> findByDateRange(@Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate);

    @Query("SELECT COUNT(a) FROM AdminAction a WHERE a.adminPublicId = :adminPublicId")
    Long countByAdminPublicId(@Param("adminPublicId") UUID adminPublicId);

    @Query("SELECT COUNT(a) FROM AdminAction a WHERE a.actionType = :actionType")
    Long countByActionType(@Param("actionType") String actionType);
}
