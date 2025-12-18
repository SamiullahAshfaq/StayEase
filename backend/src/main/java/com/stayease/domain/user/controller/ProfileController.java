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
import com.stayease.shared.service.FileStorageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Slf4j
public class ProfileController {

    private final UserService userService;
    private final FileStorageService fileStorageService;

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
     * Accepts base64 encoded images, stores them locally, and returns the file URL
     */
    @PostMapping("/image")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_TENANT', 'ROLE_LANDLORD', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProfileImage(
            @RequestBody Map<String, String> request) {
        log.info("POST request to upload profile image");
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        String base64Image = request.get("imageUrl");
        if (base64Image == null || base64Image.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Image data is required"));
        }

        try {
            // Get current user to check if they have an existing profile image
            UserDTO currentUser = userService.getUserById(currentUserId);

            // Delete old profile image if it exists
            if (currentUser.getProfileImageUrl() != null && !currentUser.getProfileImageUrl().isEmpty()) {
                // Extract filename from URL
                String oldImageUrl = currentUser.getProfileImageUrl();
                if (oldImageUrl.contains("/profile-images/")) {
                    String[] parts = oldImageUrl.split("/profile-images/");
                    if (parts.length > 1) {
                        fileStorageService.deleteFile(parts[1]);
                    }
                }
            }

            // Store the new image file
            String filename = fileStorageService.storeBase64Image(base64Image);

            // Build the URL to access the image
            String imageUrl = "/api/files/profile-images/" + filename;

            // Update user with new profile image URL
            UpdateUserDTO updateDTO = UpdateUserDTO.builder()
                    .profileImageUrl(imageUrl)
                    .build();
            userService.updateUser(currentUserId, updateDTO);

            return ResponseEntity.ok(ApiResponse.success(
                    Map.of("imageUrl", imageUrl),
                    "Profile image uploaded successfully"));

        } catch (Exception e) {
            log.error("Failed to upload profile image", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to upload image: " + e.getMessage()));
        }
    }

    /**
     * Delete profile image
     */
    @DeleteMapping("/image")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_TENANT', 'ROLE_LANDLORD', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProfileImage() {
        log.info("DELETE request to delete profile image");
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        try {
            // Get current user to check if they have a profile image
            UserDTO currentUser = userService.getUserById(currentUserId);

            // Delete the file if it exists
            if (currentUser.getProfileImageUrl() != null && !currentUser.getProfileImageUrl().isEmpty()) {
                String imageUrl = currentUser.getProfileImageUrl();
                if (imageUrl.contains("/profile-images/")) {
                    String[] parts = imageUrl.split("/profile-images/");
                    if (parts.length > 1) {
                        fileStorageService.deleteFile(parts[1]);
                    }
                }
            }

            // Update user to remove profile image
            UpdateUserDTO updateDTO = UpdateUserDTO.builder()
                    .profileImageUrl(null)
                    .build();
            userService.updateUser(currentUserId, updateDTO);

            return ResponseEntity.ok(ApiResponse.success(null, "Profile image deleted successfully"));

        } catch (Exception e) {
            log.error("Failed to delete profile image", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to delete image: " + e.getMessage()));
        }
    }
}
