package com.stayease.domain.serviceoffering.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stayease.domain.serviceoffering.dto.CreateServiceOfferingDTO;
import com.stayease.domain.serviceoffering.dto.ServiceOfferingDTO;
import com.stayease.domain.serviceoffering.entity.ServiceOffering.*;
import com.stayease.domain.serviceoffering.entity.ServiceOffering.ServiceCategory;
import com.stayease.domain.serviceoffering.entity.ServiceOffering.ServiceStatus;
import com.stayease.domain.serviceoffering.service.ServiceOfferingService;
import com.stayease.security.UserPrincipal;
import com.stayease.shared.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST Controller for Service Offering management
 */
@RestController
@RequestMapping("/api/service-offerings")
@RequiredArgsConstructor
@Slf4j
public class ServiceOfferingController {

    private final ServiceOfferingService serviceOfferingService;

    /**
     * Create a new service offering
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SERVICE_PROVIDER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ServiceOfferingDTO>> createService(
            @Valid @RequestBody CreateServiceOfferingDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Creating service offering for user: {}", currentUser.getId());

        String providerPublicId = currentUser.getId().toString();
        ServiceOfferingDTO createdService = serviceOfferingService.createService(dto, providerPublicId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.<ServiceOfferingDTO>builder()
                        .success(true)
                        .message("Service offering created successfully. Pending approval.")
                        .data(createdService)
                        .build());
    }

    /**
     * Get service offering by public ID
     */
    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<ServiceOfferingDTO>> getServiceById(@PathVariable String publicId) {
        log.debug("Fetching service offering: {}", publicId);

        ServiceOfferingDTO service = serviceOfferingService.getServiceByPublicId(publicId);

        return ResponseEntity.ok(ApiResponse.<ServiceOfferingDTO>builder()
                .success(true)
                .data(service)
                .build());
    }

    /**
     * Get all active service offerings with pagination
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ServiceOfferingDTO>>> getAllActiveServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "averageRating") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        log.debug("Fetching all active services - page: {}, size: {}", page, size);

        Page<ServiceOfferingDTO> services = serviceOfferingService.getAllActiveServices(page, size, sortBy, sortDirection);

        return ResponseEntity.ok(ApiResponse.<Page<ServiceOfferingDTO>>builder()
                .success(true)
                .data(services)
                .build());
    }

    /**
     * Search service offerings with filters
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ServiceOfferingDTO>>> searchServices(
            @RequestParam(required = false) ServiceCategory category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Boolean mobileServiceOnly,
            @RequestParam(required = false) Boolean instantBookingOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "averageRating") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        log.debug("Searching services with filters");

        Page<ServiceOfferingDTO> services = serviceOfferingService.searchServices(
                category, city, keyword, minRating, mobileServiceOnly, instantBookingOnly,
                page, size, sortBy, sortDirection);

        return ResponseEntity.ok(ApiResponse.<Page<ServiceOfferingDTO>>builder()
                .success(true)
                .data(services)
                .build());
    }

    /**
     * Get services by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<Page<ServiceOfferingDTO>>> getServicesByCategory(
            @PathVariable ServiceCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.debug("Fetching services by category: {}", category);

        Page<ServiceOfferingDTO> services = serviceOfferingService.getServicesByCategory(category, page, size);

        return ResponseEntity.ok(ApiResponse.<Page<ServiceOfferingDTO>>builder()
                .success(true)
                .data(services)
                .build());
    }

    /**
     * Get featured services
     */
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ServiceOfferingDTO>>> getFeaturedServices() {
        log.debug("Fetching featured services");

        List<ServiceOfferingDTO> services = serviceOfferingService.getFeaturedServices();

        return ResponseEntity.ok(ApiResponse.<List<ServiceOfferingDTO>>builder()
                .success(true)
                .data(services)
                .build());
    }

    /**
     * Get services by provider (my services)
     */
    @GetMapping("/my-services")
    @PreAuthorize("hasAnyAuthority('ROLE_SERVICE_PROVIDER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<ServiceOfferingDTO>>> getMyServices(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.debug("Fetching services for provider: {}", currentUser.getId());

        String providerPublicId = currentUser.getId().toString();
        List<ServiceOfferingDTO> services = serviceOfferingService.getServicesByProvider(providerPublicId);

        return ResponseEntity.ok(ApiResponse.<List<ServiceOfferingDTO>>builder()
                .success(true)
                .data(services)
                .build());
    }

