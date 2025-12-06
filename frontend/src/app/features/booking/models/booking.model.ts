export interface Booking {
  publicId: string;
  listingPublicId: string;
  guestPublicId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfNights: number;
  totalPrice: number;
  currency: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  specialRequests?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  addons?: BookingAddon[];
  createdAt: string;
  updatedAt: string;
  listingTitle?: string;
  listingCoverImage?: string;
  guestName?: string;
  landlordPublicId?: string;
}

export interface BookingAddon {
  id?: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

export interface CreateBookingRequest {
  listingPublicId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
  addons?: BookingAddon[];
}

export interface BookingPage {
  content: Booking[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}