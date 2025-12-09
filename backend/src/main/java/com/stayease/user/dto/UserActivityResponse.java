package com.stayease.user.dto;

import com.stayease.user.entity.ActivityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserActivityResponse {

    private Long id;
    private ActivityType activityType;
    private String description;
    private String metadata;
    private String ipAddress;
    private LocalDateTime createdAt;
}
