package com.stayease.domain.admin.repository;

import com.stayease.domain.admin.entity.AuditLog;
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
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByActorPublicId(UUID actorPublicId, Pageable pageable);

    Page<AuditLog> findByAction(String action, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.createdAt BETWEEN :startDate AND :endDate")
    Page<AuditLog> findByDateRange(@Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.target LIKE %:targetPattern%")
    Page<AuditLog> searchByTarget(@Param("targetPattern") String targetPattern, Pageable pageable);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.actorPublicId = :actorPublicId")
    Long countByActorPublicId(@Param("actorPublicId") UUID actorPublicId);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.action = :action")
    Long countByAction(@Param("action") String action);

    List<AuditLog> findTop100ByOrderByCreatedAtDesc();
}
