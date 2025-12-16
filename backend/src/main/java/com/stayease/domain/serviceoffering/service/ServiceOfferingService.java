package com.stayease.domain.serviceoffering.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stayease.domain.serviceoffering.dto.CreateServiceOfferingDTO;
import com.stayease.domain.serviceoffering.dto.ServiceOfferingDTO;
import com.stayease.domain.serviceoffering.entity.ServiceOffering;
import com.stayease.domain.serviceoffering.entity.ServiceOffering.ServiceCategory;
import com.stayease.domain.serviceoffering.entity.ServiceOffering.ServiceStatus;
import com.stayease.domain.serviceoffering.repository.ServiceOfferingRepository;
import com.stayease.exception.ForbiddenException;
import com.stayease.exception.NotFoundException;
import com.stayease.shared.mapper.ServiceOfferingMapper;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing Service Offerings
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServiceOfferingService {

    private final ServiceOfferingRepository serviceOfferingRepository;
    private final ServiceOfferingMapper serviceOfferingMapper;

    /**
     * Create a new service offering
     */
    public ServiceOfferingDTO createService(CreateServiceOfferingDTO dto, String providerPublicId) {
        log.info("Creating new service offering for provider: {}", providerPublicId);

        ServiceOffering service = serviceOfferingMapper.toEntity(dto);
        service.setProviderPublicId(providerPublicId);
        service.setStatus(ServiceStatus.PENDING_APPROVAL);
        service.setIsActive(false);

        ServiceOffering savedService = serviceOfferingRepository.save(service);
        log.info("Service offering created successfully with ID: {}", savedService.getPublicId());

        return serviceOfferingMapper.toDTO(savedService);
    }

    /**
     * Get service offering by public ID
     */
    @Transactional(readOnly = true)
    public ServiceOfferingDTO getServiceByPublicId(String publicId) {
        log.debug("Fetching service offering with publicId: {}", publicId);

        ServiceOffering service = serviceOfferingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Service offering not found with ID: " + publicId));

        // Increment view count
        service.incrementViews();
        serviceOfferingRepository.save(service);

        return serviceOfferingMapper.toDTO(service);
    }

    /**
     * Get all active service offerings with pagination and sorting
     */
    @Transactional(readOnly = true)
    public Page<ServiceOfferingDTO> getAllActiveServices(int page, int size, String sortBy, String sortDirection) {
        log.debug("Fetching all active service offerings - page: {}, size: {}", page, size);

        Sort sort = sortDirection.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ServiceOffering> services = serviceOfferingRepository.findByIsActiveTrueAndStatusOrderByAverageRatingDescCreatedAtDesc(
                ServiceStatus.ACTIVE, pageable);

        return services.map(serviceOfferingMapper::toDTO);
    }

    /**
     * Search service offerings with filters
     */
    @Transactional(readOnly = true)
    public Page<ServiceOfferingDTO> searchServices(ServiceCategory category, String city, String keyword,
                                                   Double minRating, Boolean mobileServiceOnly, Boolean instantBookingOnly,
                                                   int page, int size, String sortBy, String sortDirection) {
        log.debug("Searching service offerings with filters");

        Sort sort = sortDirection.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<ServiceOffering> spec = createSearchSpecification(category, city, keyword, minRating, 
                                        mobileServiceOnly, instantBookingOnly);

        // Cast repository to JpaSpecificationExecutor to use findAll with Specification
        JpaSpecificationExecutor<ServiceOffering> specRepo = (JpaSpecificationExecutor<ServiceOffering>) serviceOfferingRepository;
        Page<ServiceOffering> services = specRepo.findAll(spec, pageable);

        return services.map(serviceOfferingMapper::toDTO);
    }

    /**
     * Get services by provider
     */
    @Transactional(readOnly = true)
    public List<ServiceOfferingDTO> getServicesByProvider(String providerPublicId) {
        log.debug("Fetching services for provider: {}", providerPublicId);

        List<ServiceOffering> services = serviceOfferingRepository.findByProviderPublicId(providerPublicId);

        return serviceOfferingMapper.toDTOList(services);
    }

    /**
     * Get services by category
     */
    @Transactional(readOnly = true)
    public Page<ServiceOfferingDTO> getServicesByCategory(ServiceCategory category, int page, int size) {
        log.debug("Fetching services by category: {}", category);

        Pageable pageable = PageRequest.of(page, size, Sort.by("averageRating").descending());

        Page<ServiceOffering> services = serviceOfferingRepository.findByCategoryAndIsActiveTrueAndStatusOrderByCreatedAtDesc(
                category, ServiceStatus.ACTIVE, pageable);

        return services.map(serviceOfferingMapper::toDTO);
    }

    /**
     * Get featured services
     */
    @Transactional(readOnly = true)
    public List<ServiceOfferingDTO> getFeaturedServices() {
        log.debug("Fetching featured services");

        List<ServiceOffering> services = serviceOfferingRepository.findFeaturedServices();

        return serviceOfferingMapper.toDTOList(services);
    }

    /**
     * Update service offering
     */
    public ServiceOfferingDTO updateService(String publicId, CreateServiceOfferingDTO dto, String currentUserPublicId) {
        log.info("Updating service offering: {}", publicId);

        ServiceOffering service = serviceOfferingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Service offering not found with ID: " + publicId));

        if (!service.getProviderPublicId().equals(currentUserPublicId)) {
            throw new ForbiddenException("You don't have permission to update this service");
        }

        serviceOfferingMapper.updateEntity(service, dto);

        ServiceOffering updatedService = serviceOfferingRepository.save(service);
        log.info("Service offering updated successfully: {}", publicId);

        return serviceOfferingMapper.toDTO(updatedService);
    }

    /**
     * Delete service offering
     */
    public void deleteService(String publicId, String currentUserPublicId) {
        log.info("Deleting service offering: {}", publicId);

        ServiceOffering service = serviceOfferingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Service offering not found with ID: " + publicId));

        if (!service.getProviderPublicId().equals(currentUserPublicId)) {
            throw new ForbiddenException("You don't have permission to delete this service");
        }

        serviceOfferingRepository.delete(service);
        log.info("Service offering deleted successfully: {}", publicId);
    }

    /**
     * Update service offering status
     */
    public ServiceOfferingDTO updateServiceStatus(String publicId, ServiceStatus status, String currentUserPublicId) {
        log.info("Updating service status: {} to {}", publicId, status);

        ServiceOffering service = serviceOfferingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Service offering not found with ID: " + publicId));

        if (!service.getProviderPublicId().equals(currentUserPublicId)) {
            throw new ForbiddenException("You don't have permission to update this service");
        }

        service.setStatus(status);
        if (status == ServiceStatus.ACTIVE) {
            service.setIsActive(true);
        } else if (status == ServiceStatus.INACTIVE || status == ServiceStatus.PAUSED) {
            service.setIsActive(false);
        }

        ServiceOffering updatedService = serviceOfferingRepository.save(service);
        log.info("Service status updated successfully: {}", publicId);

        return serviceOfferingMapper.toDTO(updatedService);
    }

    /**
     * Approve service offering (admin only)
     */
    public ServiceOfferingDTO approveService(String publicId, String approvedBy) {
        log.info("Approving service offering: {}", publicId);

        ServiceOffering service = serviceOfferingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Service offering not found with ID: " + publicId));

        service.approve(approvedBy);

        ServiceOffering approvedService = serviceOfferingRepository.save(service);
        log.info("Service offering approved successfully: {}", publicId);

        return serviceOfferingMapper.toDTO(approvedService);
    }

    /**
     * Reject service offering (admin only)
     */
    public ServiceOfferingDTO rejectService(String publicId, String reason) {
        log.info("Rejecting service offering: {}", publicId);

        ServiceOffering service = serviceOfferingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Service offering not found with ID: " + publicId));

        service.reject(reason);

        ServiceOffering rejectedService = serviceOfferingRepository.save(service);
        log.info("Service offering rejected: {}", publicId);

        return serviceOfferingMapper.toDTO(rejectedService);
    }

    /**
     * Feature/unfeature service (admin only)
     */
    public ServiceOfferingDTO toggleFeatured(String publicId, boolean featured) {
        log.info("Toggling featured status for service: {}", publicId);

        ServiceOffering service = serviceOfferingRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Service offering not found with ID: " + publicId));

        service.setIsFeatured(featured);

        ServiceOffering updatedService = serviceOfferingRepository.save(service);
        log.info("Service featured status updated: {}", publicId);

        return serviceOfferingMapper.toDTO(updatedService);
    }

    /**
     * Create search specification with filters
     */
    private Specification<ServiceOffering> createSearchSpecification(ServiceCategory category, String city, 
                                                                     String keyword, Double minRating,
                                                                     Boolean mobileServiceOnly, Boolean instantBookingOnly) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only active services
            predicates.add(cb.equal(root.get("isActive"), true));
            predicates.add(cb.equal(root.get("status"), ServiceStatus.ACTIVE));

            // Category filter
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            // City filter
            if (city != null && !city.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("city")), "%" + city.toLowerCase() + "%"));
            }

            // Keyword search
            if (keyword != null && !keyword.trim().isEmpty()) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), likePattern);
                Predicate descriptionMatch = cb.like(cb.lower(root.get("description")), likePattern);
                predicates.add(cb.or(titleMatch, descriptionMatch));
            }

            // Minimum rating filter
            if (minRating != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("averageRating"), minRating));
            }

            // Mobile service filter
            if (mobileServiceOnly != null && mobileServiceOnly) {
                predicates.add(cb.equal(root.get("providesMobileService"), true));
            }

            // Instant booking filter
            if (instantBookingOnly != null && instantBookingOnly) {
                predicates.add(cb.equal(root.get("isInstantBooking"), true));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
