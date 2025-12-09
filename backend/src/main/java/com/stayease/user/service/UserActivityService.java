package com.stayease.user.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stayease.user.dto.UserActivityResponse;
import com.stayease.user.entity.ActivityType;
import com.stayease.user.entity.User;
import com.stayease.user.entity.UserActivity;
import com.stayease.user.repository.UserActivityRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserActivityService {

    private final UserActivityRepository userActivityRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void logActivity(User user, ActivityType activityType, String description, HttpServletRequest request) {
        logActivity(user, activityType, description, null, request);
    }

    @Transactional
    public void logActivity(User user, ActivityType activityType, String description,
            Map<String, Object> metadata, HttpServletRequest request) {
        try {
            String metadataJson = null;
            if (metadata != null && !metadata.isEmpty()) {
                metadataJson = objectMapper.writeValueAsString(metadata);
            }

            UserActivity activity = UserActivity.builder()
                    .user(user)
                    .activityType(activityType)
                    .description(description)
                    .metadata(metadataJson)
                    .ipAddress(getClientIp(request))
                    .userAgent(request.getHeader("User-Agent"))
                    .build();

            userActivityRepository.save(activity);
            log.info("Logged activity: {} for user: {}", activityType, user.getEmail());
        } catch (Exception e) {
            log.error("Failed to log user activity", e);
        }
    }

    @Transactional
    public void logActivitySimple(User user, ActivityType activityType, String description) {
        try {
            UserActivity activity = UserActivity.builder()
                    .user(user)
                    .activityType(activityType)
                    .description(description)
                    .build();

            userActivityRepository.save(activity);
            log.info("Logged activity: {} for user: {}", activityType, user.getEmail());
        } catch (Exception e) {
            log.error("Failed to log user activity", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<UserActivityResponse> getUserActivities(Long userId, Pageable pageable) {
        Page<UserActivity> activities = userActivityRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return activities.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<UserActivityResponse> getUserActivitiesByType(Long userId, ActivityType activityType,
            Pageable pageable) {
        Page<UserActivity> activities = userActivityRepository.findByUserIdAndActivityType(userId, activityType,
                pageable);
        return activities.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<UserActivityResponse> getUserActivitiesByDateRange(Long userId, LocalDateTime startDate,
            LocalDateTime endDate, Pageable pageable) {
        Page<UserActivity> activities = userActivityRepository.findByUserIdAndDateRange(userId, startDate, endDate,
                pageable);
        return activities.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Long getUserActivityCount(User user) {
        return userActivityRepository.countByUser(user);
    }

    private UserActivityResponse mapToResponse(UserActivity activity) {
        return UserActivityResponse.builder()
                .id(activity.getId())
                .activityType(activity.getActivityType())
                .description(activity.getDescription())
                .metadata(activity.getMetadata())
                .ipAddress(activity.getIpAddress())
                .createdAt(activity.getCreatedAt())
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String[] headerNames = {
                "X-Forwarded-For",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_X_FORWARDED_FOR",
                "HTTP_X_FORWARDED",
                "HTTP_X_CLUSTER_CLIENT_IP",
                "HTTP_CLIENT_IP",
                "HTTP_FORWARDED_FOR",
                "HTTP_FORWARDED",
                "HTTP_VIA",
                "REMOTE_ADDR"
        };

        for (String header : headerNames) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // Get first IP if multiple IPs
                return ip.split(",")[0].trim();
            }
        }

        return request.getRemoteAddr();
    }
}
