package com.stayease.domain.admin.controller;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stayease.domain.admin.dto.AdminActionDTO;
import com.stayease.domain.admin.dto.AuditLogDTO;
import com.stayease.domain.admin.service.AdminService;
import com.stayease.domain.admin.service.AuditService;
import com.stayease.security.SecurityUtils;
import com.stayease.shared.dto.ApiResponse;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminService adminService;
    private final AuditService auditService;

    // ======================== LISTING MANAGEMENT ========================

    @PostMapping("/listings/{listingId}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> approveListing(
            @PathVariable UUID listingId,
            @Valid @RequestBody AdminActionRequest request) {
        log.info("Admin approving listing: {}", listingId);
        UUID adminId = SecurityUtils.getCurrentUserId();
        adminService.approveListing(adminId, listingId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(null, "Listing approved successfully"));
    }

    @PostMapping("/listings/{listingId}/reject")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> rejectListing(
            @PathVariable UUID listingId,
            @Valid @RequestBody AdminActionRequest request) {
        log.info("Admin rejecting listing: {}", listingId);
        UUID adminId = SecurityUtils.getCurrentUserId();
        adminService.rejectListing(adminId, listingId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(null, "Listing rejected successfully"));
    }

    @PostMapping("/listings/{listingId}/feature")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> featureListing(
            @PathVariable UUID listingId,
            @Valid @RequestBody AdminActionRequest request) {
        log.info("Admin featuring listing: {}", listingId);
        UUID adminId = SecurityUtils.getCurrentUserId();
        adminService.featureListing(adminId, listingId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(null, "Listing featured successfully"));
    }

    @PostMapping("/listings/{listingId}/unfeature")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> unfeatureListing(
            @PathVariable UUID listingId,
            @Valid @RequestBody AdminActionRequest request) {
        log.info("Admin unfeaturing listing: {}", listingId);
        UUID adminId = SecurityUtils.getCurrentUserId();
        adminService.unfeatureListing(adminId, listingId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(null, "Listing unfeatured successfully"));
    }

    // ======================== USER MANAGEMENT ========================

    @PostMapping("/users/{userId}/suspend")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> suspendUser(
            @PathVariable UUID userId,
            @Valid @RequestBody AdminActionRequest request) {
        log.info("Admin suspending user: {}", userId);
        UUID adminId = SecurityUtils.getCurrentUserId();
        adminService.suspendUser(adminId, userId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(null, "User suspended successfully"));
    }

    @PostMapping("/users/{userId}/reactivate")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> reactivateUser(
            @PathVariable UUID userId,
            @Valid @RequestBody AdminActionRequest request) {
        log.info("Admin reactivating user: {}", userId);
        UUID adminId = SecurityUtils.getCurrentUserId();
        adminService.reactivateUser(adminId, userId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(null, "User reactivated successfully"));
    }

    // ======================== BOOKING MANAGEMENT ========================

    @PostMapping("/bookings/{bookingId}/cancel")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(
            @PathVariable UUID bookingId,
            @Valid @RequestBody AdminActionRequest request) {
        log.info("Admin cancelling booking: {}", bookingId);
        UUID adminId = SecurityUtils.getCurrentUserId();
        adminService.cancelBooking(adminId, bookingId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(null, "Booking cancelled successfully"));
    }

    // ======================== ADMIN ACTIONS ========================

    @GetMapping("/actions")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AdminActionDTO>>> getAllAdminActions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET request to fetch all admin actions");
        Pageable pageable = PageRequest.of(page, size);
        Page<AdminActionDTO> actions = adminService.getAllAdminActions(pageable);
        return ResponseEntity.ok(ApiResponse.success(actions, "Admin actions retrieved successfully"));
    }

    @GetMapping("/actions/admin/{adminId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AdminActionDTO>>> getAdminActionsByAdmin(
            @PathVariable UUID adminId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET request to fetch admin actions for admin: {}", adminId);
        Pageable pageable = PageRequest.of(page, size);
        Page<AdminActionDTO> actions = adminService.getAdminActionsByAdmin(adminId, pageable);
        return ResponseEntity.ok(ApiResponse.success(actions, "Admin actions retrieved successfully"));
    }

    @GetMapping("/actions/type/{actionType}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AdminActionDTO>>> getAdminActionsByType(
            @PathVariable String actionType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET request to fetch admin actions of type: {}", actionType);
        Pageable pageable = PageRequest.of(page, size);
        Page<AdminActionDTO> actions = adminService.getAdminActionsByType(actionType, pageable);
        return ResponseEntity.ok(ApiResponse.success(actions, "Admin actions retrieved successfully"));
    }

    @GetMapping("/actions/target/{targetEntity}/{targetId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<AdminActionDTO>>> getAdminActionsForTarget(
            @PathVariable String targetEntity,
            @PathVariable String targetId) {
        log.info("GET request to fetch admin actions for target: {} {}", targetEntity, targetId);
        List<AdminActionDTO> actions = adminService.getAdminActionsForTarget(targetEntity, targetId);
        return ResponseEntity.ok(ApiResponse.success(actions, "Admin actions retrieved successfully"));
    }

    // ======================== AUDIT LOGS ========================

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET request to fetch all audit logs");
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLogDTO> logs = auditService.getAllAuditLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success(logs, "Audit logs retrieved successfully"));
    }

    @GetMapping("/audit-logs/actor/{actorId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAuditLogsByActor(
            @PathVariable UUID actorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET request to fetch audit logs for actor: {}", actorId);
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLogDTO> logs = auditService.getAuditLogsByActor(actorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs, "Audit logs retrieved successfully"));
    }

    @GetMapping("/audit-logs/action/{action}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAuditLogsByAction(
            @PathVariable String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET request to fetch audit logs for action: {}", action);
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLogDTO> logs = auditService.getAuditLogsByAction(action, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs, "Audit logs retrieved successfully"));
    }

    @GetMapping("/audit-logs/date-range")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAuditLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET request to fetch audit logs between {} and {}", startDate, endDate);
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLogDTO> logs = auditService.getAuditLogsByDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs, "Audit logs retrieved successfully"));
    }

    @GetMapping("/audit-logs/search")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> searchAuditLogs(
            @RequestParam String target,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET request to search audit logs with target: {}", target);
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLogDTO> logs = auditService.searchAuditLogsByTarget(target, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs, "Audit logs retrieved successfully"));
    }

    @GetMapping("/audit-logs/recent")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getRecentAuditLogs() {
        log.info("GET request to fetch recent audit logs");
        List<AuditLogDTO> logs = auditService.getRecentAuditLogs();
        return ResponseEntity.ok(ApiResponse.success(logs, "Recent audit logs retrieved successfully"));
    }

    // ======================== REQUEST DTOs ========================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminActionRequest {
        @NotBlank(message = "Reason is required")
        private String reason;
    }
}
