import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Listing } from '../../features/listing/models/listing.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/favorites`;

  addToFavorites(listingId: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${listingId}`, {}).pipe(
      map(() => undefined)
    );
  }

  removeFromFavorites(listingId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${listingId}`).pipe(
      map(() => undefined)
    );
  }

  getUserFavorites(): Observable<Listing[]> {
    return this.http.get<ApiResponse<Listing[]>>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  isFavorite(listingId: string): Observable<boolean> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/${listingId}/status`).pipe(
      map(response => response.data)
    );
  }

  toggleFavorite(listingId: string, currentStatus: boolean): Observable<void> {
    return currentStatus 
      ? this.removeFromFavorites(listingId)
      : this.addToFavorites(listingId);
  }
}
