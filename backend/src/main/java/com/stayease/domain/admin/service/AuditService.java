package com.stayease.domain.admin.service;

import com.stayease.domain.admin.dto.AuditLogDTO;
import com.stayease.domain.admin.entity.AuditLog;
import com.stayease.domain.admin.repository.AuditLogRepository;
import com.stayease.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    /**
     * Create an audit log entry
     */
    public void logAction(UUID actorPublicId, String action, String target, String details) {
        log.info("Creating audit log: actor={}, action={}, target={}", actorPublicId, action, target);

        AuditLog auditLog = AuditLog.builder()
                .actorPublicId(actorPublicId)
                .action(action)
                .target(target)
                .details(details)
                .build();

        auditLogRepository.save(auditLog);
    }

    /**
     * Get all audit logs with pagination
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getAllAuditLogs(Pageable pageable) {
        log.info("Fetching all audit logs with pagination");
        return auditLogRepository.findAll(pageable).map(this::convertToDTO);
    }

    /**
     * Get audit logs by actor
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getAuditLogsByActor(UUID actorPublicId, Pageable pageable) {
        log.info("Fetching audit logs for actor: {}", actorPublicId);
        return auditLogRepository.findByActorPublicId(actorPublicId, pageable).map(this::convertToDTO);
    }

    /**
     * Get audit logs by action type
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getAuditLogsByAction(String action, Pageable pageable) {
        log.info("Fetching audit logs for action: {}", action);
        return auditLogRepository.findByAction(action, pageable).map(this::convertToDTO);
    }

    /**
     * Get audit logs within date range
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getAuditLogsByDateRange(Instant startDate, Instant endDate, Pageable pageable) {
        log.info("Fetching audit logs between {} and {}", startDate, endDate);
        return auditLogRepository.findByDateRange(startDate, endDate, pageable).map(this::convertToDTO);
    }

    /**
     * Search audit logs by target
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> searchAuditLogsByTarget(String targetPattern, Pageable pageable) {
        log.info("Searching audit logs with target pattern: {}", targetPattern);
        return auditLogRepository.searchByTarget(targetPattern, pageable).map(this::convertToDTO);
    }

    /**
     * Get recent audit logs (last 100)
     */
    @Transactional(readOnly = true)
    public List<AuditLogDTO> getRecentAuditLogs() {
        log.info("Fetching recent audit logs");
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get count of audit logs by actor
     */
    @Transactional(readOnly = true)
    public Long countByActor(UUID actorPublicId) {
        return auditLogRepository.countByActorPublicId(actorPublicId);
    }

    /**
     * Get count of audit logs by action
     */
    @Transactional(readOnly = true)
    public Long countByAction(String action) {
        return auditLogRepository.countByAction(action);
    }

    /**
     * Convert AuditLog entity to DTO
     */
    private AuditLogDTO convertToDTO(AuditLog auditLog) {
        AuditLogDTO dto = AuditLogDTO.builder()
                .id(auditLog.getId())
                .actorPublicId(auditLog.getActorPublicId())
                .action(auditLog.getAction())
                .target(auditLog.getTarget())
                .details(auditLog.getDetails())
                .createdAt(auditLog.getCreatedAt())
                .build();

        // Fetch actor details if available
        if (auditLog.getActorPublicId() != null) {
            userRepository.findByPublicId(auditLog.getActorPublicId()).ifPresent(user -> {
                dto.setActorEmail(user.getEmail());
                dto.setActorName(user.getFirstName() + " " + user.getLastName());
            });
        }

        return dto;
    }
}
