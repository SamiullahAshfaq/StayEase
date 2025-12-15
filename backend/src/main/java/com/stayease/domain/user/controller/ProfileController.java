package com.stayease.domain.user.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stayease.domain.user.dto.UpdateUserDTO;
import com.stayease.domain.user.dto.UserDTO;
import com.stayease.domain.user.service.UserService;
import com.stayease.security.SecurityUtils;
import com.stayease.shared.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Slf4j
public class ProfileController {

    private final UserService userService;

    /**
     * Get current user's profile
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_TENANT', 'ROLE_LANDLORD', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> getProfile() {
        log.info("GET request to fetch current user's profile");
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        UserDTO user = userService.getUserById(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(user, "Profile retrieved successfully"));
    }

    /**
     * Update current user's profile
     */
    @PutMapping
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_TENANT', 'ROLE_LANDLORD', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @Valid @RequestBody UpdateUserDTO updateUserDTO) {
        log.info("PUT request to update current user's profile");
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        UserDTO updatedUser = userService.updateUser(currentUserId, updateUserDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "Profile updated successfully"));
    }

    /**
     * Upload profile image
     * For now, this accepts base64 encoded images in the request body
     * TODO: Implement proper file upload to cloud storage (S3, Cloudinary, etc.)
     */
    @PostMapping("/image")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_TENANT', 'ROLE_LANDLORD', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProfileImage(
            @RequestBody Map<String, String> request) {
        log.info("POST request to upload profile image");
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        String imageUrl = request.get("imageUrl");
        if (imageUrl == null || imageUrl.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Image URL is required"));
        }

        // Update user with new profile image
        UpdateUserDTO updateDTO = UpdateUserDTO.builder()
                .profileImageUrl(imageUrl)
                .build();
        userService.updateUser(currentUserId, updateDTO);

        return ResponseEntity.ok(ApiResponse.success(
                Map.of("imageUrl", imageUrl),
                "Profile image uploaded successfully"));
    }

    /**
     * Delete profile image
     */
    @DeleteMapping("/image")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_TENANT', 'ROLE_LANDLORD', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProfileImage() {
        log.info("DELETE request to delete profile image");
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        // Update user to remove profile image
        UpdateUserDTO updateDTO = UpdateUserDTO.builder()
                .profileImageUrl(null)
                .build();
        userService.updateUser(currentUserId, updateDTO);

        return ResponseEntity.ok(ApiResponse.success(null, "Profile image deleted successfully"));
    }
}
