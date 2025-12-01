// SearchListingDTO.java
package com.stayease.domain.listing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchListingDTO {
    private String location;
    private String category;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer guests;
    private Integer page = 0;
    private Integer size = 20;
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";
}