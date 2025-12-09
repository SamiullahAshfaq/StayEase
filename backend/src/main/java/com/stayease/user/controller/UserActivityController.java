package com.stayease.user.controller;

import com.stayease.user.dto.ApiResponse;
import com.stayease.user.dto.UserActivityResponse;
import com.stayease.user.entity.ActivityType;
import com.stayease.user.security.OAuth2UserPrincipal;
import com.stayease.user.service.UserActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserActivityController {

    private final UserActivityService userActivityService;

    @GetMapping
    public ResponseEntity<?> getUserActivities(
            @AuthenticationPrincipal OAuth2UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        if (userPrincipal == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User not authenticated"));
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<UserActivityResponse> activities = userActivityService.getUserActivities(
                userPrincipal.getId(), pageable);

        return ResponseEntity.ok(ApiResponse.success("Activities retrieved successfully", activities));
    }

    @GetMapping("/type/{activityType}")
    public ResponseEntity<?> getUserActivitiesByType(
            @AuthenticationPrincipal OAuth2UserPrincipal userPrincipal,
            @PathVariable ActivityType activityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        if (userPrincipal == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User not authenticated"));
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<UserActivityResponse> activities = userActivityService.getUserActivitiesByType(
                userPrincipal.getId(), activityType, pageable);

        return ResponseEntity.ok(ApiResponse.success("Activities retrieved successfully", activities));
    }

    @GetMapping("/range")
    public ResponseEntity<?> getUserActivitiesByDateRange(
            @AuthenticationPrincipal OAuth2UserPrincipal userPrincipal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        if (userPrincipal == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User not authenticated"));
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<UserActivityResponse> activities = userActivityService.getUserActivitiesByDateRange(
                userPrincipal.getId(), startDate, endDate, pageable);

        return ResponseEntity.ok(ApiResponse.success("Activities retrieved successfully", activities));
    }
}
