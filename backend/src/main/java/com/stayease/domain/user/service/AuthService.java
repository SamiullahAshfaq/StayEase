package com.stayease.domain.user.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stayease.domain.user.dto.AuthResponseDTO;
import com.stayease.domain.user.dto.CreateUserDTO;
import com.stayease.domain.user.dto.UserDTO;
import com.stayease.domain.user.entity.Authority;
import com.stayease.domain.user.entity.User;
import com.stayease.domain.user.repository.AuthorityRepository;
import com.stayease.domain.user.repository.UserRepository;
import com.stayease.exception.ConflictException;
import com.stayease.exception.NotFoundException;
import com.stayease.exception.UnauthorizedException;
import com.stayease.security.JwtTokenProvider;
import com.stayease.shared.constant.AuthorityConstant;
import com.stayease.shared.mapper.UserMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;
    private final UserService userService;

    public AuthResponseDTO register(CreateUserDTO createUserDTO) {
        log.info("Registering new user with email: {}", createUserDTO.getEmail());

        if (userRepository.existsByEmail(createUserDTO.getEmail())) {
            throw new ConflictException("Email already exists: " + createUserDTO.getEmail());
        }

        User user = User.builder()
                .email(createUserDTO.getEmail())
                .password(passwordEncoder.encode(createUserDTO.getPassword()))
                .firstName(createUserDTO.getFirstName())
                .lastName(createUserDTO.getLastName())
                .publicId(UUID.randomUUID())
                .phoneNumber(createUserDTO.getPhoneNumber())
                .profileImageUrl(createUserDTO.getProfileImageUrl())
                .bio(createUserDTO.getBio())
                .isEmailVerified(false)
                .isPhoneVerified(false)
                .isActive(true)
                .lastLoginAt(LocalDateTime.now())
                .build();

        // Assign authority based on user type (default to ROLE_TENANT if not specified)
        String requestedRole = (createUserDTO.getUserType() != null && !createUserDTO.getUserType().isEmpty())
                ? createUserDTO.getUserType()
                : AuthorityConstant.ROLE_TENANT;

        // Validate role name (must be final for lambda)
        final String roleName;
        if (!requestedRole.equals(AuthorityConstant.ROLE_TENANT)
                && !requestedRole.equals(AuthorityConstant.ROLE_LANDLORD)
                && !requestedRole.equals(AuthorityConstant.ROLE_SERVICE_PROVIDER)) {
            log.warn("Invalid role requested: {}. Defaulting to ROLE_TENANT", requestedRole);
            roleName = AuthorityConstant.ROLE_TENANT;
        } else {
            roleName = requestedRole;
        }

        Authority userAuthority = authorityRepository.findByName(roleName)
                .orElseThrow(() -> new NotFoundException("Authority not found: " + roleName));
        user.addAuthority(userAuthority);

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());

        String token = jwtTokenProvider.generateToken(savedUser);
        UserDTO userDTO = userMapper.toDTO(savedUser);

        return AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationTime())
                .user(userDTO)
                .build();
    }

    public AuthResponseDTO login(String email, String password) {
        log.info("User login attempt for email: {}", email);

        User user = userRepository.findByEmailWithAuthorities(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!user.getIsActive()) {
            throw new UnauthorizedException("User account is deactivated");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user);
        UserDTO userDTO = userMapper.toDTO(user);

        log.info("User logged in successfully with ID: {}", user.getId());

        return AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationTime())
                .user(userDTO)
                .build();
    }

    public AuthResponseDTO loginWithOAuth(String provider, String providerId, String email,
            String firstName, String lastName, String profileImageUrl) {
        log.info("OAuth login attempt for provider: {}, providerId: {}", provider, providerId);

        User user = userRepository.findByOauthProviderAndOauthProviderId(provider, providerId)
                .orElseGet(() -> {
                    log.info("Creating new OAuth user for email: {}", email);

                    User newUser = User.builder()
                            .email(email)
                            .firstName(firstName)
                            .lastName(lastName)
                            .profileImageUrl(profileImageUrl)
                            .oauthProvider(provider)
                            .oauthProviderId(providerId)
                            .isEmailVerified(true) // OAuth providers verify email
                            .isPhoneVerified(false)
                            .isActive(true)
                            .lastLoginAt(LocalDateTime.now())
                            .build();

                    Authority userAuthority = authorityRepository.findByName(AuthorityConstant.ROLE_TENANT)
                            .orElseThrow(() -> new NotFoundException(
                                    "Authority not found: " + AuthorityConstant.ROLE_TENANT));
                    newUser.addAuthority(userAuthority);

                    return userRepository.save(newUser);
                });

        if (!user.getIsActive()) {
            throw new UnauthorizedException("User account is deactivated");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user);
        UserDTO userDTO = userMapper.toDTO(user);

        log.info("OAuth user logged in successfully with ID: {}", user.getId());

        return AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationTime())
                .user(userDTO)
                .build();
    }

    public void changePassword(UUID publicId, String oldPassword, String newPassword) {
        log.info("Password change request for user publicId: {}", publicId);

        User user = userRepository.findByIdWithAuthorities(publicId)
                .orElseThrow(() -> new NotFoundException("User not found with publicId: " + publicId));

        if (user.getPassword() == null) {
            throw new UnauthorizedException("Cannot change password for OAuth users");
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password changed successfully for user publicId: {}", publicId);
    }

    public void resetPassword(String email, String newPassword) {
        log.info("Password reset request for email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password reset successfully for user ID: {}", user.getId());
    }

    @Transactional(readOnly = true)
    public UserDTO getCurrentUser(UUID userId) {
        return userService.getUserById(userId);
    }

    /**
     * Sync Auth0 user with local database
     * Creates new user or updates existing user based on Auth0 sub
     * Returns AuthResponseDTO with local JWT token
     */
    public AuthResponseDTO syncAuth0User(String sub, String email, Boolean emailVerified,
            String name, String nickname, String picture,
            String givenName, String familyName) {
        log.info("Syncing Auth0 user with sub: {}", sub);

        User user = userRepository.findByOauthProviderAndOauthProviderId("auth0", sub)
                .orElseGet(() -> {
                    log.info("Creating new Auth0 user for email: {}", email);

                    // Split name if givenName/familyName not provided
                    String firstName = givenName;
                    String lastName = familyName;
                    if (firstName == null && name != null) {
                        String[] nameParts = name.split(" ", 2);
                        firstName = nameParts[0];
                        lastName = nameParts.length > 1 ? nameParts[1] : "";
                    }

                    User newUser = User.builder()
                            .email(email)
                            .firstName(firstName)
                            .lastName(lastName)
                            .profileImageUrl(picture)
                            .oauthProvider("auth0")
                            .oauthProviderId(sub)
                            .isEmailVerified(emailVerified != null ? emailVerified : false)
                            .isPhoneVerified(false)
                            .isActive(true)
                            .lastLoginAt(LocalDateTime.now())
                            .publicId(UUID.randomUUID())
                            .build();

                    // Assign default TENANT authority
                    Authority userAuthority = authorityRepository.findByName(AuthorityConstant.ROLE_TENANT)
                            .orElseThrow(() -> new NotFoundException(
                                    "Authority not found: " + AuthorityConstant.ROLE_TENANT));
                    newUser.addAuthority(userAuthority);

                    return userRepository.save(newUser);
                });

        if (!user.getIsActive()) {
            throw new UnauthorizedException("User account is deactivated");
        }

        // Update user information from Auth0
        boolean updated = false;
        if (picture != null && !picture.equals(user.getProfileImageUrl())) {
            user.setProfileImageUrl(picture);
            updated = true;
        }
        if (emailVerified != null && !emailVerified.equals(user.getIsEmailVerified())) {
            user.setIsEmailVerified(emailVerified);
            updated = true;
        }

        user.setLastLoginAt(LocalDateTime.now());
        if (updated) {
            userRepository.save(user);
        }

        // Generate local JWT token for the user
        String token = jwtTokenProvider.generateToken(user);
        UserDTO userDTO = userMapper.toDTO(user);
        log.info("Auth0 user synced successfully with ID: {}", user.getId());

        return AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationTime())
                .user(userDTO)
                .build();
    }
}
