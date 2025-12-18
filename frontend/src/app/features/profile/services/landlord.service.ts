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
  private baseUrl = environment.apiUrl;

  /**
   * Profile Management - Uses /api/profile endpoints
   */
  getProfile(): Observable<ApiResponse<LandlordProfile>> {
    return this.http.get<ApiResponse<LandlordProfile>>(`${this.baseUrl}/profile`);
  }

  updateProfile(request: UpdateLandlordProfileRequest): Observable<ApiResponse<LandlordProfile>> {
    return this.http.put<ApiResponse<LandlordProfile>>(`${this.baseUrl}/profile`, request);
  }

  uploadAvatar(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/profile/avatar`, formData);
  }

  /**
   * Listing Management - Uses /api/listings endpoints
   */
  getMyListings(status?: string): Observable<ApiResponse<Listing[]>> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ApiResponse<Listing[]>>(`${this.baseUrl}/listings/my-listings`, { params });
  }

  getListing(publicId: string): Observable<ApiResponse<Listing>> {
    return this.http.get<ApiResponse<Listing>>(`${this.baseUrl}/listings/${publicId}`);
  }

  createListing(request: CreateListingRequest): Observable<ApiResponse<Listing>> {
    const url = `${this.baseUrl}/listings`;
    console.log('[LandlordService] Creating listing at URL:', url);
    console.log('[LandlordService] Request payload:', request);
    return this.http.post<ApiResponse<Listing>>(url, request);
  }

  updateListing(publicId: string, request: Partial<CreateListingRequest>): Observable<ApiResponse<Listing>> {
    return this.http.put<ApiResponse<Listing>>(`${this.baseUrl}/listings/${publicId}`, request);
  }

  deleteListing(publicId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/listings/${publicId}`);
  }

  publishListing(publicId: string): Observable<ApiResponse<Listing>> {
    return this.http.post<ApiResponse<Listing>>(`${this.baseUrl}/listings/${publicId}/publish`, {});
  }

  pauseListing(publicId: string): Observable<ApiResponse<Listing>> {
    return this.http.post<ApiResponse<Listing>>(`${this.baseUrl}/listings/${publicId}/pause`, {});
  }

  activateListing(publicId: string): Observable<ApiResponse<Listing>> {
    return this.http.post<ApiResponse<Listing>>(`${this.baseUrl}/listings/${publicId}/activate`, {});
  }

  uploadListingImages(publicId: string, files: File[]): Observable<ApiResponse<string[]>> {
    // Convert files to base64 and upload
    return new Observable(observer => {
      const promises = files.map(file => this.fileToBase64(file));
      
      Promise.all(promises).then(base64Images => {
        this.http.post<ApiResponse<string[]>>(`${environment.apiUrl.replace('/api', '')}/api/files/listing-images`, {
          images: base64Images
        }).subscribe({
          next: (response) => observer.next(response),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      }).catch(error => observer.error(error));
    });
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  deleteListingImage(publicId: string, imageId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/listings/${publicId}/images/${imageId}`);
  }

  /**
   * Booking Management - Uses /api/bookings endpoints
   */
  getMyBookings(status?: string): Observable<ApiResponse<Booking[]>> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ApiResponse<Booking[]>>(`${this.baseUrl}/bookings`, { params });
  }

  getBooking(publicId: string): Observable<ApiResponse<Booking>> {
    return this.http.get<ApiResponse<Booking>>(`${this.baseUrl}/bookings/${publicId}`);
  }

  confirmBooking(publicId: string): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(`${this.baseUrl}/bookings/${publicId}/confirm`, {});
  }

  rejectBooking(publicId: string, reason: string): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(`${this.baseUrl}/bookings/${publicId}/reject`, { reason });
  }

  cancelBooking(publicId: string, reason: string): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(`${this.baseUrl}/bookings/${publicId}/cancel`, { reason });
  }

  /**
   * Statistics & Analytics - These endpoints may not exist yet
   */
  getStats(): Observable<ApiResponse<ListingStats>> {
    return this.http.get<ApiResponse<ListingStats>>(`${this.baseUrl}/landlord/stats`);
  }

  getRevenueByMonth(year: number): Observable<ApiResponse<Revenue[]>> {
    return this.http.get<ApiResponse<Revenue[]>>(`${this.baseUrl}/landlord/revenue/${year}`);
  }

  /**
   * Verification - These endpoints may not exist yet
   */
  requestVerification(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/landlord/verification/request`, {});
  }

  uploadVerificationDocument(documentType: string, file: File): Observable<ApiResponse<void>> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/landlord/verification/upload`, formData);
  }

  /**
   * Banking - These endpoints may not exist yet
   */
  addBankAccount(accountDetails: any): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/landlord/banking/account`, accountDetails);
  }

  removeBankAccount(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/landlord/banking/account`);
  }

  /**
   * Notifications - These endpoints may not exist yet
   */
  getNotificationSettings(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/landlord/settings/notifications`);
  }

  updateNotificationSettings(settings: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/landlord/settings/notifications`, settings);
  }
}
