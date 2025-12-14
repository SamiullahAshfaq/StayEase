import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ServiceOffering,
  CreateServiceOfferingRequest,
  ServiceFilter,
  ServiceListResponse,
  ApiResponse
} from '../models/service-offering.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceOfferingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/services`;

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
  updateService(publicId: string, request: Partial<CreateServiceOfferingRequest>): Observable<ApiResponse<ServiceOffering>> {
    return this.http.patch<ApiResponse<ServiceOffering>>(`${this.apiUrl}/${publicId}`, request);
  }

  /**
   * Delete service offering
   */
  deleteService(publicId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${publicId}`);
  }

  /**
   * Get services with filters
   */
  getServices(filter: ServiceFilter = {}): Observable<ApiResponse<ServiceListResponse>> {
    let params = new HttpParams();
    
    if (filter.category) params = params.set('category', filter.category);
    if (filter.city) params = params.set('city', filter.city);
    if (filter.country) params = params.set('country', filter.country);
    if (filter.keyword) params = params.set('keyword', filter.keyword);
    if (filter.minPrice) params = params.set('minPrice', filter.minPrice.toString());
    if (filter.maxPrice) params = params.set('maxPrice', filter.maxPrice.toString());
    if (filter.minRating) params = params.set('minRating', filter.minRating.toString());
    if (filter.isFeatured !== undefined) params = params.set('isFeatured', filter.isFeatured.toString());
    if (filter.providesMobileService !== undefined) params = params.set('providesMobileService', filter.providesMobileService.toString());
    if (filter.isInstantBooking !== undefined) params = params.set('isInstantBooking', filter.isInstantBooking.toString());
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);
    if (filter.page !== undefined) params = params.set('page', filter.page.toString());
    if (filter.size) params = params.set('size', filter.size.toString());

    return this.http.get<ApiResponse<ServiceListResponse>>(this.apiUrl, { params });
  }

  /**
   * Get featured services
   */
  getFeaturedServices(page: number = 0, size: number = 12): Observable<ApiResponse<ServiceListResponse>> {
    return this.getServices({ isFeatured: true, page, size, sortBy: 'averageRating', sortDirection: 'desc' });
  }

  /**
   * Get services by category
   */
  getServicesByCategory(category: string, page: number = 0, size: number = 12): Observable<ApiResponse<ServiceListResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<ServiceListResponse>>(`${this.apiUrl}/category/${category}`, { params });
  }

  /**
   * Search services
   */
  searchServices(keyword: string, page: number = 0, size: number = 12): Observable<ApiResponse<ServiceListResponse>> {
    return this.getServices({ keyword, page, size });
  }

  /**
   * Get my services (provider)
   */
  getMyServices(page: number = 0, size: number = 10): Observable<ApiResponse<ServiceListResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<ServiceListResponse>>(`${this.apiUrl}/my-services`, { params });
  }

  /**
   * Track view
   */
  trackView(publicId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${publicId}/view`, {});
  }

  /**
   * Toggle favorite
   */
  toggleFavorite(publicId: string, isFavorite: boolean): Observable<ApiResponse<void>> {
    if (isFavorite) {
      return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${publicId}/favorite`, {});
    } else {
      return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${publicId}/favorite`);
    }
  }

  /**
   * Activate/Deactivate service
   */
  toggleActive(publicId: string, isActive: boolean): Observable<ApiResponse<ServiceOffering>> {
    const action = isActive ? 'activate' : 'deactivate';
    return this.http.post<ApiResponse<ServiceOffering>>(`${this.apiUrl}/${publicId}/${action}`, {});
  }

  /**
   * Feature service (admin/provider)
   */
  toggleFeature(publicId: string, isFeatured: boolean): Observable<ApiResponse<ServiceOffering>> {
    return this.http.post<ApiResponse<ServiceOffering>>(`${this.apiUrl}/${publicId}/feature`, { isFeatured });
  }

  /**
   * Get statistics
   */
  getStatistics(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/statistics`);
  }
}
