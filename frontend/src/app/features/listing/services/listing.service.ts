import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Listing,
  CreateListing,
  UpdateListing,
  SearchListingParams,
  ListingPage,
  ListingStatus
} from '../models/listing.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private apiUrl = `${environment.apiUrl}/listings`;

  constructor(private http: HttpClient) {}

  createListing(listing: CreateListing): Observable<ApiResponse<Listing>> {
    return this.http.post<ApiResponse<Listing>>(this.apiUrl, listing);
  }

  getListingById(publicId: string): Observable<ApiResponse<Listing>> {
    return this.http.get<ApiResponse<Listing>>(`${this.apiUrl}/${publicId}`);
  }

  getAllListings(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'createdAt',
    sortDirection: string = 'DESC'
  ): Observable<ApiResponse<ListingPage>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<ApiResponse<ListingPage>>(this.apiUrl, { params });
  }

  searchListings(searchParams: SearchListingParams): Observable<ApiResponse<ListingPage>> {
    return this.http.post<ApiResponse<ListingPage>>(`${this.apiUrl}/search`, searchParams);
  }

  getListingsByCategory(
    category: string,
    page: number = 0,
    size: number = 20
  ): Observable<ApiResponse<ListingPage>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<ListingPage>>(
      `${this.apiUrl}/category/${category}`,
      { params }
    );
  }

  getListingsByLandlord(landlordPublicId: string): Observable<ApiResponse<Listing[]>> {
    return this.http.get<ApiResponse<Listing[]>>(
      `${this.apiUrl}/landlord/${landlordPublicId}`
    );
  }

  getMyListings(): Observable<ApiResponse<Listing[]>> {
    return this.http.get<ApiResponse<Listing[]>>(`${this.apiUrl}/my-listings`);
  }

  updateListing(publicId: string, listing: UpdateListing): Observable<ApiResponse<Listing>> {
    return this.http.put<ApiResponse<Listing>>(`${this.apiUrl}/${publicId}`, listing);
  }

  updateListingStatus(
    publicId: string,
    status: ListingStatus
  ): Observable<ApiResponse<Listing>> {
    let params = new HttpParams().set('status', status);
    return this.http.patch<ApiResponse<Listing>>(
      `${this.apiUrl}/${publicId}/status`,
      null,
      { params }
    );
  }

  deleteListing(publicId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${publicId}`);
  }
}
