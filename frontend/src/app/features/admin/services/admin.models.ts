// Admin Models

export interface ListingManagement {
  id: number;
  publicId: string;
  title: string;
  status: string;
  price: number;
  landlordName: string;
  landlordEmail: string;
  createdAt: string;
  isFeatured: boolean;
  category?: string;
  location?: string;
}

export interface UserManagement {
  id: number;
  publicId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
  totalBookings: number;
  totalListings: number;
}

export interface BookingManagement {
  id: number;
  publicId: string;
  listingTitle: string;
  guestName: string;
  guestEmail: string;
  landlordName: string;
  landlordEmail: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export interface AdminAction {
  id: number;
  adminPublicId: string;
  adminEmail: string;
  adminName: string;
  actionType: string;
  targetEntity: string;
  targetId: string;
  reason: string;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  actorPublicId: string;
  actorEmail: string;
  actorName: string;
  action: string;
  target: string;
  details: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AdminActionRequest {
  reason: string;
}
