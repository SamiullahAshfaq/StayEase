package com.stayease.domain.user.dto;

import com.stayease.domain.user.entity.User;
import lombok.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
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
    private String phoneNumber;
    private String profileImageUrl;
    private LocalDate dateOfBirth;
    private String bio;
    private String language;
    private String currency;
    private Boolean isEmailVerified;
    private Boolean isPhoneVerified;
    private User.AccountStatus accountStatus;
    private List<String> authorities;
    private Instant createdAt;
    private Instant lastLoginAt;
}