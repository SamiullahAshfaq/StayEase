package com.stayease.shared.mapper;

import com.stayease.domain.user.dto.CreateUserDTO;
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
                .imageUrl(user.getImageUrl())
                .verified(user.getVerified())
                .authorities(user.getAuthorities().stream()
                        .map(ua -> ua.getAuthority().getName())
                        .collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .build();
    }

    public User toEntity(CreateUserDTO dto) {
        if (dto == null) {
            return null;
        }

        return User.builder()
                .email(dto.getEmail())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .imageUrl(dto.getImageUrl())
                .verified(false)
                .build();
    }
}