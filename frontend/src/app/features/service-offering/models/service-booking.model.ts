/**
 * Service Booking Model
 */

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

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

export interface ServiceBooking {
  id: number;
  publicId: string;
  status: BookingStatus;

  // Service info
  servicePublicId: string;
  serviceTitle?: string;
  serviceCategory?: string;
  serviceImageUrl?: string;

  // Provider info
  providerPublicId: string;
  providerName?: string;
  providerAvatar?: string;
  providerPhone?: string;

  // Customer info
  customerPublicId: string;
  customerName?: string;
  customerAvatar?: string;
  customerPhone?: string;
  customerEmail?: string;

  // Booking details
  bookingDate: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  numberOfPeople: number;
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
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  paidAt?: string;

  // Additional info
  specialRequests?: string;
  rejectionReason?: string;
  cancellationReason?: string;

  // Status timestamps
  confirmedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  serviceStartedAt?: string;
  serviceCompletedAt?: string;
  refundedAt?: string;
  refundAmount?: number;

  // Review tracking
  isReviewedByCustomer: boolean;
  isReviewedByProvider: boolean;
  reviewPublicId?: string;

  // Communication
  hasUnreadMessages: boolean;
  messageCount?: number;

  // Flags
  isRefundable: boolean;
  canCancel: boolean;
  canReview: boolean;

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

export interface ServiceBookingListResponse {
  content: ServiceBooking[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'Pending',
  [BookingStatus.CONFIRMED]: 'Confirmed',
  [BookingStatus.PAID]: 'Paid',
  [BookingStatus.IN_PROGRESS]: 'In Progress',
  [BookingStatus.COMPLETED]: 'Completed',
  [BookingStatus.CANCELLED]: 'Cancelled',
  [BookingStatus.REJECTED]: 'Rejected',
  [BookingStatus.REFUNDED]: 'Refunded',
  [BookingStatus.NO_SHOW]: 'No Show'
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Pending',
  [PaymentStatus.AUTHORIZED]: 'Authorized',
  [PaymentStatus.CAPTURED]: 'Paid',
  [PaymentStatus.REFUNDED]: 'Refunded',
  [PaymentStatus.FAILED]: 'Failed'
};
