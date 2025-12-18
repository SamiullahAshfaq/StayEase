package com.stayease.domain.serviceoffering.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for paginated service offering responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceListResponse {

    private List<ServiceOfferingDTO> content;
    private int totalElements;
    private int totalPages;
    private int currentPage;
    private int size;
}
