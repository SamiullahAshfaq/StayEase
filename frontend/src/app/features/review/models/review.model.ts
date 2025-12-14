/**
 * Review Models - Airbnb-style review system
 */

export enum ReviewType {
  PROPERTY_REVIEW = 'PROPERTY_REVIEW',
  HOST_REVIEW = 'HOST_REVIEW',
  GUEST_REVIEW = 'GUEST_REVIEW',
  SERVICE_REVIEW = 'SERVICE_REVIEW',
  EXPERIENCE_REVIEW = 'EXPERIENCE_REVIEW'
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  FLAGGED = 'FLAGGED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  HIDDEN = 'HIDDEN',
  DELETED = 'DELETED'
}

export interface Review {
  id: number;
  publicId: string;
  reviewType: ReviewType;
  status: ReviewStatus;
  
  // References
  bookingPublicId: string;
  reviewerPublicId: string;
  revieweePublicId: string;
  propertyPublicId?: string;
  servicePublicId?: string;
  
  // Reviewer info
  reviewerName: string;
  reviewerAvatar?: string;
  reviewerLocation?: string;
  
  // Reviewee info
  revieweeName: string;
  revieweeAvatar?: string;
  
  // Property/Service info
  propertyTitle?: string;
  propertyImage?: string;
  serviceTitle?: string;
  serviceImage?: string;
  
  // Rating scores (1-5)
  overallRating: number;
  cleanlinessRating?: number;
  accuracyRating?: number;
  checkInRating?: number;
  communicationRating?: number;
  locationRating?: number;
  valueRating?: number;
  respectRating?: number;
  followRulesRating?: number;
  
  // Content
  title?: string;
  comment: string;
  privateComment?: string;
  
  // Photos
  photoUrls: string[];
  
  // Response
  hasResponse: boolean;
  publicResponse?: string;
  publicResponseDate?: string;
  
  // Moderation
  isHighlighted: boolean;
  isVerifiedStay: boolean;
  stayDuration?: number;
  
  // Engagement
  helpfulCount: number;
  isHelpfulByCurrentUser: boolean;
  reportCount: number;
  isReportedByCurrentUser: boolean;
  
  // Publishing
  willAutoPublishAt?: string;
  publishedAt?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  reviewType: ReviewType;
  bookingPublicId: string;
  revieweePublicId: string;
  propertyPublicId?: string;
  servicePublicId?: string;
  
  overallRating: number;
  cleanlinessRating?: number;
  accuracyRating?: number;
  checkInRating?: number;
  communicationRating?: number;
  locationRating?: number;
  valueRating?: number;
  respectRating?: number;
  followRulesRating?: number;
  
  title?: string;
  comment: string;
  privateComment?: string;
  photoUrls?: string[];
}

export interface UpdateReviewRequest {
  overallRating?: number;
  cleanlinessRating?: number;
  accuracyRating?: number;
  checkInRating?: number;
  communicationRating?: number;
  locationRating?: number;
  valueRating?: number;
  respectRating?: number;
  followRulesRating?: number;
  
  title?: string;
  comment?: string;
  privateComment?: string;
  photoUrls?: string[];
}

export interface ReviewResponse {
  publicResponse: string;
}

export interface ReviewStatistics {
  totalReviews: number;
  averageOverallRating: number;
  averageCleanlinessRating: number;
  averageAccuracyRating: number;
  averageCheckInRating: number;
  averageCommunicationRating: number;
  averageLocationRating: number;
  averageValueRating: number;
  
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  
  fiveStarPercentage: number;
  fourStarPercentage: number;
  threeStarPercentage: number;
  twoStarPercentage: number;
  oneStarPercentage: number;
}

export interface ReviewFilter {
  reviewType?: ReviewType;
  status?: ReviewStatus;
  propertyPublicId?: string;
  reviewerPublicId?: string;
  revieweePublicId?: string;
  minRating?: number;
  maxRating?: number;
  hasPhotos?: boolean;
  hasResponse?: boolean;
  isHighlighted?: boolean;
  sortBy?: 'createdAt' | 'overallRating' | 'helpfulCount';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface ReviewListResponse {
  content: Review[];
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
