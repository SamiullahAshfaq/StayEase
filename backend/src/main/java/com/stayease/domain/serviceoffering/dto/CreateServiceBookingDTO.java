package com.stayease.domain.serviceoffering.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO for creating new service bookings
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateServiceBookingDTO {

    @NotBlank(message = "Service ID is required")
    private String servicePublicId;

    @NotBlank(message = "Customer ID is required")
    private String customerPublicId;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date must be today or in the future")
    private LocalDate bookingDate;

    private LocalTime startTime;
    private LocalTime endTime;

    @Min(value = 1, message = "Number of people must be at least 1")
    private Integer numberOfPeople;

    private Integer numberOfItems;

    // Location (if mobile service)
    private String customerAddress;
    private Double latitude;
    private Double longitude;

    @Size(max = 1000, message = "Special requests must not exceed 1000 characters")
    private String specialRequests;

    @NotBlank(message = "Customer phone is required")
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number")
    private String customerPhone;

    @NotBlank(message = "Customer email is required")
    @Email(message = "Invalid email address")
    private String customerEmail;
}
