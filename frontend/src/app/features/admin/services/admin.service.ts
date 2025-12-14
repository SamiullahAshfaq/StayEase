import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  AdminAction, 
  AuditLog, 
  PageResponse, 
  ApiResponse, 
  ListingManagement, 
  UserManagement, 
  BookingManagement 
} from './admin.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  // ==================== LISTING MANAGEMENT ====================
  
  getListings(page: number = 0, size: number = 20, status?: string, search?: string): Observable<ApiResponse<PageResponse<ListingManagement>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (status) {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get<ApiResponse<PageResponse<ListingManagement>>>(
      `${this.apiUrl}/listings`,
      { params }
    );
  }

  approveListing(listingId: string, reason: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/listings/${listingId}/approve`,
      { reason }
    );
  }

  rejectListing(listingId: string, reason: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/listings/${listingId}/reject`,
      { reason }
    );
  }

  featureListing(listingId: string, reason: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/listings/${listingId}/feature`,
      { reason }
    );
  }

  unfeatureListing(listingId: string, reason: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/listings/${listingId}/unfeature`,
      { reason }
    );
  }

  // ==================== USER MANAGEMENT ====================
  
  getUsers(page: number = 0, size: number = 20, role?: string, status?: string, search?: string): Observable<ApiResponse<PageResponse<UserManagement>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (role) {
      params = params.set('role', role);
    }
    if (status) {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get<ApiResponse<PageResponse<UserManagement>>>(
      `${this.apiUrl}/users`,
      { params }
    );
  }

  suspendUser(userId: string, reason: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/users/${userId}/suspend`,
      { reason }
    );
  }

  reactivateUser(userId: string, reason: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/users/${userId}/reactivate`,
      { reason }
    );
  }

  // ==================== BOOKING MANAGEMENT ====================
  
  getBookings(page: number = 0, size: number = 20, status?: string, search?: string): Observable<ApiResponse<PageResponse<BookingManagement>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (status) {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get<ApiResponse<PageResponse<BookingManagement>>>(
      `${this.apiUrl}/bookings`,
      { params }
    );
  }

  cancelBooking(bookingId: string, reason: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/bookings/${bookingId}/cancel`,
      { reason }
    );
  }

  // ==================== ADMIN ACTIONS ====================
  
  getAllAdminActions(page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<AdminAction>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<PageResponse<AdminAction>>>(
      `${this.apiUrl}/actions`,
      { params }
    );
  }

  getAdminActionsByAdmin(adminId: string, page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<AdminAction>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<PageResponse<AdminAction>>>(
      `${this.apiUrl}/actions/admin/${adminId}`,
      { params }
    );
  }

  getAdminActionsByType(actionType: string, page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<AdminAction>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<PageResponse<AdminAction>>>(
      `${this.apiUrl}/actions/type/${actionType}`,
      { params }
    );
  }

  getAdminActionsForTarget(targetEntity: string, targetId: string): Observable<ApiResponse<AdminAction[]>> {
    return this.http.get<ApiResponse<AdminAction[]>>(
      `${this.apiUrl}/actions/target/${targetEntity}/${targetId}`
    );
  }

  // ==================== AUDIT LOGS ====================
  
  getAllAuditLogs(page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<AuditLog>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<PageResponse<AuditLog>>>(
      `${this.apiUrl}/audit-logs`,
      { params }
    );
  }

  getAuditLogsByActor(actorId: string, page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<AuditLog>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<PageResponse<AuditLog>>>(
      `${this.apiUrl}/audit-logs/actor/${actorId}`,
      { params }
    );
  }

  getAuditLogsByAction(action: string, page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<AuditLog>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<PageResponse<AuditLog>>>(
      `${this.apiUrl}/audit-logs/action/${action}`,
      { params }
    );
  }

  getAuditLogsByDateRange(startDate: string, endDate: string, page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<AuditLog>>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<PageResponse<AuditLog>>>(
      `${this.apiUrl}/audit-logs/date-range`,
      { params }
    );
  }

  searchAuditLogs(target: string, page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<AuditLog>>> {
    const params = new HttpParams()
      .set('target', target)
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<PageResponse<AuditLog>>>(
      `${this.apiUrl}/audit-logs/search`,
      { params }
    );
  }

  getRecentAuditLogs(): Observable<ApiResponse<AuditLog[]>> {
    return this.http.get<ApiResponse<AuditLog[]>>(
      `${this.apiUrl}/audit-logs/recent`
    );
  }
}
