package com.stayease.shared.mapper;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.stayease.domain.serviceoffering.dto.CreateServiceOfferingDTO;
import com.stayease.domain.serviceoffering.dto.ServiceImageDTO;
import com.stayease.domain.serviceoffering.dto.ServiceOfferingDTO;
import com.stayease.domain.serviceoffering.entity.ServiceImage;
import com.stayease.domain.serviceoffering.entity.ServiceOffering;

/**
 * Mapper for Service Offering entity and DTOs
 */
@Component
public class ServiceOfferingMapper {

    /**
     * Convert ServiceOffering entity to DTO
     */
    public ServiceOfferingDTO toDTO(ServiceOffering service) {
        if (service == null) {
            return null;
        }

        List<ServiceImageDTO> imageDTOs = service.getImages() != null ?
                service.getImages().stream()
                        .map(this::toImageDTO)
                        .collect(Collectors.toList()) : List.of();

        return ServiceOfferingDTO.builder()
                .publicId(service.getPublicId())
                .category(service.getCategory())
                .status(service.getStatus())
                // Provider info
                .providerPublicId(service.getProviderPublicId())
                // Basic info
                .title(service.getTitle())
                .description(service.getDescription())
                .highlights(service.getHighlights())
                .whatIsIncluded(service.getWhatIsIncluded())
                .whatToExpect(service.getWhatToExpect())
                // Pricing
                .pricingType(service.getPricingType())
                .basePrice(service.getBasePrice())
                .extraPersonPrice(service.getExtraPersonPrice())
                .weekendSurcharge(service.getWeekendSurcharge())
                .peakSeasonSurcharge(service.getPeakSeasonSurcharge())
                .finalPrice(service.calculateFinalPrice())
                .discountPercentage(service.getDiscountPercentage())
                // Capacity
                .minCapacity(service.getMinCapacity())
                .maxCapacity(service.getMaxCapacity())
                // Duration
                .durationMinutes(service.getDurationMinutes())
                .minBookingHours(service.getMinBookingHours())
                // Availability
                .isActive(service.getIsActive())
                .isInstantBooking(service.getIsInstantBooking())
                .availableFrom(service.getAvailableFrom())
                .availableTo(service.getAvailableTo())
                .availableDays(service.getAvailableDays())
                // Location
                .city(service.getCity())
                .country(service.getCountry())
                .address(service.getAddress())
                .latitude(service.getLatitude())
                .longitude(service.getLongitude())
                .serviceRadius(service.getServiceRadius())
                .providesMobileService(service.getProvidesMobileService())
                // Requirements
                .requirements(service.getRequirements())
                .cancellationPolicy(service.getCancellationPolicy())
                .advanceBookingHours(service.getAdvanceBookingHours())
                .safetyMeasures(service.getSafetyMeasures())
                // Languages & Amenities
                .languages(service.getLanguages())
                .amenities(service.getAmenities())
                // Media
                .images(imageDTOs)
                .videoUrl(service.getVideoUrl())
                // Reviews & Rating
                .averageRating(service.getAverageRating())
                .totalReviews(service.getTotalReviews())
                .totalBookings(service.getTotalBookings())
                // Verification
                .isVerified(service.getIsVerified())
                .hasInsurance(service.getHasInsurance())
                .hasLicense(service.getHasLicense())
                // Promotion
                .isFeatured(service.isFeaturedNow())
                .hasActiveDiscount(service.getDiscountPercentage() != null && service.getDiscountValidUntil() != null)
                // Statistics
                .viewCount(service.getViewCount())
                .favoriteCount(service.getFavoriteCount())
                // Timestamps
                .createdAt(service.getCreatedAt())
                .updatedAt(service.getUpdatedAt())
                // Computed fields
                .isBookable(service.isBookable())
                .categoryDisplayName(service.getCategory().name())
                .priceDisplay(formatPrice(service.getBasePrice(), service.getPricingType()))
                .build();
    }

