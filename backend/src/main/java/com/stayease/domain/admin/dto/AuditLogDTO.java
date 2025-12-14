package com.stayease.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {

    private Long id;
    private UUID actorPublicId;
    private String actorEmail;
    private String actorName;
    private String action;
    private String target;
    private String details;
    private Instant createdAt;
}
