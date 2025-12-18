package com.stayease.shared.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FileStorageService {

    private final Path fileStorageLocation;

    private final Path profileImagesLocation;
    private final Path listingImagesLocation;
    private final Path serviceImagesLocation;

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        Path baseLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.profileImagesLocation = baseLocation.resolve("profile-images");
        this.listingImagesLocation = baseLocation.resolve("listing-images");
        this.serviceImagesLocation = baseLocation.resolve("service-images");
        this.fileStorageLocation = profileImagesLocation; // Keep for backward compatibility

        try {
            Files.createDirectories(this.profileImagesLocation);
            Files.createDirectories(this.listingImagesLocation);
            Files.createDirectories(this.serviceImagesLocation);
            log.info("File storage directories created at: {}", baseLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    /**
     * Store base64 encoded image and return the filename
     * 
     * @param base64Image Base64 encoded image string with or without data URI
     *                    prefix
     * @return Filename of the stored image
     */
    public String storeBase64Image(String base64Image) {
        return storeBase64Image(base64Image, profileImagesLocation);
    }

    /**
     * Store base64 encoded listing image and return the filename
     *
     * @param base64Image Base64 encoded image string with or without data URI
     *                    prefix
     * @return Filename of the stored image
     */
    public String storeBase64ListingImage(String base64Image) {
        return storeBase64Image(base64Image, listingImagesLocation);
    }

    /**
     * Store base64 encoded service image and return the filename
     *
     * @param base64Image Base64 encoded image string with or without data URI
     *                    prefix
     * @return Filename of the stored image
     */
    public String storeBase64ServiceImage(String base64Image) {
        return storeBase64Image(base64Image, serviceImagesLocation);
    }

    private String storeBase64Image(String base64Image, Path targetDirectory) {
        try {
            // Remove data URI prefix if present (e.g., "data:image/png;base64,")
            String base64Data = base64Image;
            String fileExtension = "png"; // default

            if (base64Image.contains(",")) {
                String[] parts = base64Image.split(",");
                String dataUriPrefix = parts[0];
                base64Data = parts[1];

                // Extract file extension from data URI
                if (dataUriPrefix.contains("image/jpeg") || dataUriPrefix.contains("image/jpg")) {
                    fileExtension = "jpg";
                } else if (dataUriPrefix.contains("image/png")) {
                    fileExtension = "png";
                } else if (dataUriPrefix.contains("image/gif")) {
                    fileExtension = "gif";
                } else if (dataUriPrefix.contains("image/webp")) {
                    fileExtension = "webp";
                }
            }

            // Decode base64 to bytes
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);

            // Generate unique filename
            String filename = UUID.randomUUID().toString() + "." + fileExtension;
            Path targetLocation = targetDirectory.resolve(filename);

            // Save file
            Files.write(targetLocation, imageBytes);
            log.info("Stored image file: {}", filename);

            return filename;

        } catch (Exception ex) {
            log.error("Failed to store base64 image", ex);
            throw new RuntimeException("Failed to store image file", ex);
        }
    }

    /**
     * Delete a file by filename
     * 
     * @param filename Name of the file to delete
     * @return true if deleted successfully, false otherwise
     */
    public boolean deleteFile(String filename) {
        try {
            if (filename == null || filename.isEmpty()) {
                return false;
            }

            // Extract just the filename if it's a full URL
            if (filename.startsWith("http://") || filename.startsWith("https://")) {
                String[] parts = filename.split("/");
                filename = parts[parts.length - 1];
            }

            Path filePath = this.fileStorageLocation.resolve(filename).normalize();
            Files.deleteIfExists(filePath);
            log.info("Deleted file: {}", filename);
            return true;
        } catch (IOException ex) {
            log.error("Failed to delete file: {}", filename, ex);
            return false;
        }
    }

    /**
     * Get the file storage location path
     * 
     * @return Path to the file storage directory
     */
    public Path getFileStorageLocation() {
        return fileStorageLocation;
    }
}
