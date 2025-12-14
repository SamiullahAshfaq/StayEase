// Enhanced Booking Models with Airbnb-like features

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
  landlordName?: string;
  landlordEmail?: string;
  landlordPhone?: string;
  landlordAvatar?: string;
  priceBreakdown?: PriceBreakdown;
  cancellationPolicy?: CancellationPolicy;
  checkInTime?: string;
  checkOutTime?: string;
  houseRules?: string[];
  confirmationCode?: string;
}

export interface BookingAddon {
  id?: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  icon?: string;
}

export interface PriceBreakdown {
  basePrice: number;
  pricePerNight: number;
  numberOfNights: number;
  cleaningFee: number;
  serviceFee: number;
  taxAmount: number;
  discounts: Discount[];
  addonsTotal: number;
  totalBeforeTaxes: number;
  totalPrice: number;
  currency: string;
}

export interface Discount {
  type: 'WEEKLY' | 'MONTHLY' | 'EARLY_BIRD' | 'LAST_MINUTE' | 'PROMO_CODE';
  name: string;
  description: string;
  amount: number;
  percentage?: number;
}

export interface CancellationPolicy {
  type: 'FLEXIBLE' | 'MODERATE' | 'STRICT' | 'SUPER_STRICT';
  description: string;
  refundPercentage: number;
  cutoffHours: number;
  nonRefundableAmount?: number;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PAYMENT_FAILED = 'PAYMENT_FAILED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

export interface CreateBookingRequest {
  listingPublicId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
  addons?: BookingAddon[];
  promoCode?: string;
  agreedToHouseRules: boolean;
  agreedToCancellationPolicy: boolean;
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

export interface ModifyBookingRequest {
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  specialRequests?: string;
  addons?: BookingAddon[];
}

export interface BookingTimeline {
  events: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  type: 'CREATED' | 'CONFIRMED' | 'PAYMENT' | 'CHECK_IN' | 'CHECK_OUT' | 'CANCELLED' | 'MODIFIED';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  status: 'COMPLETED' | 'PENDING' | 'UPCOMING';
}

export interface GuestReview {
  bookingPublicId: string;
  rating: number;
  cleanliness: number;
  accuracy: number;
  checkIn: number;
  communication: number;
  location: number;
  value: number;
  publicComment: string;
  privateComment?: string;
}

export interface HostContact {
  name: string;
  avatar?: string;
  responseRate: number;
  responseTime: string;
  joinedDate: string;
  languages: string[];
  verified: boolean;
}
