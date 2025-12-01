export interface Listing {
  city: string;
  state: string;
  country: string;
  amenities: never[];
  id: any;
  publicId: string;
  landlordPublicId: string;
  title: string;
  description: string;
  location: string;
  price: number;
  currency: string;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  category: string;
  rules?: string;
  images: ListingImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ListingImage {
  id: number;
  url: string;
  caption?: string;
  sortOrder: number;
}

export interface CreateListing {
  title: string;
  description: string;
  location: string;
  price: number;
  currency?: string;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  category: string;
  rules?: string;
  imageUrls?: string[];
}

export interface UpdateListing {
  title?: string;
  description?: string;
  location?: string;
  price?: number;
  guests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  category?: string;
  rules?: string;
  imageUrls?: string[];
}

export interface SearchListing {
  location?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}