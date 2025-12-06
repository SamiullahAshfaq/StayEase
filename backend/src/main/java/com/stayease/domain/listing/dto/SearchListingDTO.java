package com.stayease.domain.listing.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchListingDTO {
    
    private String location;
    private String city;
    private String country;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer guests;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private List<String> propertyTypes;
    private List<String> categories;
    private List<String> amenities;
    private Integer minBedrooms;
    private Integer minBeds;
    private BigDecimal minBathrooms;
    private Boolean instantBook;
    
    // Sorting
    @Builder.Default
    private String sortBy = "createdAt"; // createdAt, pricePerNight, averageRating
    @Builder.Default
    private String sortDirection = "DESC"; // ASC or DESC
    
    // Pagination
    @Builder.Default
    private Integer page = 0;
    @Builder.Default
    private Integer size = 20;
}