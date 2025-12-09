package com.stayease.user.controller;

import com.stayease.user.dto.*;
import com.stayease.user.entity.ActivityType;
import com.stayease.user.entity.AuthProvider;
import com.stayease.user.entity.Role;
import com.stayease.user.entity.User;
import com.stayease.user.repository.UserRepository;
import com.stayease.user.security.OAuth2JwtTokenProvider;
import com.stayease.user.security.OAuth2UserPrincipal;
import com.stayease.user.service.UserActivityService;
import com.stayease.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OAuth2JwtTokenProvider tokenProvider;
    private final UserService userService;
    private final UserActivityService userActivityService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = tokenProvider.generateToken(authentication);
            OAuth2UserPrincipal userPrincipal = (OAuth2UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Update last login
            userService.updateLastLogin(user);

            // Log login activity
            userActivityService.logActivity(user, ActivityType.LOGIN, "Local login successful", request);

            UserResponse userResponse = userService.mapToUserResponse(user);

            return ResponseEntity.ok(AuthResponse.builder()
                    .accessToken(token)
                    .tokenType("Bearer")
                    .user(userResponse)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid email or password"));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest,
            HttpServletRequest request) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email address already in use"));
        }

        // Create new user account
        User user = User.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .provider(AuthProvider.LOCAL)
                .emailVerified(false)
                .build();

        user.addRole(Role.ROLE_USER);

        User savedUser = userRepository.save(user);

        // Log signup activity
        userActivityService.logActivity(savedUser, ActivityType.REGISTER,
                "New account created", request);

        // Auto login after signup
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        signUpRequest.getEmail(),
                        signUpRequest.getPassword()));

        String token = tokenProvider.generateToken(authentication);
        UserResponse userResponse = userService.mapToUserResponse(savedUser);

        return ResponseEntity.ok(AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(userResponse)
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal OAuth2UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User not authenticated"));
        }

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserResponse userResponse = userService.mapToUserResponse(user);

        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", userResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@AuthenticationPrincipal OAuth2UserPrincipal userPrincipal,
            HttpServletRequest request) {
        if (userPrincipal != null) {
            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Log logout activity
            userActivityService.logActivity(user, ActivityType.LOGOUT, "User logged out", request);
        }

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }
}
