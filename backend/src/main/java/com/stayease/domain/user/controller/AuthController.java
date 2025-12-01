package com.stayease.domain.user.controller;

import com.stayease.domain.user.dto.AuthResponseDTO;
import com.stayease.domain.user.dto.CreateUserDTO;
import com.stayease.domain.user.dto.UserDTO;
import com.stayease.domain.user.service.AuthService;
import com.stayease.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDTO>> register(@Valid @RequestBody CreateUserDTO createUserDTO) {
        UserDTO user = authService.register(createUserDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(user, "User registered successfully"));
    }

    @PostMapping("/callback")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> handleOAuthCallback(@AuthenticationPrincipal Jwt jwt) {
        AuthResponseDTO response = authService.handleOAuthCallback(jwt);
        return ResponseEntity.ok(ApiResponse.success(response, "Authentication successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        UserDTO user = authService.getCurrentUserFromJwt(jwt);
        return ResponseEntity.ok(ApiResponse.success(user, "User retrieved successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // Logout is handled on the client side for JWT-based auth
        // This endpoint is primarily for logging purposes
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }
}