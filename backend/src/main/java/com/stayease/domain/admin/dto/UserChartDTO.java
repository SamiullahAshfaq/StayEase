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
public class UserChartDTO {
    private List<UserGrowth> userGrowth;
    private List<UserTypeDistribution> userTypes;
    private List<ActivityHeatmap> activityHeatmap;
    private List<TopUser> topActiveUsers;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserGrowth {
        private LocalDate date;
        private String label;
        private Long newUsers;
        private Long totalUsers;
        private Long activeUsers;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserTypeDistribution {
        private String userType;
        private Long count;
        private Double percentage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityHeatmap {
        private Integer hour;
        private Integer dayOfWeek;
        private Long activityCount;
        private String label;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopUser {
        private String userId;
        private String userName;
        private String email;
        private Long bookingCount;
        private Long loginCount;
        private String userType;
    }
}
