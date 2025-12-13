package com.stayease.domain.admin.dto;

import java.math.BigDecimal;
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
public class RevenueChartDTO {
    private List<DataPoint> dailyRevenue;
    private List<DataPoint> monthlyRevenue;
    private List<PaymentMethodBreakdown> paymentMethods;
    private List<RevenueByCategory> revenueByCategory;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataPoint {
        private LocalDate date;
        private String label;
        private BigDecimal value;
        private Long count;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentMethodBreakdown {
        private String method;
        private BigDecimal amount;
        private Long count;
        private Double percentage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueByCategory {
        private String category;
        private BigDecimal amount;
        private Long bookings;
        private Double percentage;
    }
}
