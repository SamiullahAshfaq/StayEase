import { environment } from '../../../environments/environment';

/**
 * Helper utility to construct full image URLs from backend paths
 * Listing images from DB are stored as: /images/listings/listing-1.jpg
 * Service images from DB are stored as: /images/services/service-1.jpg
 * This helper converts them to: http://localhost:8080/images/listings/listing-1.jpg
 */
export class ImageUrlHelper {
  private static readonly BACKEND_URL = environment.apiUrl.replace('/api', '');

  /**
   * Get full image URL from backend path
   * @param imagePath - Path from database (e.g., "/images/listings/listing-1.jpg")
   * @returns Full URL (e.g., "http://localhost:8080/images/listings/listing-1.jpg")
   */
  static getFullImageUrl(imagePath: string): string {
    if (!imagePath) {
      return this.getPlaceholderImage();
    }

    // If already a full URL (http/https), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Remove leading slash if present to avoid double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

    return `${this.BACKEND_URL}/${cleanPath}`;
  }

  /**
   * Get placeholder image for listings without images
   */
  static getPlaceholderImage(): string {
    return 'https://via.placeholder.com/800x600?text=No+Image+Available';
  }

  /**
   * Get service placeholder image
   */
  static getServicePlaceholderImage(category?: string): string {
    // Return category-specific placeholder
    if (category) {
      return `https://via.placeholder.com/800x600?text=${encodeURIComponent(category.replace(/_/g, ' '))}`;
    }
    return 'https://via.placeholder.com/800x600?text=Service+Image';
  }

  /**
   * Get cover image URL from listing
   * @param images - Array of listing images
   * @returns URL of cover image or first image or placeholder
   */
  static getCoverImageUrl(images: { url: string; isCover: boolean }[]): string {
    if (!images || images.length === 0) {
      return this.getPlaceholderImage();
    }

    // Find cover image
    const coverImage = images.find(img => img.isCover);
    const imageUrl = coverImage?.url || images[0]?.url;

    return this.getFullImageUrl(imageUrl);
  }

  /**
   * Get primary service image URL
   * @param images - Array of service images
   * @returns URL of primary image or first image or placeholder
   */
  static getServiceCoverImageUrl(images: { imageUrl: string; isPrimary: boolean }[], category?: string): string {
    if (!images || images.length === 0) {
      return this.getServicePlaceholderImage(category);
    }

    // Find primary image
    const primaryImage = images.find(img => img.isPrimary);
    const imageUrl = primaryImage?.imageUrl || images[0]?.imageUrl;

    return this.getFullImageUrl(imageUrl);
  }

  /**
   * Get all image URLs from listing
   * @param images - Array of listing images
   * @returns Array of full image URLs
   */
  static getAllImageUrls(images: { url: string }[]): string[] {
    if (!images || images.length === 0) {
      return [this.getPlaceholderImage()];
    }

    return images.map(img => this.getFullImageUrl(img.url));
  }

  /**
   * Get all service image URLs
   * @param images - Array of service images
   * @returns Array of full image URLs
   */
  static getAllServiceImageUrls(images: { imageUrl: string }[]): string[] {
    if (!images || images.length === 0) {
      return [this.getServicePlaceholderImage()];
    }

    return images.map(img => this.getFullImageUrl(img.imageUrl));
  }

  /**
   * Get profile image URL
   * @param profileImageUrl - Profile image path from database
   * @returns Full URL or default avatar
   */
  static getProfileImageUrl(profileImageUrl?: string | null): string {
    if (!profileImageUrl) {
      return 'https://ui-avatars.com/api/?name=User&background=random';
    }

    return this.getFullImageUrl(profileImageUrl);
  }

  /**
   * Get category icon for service
   * @param category - Service category
   * @returns Icon class or emoji
   */
  static getServiceCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
      'HOME_CHEF': '👨‍🍳',
      'TOUR_GUIDE': '🗺️',
      'CAR_RENTAL': '🚗',
      'AIRPORT_TRANSFER': '✈️',
      'LAUNDRY_SERVICE': '🧺',
      'HOUSE_CLEANING': '🧹',
      'MASSAGE_SPA': '💆',
      'PHOTOGRAPHY': '📸',
      'EVENT_PLANNING': '🎉',
      'BABY_SITTING': '👶',
      'PET_CARE': '🐕',
      'GROCERY_DELIVERY': '🛒',
      'PERSONAL_TRAINER': '💪',
      'YOGA_MEDITATION': '🧘',
      'LANGUAGE_TUTOR': '📚',
      'BIKE_RENTAL': '🚲',
      'EQUIPMENT_RENTAL': '⛺'
    };

    return iconMap[category] || '📋';
  }
}
