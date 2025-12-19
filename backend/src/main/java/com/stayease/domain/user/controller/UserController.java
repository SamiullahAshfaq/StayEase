package com.stayease.domain.user.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('USER', 'LANDLORD', 'ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable UUID id) {
        log.info("GET request to fetch user by ID: {}", id);
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user, "User retrieved successfully"));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByEmail(@PathVariable String email) {
        log.info("GET request to fetch user by email: {}", email);
        UserDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(user, "User retrieved successfully"));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        log.info("GET request to fetch all users");
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users, "Users retrieved successfully"));
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getActiveUsers() {
        log.info("GET request to fetch active users");
        List<UserDTO> users = userService.getActiveUsers();
        return ResponseEntity.ok(ApiResponse.success(users, "Active users retrieved successfully"));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('USER', 'LANDLORD', 'ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser() {
        log.info("GET request to fetch current user");
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        UserDTO user = userService.getUserById(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(user, "Current user retrieved successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('USER', 'LANDLORD', 'ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserDTO updateUserDTO) {
        log.info("PUT request to update user with ID: {}", id);

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.hasAuthority("ADMIN");

        // Users can only update their own profile unless they're admin
        if (!isAdmin && !currentUserId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You can only update your own profile"));
        }

        UserDTO updatedUser = userService.updateUser(id, updateUserDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "User updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        log.info("DELETE request to delete user with ID: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable UUID id) {
        log.info("PATCH request to deactivate user with ID: {}", id);
        userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deactivated successfully"));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable UUID id) {
        log.info("PATCH request to activate user with ID: {}", id);
        userService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User activated successfully"));
    }

    @PatchMapping("/{id}/verify-email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@PathVariable UUID id) {
        log.info("PATCH request to verify email for user with ID: {}", id);
        userService.verifyEmail(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Email verified successfully"));
    }

    @PatchMapping("/{id}/verify-phone")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> verifyPhone(@PathVariable UUID id) {
        log.info("PATCH request to verify phone for user with ID: {}", id);
        userService.verifyPhone(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Phone verified successfully"));
    }

    @PostMapping("/{id}/authorities/{authorityName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> addAuthority(
            @PathVariable UUID id,
            @PathVariable String authorityName) {
        log.info("POST request to add authority {} to user with ID: {}", authorityName, id);
        userService.addAuthorityToUser(id, authorityName);
        return ResponseEntity.ok(ApiResponse.success(null, "Authority added successfully"));
    }

    @DeleteMapping("/{id}/authorities/{authorityName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeAuthority(
            @PathVariable UUID id,
            @PathVariable String authorityName) {
        log.info("DELETE request to remove authority {} from user with ID: {}", authorityName, id);
        userService.removeAuthorityFromUser(id, authorityName);
        return ResponseEntity.ok(ApiResponse.success(null, "Authority removed successfully"));
    }

    @GetMapping("/by-authority/{authorityName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getUsersByAuthority(
            @PathVariable String authorityName) {
        log.info("GET request to fetch users with authority: {}", authorityName);
        List<UserDTO> users = userService.getUsersByAuthority(authorityName);
        return ResponseEntity.ok(ApiResponse.success(users, "Users retrieved successfully"));
    }
}