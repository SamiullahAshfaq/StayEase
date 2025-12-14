import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ServiceBooking,
  CreateServiceBookingRequest,
  ApiResponse
} from '../models/service-offering.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceBookingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/service-bookings`;

  /**
   * Create a new booking
   */
  createBooking(request: CreateServiceBookingRequest): Observable<ApiResponse<ServiceBooking>> {
    return this.http.post<ApiResponse<ServiceBooking>>(this.apiUrl, request);
  }

  /**
   * Get booking by public ID
   */
  getBooking(publicId: string): Observable<ApiResponse<ServiceBooking>> {
    return this.http.get<ApiResponse<ServiceBooking>>(`${this.apiUrl}/${publicId}`);
  }

  /**
   * Get my bookings (customer)
   */
  getMyBookings(page: number = 0, size: number = 10): Observable<ApiResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/my-bookings`, { params });
  }

  /**
   * Get provider bookings
   */
  getProviderBookings(page: number = 0, size: number = 10): Observable<ApiResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/provider-bookings`, { params });
  }

  /**
   * Confirm booking (provider)
   */
  confirmBooking(publicId: string): Observable<ApiResponse<ServiceBooking>> {
    return this.http.post<ApiResponse<ServiceBooking>>(`${this.apiUrl}/${publicId}/confirm`, {});
  }

  /**
   * Reject booking (provider)
   */
  rejectBooking(publicId: string, reason?: string): Observable<ApiResponse<ServiceBooking>> {
    return this.http.post<ApiResponse<ServiceBooking>>(`${this.apiUrl}/${publicId}/reject`, { reason });
  }

  /**
   * Cancel booking
   */
  cancelBooking(publicId: string): Observable<ApiResponse<ServiceBooking>> {
    return this.http.post<ApiResponse<ServiceBooking>>(`${this.apiUrl}/${publicId}/cancel`, {});
  }

  /**
   * Start service (provider)
   */
  startService(publicId: string): Observable<ApiResponse<ServiceBooking>> {
    return this.http.post<ApiResponse<ServiceBooking>>(`${this.apiUrl}/${publicId}/start`, {});
  }

  /**
   * Complete service (provider)
   */
  completeService(publicId: string): Observable<ApiResponse<ServiceBooking>> {
    return this.http.post<ApiResponse<ServiceBooking>>(`${this.apiUrl}/${publicId}/complete`, {});
  }

  /**
   * Check availability
   */
  checkAvailability(servicePublicId: string, date: string, startTime: string): Observable<ApiResponse<boolean>> {
    let params = new HttpParams()
      .set('servicePublicId', servicePublicId)
      .set('date', date)
      .set('startTime', startTime);
    
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/check-availability`, { params });
  }
}
