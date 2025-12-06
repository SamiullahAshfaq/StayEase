package com.stayease.domain.user.controller;

import com.stayease.domain.user.dto.UpdateUserDTO;
import com.stayease.domain.user.dto.UserDTO;
import com.stayease.domain.user.service.UserService;
import com.stayease.security.UserPrincipal;
import com.stayease.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    private final UserService userService;

    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable UUID publicId) {
        log.debug("Fetching user: {}", publicId);
        
        UserDTO user = userService.getUserByPublicId(publicId);
        
        return ResponseEntity.ok(ApiResponse.<UserDTO>builder()
                .success(true)
                .data(user)
                .build());
    }

    @PutMapping("/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable UUID publicId,
            @Valid @RequestBody UpdateUserDTO updateDTO,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        log.info("Updating user: {}", publicId);
        
        UserDTO updatedUser = userService.updateUser(publicId, updateDTO, currentUser.getPublicId());
        
        return ResponseEntity.ok(ApiResponse.<UserDTO>builder()
                .success(true)
                .message("User updated successfully")
                .data(updatedUser)
                .build());
    }

    @DeleteMapping("/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable UUID publicId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        log.info("Deleting user: {}", publicId);
        
        userService.deleteUser(publicId, currentUser.getPublicId());
        
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("User deleted successfully")
                .build());
    }
}