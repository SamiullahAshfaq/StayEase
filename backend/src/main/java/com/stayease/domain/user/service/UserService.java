package com.stayease.domain.user.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stayease.domain.user.dto.CreateUserDTO;
import com.stayease.domain.user.dto.UpdateUserDTO;
import com.stayease.domain.user.dto.UserDTO;
import com.stayease.domain.user.entity.Authority;
import com.stayease.domain.user.entity.User;
import com.stayease.domain.user.repository.AuthorityRepository;
import com.stayease.domain.user.repository.UserRepository;
import com.stayease.exception.ConflictException;
import com.stayease.exception.NotFoundException;
import com.stayease.security.UserPrincipal;
import com.stayease.shared.constant.AuthorityConstant;
import com.stayease.shared.mapper.UserMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Primary
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Authenticating user with email: {}", email);
        User user = userRepository.findByEmailWithAuthorities(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return UserPrincipal.create(user);
    }

    /**
     * Load user by publicId (UUID) - used for JWT authentication
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserByPublicId(UUID publicId) throws UsernameNotFoundException {
        log.debug("Authenticating user with publicId: {}", publicId);
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with publicId: " + publicId));
        return UserPrincipal.create(user);
    }

    public UserDTO createUser(CreateUserDTO createUserDTO) {
        log.info("Creating new user with email: {}", createUserDTO.getEmail());

        if (userRepository.existsByEmail(createUserDTO.getEmail())) {
            throw new ConflictException("Email already exists: " + createUserDTO.getEmail());
        }

        User user = User.builder()
                .email(createUserDTO.getEmail())
                .password(passwordEncoder.encode(createUserDTO.getPassword()))
                .firstName(createUserDTO.getFirstName())
                .lastName(createUserDTO.getLastName())
                .phoneNumber(createUserDTO.getPhoneNumber())
                .profileImageUrl(createUserDTO.getProfileImageUrl())
                .bio(createUserDTO.getBio())
                .isEmailVerified(false)
                .isPhoneVerified(false)
                .isActive(true)
                .build();

        // Assign default USER authority
        Authority userAuthority = authorityRepository.findByName(AuthorityConstant.ROLE_TENANT)
                .orElseThrow(() -> new NotFoundException("Authority not found: " + AuthorityConstant.ROLE_TENANT));
        user.addAuthority(userAuthority);

        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());

        return userMapper.toDTO(savedUser);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(UUID id) {
        log.debug("Fetching user by ID: {}", id);
        User user = userRepository.findByIdWithAuthorities(id)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + id));
        return userMapper.toDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByPublicId(UUID publicId) {
        log.debug("Fetching user by public ID: {}", publicId);
        User user = userRepository.findByPublicIdWithAuthorities(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with public ID: " + publicId));
        return userMapper.toDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(String email) {
        log.debug("Fetching user by email: {}", email);
        User user = userRepository.findByEmailWithAuthorities(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));
        return userMapper.toDTO(user);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        log.debug("Fetching all users");
        return userRepository.findAll().stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getActiveUsers() {
        log.debug("Fetching active users");
        return userRepository.findByIsActiveTrue().stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    public UserDTO updateUser(UUID publicId, UpdateUserDTO updateUserDTO) {
        log.info("Updating user with publicId: {}", publicId);

        User user = userRepository.findByIdWithAuthorities(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with publicId: " + publicId));

        if (updateUserDTO.getFirstName() != null) {
            user.setFirstName(updateUserDTO.getFirstName());
        }
        if (updateUserDTO.getLastName() != null) {
            user.setLastName(updateUserDTO.getLastName());
        }
        if (updateUserDTO.getPhoneNumber() != null) {
            user.setPhoneNumber(updateUserDTO.getPhoneNumber());
        }
        if (updateUserDTO.getProfileImageUrl() != null) {
            user.setProfileImageUrl(updateUserDTO.getProfileImageUrl());
        }
        if (updateUserDTO.getBio() != null) {
            user.setBio(updateUserDTO.getBio());
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated successfully with publicId: {}", updatedUser.getPublicId());

        return userMapper.toDTO(updatedUser);
    }

    public void deleteUser(UUID publicId) {
        log.info("Deleting user with publicId: {}", publicId);

        User user = userRepository.findByIdWithAuthorities(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with publicId: " + publicId));

        userRepository.delete(user);
        log.info("User deleted successfully with publicId: {}", publicId);
    }

    public void deactivateUser(UUID publicId) {
        log.info("Deactivating user with publicId: {}", publicId);

        User user = userRepository.findByIdWithAuthorities(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with publicId: " + publicId));

        user.setIsActive(false);
        userRepository.save(user);
        log.info("User deactivated successfully with publicId: {}", publicId);
    }

    public void activateUser(UUID publicId) {
        log.info("Activating user with publicId: {}", publicId);

        User user = userRepository.findByIdWithAuthorities(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with publicId: " + publicId));

        user.setIsActive(true);
        userRepository.save(user);
        log.info("User activated successfully with publicId: {}", publicId);
    }

    public void verifyEmail(UUID publicId) {
        log.info("Verifying email for user with publicId: {}", publicId);

        User user = userRepository.findByIdWithAuthorities(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with publicId: " + publicId));

        user.setIsEmailVerified(true);
        userRepository.save(user);
        log.info("Email verified successfully for user with publicId: {}", publicId);
    }

    public void verifyPhone(UUID publicId) {
        log.info("Verifying phone for user with publicId: {}", publicId);

        User user = userRepository.findByIdWithAuthorities(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with publicId: " + publicId));

        user.setIsPhoneVerified(true);
        userRepository.save(user);
        log.info("Phone verified successfully for user with publicId: {}", publicId);
    }

    public void updateLastLogin(UUID publicId) {
        log.debug("Updating last login for user with publicId: {}", publicId);

        User user = userRepository.findByIdWithAuthorities(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with publicId: " + publicId));

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public void addAuthorityToUser(UUID userId, String authorityName) {
        log.info("Adding authority {} to user with ID: {}", authorityName, userId);

        User user = userRepository.findByIdWithAuthorities(userId)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + userId));

        Authority authority = authorityRepository.findByName(authorityName)
                .orElseThrow(() -> new NotFoundException("Authority not found: " + authorityName));

        user.addAuthority(authority);
        userRepository.save(user);
        log.info("Authority {} added successfully to user with ID: {}", authorityName, userId);
    }

    public void removeAuthorityFromUser(UUID userId, String authorityName) {
        log.info("Removing authority {} from user with ID: {}", authorityName, userId);

        User user = userRepository.findByIdWithAuthorities(userId)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + userId));

        Authority authority = authorityRepository.findByName(authorityName)
                .orElseThrow(() -> new NotFoundException("Authority not found: " + authorityName));

        user.removeAuthority(authority);
        userRepository.save(user);
        log.info("Authority {} removed successfully from user with ID: {}", authorityName, userId);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByAuthority(String authorityName) {
        log.debug("Fetching users with authority: {}", authorityName);
        return userRepository.findByAuthorityName(authorityName).stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }
}