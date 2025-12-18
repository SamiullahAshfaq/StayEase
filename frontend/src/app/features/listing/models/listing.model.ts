import { ListingImage } from './listing-image.model';

export interface Listing {
  publicId: string;
  landlordPublicId: string;
  title: string;
  description: string;
  location: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  basePrice: number;
  currency: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  propertyType: string;
  category: string;
  amenities: string[];
  houseRules?: string;
  cancellationPolicy: string;
  minimumStay: number;
  maximumStay?: number;
  instantBook: boolean;
  status: ListingStatus;
  images: ListingImage[];
  coverImageUrl?: string;
  averageRating?: number;
  totalReviews?: number;
  viewCount: number;
  bookingCount: number;
  createdAt: string;
  updatedAt: string;
}
export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

export interface CreateListing {
  title: string;
  description: string;
  location: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  pricePerNight: number;
  currency: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  propertyType: string;
  category: string;
  amenities: string[];
  houseRules?: string;
  cancellationPolicy: string;
  minimumStay: number;
  maximumStay?: number;
  instantBook: boolean;
  images: ListingImage[];
}

export interface UpdateListing {
  title?: string;
  description?: string;
  location?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  pricePerNight?: number;
  currency?: string;
  maxGuests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  propertyType?: string;
  category?: string;
  amenities?: string[];
  houseRules?: string;
  cancellationPolicy?: string;
  minimumStay?: number;
  maximumStay?: number;
  instantBook?: boolean;
  status?: ListingStatus;
  images?: ListingImage[];
}

export interface SearchListingParams {
  location?: string;
  city?: string;
  country?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyTypes?: string[];
  categories?: string[];
  amenities?: string[];
  minBedrooms?: number;
  minBeds?: number;
  minBathrooms?: number;
  instantBook?: boolean;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  size?: number;
}

export interface ListingPage {
  content: Listing[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const PROPERTY_TYPES = [
  'House',
  'Apartment',
  'Condo',
  'Villa',
  'Cottage',
  'Cabin',
  'Loft',
  'Townhouse',
  'Bungalow',
  'Chalet'
];

export const CATEGORIES = [
  'Amazing views',
  'Beachfront',
  'Trending',
  'Cabins',
  'Lakefront',
  'Mansions',
  'Countryside',
  'Design',
  'Pools',
  'Tropical',
  'Islands',
  'Caves',
  'Castles',
  'Skiing',
  'Camping',
  'Luxe',
  'Tiny homes',
  'Treehouses',
  'Farms',
  'Historical homes'
];

export const CATEGORY_ICONS: Record<string, string> = {
  'Amazing views': '🏔️',
  'Beachfront': '🏖️',
  'Trending': '🔥',
  'Cabins': '🏕️',
  'Lakefront': '🌊',
  'Mansions': '🏰',
  'Countryside': '🌾',
  'Design': '✨',
  'Pools': '🏊',
  'Tropical': '🌴',
  'Islands': '🏝️',
  'Caves': '⛰️',
  'Castles': '🏰',
  'Skiing': '⛷️',
  'Camping': '⛺',
  'Luxe': '💎',
  'Tiny homes': '🏡',
  'Treehouses': '🌳',
  'Farms': '🚜',
  'Historical homes': '🏛️'
};

export const AMENITIES = [
  'WiFi',
  'Kitchen',
  'Washer',
  'Dryer',
  'Air conditioning',
  'Heating',
  'TV',
  'Hair dryer',
  'Iron',
  'Pool',
  'Hot tub',
  'Free parking',
  'EV charger',
  'Gym',
  'Breakfast',
  'Smoking allowed',
  'Pets allowed',
  'Self check-in',
  'Workspace',
  'Fireplace',
  'Piano',
  'BBQ grill',
  'Outdoor dining',
  'Beach access',
  'Ski-in/Ski-out'
];

export const CANCELLATION_POLICIES = [
  'FLEXIBLE',
  'MODERATE',
  'STRICT',
  'SUPER_STRICT'
];
