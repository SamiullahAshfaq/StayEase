// CreateListingDTO.java
package com.stayease.domain.listing.dto;

import jakarta.validation.constraints.*;
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
public class CreateListingDTO {
    
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Location is required")
    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @Size(max = 10)
    @Builder.Default
    private String currency = "USD";

    @NotNull(message = "Number of guests is required")
    @Min(value = 1, message = "Must accommodate at least 1 guest")
    private Integer guests;

    @NotNull(message = "Number of bedrooms is required")
    @Min(value = 0, message = "Bedrooms cannot be negative")
    private Integer bedrooms;

    @NotNull(message = "Number of beds is required")
    @Min(value = 1, message = "Must have at least 1 bed")
    private Integer beds;

    @NotNull(message = "Number of bathrooms is required")
    @Min(value = 1, message = "Must have at least 1 bathroom")
    private Integer bathrooms;

    @NotBlank(message = "Category is required")
    private String category;

    private String rules;

    private List<String> imageUrls;
}
