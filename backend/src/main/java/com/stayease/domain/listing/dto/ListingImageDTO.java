// ListingImageDTO.java
package com.stayease.domain.listing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingImageDTO {
    private Long id;
    private String url;
    private String caption;
    private Integer sortOrder;
}