    /**
     * Convert CreateServiceOfferingDTO to ServiceOffering entity
     */
    public ServiceOffering toEntity(CreateServiceOfferingDTO dto) {
        if (dto == null) {
            return null;
        }

        ServiceOffering service = ServiceOffering.builder()
                .publicId(UUID.randomUUID().toString())
                .category(dto.getCategory())
                .providerPublicId(dto.getProviderPublicId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .highlights(dto.getHighlights())
                .whatIsIncluded(dto.getWhatIsIncluded())
                .whatToExpect(dto.getWhatToExpect())
                // Pricing
                .pricingType(dto.getPricingType())
                .basePrice(dto.getBasePrice())
                .extraPersonPrice(dto.getExtraPersonPrice())
                .weekendSurcharge(dto.getWeekendSurcharge())
                .peakSeasonSurcharge(dto.getPeakSeasonSurcharge())
                // Capacity
                .minCapacity(dto.getMinCapacity())
                .maxCapacity(dto.getMaxCapacity())
                // Duration
                .durationMinutes(dto.getDurationMinutes())
                .minBookingHours(dto.getMinBookingHours())
                // Availability
                .isInstantBooking(dto.getIsInstantBooking() != null ? dto.getIsInstantBooking() : false)
                .availableFrom(dto.getAvailableFrom())
                .availableTo(dto.getAvailableTo())
                .availableDays(dto.getAvailableDays())
                // Location
                .city(dto.getCity())
                .country(dto.getCountry())
                .address(dto.getAddress())
                .zipCode(dto.getZipCode())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .serviceRadius(dto.getServiceRadius())
                .providesMobileService(dto.getProvidesMobileService() != null ? dto.getProvidesMobileService() : false)
                // Requirements
                .requirements(dto.getRequirements())
                .cancellationPolicy(dto.getCancellationPolicy())
                .advanceBookingHours(dto.getAdvanceBookingHours())
                .safetyMeasures(dto.getSafetyMeasures())
                // Languages & Amenities
                .languages(dto.getLanguages())
                .amenities(dto.getAmenities())
                // Media
                .videoUrl(dto.getVideoUrl())
                // Verification
                .hasInsurance(dto.getHasInsurance() != null ? dto.getHasInsurance() : false)
                .hasLicense(dto.getHasLicense() != null ? dto.getHasLicense() : false)
                .licenseNumber(dto.getLicenseNumber())
                // Status
                .status(ServiceOffering.ServiceStatus.PENDING_APPROVAL)
                .isActive(false)
                .build();

        // Add images if provided
        if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
            int order = 0;
            for (String imageUrl : dto.getImageUrls()) {
                ServiceImage image = ServiceImage.builder()
                        .imageUrl(imageUrl)
                        .isPrimary(order == 0) // First image is primary
                        .displayOrder(order++)
                        .build();
                service.addImage(image);
            }
        }

        return service;
    }

