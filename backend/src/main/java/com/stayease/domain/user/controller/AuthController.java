package com.stayease.domain.user.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stayease.domain.user.dto.AuthResponseDTO;
import com.stayease.domain.user.dto.CreateUserDTO;
import com.stayease.domain.user.dto.UserDTO;
import com.stayease.domain.user.service.AuthService;
import com.stayease.security.SecurityUtils;
import com.stayease.shared.dto.ApiResponse;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(
            @Valid @RequestBody CreateUserDTO createUserDTO) {
        log.info("POST request to register new user with email: {}", createUserDTO.getEmail());
        AuthResponseDTO response = authService.register(createUserDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(
            @Valid @RequestBody LoginRequest loginRequest) {
        log.info("POST request to login user with email: {}", loginRequest.getEmail());
        AuthResponseDTO response = authService.login(loginRequest.getEmail(), loginRequest.getPassword());
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/oauth")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> oauthLogin(
            @Valid @RequestBody OAuthLoginRequest request) {
        log.info("POST request for OAuth login with provider: {}", request.getProvider());
        AuthResponseDTO response = authService.loginWithOAuth(
                request.getProvider(),
                request.getProviderId(),
                request.getEmail(),
                request.getFirstName(),
                request.getLastName(),
                request.getProfileImageUrl()
        );
        return ResponseEntity.ok(ApiResponse.success(response, "OAuth login successful"));
    }

    @PostMapping("/change-password")
    @PreAuthorize("hasAnyRole('USER', 'LANDLORD', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        log.info("POST request to change password for current user");
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        authService.changePassword(currentUserId, request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        log.info("POST request to reset password for email: {}", request.getEmail());
        authService.resetPassword(request.getEmail(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully"));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER', 'LANDLORD', 'ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser() {
        log.info("GET request to fetch current authenticated user");
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        UserDTO user = authService.getCurrentUser(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(user, "Current user retrieved successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        log.info("POST request to logout user");
        // JWT is stateless, so logout is handled on the client side by removing the token
        // This endpoint exists for consistency and can be extended with token blacklisting if needed
        return ResponseEntity.ok(ApiResponse.success(null, "Logout successful"));
    }

    @PostMapping("/auth0/sync")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> syncAuth0User(
            @Valid @RequestBody Auth0SyncRequest request) {
        log.info("POST request to sync Auth0 user with sub: {}", request.getSub());
        AuthResponseDTO response = authService.syncAuth0User(
                request.getSub(),
                request.getEmail(),
                request.getEmailVerified(),
                request.getName(),
                request.getNickname(),
                request.getPicture(),
                request.getGivenName(),
                request.getFamilyName()
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Auth0 user synced successfully"));
    }

    // Request DTOs
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OAuthLoginRequest {
        @NotBlank(message = "Provider is required")
        private String provider;

        @NotBlank(message = "Provider ID is required")
        private String providerId;

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        private String email;

        private String firstName;
        private String lastName;
        private String profileImageUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChangePasswordRequest {
        @NotBlank(message = "Old password is required")
        private String oldPassword;

        @NotBlank(message = "New password is required")
        private String newPassword;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResetPasswordRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        private String email;

        @NotBlank(message = "New password is required")
        private String newPassword;

        // In production, you'd also require a reset token here
        private String resetToken;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Auth0SyncRequest {
        @NotBlank(message = "Auth0 sub is required")
        private String sub;

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        private String email;

        private Boolean emailVerified;
        private String name;
        private String nickname;
        private String picture;
        private String givenName;
        private String familyName;
    }
}
