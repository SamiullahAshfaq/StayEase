package com.stayease.domain.user.service;

import com.stayease.domain.user.dto.AuthResponseDTO;
import com.stayease.domain.user.dto.CreateUserDTO;
import com.stayease.domain.user.dto.UserDTO;
import com.stayease.domain.user.entity.User;
import com.stayease.exception.UnauthorizedException;
import com.stayease.shared.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserService userService;
    private final UserMapper userMapper;

    public UserDTO register(CreateUserDTO createUserDTO) {
        log.info("Registering new user with email: {}", createUserDTO.getEmail());
        return userService.createUser(createUserDTO);
    }

    public AuthResponseDTO handleOAuthCallback(Jwt jwt) {
        if (jwt == null) {
            throw new UnauthorizedException("Invalid token");
        }

        String email = jwt.getClaimAsString("email");
        String firstName = jwt.getClaimAsString("given_name");
        String lastName = jwt.getClaimAsString("family_name");
        String picture = jwt.getClaimAsString("picture");

        log.info("Processing OAuth callback for user: {}", email);

        // Get or create user from OAuth data
        User user = userService.getOrCreateUserFromOAuth(email, firstName, lastName, picture);
        UserDTO userDTO = userMapper.toDTO(user);

        // Build response
        return AuthResponseDTO.builder()
                .token(jwt.getTokenValue())
                .tokenType("Bearer")
                .expiresIn(jwt.getExpiresAt() != null ? 
                        jwt.getExpiresAt().getEpochSecond() - jwt.getIssuedAt().getEpochSecond() : 
                        3600L)
                .user(userDTO)
                .build();
    }

    @Transactional(readOnly = true)
    public UserDTO getCurrentUserFromJwt(Jwt jwt) {
        if (jwt == null) {
            throw new UnauthorizedException("Invalid token");
        }

        String email = jwt.getClaimAsString("email");
        log.info("Fetching current user from JWT: {}", email);
        
        return userService.getUserByEmail(email);
    }
}