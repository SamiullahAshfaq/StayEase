package com.stayease.domain.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO for updating notification status
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateNotificationDTO {

    private Boolean isRead;
    private Boolean isArchived;

    // Update metadata
    private Map<String, String> metadata;
}