    /**
     * Get services by specific provider
     */
    @GetMapping("/provider/{providerPublicId}")
    public ResponseEntity<ApiResponse<List<ServiceOfferingDTO>>> getServicesByProvider(
            @PathVariable String providerPublicId) {

        log.debug("Fetching services for provider: {}", providerPublicId);

        List<ServiceOfferingDTO> services = serviceOfferingService.getServicesByProvider(providerPublicId);

        return ResponseEntity.ok(ApiResponse.<List<ServiceOfferingDTO>>builder()
                .success(true)
                .data(services)
                .build());
    }

    /**
     * Update service offering
     */
    @PutMapping("/{publicId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SERVICE_PROVIDER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ServiceOfferingDTO>> updateService(
            @PathVariable String publicId,
            @Valid @RequestBody CreateServiceOfferingDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Updating service offering: {}", publicId);

        String providerPublicId = currentUser.getId().toString();
        ServiceOfferingDTO updatedService = serviceOfferingService.updateService(publicId, dto, providerPublicId);

        return ResponseEntity.ok(ApiResponse.<ServiceOfferingDTO>builder()
                .success(true)
                .message("Service offering updated successfully")
                .data(updatedService)
                .build());
    }

    /**
     * Update service status (activate/deactivate)
     */
    @PatchMapping("/{publicId}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_SERVICE_PROVIDER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ServiceOfferingDTO>> updateServiceStatus(
            @PathVariable String publicId,
            @RequestParam ServiceStatus status,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Updating service status: {} to {}", publicId, status);

        String providerPublicId = currentUser.getId().toString();
        ServiceOfferingDTO updatedService = serviceOfferingService.updateServiceStatus(publicId, status, providerPublicId);

        return ResponseEntity.ok(ApiResponse.<ServiceOfferingDTO>builder()
                .success(true)
                .message("Service status updated successfully")
                .data(updatedService)
                .build());
    }

    /**
     * Delete service offering
     */
    @DeleteMapping("/{publicId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SERVICE_PROVIDER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteService(
            @PathVariable String publicId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Deleting service offering: {}", publicId);

        String providerPublicId = currentUser.getId().toString();
        serviceOfferingService.deleteService(publicId, providerPublicId);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Service offering deleted successfully")
                .build());
    }

    /**
     * Approve service offering (admin only)
     */
    @PostMapping("/{publicId}/approve")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ServiceOfferingDTO>> approveService(
            @PathVariable String publicId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Admin approving service: {}", publicId);

        String approvedBy = currentUser.getId().toString();
        ServiceOfferingDTO approvedService = serviceOfferingService.approveService(publicId, approvedBy);

        return ResponseEntity.ok(ApiResponse.<ServiceOfferingDTO>builder()
                .success(true)
                .message("Service offering approved successfully")
                .data(approvedService)
                .build());
    }

    /**
     * Reject service offering (admin only)
     */
    @PostMapping("/{publicId}/reject")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ServiceOfferingDTO>> rejectService(
            @PathVariable String publicId,
            @RequestParam String reason) {

        log.info("Admin rejecting service: {}", publicId);

        ServiceOfferingDTO rejectedService = serviceOfferingService.rejectService(publicId, reason);

        return ResponseEntity.ok(ApiResponse.<ServiceOfferingDTO>builder()
                .success(true)
                .message("Service offering rejected")
                .data(rejectedService)
                .build());
    }

    /**
     * Feature/unfeature service offering (admin only)
     */
    @PostMapping("/{publicId}/feature")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ServiceOfferingDTO>> toggleFeaturedService(
            @PathVariable String publicId,
            @RequestParam boolean featured) {

        log.info("Toggling featured status for service: {}", publicId);

        ServiceOfferingDTO updatedService = serviceOfferingService.toggleFeatured(publicId, featured);

        return ResponseEntity.ok(ApiResponse.<ServiceOfferingDTO>builder()
                .success(true)
                .message(featured ? "Service featured successfully" : "Service unfeatured successfully")
                .data(updatedService)
                .build());
    }
}
