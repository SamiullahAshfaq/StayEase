package com.stayease.domain.user.service;

import com.stayease.domain.user.dto.*;
import com.stayease.domain.user.entity.Authority;
import com.stayease.domain.user.entity.User;
import com.stayease.domain.user.entity.UserAuthority;
import com.stayease.domain.user.repository.AuthorityRepository;
import com.stayease.domain.user.repository.LegacyUserRepository;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.UnauthorizedException;
import com.stayease.security.JwtTokenProvider;
import com.stayease.security.UserPrincipal;
import com.stayease.shared.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service("legacyAuthService")
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LegacyAuthService {

    private final LegacyUserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    public AuthResponseDTO register(RegisterDTO registerDTO) {
        log.info("Registering new user: {}", registerDTO.getEmail());

        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = User.builder()
                .email(registerDTO.getEmail())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .firstName(registerDTO.getFirstName())
                .lastName(registerDTO.getLastName())
                .phoneNumber(registerDTO.getPhoneNumber())
                .accountStatus(User.AccountStatus.ACTIVE)
                .build();

        // Assign default ROLE_USER
        Authority userAuthority = authorityRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Default authority not found"));
        
        UserAuthority userAuthorityMapping = UserAuthority.builder()
                .authority(userAuthority)
                .build();
        
        user.addAuthority(userAuthorityMapping);

        // If user wants to be a landlord, add ROLE_LANDLORD
        if (Boolean.TRUE.equals(registerDTO.getIsLandlord())) {
            Authority landlordAuthority = authorityRepository.findByName("ROLE_LANDLORD")
                    .orElseThrow(() -> new RuntimeException("Landlord authority not found"));
            
            UserAuthority landlordMapping = UserAuthority.builder()
                    .authority(landlordAuthority)
                    .build();
            
            user.addAuthority(landlordMapping);
        }

        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getPublicId());

        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        String token = tokenProvider.generateTokenFromPrincipal(userPrincipal);

        return AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(86400000L) // 24 hours
                .user(userMapper.toDTO(savedUser))
                .build();
    }

    public AuthResponseDTO login(LoginDTO loginDTO) {
        log.info("User login attempt: {}", loginDTO.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDTO.getEmail(),
                        loginDTO.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        // Update last login
        User user = userRepository.findByPublicId(userPrincipal.getPublicId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        User fullUser = userRepository.findByPublicIdWithAuthorities(userPrincipal.getPublicId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        log.info("User logged in successfully: {}", user.getPublicId());

        return AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(86400000L) // 24 hours
                .user(userMapper.toDTO(fullUser))
                .build();
    }

    @Transactional(readOnly = true)
    public UserDTO getCurrentUser(UserPrincipal currentUser) {
        User user = userRepository.findByPublicIdWithAuthorities(currentUser.getPublicId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        
        return userMapper.toDTO(user);
    }
}