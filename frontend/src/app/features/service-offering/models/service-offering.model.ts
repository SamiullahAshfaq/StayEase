/**
 * Service Offering Models - Airbnb-style service marketplace
 */

export enum ServiceCategory {
  HOME_CHEF = 'HOME_CHEF',
  TOUR_GUIDE = 'TOUR_GUIDE',
  CAR_RENTAL = 'CAR_RENTAL',
  AIRPORT_TRANSFER = 'AIRPORT_TRANSFER',
  LAUNDRY_SERVICE = 'LAUNDRY_SERVICE',
  HOUSE_CLEANING = 'HOUSE_CLEANING',
  MASSAGE_SPA = 'MASSAGE_SPA',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  EVENT_PLANNING = 'EVENT_PLANNING',
  BABY_SITTING = 'BABY_SITTING',
  PET_CARE = 'PET_CARE',
  GROCERY_DELIVERY = 'GROCERY_DELIVERY',
  PERSONAL_TRAINER = 'PERSONAL_TRAINER',
  YOGA_MEDITATION = 'YOGA_MEDITATION',
  LANGUAGE_TUTOR = 'LANGUAGE_TUTOR',
  BIKE_RENTAL = 'BIKE_RENTAL',
  EQUIPMENT_RENTAL = 'EQUIPMENT_RENTAL'
}

export enum ServiceStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE'
}

export enum PricingType {
  PER_HOUR = 'PER_HOUR',
  PER_DAY = 'PER_DAY',
  PER_PERSON = 'PER_PERSON',
  PER_SESSION = 'PER_SESSION',
  PER_ITEM = 'PER_ITEM',
  CUSTOM = 'CUSTOM'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PAID = 'PAID',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
  NO_SHOW = 'NO_SHOW'
}

export interface ServiceImage {
  id: number;
  imageUrl: string;
  caption?: string;
  isPrimary: boolean;
  displayOrder: number;
  uploadedAt: string;
}

export interface ServiceOffering {
  id: number;
  publicId: string;
  category: ServiceCategory;
  status: ServiceStatus;
  
  // Provider info
  providerPublicId: string;
  providerName: string;
  providerAvatar?: string;
  providerRating?: number;
  providerReviewCount?: number;
  isProviderVerified: boolean;
  
  // Basic info
  title: string;
  description: string;
  highlights?: string;
  whatIsIncluded?: string;
  whatToExpect?: string;
  
  // Pricing
  pricingType: PricingType;
  basePrice: number;
  extraPersonPrice?: number;
  weekendSurcharge?: number;
  peakSeasonSurcharge?: number;
  
  // Capacity
  minCapacity?: number;
  maxCapacity?: number;
  
  // Duration
  durationMinutes?: number;
  minBookingHours?: number;
  
  // Availability
  isActive: boolean;
  isInstantBooking: boolean;
  availableFrom?: string; // LocalTime as string
  availableTo?: string;
  availableDays: string[];
  
  // Location
  city: string;
  country: string;
  address?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  serviceRadius?: number;
  providesMobileService: boolean;
  
  // Requirements & Policies
  requirements?: string;
  cancellationPolicy?: string;
  advanceBookingHours?: number;
  safetyMeasures?: string;
  
  // Languages & Amenities
  languages: string[];
  amenities: string[];
  
  // Media
  images: ServiceImage[];
  videoUrl?: string;
  
  // Reviews & Stats
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  
  // Verification
  isVerified: boolean;
  hasInsurance: boolean;
  hasLicense: boolean;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  
  // Promotion
  isFeatured: boolean;
  featuredUntil?: string;
  discountPercentage?: number;
  discountValidUntil?: string;
  
  // Statistics
  viewCount: number;
  favoriteCount: number;
  inquiryCount: number;
  
  // Computed fields
  categoryDisplayName: string;
  priceDisplay: string;
  finalPrice: number;
  isBookable: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastBookedAt?: string;
}

export interface CreateServiceOfferingRequest {
  category: ServiceCategory;
  title: string;
  description: string;
  highlights?: string;
  whatIsIncluded?: string;
  whatToExpect?: string;
  
  pricingType: PricingType;
  basePrice: number;
  extraPersonPrice?: number;
  weekendSurcharge?: number;
  peakSeasonSurcharge?: number;
  
  minCapacity?: number;
  maxCapacity?: number;
  durationMinutes?: number;
  minBookingHours?: number;
  
