package com.stayease.domain.admin.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListingManagementDTO {

    private UUID publicId;
    private String title;
    private String location;
    private String city;
    private String country;
    private String landlordName;
    private String landlordEmail;
    private BigDecimal pricePerNight;
    private String currency;
    private Integer maxGuests;
    private String propertyType;
    private String category;
    private String status;
    private Boolean instantBook;
    private Instant createdAt;
    private Instant updatedAt;
}
