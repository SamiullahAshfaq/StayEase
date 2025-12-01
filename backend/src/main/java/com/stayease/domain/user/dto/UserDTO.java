package com.stayease.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private UUID publicId;
    private String email;
    private String firstName;
    private String lastName;
    private String imageUrl;
    private Boolean verified;
    private Set<String> authorities;
    private Instant createdAt;
}