import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  LandlordProfile,
  UpdateLandlordProfileRequest,
  Listing,
  CreateListingRequest,
  ListingStats,
  Booking,
  Revenue,
  ApiResponse
} from '../models/landlord.model';

@Injectable({
  providedIn: 'root'
})
export class LandlordService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/landlord`;

  /**
   * Profile Management
   */
  getProfile(): Observable<ApiResponse<LandlordProfile>> {
    return this.http.get<ApiResponse<LandlordProfile>>(`${this.apiUrl}/profile`);
  }

  updateProfile(request: UpdateLandlordProfileRequest): Observable<ApiResponse<LandlordProfile>> {
    return this.http.put<ApiResponse<LandlordProfile>>(`${this.apiUrl}/profile`, request);
  }

  uploadAvatar(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/profile/avatar`, formData);
  }

  /**
   * Listing Management
   */
  getMyListings(status?: string): Observable<ApiResponse<Listing[]>> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ApiResponse<Listing[]>>(`${this.apiUrl}/listings`, { params });
  }

  getListing(publicId: string): Observable<ApiResponse<Listing>> {
    return this.http.get<ApiResponse<Listing>>(`${this.apiUrl}/listings/${publicId}`);
  }

  createListing(request: CreateListingRequest): Observable<ApiResponse<Listing>> {
    return this.http.post<ApiResponse<Listing>>(`${this.apiUrl}/listings`, request);
  }

  updateListing(publicId: string, request: Partial<CreateListingRequest>): Observable<ApiResponse<Listing>> {
    return this.http.put<ApiResponse<Listing>>(`${this.apiUrl}/listings/${publicId}`, request);
  }

  deleteListing(publicId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/listings/${publicId}`);
  }

  publishListing(publicId: string): Observable<ApiResponse<Listing>> {
    return this.http.post<ApiResponse<Listing>>(`${this.apiUrl}/listings/${publicId}/publish`, {});
  }

  pauseListing(publicId: string): Observable<ApiResponse<Listing>> {
    return this.http.post<ApiResponse<Listing>>(`${this.apiUrl}/listings/${publicId}/pause`, {});
  }

  activateListing(publicId: string): Observable<ApiResponse<Listing>> {
    return this.http.post<ApiResponse<Listing>>(`${this.apiUrl}/listings/${publicId}/activate`, {});
  }

  uploadListingImages(publicId: string, files: File[]): Observable<ApiResponse<string[]>> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return this.http.post<ApiResponse<string[]>>(`${this.apiUrl}/listings/${publicId}/images`, formData);
  }

  deleteListingImage(publicId: string, imageId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/listings/${publicId}/images/${imageId}`);
  }

  /**
   * Booking Management
   */
  getMyBookings(status?: string): Observable<ApiResponse<Booking[]>> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ApiResponse<Booking[]>>(`${this.apiUrl}/bookings`, { params });
  }

  getBooking(publicId: string): Observable<ApiResponse<Booking>> {
    return this.http.get<ApiResponse<Booking>>(`${this.apiUrl}/bookings/${publicId}`);
  }

  confirmBooking(publicId: string): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(`${this.apiUrl}/bookings/${publicId}/confirm`, {});
  }

  rejectBooking(publicId: string, reason: string): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(`${this.apiUrl}/bookings/${publicId}/reject`, { reason });
  }

  cancelBooking(publicId: string, reason: string): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(`${this.apiUrl}/bookings/${publicId}/cancel`, { reason });
  }

  /**
   * Statistics & Analytics
   */
  getStats(): Observable<ApiResponse<ListingStats>> {
    return this.http.get<ApiResponse<ListingStats>>(`${this.apiUrl}/stats`);
  }

  getRevenueByMonth(year: number): Observable<ApiResponse<Revenue[]>> {
    return this.http.get<ApiResponse<Revenue[]>>(`${this.apiUrl}/revenue/${year}`);
  }

  /**
   * Verification
   */
  requestVerification(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/verification/request`, {});
  }

  uploadVerificationDocument(documentType: string, file: File): Observable<ApiResponse<void>> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/verification/upload`, formData);
  }

  /**
   * Banking
   */
  addBankAccount(accountDetails: any): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/banking/account`, accountDetails);
  }

  removeBankAccount(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/banking/account`);
  }

  /**
   * Notifications
   */
  getNotificationSettings(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/settings/notifications`);
  }

  updateNotificationSettings(settings: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/settings/notifications`, settings);
  }
}
