package com.stayease.domain.user.service;

import com.stayease.domain.user.dto.UpdateUserDTO;
import com.stayease.domain.user.dto.UserDTO;
import com.stayease.domain.user.entity.User;
import com.stayease.domain.user.repository.LegacyUserRepository;
import com.stayease.exception.ForbiddenException;
import com.stayease.exception.NotFoundException;
import com.stayease.shared.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import com.stayease.security.UserPrincipal;

@Service("legacyUserService")
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LegacyUserService implements UserDetailsService {

    private final LegacyUserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailWithAuthorities(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return UserPrincipal.create(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByPublicId(UUID publicId) {
        User user = userRepository.findByPublicIdWithAuthorities(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + publicId));
        
        return userMapper.toDTO(user);
    }

    public UserDTO updateUser(UUID publicId, UpdateUserDTO updateDTO, UUID currentUserPublicId) {
        if (!publicId.equals(currentUserPublicId)) {
            throw new ForbiddenException("You can only update your own profile");
        }

        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + publicId));

        if (updateDTO.getFirstName() != null) user.setFirstName(updateDTO.getFirstName());
        if (updateDTO.getLastName() != null) user.setLastName(updateDTO.getLastName());
        if (updateDTO.getPhoneNumber() != null) user.setPhoneNumber(updateDTO.getPhoneNumber());
        if (updateDTO.getProfileImageUrl() != null) user.setProfileImageUrl(updateDTO.getProfileImageUrl());
        if (updateDTO.getDateOfBirth() != null) user.setDateOfBirth(updateDTO.getDateOfBirth());
        if (updateDTO.getBio() != null) user.setBio(updateDTO.getBio());
        if (updateDTO.getLanguage() != null) user.setLanguage(updateDTO.getLanguage());
        if (updateDTO.getCurrency() != null) user.setCurrency(updateDTO.getCurrency());

        if (updateDTO.getPassword() != null && !updateDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updateDTO.getPassword()));
        }

        User savedUser = userRepository.save(user);
        User fullUser = userRepository.findByPublicIdWithAuthorities(savedUser.getPublicId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        return userMapper.toDTO(fullUser);
    }

    public void deleteUser(UUID publicId, UUID currentUserPublicId) {
        if (!publicId.equals(currentUserPublicId)) {
            throw new ForbiddenException("You can only delete your own account");
        }

        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + publicId));

        userRepository.delete(user);
        log.info("User deleted: {}", publicId);
    }
}