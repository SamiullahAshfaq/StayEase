package com.stayease.shared.mapper;

import com.stayease.domain.user.dto.UserDTO;
import com.stayease.domain.user.entity.User;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

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
                .dateOfBirth(user.getDateOfBirth())
                .bio(user.getBio())
                .language(user.getLanguage())
                .currency(user.getCurrency())
                .isEmailVerified(user.getIsEmailVerified())
                .isPhoneVerified(user.getIsPhoneVerified())
                .accountStatus(user.getAccountStatus())
                .authorities(user.getAuthorities() != null ? 
                        user.getAuthorities().stream()
                                .map(ua -> ua.getAuthority().getName())
                                .collect(Collectors.toList()) : null)
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}