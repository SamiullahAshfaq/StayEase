package com.stayease.domain.user.controller;

import com.stayease.domain.user.dto.UpdateUserDTO;
import com.stayease.domain.user.dto.UserDTO;
import com.stayease.domain.user.service.UserService;
import com.stayease.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByPublicId(@PathVariable UUID publicId) {
        UserDTO user = userService.getUserByPublicId(publicId);
        return ResponseEntity.ok(ApiResponse.success(user, "User retrieved successfully"));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users, "Users retrieved successfully"));
    }

    @PutMapping("/{publicId}")
    @PreAuthorize("isAuthenticated() and (#publicId.toString() == authentication.principal.publicId.toString() or hasRole('ADMIN'))")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable UUID publicId,
            @Valid @RequestBody UpdateUserDTO updateUserDTO) {
        UserDTO updatedUser = userService.updateUser(publicId, updateUserDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "User updated successfully"));
    }

    @DeleteMapping("/{publicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID publicId) {
        userService.deleteUser(publicId);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }

    @PostMapping("/{publicId}/authorities/{authorityName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> addAuthorityToUser(
            @PathVariable UUID publicId,
            @PathVariable String authorityName) {
        UserDTO user = userService.addAuthorityToUser(publicId, authorityName);
        return ResponseEntity.ok(ApiResponse.success(user, "Authority added successfully"));
    }

    @DeleteMapping("/{publicId}/authorities/{authorityName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> removeAuthorityFromUser(
            @PathVariable UUID publicId,
            @PathVariable String authorityName) {
        UserDTO user = userService.removeAuthorityFromUser(publicId, authorityName);
        return ResponseEntity.ok(ApiResponse.success(user, "Authority removed successfully"));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(@RequestAttribute("userPublicId") UUID userPublicId) {
        UserDTO user = userService.getUserByPublicId(userPublicId);
        return ResponseEntity.ok(ApiResponse.success(user, "Current user retrieved successfully"));
    }
}