    /**
     * Update ServiceOffering entity from CreateServiceOfferingDTO (for updates)
     */
    public void updateEntity(ServiceOffering service, CreateServiceOfferingDTO dto) {
        if (dto == null) {
            return;
        }

        if (dto.getCategory() != null) service.setCategory(dto.getCategory());
        if (dto.getTitle() != null) service.setTitle(dto.getTitle());
        if (dto.getDescription() != null) service.setDescription(dto.getDescription());
        if (dto.getHighlights() != null) service.setHighlights(dto.getHighlights());
        if (dto.getWhatIsIncluded() != null) service.setWhatIsIncluded(dto.getWhatIsIncluded());
        if (dto.getWhatToExpect() != null) service.setWhatToExpect(dto.getWhatToExpect());
        
        // Pricing
        if (dto.getPricingType() != null) service.setPricingType(dto.getPricingType());
        if (dto.getBasePrice() != null) service.setBasePrice(dto.getBasePrice());
        if (dto.getExtraPersonPrice() != null) service.setExtraPersonPrice(dto.getExtraPersonPrice());
        if (dto.getWeekendSurcharge() != null) service.setWeekendSurcharge(dto.getWeekendSurcharge());
        if (dto.getPeakSeasonSurcharge() != null) service.setPeakSeasonSurcharge(dto.getPeakSeasonSurcharge());
        
        // Capacity
        if (dto.getMinCapacity() != null) service.setMinCapacity(dto.getMinCapacity());
        if (dto.getMaxCapacity() != null) service.setMaxCapacity(dto.getMaxCapacity());
        
        // Duration
        if (dto.getDurationMinutes() != null) service.setDurationMinutes(dto.getDurationMinutes());
        if (dto.getMinBookingHours() != null) service.setMinBookingHours(dto.getMinBookingHours());
        
        // Availability
        if (dto.getIsInstantBooking() != null) service.setIsInstantBooking(dto.getIsInstantBooking());
        if (dto.getAvailableFrom() != null) service.setAvailableFrom(dto.getAvailableFrom());
        if (dto.getAvailableTo() != null) service.setAvailableTo(dto.getAvailableTo());
        if (dto.getAvailableDays() != null) service.setAvailableDays(dto.getAvailableDays());
        
        // Location
        if (dto.getCity() != null) service.setCity(dto.getCity());
        if (dto.getCountry() != null) service.setCountry(dto.getCountry());
        if (dto.getAddress() != null) service.setAddress(dto.getAddress());
        if (dto.getZipCode() != null) service.setZipCode(dto.getZipCode());
        if (dto.getLatitude() != null) service.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) service.setLongitude(dto.getLongitude());
        if (dto.getServiceRadius() != null) service.setServiceRadius(dto.getServiceRadius());
        if (dto.getProvidesMobileService() != null) service.setProvidesMobileService(dto.getProvidesMobileService());
        
        // Requirements
        if (dto.getRequirements() != null) service.setRequirements(dto.getRequirements());
        if (dto.getCancellationPolicy() != null) service.setCancellationPolicy(dto.getCancellationPolicy());
        if (dto.getAdvanceBookingHours() != null) service.setAdvanceBookingHours(dto.getAdvanceBookingHours());
        if (dto.getSafetyMeasures() != null) service.setSafetyMeasures(dto.getSafetyMeasures());
        
        // Languages & Amenities
        if (dto.getLanguages() != null) service.setLanguages(dto.getLanguages());
        if (dto.getAmenities() != null) service.setAmenities(dto.getAmenities());
        
        // Media
        if (dto.getVideoUrl() != null) service.setVideoUrl(dto.getVideoUrl());
        
        // Verification
        if (dto.getHasInsurance() != null) service.setHasInsurance(dto.getHasInsurance());
        if (dto.getHasLicense() != null) service.setHasLicense(dto.getHasLicense());
        if (dto.getLicenseNumber() != null) service.setLicenseNumber(dto.getLicenseNumber());

        // Update images if provided
        if (dto.getImageUrls() != null) {
            service.getImages().clear();
            int order = 0;
            for (String imageUrl : dto.getImageUrls()) {
                ServiceImage image = ServiceImage.builder()
                        .imageUrl(imageUrl)
                        .isPrimary(order == 0)
                        .displayOrder(order++)
                        .build();
                service.addImage(image);
            }
        }
    }

    /**
     * Convert ServiceImage entity to DTO
     */
    public ServiceImageDTO toImageDTO(ServiceImage image) {
        if (image == null) {
            return null;
        }

        return ServiceImageDTO.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .caption(image.getCaption())
                .isPrimary(image.getIsPrimary())
                .displayOrder(image.getDisplayOrder())
                .uploadedAt(image.getUploadedAt())
                .build();
    }

    /**
     * Convert list of ServiceOffering entities to DTOs
     */
    public List<ServiceOfferingDTO> toDTOList(List<ServiceOffering> services) {
        return services.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Format price with pricing type
     */
    private String formatPrice(java.math.BigDecimal price, ServiceOffering.PricingType pricingType) {
        if (price == null) {
            return "$0";
        }
        
        String priceStr = "$" + price.intValue();
        
        switch (pricingType) {
            case PER_HOUR:
                return priceStr + "/hour";
            case PER_DAY:
                return priceStr + "/day";
            case PER_PERSON:
                return priceStr + "/person";
            case PER_SESSION:
                return priceStr + "/session";
            case PER_ITEM:
                return priceStr + "/item";
            default:
                return priceStr;
        }
    }
}
