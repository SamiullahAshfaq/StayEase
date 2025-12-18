package com.stayease.shared.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stayease.shared.dto.ApiResponse;
import com.stayease.shared.service.FileStorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final FileStorageService fileStorageService;

    /**
     * Serve profile images
     */
    @GetMapping("/profile-images/{filename:.+}")
    public ResponseEntity<Resource> getProfileImage(@PathVariable String filename) {
        try {
            Path filePath = fileStorageService.getFileStorageLocation().resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                log.warn("File not found: {}", filename);
                return ResponseEntity.notFound().build();
            }

            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (IOException ex) {
            log.error("Error serving file: {}", filename, ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Serve listing images
     */
    @GetMapping("/listing-images/{filename:.+}")
    public ResponseEntity<Resource> getListingImage(@PathVariable String filename) {
        try {
            Path listingImagesPath = fileStorageService.getFileStorageLocation()
                    .getParent().resolve("listing-images");
            Path filePath = listingImagesPath.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                log.warn("Listing image not found: {}", filename);
                return ResponseEntity.notFound().build();
            }

            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (IOException ex) {
            log.error("Error serving listing image: {}", filename, ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Upload listing images (base64)
     */
    @PostMapping("/listing-images")
    public ResponseEntity<ApiResponse<List<String>>> uploadListingImages(
            @RequestBody Map<String, List<String>> request) {
        try {
            List<String> base64Images = request.get("images");
            if (base64Images == null || base64Images.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("No images provided"));
            }

            List<String> imageUrls = new ArrayList<>();
            for (String base64Image : base64Images) {
                String filename = fileStorageService.storeBase64ListingImage(base64Image);
                String imageUrl = "/api/files/listing-images/" + filename;
                imageUrls.add(imageUrl);
            }

            return ResponseEntity.ok(ApiResponse.success(
                    imageUrls,
                    "Images uploaded successfully"));

        } catch (Exception e) {
            log.error("Failed to upload listing images", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to upload images: " + e.getMessage()));
        }
    }

    /**
     * Serve service images
     */
    @GetMapping("/service-images/{filename:.+}")
    public ResponseEntity<Resource> getServiceImage(@PathVariable String filename) {
        try {
            Path serviceImagesPath = fileStorageService.getFileStorageLocation()
                    .getParent().resolve("service-images");
            Path filePath = serviceImagesPath.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                log.warn("Service image not found: {}", filename);
                return ResponseEntity.notFound().build();
            }

            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (IOException ex) {
            log.error("Error serving service image: {}", filename, ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Upload service images (base64)
     */
    @PostMapping("/service-images")
    public ResponseEntity<ApiResponse<List<String>>> uploadServiceImages(
            @RequestBody Map<String, List<String>> request) {
        try {
            List<String> base64Images = request.get("images");
            if (base64Images == null || base64Images.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("No images provided"));
            }

            List<String> imageUrls = new ArrayList<>();
            for (String base64Image : base64Images) {
                String filename = fileStorageService.storeBase64ServiceImage(base64Image);
                String imageUrl = "/api/files/service-images/" + filename;
                imageUrls.add(imageUrl);
            }

            return ResponseEntity.ok(ApiResponse.success(
                    imageUrls,
                    "Images uploaded successfully"));

        } catch (Exception e) {
            log.error("Failed to upload service images", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to upload images: " + e.getMessage()));
        }
    }
}
