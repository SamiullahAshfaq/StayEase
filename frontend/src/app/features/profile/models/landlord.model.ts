/**
 * Landlord Profile Models - Airbnb-style host management
 */

export interface LandlordProfile {
  id: number;
  publicId: string;
  userId: string;
  
  // Personal Info
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  
  // Host Info
  isVerified: boolean;
  isSuperhost: boolean;
  hostSince: string;
  responseRate?: number;
  responseTime?: string; // e.g., "within an hour"
  
  // Address
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  address?: string;
  
  // Verification Documents
  governmentIdVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Languages
  languages: string[];
  
  // Social Links
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  
  // Statistics
  totalListings: number;
  activeListings: number;
  totalReviews: number;
  averageRating: number;
  totalBookings: number;
  totalEarnings: number;
  
  // Preferences
  instantBookingEnabled: boolean;
  autoApproveBookings: boolean;
  allowPets: boolean;
  allowSmoking: boolean;
  allowParties: boolean;
  
  // Banking Info (masked)
  hasBankAccount: boolean;
  bankAccountLast4?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UpdateLandlordProfileRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  bio?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  address?: string;
  languages?: string[];
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  instantBookingEnabled?: boolean;
  autoApproveBookings?: boolean;
  allowPets?: boolean;
  allowSmoking?: boolean;
  allowParties?: boolean;
}

export interface Listing {
  id: number;
  publicId: string;
  landlordPublicId: string;  // Added to identify the listing owner
  title: string;
  description: string;
  propertyType: PropertyType;
  roomType: RoomType;
  status: ListingStatus;
  
  // Location
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  
  // Capacity
  bedrooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  
  // Pricing
  basePrice: number;
  cleaningFee?: number;
  securityDeposit?: number;
  weekendPrice?: number;
  monthlyDiscount?: number;
  weeklyDiscount?: number;
  
  // Amenities
  amenities: string[];
  
  // Rules
  houseRules?: string;
  checkInTime: string;
  checkOutTime: string;
  minNights: number;
  maxNights?: number;
  
  // Images
  images: ListingImage[];
  coverImageUrl?: string;  // CHANGED from coverImage to match backend
  
  // Availability
  isInstantBooking: boolean;
  isActive: boolean;
  availableFrom?: string;
  availableTo?: string;
  
  // Statistics
  viewCount: number;
  favoriteCount: number;
  bookingCount: number;
  averageRating: number;
  totalReviews: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  lastBookedAt?: string;
}

export interface ListingImage {
  id: number;
  url: string;           // CHANGED from imageUrl to match backend
  caption?: string;
  isCover: boolean;      // CHANGED from isPrimary to match backend
  sortOrder: number;     // CHANGED from displayOrder to match backend
}

export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  VILLA = 'VILLA',
  CONDO = 'CONDO',
  TOWNHOUSE = 'TOWNHOUSE',
  COTTAGE = 'COTTAGE',
  CABIN = 'CABIN',
  LOFT = 'LOFT',
  STUDIO = 'STUDIO',
  UNIQUE = 'UNIQUE'
}

export enum RoomType {
  ENTIRE_PLACE = 'ENTIRE_PLACE',
  PRIVATE_ROOM = 'PRIVATE_ROOM',
  SHARED_ROOM = 'SHARED_ROOM'
}

export enum ListingStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE'
}

export interface CreateListingRequest {
  title: string;
  description: string;
  
  // Location fields
  location: string;      // NEW: required by backend (could be same as address or city)
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  
  // Property details
  propertyType: string;  // e.g., "APARTMENT", "HOUSE", "VILLA"
  category: string;      // NEW: required by backend (e.g., "ENTIRE_PLACE", "PRIVATE_ROOM")
  
  // Capacity
  bedrooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  
  // Pricing
  pricePerNight: number;  // CHANGED from basePrice to match backend
  currency?: string;
  
  // Booking rules
  minimumStay?: number;   // CHANGED from minNights
  maximumStay?: number;   // CHANGED from maxNights
  instantBook?: boolean;  // CHANGED from isInstantBooking
  cancellationPolicy?: string;
  
  // Details
  amenities?: string[];
  houseRules?: string;
  
  // Images - CHANGED to match backend ListingImageDTO structure
  images: {
    url: string;
    caption?: string;
    isCover?: boolean;
    sortOrder?: number;
  }[];
}

export interface ListingStats {
  totalListings: number;
  activeListings: number;
  draftListings: number;
  pausedListings: number;
  totalViews: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  occupancyRate: number;
  topPerformingListing?: {
    publicId: string;
    title: string;
    revenue: number;
    bookings: number;
  };
}

export interface Booking {
  id: number;
  publicId: string;
  status: BookingStatus;
  
  // Listing info
  listingPublicId: string;
  listingTitle: string;
  listingImage?: string;
  
  // Guest info
  guestPublicId: string;
  guestName: string;
  guestAvatar?: string;
  guestEmail?: string;
  guestPhone?: string;
  
  // Booking details
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfNights: number;
  
  // Pricing
  nightlyRate: number;
  totalNights: number;
  cleaningFee: number;
  serviceFee: number;
  tax: number;
  totalPrice: number;
  
  // Payment
  paymentStatus: string;
  paidAt?: string;
  
  // Special requests
  specialRequests?: string;
  
  // Status tracking
  confirmedAt?: string;
  cancelledAt?: string;
  checkInAt?: string;
  checkOutAt?: string;
  
  // Review
  isReviewedByHost: boolean;
  isReviewedByGuest: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PAID = 'PAID',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED'
}

export interface Revenue {
  month: string;
  year: number;
  totalEarnings: number;
  totalBookings: number;
  averageNightlyRate: number;
  occupancyRate: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.APARTMENT]: 'Apartment',
  [PropertyType.HOUSE]: 'House',
  [PropertyType.VILLA]: 'Villa',
  [PropertyType.CONDO]: 'Condo',
  [PropertyType.TOWNHOUSE]: 'Townhouse',
  [PropertyType.COTTAGE]: 'Cottage',
  [PropertyType.CABIN]: 'Cabin',
  [PropertyType.LOFT]: 'Loft',
  [PropertyType.STUDIO]: 'Studio',
  [PropertyType.UNIQUE]: 'Unique Space'
};

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  [RoomType.ENTIRE_PLACE]: 'Entire place',
  [RoomType.PRIVATE_ROOM]: 'Private room',
  [RoomType.SHARED_ROOM]: 'Shared room'
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  [ListingStatus.DRAFT]: 'Draft',
  [ListingStatus.PENDING_APPROVAL]: 'Pending Approval',
  [ListingStatus.ACTIVE]: 'Active',
  [ListingStatus.PAUSED]: 'Paused',
  [ListingStatus.SUSPENDED]: 'Suspended',
  [ListingStatus.REJECTED]: 'Rejected',
  [ListingStatus.INACTIVE]: 'Inactive'
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'Pending',
  [BookingStatus.CONFIRMED]: 'Confirmed',
  [BookingStatus.PAID]: 'Paid',
  [BookingStatus.CHECKED_IN]: 'Checked In',
  [BookingStatus.CHECKED_OUT]: 'Checked Out',
  [BookingStatus.COMPLETED]: 'Completed',
  [BookingStatus.CANCELLED]: 'Cancelled',
  [BookingStatus.REJECTED]: 'Rejected',
  [BookingStatus.REFUNDED]: 'Refunded'
};
