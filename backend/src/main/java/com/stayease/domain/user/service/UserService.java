package com.stayease.domain.user.service;

import com.stayease.domain.user.dto.CreateUserDTO;
import com.stayease.domain.user.dto.UpdateUserDTO;
import com.stayease.domain.user.dto.UserDTO;
import com.stayease.domain.user.entity.Authority;
import com.stayease.domain.user.entity.User;
import com.stayease.domain.user.repository.AuthorityRepository;
import com.stayease.domain.user.repository.UserRepository;
import com.stayease.exception.ConflictException;
import com.stayease.exception.NotFoundException;
import com.stayease.shared.constant.AuthorityConstant;
import com.stayease.shared.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserDTO createUser(CreateUserDTO createUserDTO) {
        log.info("Creating new user with email: {}", createUserDTO.getEmail());

        if (userRepository.existsByEmail(createUserDTO.getEmail())) {
            throw new ConflictException("User with email " + createUserDTO.getEmail() + " already exists");
        }

        User user = userMapper.toEntity(createUserDTO);

        // Hash password if provided
        if (createUserDTO.getPassword() != null && !createUserDTO.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(createUserDTO.getPassword()));
        }

        // Assign default TENANT role if no authorities specified
        if (createUserDTO.getAuthorities() == null || createUserDTO.getAuthorities().isEmpty()) {
            Authority tenantAuthority = authorityRepository.findByName(AuthorityConstant.ROLE_TENANT)
                    .orElseThrow(() -> new NotFoundException("Default authority not found"));
            user.addAuthority(tenantAuthority);
        } else {
            // Assign specified authorities
            for (String authorityName : createUserDTO.getAuthorities()) {
                Authority authority = authorityRepository.findByName(authorityName)
                        .orElseThrow(() -> new NotFoundException("Authority not found: " + authorityName));
                user.addAuthority(authority);
            }
        }

        User savedUser = userRepository.save(user);
        log.info("User created successfully with publicId: {}", savedUser.getPublicId());

        return userMapper.toDTO(savedUser);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByPublicId(UUID publicId) {
        log.info("Fetching user with publicId: {}", publicId);
        User user = userRepository.findByPublicIdWithAuthorities(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with publicId: " + publicId));
        return userMapper.toDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(String email) {
        log.info("Fetching user with email: {}", email);
        User user = userRepository.findByEmailWithAuthorities(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));
        return userMapper.toDTO(user);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        log.info("Fetching all users");
        return userRepository.findAll().stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    public UserDTO updateUser(UUID publicId, UpdateUserDTO updateUserDTO) {
        log.info("Updating user with publicId: {}", publicId);

        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with publicId: " + publicId));

        if (updateUserDTO.getFirstName() != null) {
            user.setFirstName(updateUserDTO.getFirstName());
        }
        if (updateUserDTO.getLastName() != null) {
            user.setLastName(updateUserDTO.getLastName());
        }
        if (updateUserDTO.getImageUrl() != null) {
            user.setImageUrl(updateUserDTO.getImageUrl());
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated successfully with publicId: {}", publicId);

        return userMapper.toDTO(updatedUser);
    }

    public void deleteUser(UUID publicId) {
        log.info("Deleting user with publicId: {}", publicId);

        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with publicId: " + publicId));

        userRepository.delete(user);
        log.info("User deleted successfully with publicId: {}", publicId);
    }

    public UserDTO addAuthorityToUser(UUID publicId, String authorityName) {
        log.info("Adding authority {} to user with publicId: {}", authorityName, publicId);

        User user = userRepository.findByPublicIdWithAuthorities(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with publicId: " + publicId));

        Authority authority = authorityRepository.findByName(authorityName)
                .orElseThrow(() -> new NotFoundException("Authority not found: " + authorityName));

        user.addAuthority(authority);
        User updatedUser = userRepository.save(user);

        log.info("Authority added successfully to user with publicId: {}", publicId);
        return userMapper.toDTO(updatedUser);
    }

    public UserDTO removeAuthorityFromUser(UUID publicId, String authorityName) {
        log.info("Removing authority {} from user with publicId: {}", authorityName, publicId);

        User user = userRepository.findByPublicIdWithAuthorities(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with publicId: " + publicId));

        Authority authority = authorityRepository.findByName(authorityName)
                .orElseThrow(() -> new NotFoundException("Authority not found: " + authorityName));

        user.removeAuthority(authority);
        User updatedUser = userRepository.save(user);

        log.info("Authority removed successfully from user with publicId: {}", publicId);
        return userMapper.toDTO(updatedUser);
    }

    public User getOrCreateUserFromOAuth(String email, String firstName, String lastName, String imageUrl) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    log.info("Creating new user from OAuth with email: {}", email);
                    CreateUserDTO createUserDTO = CreateUserDTO.builder()
                            .email(email)
                            .firstName(firstName)
                            .lastName(lastName)
                            .imageUrl(imageUrl)
                            .build();
                    
                    User user = userMapper.toEntity(createUserDTO);
                    user.setVerified(true); // OAuth users are pre-verified
                    
                    Authority tenantAuthority = authorityRepository.findByName(AuthorityConstant.ROLE_TENANT)
                            .orElseThrow(() -> new NotFoundException("Default authority not found"));
                    user.addAuthority(tenantAuthority);
                    
                    return userRepository.save(user);
                });
    }
}