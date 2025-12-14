import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../auth/auth.service';
import { ApiResponse } from '../models/api-response.model';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  bio?: string;
  language?: string;
  currency?: string;
  profileImageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;
  private http = inject(HttpClient);

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(this.apiUrl);
  }

  updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(this.apiUrl, data);
  }

  uploadProfileImage(file: File): Observable<ApiResponse<{ imageUrl: string }>> {
    // For now, convert to base64 and send as JSON
    // TODO: Implement proper multipart/form-data upload when backend supports it
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        this.http.post<ApiResponse<{ imageUrl: string }>>(
          `${this.apiUrl}/image`,
          { imageUrl }
        ).subscribe({
          next: (response) => observer.next(response),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      };
      reader.onerror = (error) => observer.error(error);
      reader.readAsDataURL(file);
    });
  }

  deleteProfileImage(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/image`);
  }
}
