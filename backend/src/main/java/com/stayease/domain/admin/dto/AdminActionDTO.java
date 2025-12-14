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
public class AdminActionDTO {

    private Long id;
    private UUID adminPublicId;
    private String adminEmail;
    private String adminName;
    private String actionType;
    private String targetEntity;
    private String targetId;
    private String reason;
    private Instant createdAt;
}
