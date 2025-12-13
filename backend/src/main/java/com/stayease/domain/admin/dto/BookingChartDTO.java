package com.stayease.domain.admin.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingChartDTO {
    private List<BookingTrend> bookingTrends;
    private List<StatusDistribution> statusDistribution;
    private List<CancellationData> cancellationReasons;
    private List<PeakTime> peakTimes;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingTrend {
        private LocalDate date;
        private String label;
        private Long bookings;
        private Long cancellations;
        private Long completions;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusDistribution {
        private String status;
        private Long count;
        private Double percentage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CancellationData {
        private String reason;
        private Long count;
        private Double percentage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeakTime {
        private String timeSlot;
        private Integer dayOfWeek;
        private Long bookingCount;
        private String label;
    }
}
