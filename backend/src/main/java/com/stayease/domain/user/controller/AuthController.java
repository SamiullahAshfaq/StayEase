package com.stayease.domain.user.controller;

import com.stayease.domain.user.dto.*;
import com.stayease.domain.user.service.AuthService;
import com.stayease.security.UserPrincipal;
import com.stayease.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(@Valid @RequestBody RegisterDTO registerDTO) {
        log.info("Registration request for email: {}", registerDTO.getEmail());
        
        AuthResponseDTO response = authService.register(registerDTO);
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.<AuthResponseDTO>builder()
                        .success(true)
                        .message("User registered successfully")
                        .data(response)
                        .build());
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@Valid @RequestBody LoginDTO loginDTO) {
        log.info("Login request for email: {}", loginDTO.getEmail());
        
        AuthResponseDTO response = authService.login(loginDTO);
        
        return ResponseEntity.ok(ApiResponse.<AuthResponseDTO>builder()
                .success(true)
                .message("Login successful")
                .data(response)
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        UserDTO user = authService.getCurrentUser(currentUser);
        
        return ResponseEntity.ok(ApiResponse.<UserDTO>builder()
                .success(true)
                .data(user)
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Logout successful")
                .build());
    }
}