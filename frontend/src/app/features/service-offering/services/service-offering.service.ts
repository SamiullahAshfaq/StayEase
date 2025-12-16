import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ServiceOffering,
  CreateServiceOfferingRequest,
  UpdateServiceOfferingRequest,
  ServiceFilter,
  ServiceListResponse,
  ApiResponse,
  ServiceCategory
} from '../models/service-offering.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceOfferingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/service-offerings`;

  /**
   * Create a new service offering
   */
  createService(request: CreateServiceOfferingRequest): Observable<ApiResponse<ServiceOffering>> {
    return this.http.post<ApiResponse<ServiceOffering>>(this.apiUrl, request);
  }

  /**
   * Get service by public ID
   */
  getService(publicId: string): Observable<ApiResponse<ServiceOffering>> {
    return this.http.get<ApiResponse<ServiceOffering>>(`${this.apiUrl}/${publicId}`);
  }

  /**
   * Update service offering
   */
  updateService(publicId: string, request: UpdateServiceOfferingRequest): Observable<ApiResponse<ServiceOffering>> {
    return this.http.put<ApiResponse<ServiceOffering>>(`${this.apiUrl}/${publicId}`, request);
  }

  /**
   * Delete service offering
   */
  deleteService(publicId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${publicId}`);
  }

  /**
   * Get all active services with pagination
   */
  getAllActiveServices(page = 0, size = 20, sortBy = 'averageRating', sortDirection = 'DESC'): Observable<ApiResponse<ServiceListResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<ApiResponse<ServiceListResponse>>(this.apiUrl, { params });
  }

  /**
   * Search services with filters
   */
  searchServices(filter: ServiceFilter = {}): Observable<ApiResponse<ServiceListResponse>> {
    let params = new HttpParams();

    if (filter.category) params = params.set('category', filter.category);
    if (filter.city) params = params.set('city', filter.city);
    if (filter.keyword) params = params.set('keyword', filter.keyword);
    if (filter.minRating !== undefined) params = params.set('minRating', filter.minRating.toString());
    // if (typeof filter.mobileServiceOnly === 'boolean') {
    //   params = params.set('mobileServiceOnly', filter.mobileServiceOnly.toString());
    // }
    if (filter.isInstantBooking) params = params.set('instantBookingOnly', filter.isInstantBooking.toString());
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);
    if (filter.page !== undefined) params = params.set('page', filter.page.toString());
    if (filter.size) params = params.set('size', filter.size.toString());

    return this.http.get<ApiResponse<ServiceListResponse>>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get services by category
   */
  getServicesByCategory(category: ServiceCategory, page = 0, size = 20): Observable<ApiResponse<ServiceListResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<ServiceListResponse>>(`${this.apiUrl}/category/${category}`, { params });
  }

  /**
   * Get featured services
   */
  getFeaturedServices(): Observable<ApiResponse<ServiceOffering[]>> {
    return this.http.get<ApiResponse<ServiceOffering[]>>(`${this.apiUrl}/featured`);
  }

  /**
   * Get my services (provider)
   */
  getMyServices(): Observable<ApiResponse<ServiceOffering[]>> {
    return this.http.get<ApiResponse<ServiceOffering[]>>(`${this.apiUrl}/my-services`);
  }

  /**
   * Get services by specific provider
   */
  getServicesByProvider(providerPublicId: string): Observable<ApiResponse<ServiceOffering[]>> {
    return this.http.get<ApiResponse<ServiceOffering[]>>(`${this.apiUrl}/provider/${providerPublicId}`);
  }

  /**
   * Update service status
   */
  updateServiceStatus(publicId: string, status: string): Observable<ApiResponse<ServiceOffering>> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<ApiResponse<ServiceOffering>>(`${this.apiUrl}/${publicId}/status`, {}, { params });
  }

  /**
   * Approve service (admin only)
   */
  approveService(publicId: string): Observable<ApiResponse<ServiceOffering>> {
    return this.http.post<ApiResponse<ServiceOffering>>(`${this.apiUrl}/${publicId}/approve`, {});
  }

  /**
   * Reject service (admin only)
   */
  rejectService(publicId: string, reason: string): Observable<ApiResponse<ServiceOffering>> {
    const params = new HttpParams().set('reason', reason);
    return this.http.post<ApiResponse<ServiceOffering>>(`${this.apiUrl}/${publicId}/reject`, {}, { params });
  }

  /**
   * Toggle featured status (admin only)
   */
  toggleFeature(publicId: string, featured: boolean): Observable<ApiResponse<ServiceOffering>> {
    const params = new HttpParams().set('featured', featured.toString());
    return this.http.post<ApiResponse<ServiceOffering>>(`${this.apiUrl}/${publicId}/feature`, {}, { params });
  }
}
