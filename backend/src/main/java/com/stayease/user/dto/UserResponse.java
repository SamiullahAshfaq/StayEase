package com.stayease.user.dto;

import com.stayease.user.entity.AuthProvider;
import com.stayease.user.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String email;
    private String name;
    private String imageUrl;
    private Boolean emailVerified;
    private AuthProvider provider;
    private Set<Role> roles;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private Boolean active;
}
