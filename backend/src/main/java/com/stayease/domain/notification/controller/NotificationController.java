package com.stayease.domain.notification.controller;

import com.stayease.domain.notification.dto.CreateNotificationDTO;
import com.stayease.domain.notification.dto.NotificationDTO;
import com.stayease.domain.notification.dto.UpdateNotificationDTO;
import com.stayease.domain.notification.entity.Notification.*;
import com.stayease.domain.notification.service.NotificationService;
import com.stayease.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Create a new notification (admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NotificationDTO>> createNotification(
            @Valid @RequestBody CreateNotificationDTO dto) {
        log.info("Creating notification for user: {}", dto.getUserPublicId());
        NotificationDTO notification = notificationService.createNotification(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(notification, "Notification created successfully"));
    }

    /**
     * Get current user's notifications
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<NotificationDTO>>> getMyNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        String userPublicId = userDetails.getUsername();
        Page<NotificationDTO> notifications = notificationService.getUserNotifications(userPublicId, pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications, "Notifications retrieved successfully"));
    }

    /**
     * Get notifications with filters
     */
    @GetMapping("/filter")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<NotificationDTO>>> getFilteredNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(required = false) NotificationCategory category,
            @RequestParam(required = false) NotificationPriority priority,
            @RequestParam(required = false) Boolean isArchived,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        String userPublicId = userDetails.getUsername();
        Page<NotificationDTO> notifications = notificationService.getFilteredNotifications(
                userPublicId, isRead, category, priority, isArchived, pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications, "Filtered notifications retrieved successfully"));
    }

    /**
     * Get unread notifications
     */
    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<NotificationDTO>>> getUnreadNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        String userPublicId = userDetails.getUsername();
        Page<NotificationDTO> notifications = notificationService.getUnreadNotifications(userPublicId, pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications, "Unread notifications retrieved successfully"));
    }

    /**
     * Get urgent unread notifications
     */
    @GetMapping("/urgent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getUrgentNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        String userPublicId = userDetails.getUsername();
        List<NotificationDTO> notifications = notificationService.getUrgentUnreadNotifications(userPublicId);
        return ResponseEntity.ok(ApiResponse.success(notifications, "Urgent notifications retrieved successfully"));
    }

    /**
     * Get recent notifications (last 7 days)
     */
    @GetMapping("/recent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getRecentNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        String userPublicId = userDetails.getUsername();
        List<NotificationDTO> notifications = notificationService.getRecentNotifications(userPublicId);
        return ResponseEntity.ok(ApiResponse.success(notifications, "Recent notifications retrieved successfully"));
    }

    /**
     * Get notifications by category
     */
    @GetMapping("/category/{category}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<NotificationDTO>>> getNotificationsByCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable NotificationCategory category,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        String userPublicId = userDetails.getUsername();
        Page<NotificationDTO> notifications = notificationService.getNotificationsByCategory(
                userPublicId, category, pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications,
                "Notifications for category " + category + " retrieved successfully"));
    }

    /**
     * Get notifications by priority
     */
    @GetMapping("/priority/{priority}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<NotificationDTO>>> getNotificationsByPriority(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable NotificationPriority priority,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        String userPublicId = userDetails.getUsername();
        Page<NotificationDTO> notifications = notificationService.getNotificationsByPriority(
                userPublicId, priority, pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications,
                "Notifications for priority " + priority + " retrieved successfully"));
    }

    /**
     * Get archived notifications
     */
    @GetMapping("/archived")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<NotificationDTO>>> getArchivedNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20, sort = "archivedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        String userPublicId = userDetails.getUsername();
        Page<NotificationDTO> notifications = notificationService.getArchivedNotifications(userPublicId, pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications, "Archived notifications retrieved successfully"));
    }

    /**
     * Get unread count
     */
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        String userPublicId = userDetails.getUsername();
        long count = notificationService.getUnreadCount(userPublicId);

        Map<String, Object> response = new HashMap<>();
        response.put("unreadCount", count);

        // Also get counts by category
        Map<String, Long> categoryCounts = new HashMap<>();
        for (NotificationCategory category : NotificationCategory.values()) {
            long catCount = notificationService.getUnreadCountByCategory(userPublicId, category);
            if (catCount > 0) {
                categoryCounts.put(category.name(), catCount);
            }
        }
        response.put("byCategoryCount", categoryCounts);

        return ResponseEntity.ok(ApiResponse.success(response, "Unread count retrieved successfully"));
    }

    /**
     * Get a specific notification
     */
    @GetMapping("/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NotificationDTO>> getNotification(
            @PathVariable String publicId) {
        NotificationDTO notification = notificationService.getNotification(publicId);
        return ResponseEntity.ok(ApiResponse.success(notification, "Notification retrieved successfully"));
    }

    /**
     * Mark notification as read
     */
    @PatchMapping("/{publicId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NotificationDTO>> markAsRead(
            @PathVariable String publicId) {
        NotificationDTO notification = notificationService.markAsRead(publicId);
        return ResponseEntity.ok(ApiResponse.success(notification, "Notification marked as read"));
    }

    /**
     * Mark all notifications as read
     */
    @PatchMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        String userPublicId = userDetails.getUsername();
        int count = notificationService.markAllAsRead(userPublicId);

        Map<String, Object> response = new HashMap<>();
        response.put("markedAsRead", count);

        return ResponseEntity.ok(ApiResponse.success(response, count + " notifications marked as read"));
    }

    /**
     * Mark all notifications in a category as read
     */
    @PatchMapping("/category/{category}/mark-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markCategoryAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable NotificationCategory category) {
        String userPublicId = userDetails.getUsername();
        int count = notificationService.markCategoryAsRead(userPublicId, category);

        Map<String, Object> response = new HashMap<>();
        response.put("markedAsRead", count);
        response.put("category", category);

        return ResponseEntity.ok(ApiResponse.success(response,
                count + " " + category + " notifications marked as read"));
    }

    /**
     * Archive notification
     */
    @PostMapping("/{publicId}/archive")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NotificationDTO>> archiveNotification(
            @PathVariable String publicId) {
        NotificationDTO notification = notificationService.archiveNotification(publicId);
        return ResponseEntity.ok(ApiResponse.success(notification, "Notification archived successfully"));
    }

    /**
     * Unarchive notification
     */
    @PostMapping("/{publicId}/unarchive")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NotificationDTO>> unarchiveNotification(
            @PathVariable String publicId) {
        NotificationDTO notification = notificationService.unarchiveNotification(publicId);
        return ResponseEntity.ok(ApiResponse.success(notification, "Notification unarchived successfully"));
    }

    /**
     * Update notification
     */
    @PatchMapping("/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NotificationDTO>> updateNotification(
            @PathVariable String publicId,
            @Valid @RequestBody UpdateNotificationDTO dto) {
        NotificationDTO notification = notificationService.updateNotification(publicId, dto);
        return ResponseEntity.ok(ApiResponse.success(notification, "Notification updated successfully"));
    }

    /**
     * Delete notification
     */
    @DeleteMapping("/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable String publicId) {
        notificationService.deleteNotification(publicId);
        return ResponseEntity.ok(ApiResponse.success(null, "Notification deleted successfully"));
    }

    /**
     * Delete all user notifications (for account deletion - admin only)
     */
    @DeleteMapping("/user/{userPublicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteAllUserNotifications(
            @PathVariable String userPublicId) {
        int count = notificationService.deleteAllUserNotifications(userPublicId);

        Map<String, Object> response = new HashMap<>();
        response.put("deleted", count);
        response.put("userPublicId", userPublicId);

        return ResponseEntity.ok(ApiResponse.success(response,
                "Deleted " + count + " notifications for user " + userPublicId));
    }

    /**
     * Cleanup expired notifications (admin only, typically scheduled)
     */
    @PostMapping("/cleanup-expired")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cleanupExpiredNotifications() {
        int count = notificationService.cleanupExpiredNotifications();

        Map<String, Object> response = new HashMap<>();
        response.put("deleted", count);

        return ResponseEntity.ok(ApiResponse.success(response,
                "Cleaned up " + count + " expired notifications"));
    }
}
