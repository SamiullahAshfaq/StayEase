package com.stayease.shared.mapper;

import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.stayease.domain.user.dto.UserDTO;
import com.stayease.domain.user.entity.User;

@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }

        return UserDTO.builder()
            .publicId(user.getPublicId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .profileImageUrl(user.getProfileImageUrl())
                .bio(user.getBio())
                .isEmailVerified(user.getIsEmailVerified())
                .isPhoneVerified(user.getIsPhoneVerified())
                .isActive(user.getIsActive())
                .oauthProvider(user.getOauthProvider())
                .authorities(user.getUserAuthorities().stream()
                        .map(ua -> ua.getAuthority().getName())
                        .collect(Collectors.toSet()))
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public User toEntity(UserDTO userDTO) {
        if (userDTO == null) {
            return null;
        }

        return User.builder()
                .publicId(userDTO.getPublicId())
                .email(userDTO.getEmail())
                .firstName(userDTO.getFirstName())
                .lastName(userDTO.getLastName())
                .phoneNumber(userDTO.getPhoneNumber())
                .profileImageUrl(userDTO.getProfileImageUrl())
                .bio(userDTO.getBio())
                .isEmailVerified(userDTO.getIsEmailVerified())
                .isPhoneVerified(userDTO.getIsPhoneVerified())
                .isActive(userDTO.getIsActive())
                .oauthProvider(userDTO.getOauthProvider())
                .lastLoginAt(userDTO.getLastLoginAt())
                .createdAt(userDTO.getCreatedAt())
                .updatedAt(userDTO.getUpdatedAt())
                .build();
    }
}