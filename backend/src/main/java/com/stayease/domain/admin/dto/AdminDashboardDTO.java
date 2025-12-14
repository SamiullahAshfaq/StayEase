package com.stayease.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDTO {

    private DashboardStatsDTO stats;
    private List<AuditLogDTO> recentLogs;
    private List<AdminActionDTO> recentActions;
    private SystemHealthDTO systemHealth;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemHealthDTO {
        private String status;
        private Long databaseConnections;
        private Long activeUsers;
        private Long pendingApprovals;
        private Long errorCount;
        private Double cpuUsage;
        private Double memoryUsage;
    }
}
