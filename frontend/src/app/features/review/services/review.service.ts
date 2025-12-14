import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewResponse,
  ReviewStatistics,
  ReviewFilter,
  ReviewListResponse,
  ApiResponse
} from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/reviews`;

  /**
   * Create a new review
   */
  createReview(request: CreateReviewRequest): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(this.apiUrl, request);
  }

  /**
   * Get review by public ID
   */
  getReview(publicId: string): Observable<ApiResponse<Review>> {
    return this.http.get<ApiResponse<Review>>(`${this.apiUrl}/${publicId}`);
  }

  /**
   * Update a review (before it's published)
   */
  updateReview(publicId: string, request: UpdateReviewRequest): Observable<ApiResponse<Review>> {
    return this.http.put<ApiResponse<Review>>(`${this.apiUrl}/${publicId}`, request);
  }

  /**
   * Delete a review
   */
  deleteReview(publicId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${publicId}`);
  }

  /**
   * Get reviews with filters
   */
  getReviews(filter: ReviewFilter = {}): Observable<ApiResponse<ReviewListResponse>> {
    let params = new HttpParams();
    
    if (filter.reviewType) params = params.set('reviewType', filter.reviewType);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.propertyPublicId) params = params.set('propertyPublicId', filter.propertyPublicId);
    if (filter.reviewerPublicId) params = params.set('reviewerPublicId', filter.reviewerPublicId);
    if (filter.revieweePublicId) params = params.set('revieweePublicId', filter.revieweePublicId);
    if (filter.minRating) params = params.set('minRating', filter.minRating.toString());
    if (filter.maxRating) params = params.set('maxRating', filter.maxRating.toString());
    if (filter.hasPhotos !== undefined) params = params.set('hasPhotos', filter.hasPhotos.toString());
    if (filter.hasResponse !== undefined) params = params.set('hasResponse', filter.hasResponse.toString());
    if (filter.isHighlighted !== undefined) params = params.set('isHighlighted', filter.isHighlighted.toString());
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);
    if (filter.page !== undefined) params = params.set('page', filter.page.toString());
    if (filter.size) params = params.set('size', filter.size.toString());

    return this.http.get<ApiResponse<ReviewListResponse>>(this.apiUrl, { params });
  }

  /**
   * Get reviews for a specific property
   */
  getPropertyReviews(propertyPublicId: string, page: number = 0, size: number = 10): Observable<ApiResponse<ReviewListResponse>> {
    return this.getReviews({ propertyPublicId, page, size, sortBy: 'createdAt', sortDirection: 'desc' });
  }

  /**
   * Get reviews written by a user
   */
  getMyReviews(page: number = 0, size: number = 10): Observable<ApiResponse<ReviewListResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<ReviewListResponse>>(`${this.apiUrl}/my-reviews`, { params });
  }

  /**
   * Get reviews about a user (host/guest)
   */
  getReviewsAboutMe(page: number = 0, size: number = 10): Observable<ApiResponse<ReviewListResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<ReviewListResponse>>(`${this.apiUrl}/about-me`, { params });
  }

  /**
   * Get pending reviews (reviews user needs to write)
   */
  getPendingReviews(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/pending`);
  }

  /**
   * Add public response to a review
   */
  addResponse(publicId: string, response: ReviewResponse): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${this.apiUrl}/${publicId}/response`, response);
  }

  /**
   * Mark review as helpful
   */
  markHelpful(publicId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${publicId}/helpful`, {});
  }

  /**
   * Unmark review as helpful
   */
  unmarkHelpful(publicId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${publicId}/helpful`);
  }

  /**
   * Report a review
   */
  reportReview(publicId: string, reason: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${publicId}/report`, { reason });
  }

  /**
   * Get review statistics for a property/host
   */
  getStatistics(targetPublicId: string, targetType: 'property' | 'host'): Observable<ApiResponse<ReviewStatistics>> {
    let params = new HttpParams()
      .set('targetPublicId', targetPublicId)
      .set('targetType', targetType);
    
    return this.http.get<ApiResponse<ReviewStatistics>>(`${this.apiUrl}/statistics`, { params });
  }

  /**
   * Publish a pending review immediately
   */
  publishNow(publicId: string): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${this.apiUrl}/${publicId}/publish`, {});
  }

  /**
   * Check if user can review a booking
   */
  canReviewBooking(bookingPublicId: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/can-review/${bookingPublicId}`);
  }
}
