package com.stayease.domain.serviceoffering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for Service Image
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceImageDTO {

    private Long id;
    private String imageUrl;
    private String caption;
    private Boolean isPrimary;
    private Integer displayOrder;
    private LocalDateTime uploadedAt;
}
