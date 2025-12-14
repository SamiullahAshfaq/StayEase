# Static Image Storage

This directory contains static images served by the Spring Boot application.

## Directory Structure

- `/images/listings/` - Property listing images
- `/images/users/` - User profile images

## Image Naming Convention

### Listing Images
- Format: `{property-name}-{number}-{sequence}.jpg`
- Examples: 
  - `villa-1-1.jpg` (cover image)
  - `villa-1-2.jpg` (additional image)
  - `paris-1-1.jpg`

### User Images
- Format: `{username}.jpg`
- Examples:
  - `admin.jpg`
  - `john.jpg`
  - `landlord1.jpg`

## Image URLs

Images are accessible via HTTP at:
- Listings: `http://localhost:8080/images/listings/{filename}`
- Users: `http://localhost:8080/images/users/{filename}`

## Development Note

For development, you can:
1. Use placeholder image URLs from external services (Unsplash, etc.)
2. Place actual images in these directories
3. Update the DataSeeder.java to reference the correct paths

The DataSeeder currently uses paths like `/images/listings/villa-1-1.jpg` which will be served from this directory.

## Production Deployment

For production, consider:
- Moving images to cloud storage (AWS S3, Azure Blob, Cloudinary)
- Implementing CDN for faster delivery
- Adding image optimization/compression
