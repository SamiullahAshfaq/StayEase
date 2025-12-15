import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Booking,
  CreateBookingRequest,
  BookingPage,
  BookingStatus
} from '../models/booking.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  createBooking(data: CreateBookingRequest): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(this.apiUrl, data);
  }

  getBookingById(publicId: string): Observable<ApiResponse<Booking>> {
    return this.http.get<ApiResponse<Booking>>(`${this.apiUrl}/${publicId}`);
  }

  getMyBookings(page: number = 0, size: number = 20): Observable<ApiResponse<BookingPage>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<BookingPage>>(`${this.apiUrl}/my-bookings`, { params });
  }

  getBookingsByListing(listingPublicId: string): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(`${this.apiUrl}/listing/${listingPublicId}`);
  }

  updateBookingStatus(
    publicId: string,
    status: BookingStatus
  ): Observable<ApiResponse<Booking>> {
    let params = new HttpParams().set('status', status);
    return this.http.patch<ApiResponse<Booking>>(
      `${this.apiUrl}/${publicId}/status`,
      null,
      { params }
    );
  }

  cancelBooking(publicId: string, reason?: string): Observable<ApiResponse<Booking>> {
    let params = new HttpParams();
    if (reason) {
      params = params.set('reason', reason);
    }
    return this.http.post<ApiResponse<Booking>>(
      `${this.apiUrl}/${publicId}/cancel`,
      null,
      { params }
    );
  }

  getUnavailableDates(listingPublicId: string): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(
      `${this.apiUrl}/listing/${listingPublicId}/unavailable-dates`
    );
  }

  confirmPayment(bookingPublicId: string): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(
      `${this.apiUrl}/${bookingPublicId}/confirm-payment`,
      null
    );
  }
}