  isInstantBooking: boolean;
  availableFrom?: string;
  availableTo?: string;
  availableDays: string[];
  
  city: string;
  country: string;
  address?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  serviceRadius?: number;
  providesMobileService: boolean;
  
  requirements?: string;
  cancellationPolicy?: string;
  advanceBookingHours?: number;
  safetyMeasures?: string;
  
  languages: string[];
  amenities: string[];
  imageUrls: string[];
  videoUrl?: string;
  
  hasInsurance: boolean;
  hasLicense: boolean;
  licenseNumber?: string;
  licenseExpiryDate?: string;
}

export interface ServiceBooking {
  id: number;
  publicId: string;
  status: BookingStatus;
  
  // Service info
  servicePublicId: string;
  serviceTitle: string;
  serviceCategory: ServiceCategory;
  serviceImageUrl?: string;
  
  // Provider info
  providerPublicId: string;
  providerName: string;
  providerAvatar?: string;
  providerPhone?: string;
  
  // Customer info
  customerPublicId: string;
  customerName: string;
  customerAvatar?: string;
  customerPhone?: string;
  customerEmail?: string;
  
  // Booking details
  bookingDate: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  numberOfPeople?: number;
  numberOfItems?: number;
  
  // Location
  serviceLocation?: string;
  customerAddress?: string;
  latitude?: number;
  longitude?: number;
  
  // Pricing
  basePrice: number;
  extraPersonCharge: number;
  surcharges: number;
  discount: number;
  serviceFee: number;
  tax: number;
  totalPrice: number;
  
  // Payment
  paymentStatus: string;
  paymentIntentId?: string;
  paidAt?: string;
  
  // Additional info
  specialRequests?: string;
  
  // Status timestamps
  confirmedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  serviceStartedAt?: string;
  serviceCompletedAt?: string;
  refundedAt?: string;
  
  // Review tracking
  isReviewedByCustomer: boolean;
  isReviewedByProvider: boolean;
  reviewPublicId?: string;
  
  // Computed fields
  canCancel: boolean;
  canReview: boolean;
  statusDisplay: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceBookingRequest {
  servicePublicId: string;
  bookingDate: string;
  startTime: string;
  numberOfPeople?: number;
  numberOfItems?: number;
  customerAddress?: string;
  customerPhone: string;
  customerEmail: string;
  specialRequests?: string;
}

export interface ServiceFilter {
  category?: ServiceCategory;
  city?: string;
  country?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  isFeatured?: boolean;
  providesMobileService?: boolean;
  isInstantBooking?: boolean;
  sortBy?: 'createdAt' | 'averageRating' | 'basePrice' | 'totalBookings';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface ServiceListResponse {
  content: ServiceOffering[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  [ServiceCategory.HOME_CHEF]: 'Home Chef',
  [ServiceCategory.TOUR_GUIDE]: 'Tour Guide',
  [ServiceCategory.CAR_RENTAL]: 'Car Rental',
  [ServiceCategory.AIRPORT_TRANSFER]: 'Airport Transfer',
  [ServiceCategory.LAUNDRY_SERVICE]: 'Laundry Service',
  [ServiceCategory.HOUSE_CLEANING]: 'House Cleaning',
  [ServiceCategory.MASSAGE_SPA]: 'Massage & Spa',
  [ServiceCategory.PHOTOGRAPHY]: 'Photography',
  [ServiceCategory.EVENT_PLANNING]: 'Event Planning',
  [ServiceCategory.BABY_SITTING]: 'Babysitting',
  [ServiceCategory.PET_CARE]: 'Pet Care',
  [ServiceCategory.GROCERY_DELIVERY]: 'Grocery Delivery',
  [ServiceCategory.PERSONAL_TRAINER]: 'Personal Trainer',
  [ServiceCategory.YOGA_MEDITATION]: 'Yoga & Meditation',
  [ServiceCategory.LANGUAGE_TUTOR]: 'Language Tutor',
  [ServiceCategory.BIKE_RENTAL]: 'Bike Rental',
  [ServiceCategory.EQUIPMENT_RENTAL]: 'Equipment Rental'
};

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  [PricingType.PER_HOUR]: 'Per Hour',
  [PricingType.PER_DAY]: 'Per Day',
  [PricingType.PER_PERSON]: 'Per Person',
  [PricingType.PER_SESSION]: 'Per Session',
  [PricingType.PER_ITEM]: 'Per Item',
  [PricingType.CUSTOM]: 'Custom'
};
