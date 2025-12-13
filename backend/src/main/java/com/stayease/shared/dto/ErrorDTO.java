// ErrorDTO.java
package com.stayease.shared.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorDTO {
    private String message;
    private int status;
    private String error;
    private String path;
    private LocalDateTime timestamp;
    private List<String> details;
}
