// UpdateListingDTO.java
package com.stayease.domain.listing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateListingDTO {

    @Size(max = 255)
    private String title;

    private String description;

    @Size(max = 255)
    private String location;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    @Min(value = 1)
    private Integer guests;

    @Min(value = 0)
    private Integer bedrooms;

    @Min(value = 1)
    private Integer beds;

    @Min(value = 1)
    private Integer bathrooms;

    private String category;

    private String rules;

    private List<String> imageUrls;
}