import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  Booking,
  CreateBookingRequest,
  BookingPage,
  BookingStatus,
  PaymentStatus
} from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class MockBookingService {
  
  // Default mock bookings data
  private defaultBookings: Booking[] = [
    {
      publicId: 'bkg-001',
      listingPublicId: 'lst-001',
      listingTitle: 'Luxury Beachfront Villa',
      listingCoverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop',
      guestPublicId: 'user-001',
      landlordPublicId: 'landlord-001',
      checkInDate: '2025-12-15',
      checkOutDate: '2025-12-20',
      numberOfGuests: 4,
      numberOfNights: 5,
      totalPrice: 1750,
      currency: 'USD',
      bookingStatus: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      specialRequests: 'Late check-in around 10 PM. Need parking for 2 cars.',
      createdAt: '2024-12-01T10:30:00',
      updatedAt: '2024-12-01T10:30:00'
    },
    {
      publicId: 'bkg-002',
      listingPublicId: 'lst-005',
      listingTitle: 'Eiffel Tower View Apartment',
      listingCoverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=800&fit=crop',
      guestPublicId: 'user-001',
      landlordPublicId: 'landlord-002',
      checkInDate: '2026-02-10',
      checkOutDate: '2026-02-17',
      numberOfGuests: 2,
      numberOfNights: 7,
      totalPrice: 1540,
      currency: 'USD',
      bookingStatus: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      specialRequests: 'Anniversary trip! Would love some champagne and roses if possible.',
      createdAt: '2024-12-05T14:15:00',
      updatedAt: '2024-12-05T14:15:00'
    },
    {
      publicId: 'bkg-003',
      listingPublicId: 'lst-011',
      listingTitle: 'Geodesic Dome in Desert',
      listingCoverImage: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=1200&h=800&fit=crop',
      guestPublicId: 'user-001',
      landlordPublicId: 'landlord-003',
      checkInDate: '2024-11-20',
      checkOutDate: '2024-11-25',
      numberOfGuests: 3,
      numberOfNights: 5,
      totalPrice: 900,
      currency: 'USD',
      bookingStatus: BookingStatus.CHECKED_OUT,
      paymentStatus: PaymentStatus.PAID,
      createdAt: '2024-11-10T09:00:00',
      updatedAt: '2024-11-25T11:00:00'
    },
    {
      publicId: 'bkg-004',
      listingPublicId: 'lst-015',
      listingTitle: 'Beverly Hills Mansion',
      listingCoverImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&h=800&fit=crop',
      guestPublicId: 'user-001',
      landlordPublicId: 'landlord-004',
      checkInDate: '2024-10-05',
      checkOutDate: '2024-10-10',
      numberOfGuests: 8,
      numberOfNights: 5,
      totalPrice: 6000,
      currency: 'USD',
      bookingStatus: BookingStatus.CHECKED_OUT,
      paymentStatus: PaymentStatus.PAID,
      specialRequests: 'Corporate retreat. Need projector and meeting room setup.',
      createdAt: '2024-09-20T16:45:00',
      updatedAt: '2024-10-10T12:00:00'
    },
    {
      publicId: 'bkg-005',
      listingPublicId: 'lst-020',
      listingTitle: 'Phuket Pool Villa with Waterfall',
      listingCoverImage: 'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=1200&h=800&fit=crop',
      guestPublicId: 'user-001',
      landlordPublicId: 'landlord-005',
      checkInDate: '2024-08-15',
      checkOutDate: '2024-08-22',
      numberOfGuests: 6,
      numberOfNights: 7,
      totalPrice: 3150,
      currency: 'USD',
      bookingStatus: BookingStatus.CANCELLED,
      paymentStatus: PaymentStatus.REFUNDED,
      specialRequests: 'Family vacation with elderly parents. Need accessible rooms.',
      cancellationReason: 'Change of travel plans due to family emergency',
      createdAt: '2024-07-10T11:20:00',
      updatedAt: '2024-07-25T10:00:00'
    },
    {
      publicId: 'bkg-006',
      listingPublicId: 'lst-032',
      listingTitle: 'Monaco Waterfront Penthouse',
      listingCoverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&fit=crop',
      guestPublicId: 'user-001',
      landlordPublicId: 'landlord-006',
      checkInDate: '2025-12-20',
      checkOutDate: '2025-12-27',
      numberOfGuests: 2,
      numberOfNights: 7,
      totalPrice: 12600,
      currency: 'USD',
      bookingStatus: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      specialRequests: 'Honeymoon! Please arrange romantic dinner on terrace.',
      createdAt: '2024-12-08T18:30:00',
      updatedAt: '2024-12-08T18:30:00'
    }
  ];

  constructor() {
    console.log('MockBookingService constructor called');
    console.log('Window type:', typeof window);
    console.log('LocalStorage type:', typeof localStorage);
    
    // Initialize bookings in localStorage if not present
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const existing = this.loadBookingsFromStorage();
      console.log('Existing bookings in localStorage:', existing ? existing.length : 'none');
      
      if (!existing) {
        console.log('Initializing localStorage with', this.defaultBookings.length, 'default bookings');
        localStorage.setItem('mock_bookings', JSON.stringify(this.defaultBookings));
        console.log('Default bookings saved to localStorage');
      }
    } else {
      console.warn('localStorage not available - running in SSR mode');
    }
  }

  /**
   * Get current bookings (always fresh from localStorage)
   */
  private getBookings(): Booking[] {
    console.log('getBookings() called');
    const stored = this.loadBookingsFromStorage();
    console.log('Loaded from storage:', stored ? stored.length + ' bookings' : 'null');
    
    if (!stored) {
      console.log('Using default bookings:', this.defaultBookings.length);
      return this.defaultBookings;
    }
    
    console.log('Returning stored bookings');
    return stored;
  }

  /**
   * Load bookings from localStorage
   */
  private loadBookingsFromStorage(): Booking[] | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }
    
    const stored = localStorage.getItem('mock_bookings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing bookings from localStorage', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Save bookings to localStorage
   */
  private saveBookingsToStorage(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const bookings = this.getBookings();
      localStorage.setItem('mock_bookings', JSON.stringify(bookings));
    }
  }

  getMyBookings(page: number = 0, size: number = 20): Observable<ApiResponse<BookingPage>> {
    console.log('MockBookingService: Getting bookings, page:', page, 'size:', size);
    
    const bookings = this.getBookings();
    console.log('Total bookings retrieved:', bookings.length);
    
    const content = bookings.slice(page * size, (page + 1) * size);
    console.log('Returning page content:', content.length, 'bookings');
    
    // Simulate API delay (reduced to 100ms for better UX)
    return of({
      success: true,
      message: 'Bookings retrieved successfully',
      timestamp: new Date().toISOString(),
      data: {
        content: content,
        totalElements: bookings.length,
        totalPages: Math.ceil(bookings.length / size),
        size: size,
        number: page,
        first: page === 0,
        last: page === Math.ceil(bookings.length / size) - 1,
        empty: bookings.length === 0
      }
    }).pipe(delay(100));
  }

  getBookingById(publicId: string): Observable<ApiResponse<Booking>> {
    const bookings = this.getBookings();
    const booking = bookings.find((b: Booking) => b.publicId === publicId);
    
    return of({
      success: !!booking,
      message: booking ? 'Booking found' : 'Booking not found',
      timestamp: new Date().toISOString(),
      data: booking || null as any
    }).pipe(delay(300));
  }

  cancelBooking(publicId: string, reason?: string): Observable<ApiResponse<Booking>> {
    const bookings = this.getBookings();
    const booking = bookings.find((b: Booking) => b.publicId === publicId);
    
    if (booking) {
      booking.bookingStatus = BookingStatus.CANCELLED;
      booking.paymentStatus = PaymentStatus.REFUNDED;
      booking.cancellationReason = reason;
      booking.updatedAt = new Date().toISOString();
      
      // Save updated bookings to localStorage
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('mock_bookings', JSON.stringify(bookings));
      }
    }
    
    return of({
      success: !!booking,
      message: booking ? 'Booking cancelled successfully' : 'Booking not found',
      timestamp: new Date().toISOString(),
      data: booking || null as any
    }).pipe(delay(800));
  }

  createBooking(data: CreateBookingRequest): Observable<ApiResponse<Booking>> {
    const nights = Math.ceil((new Date(data.checkOutDate).getTime() - new Date(data.checkInDate).getTime()) / (1000 * 60 * 60 * 24));
    
    // Fetch listing details to get the actual title
    let listingTitle = 'New Booking';
    let listingImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop';
    
    // Try to get listing info from listingService (simulate API call with mock data)
    const mockListings: any = {
      'lst-001': { title: 'Luxury Beachfront Villa', imageUrl: '/images/listings/listing-1.jpg' },
      'lst-002': { title: 'Eiffel Tower View Apartment', imageUrl: '/images/listings/listing-2.jpg' },
      'lst-003': { title: 'Tokyo Modern Loft', imageUrl: '/images/listings/listing-3.jpg' },
      'lst-004': { title: 'New York Penthouse', imageUrl: '/images/listings/listing-4.jpg' },
      'lst-005': { title: 'Santorini Cave House', imageUrl: '/images/listings/listing-5.jpg' }
    };
    
    if (mockListings[data.listingPublicId]) {
      listingTitle = mockListings[data.listingPublicId].title;
      listingImage = mockListings[data.listingPublicId].imageUrl;
    }
    
    const newBooking: Booking = {
      publicId: `bkg-${Date.now()}`,
      listingPublicId: data.listingPublicId,
      listingTitle: listingTitle,
      listingCoverImage: listingImage,
      guestPublicId: 'user-001',
      landlordPublicId: 'landlord-001',
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      numberOfGuests: data.numberOfGuests,
      numberOfNights: nights,
      totalPrice: nights * 200,
      currency: 'USD',
      bookingStatus: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      specialRequests: data.specialRequests,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Get current bookings and add new one
    const bookings = this.getBookings();
    bookings.unshift(newBooking);
    
    // Save to localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('mock_bookings', JSON.stringify(bookings));
    }

    return of({
      success: true,
      message: 'Booking created successfully',
      timestamp: new Date().toISOString(),
      data: newBooking
    }).pipe(delay(1000));
  }

  updateBookingStatus(publicId: string, status: BookingStatus): Observable<ApiResponse<Booking>> {
    const bookings = this.getBookings();
    const booking = bookings.find((b: Booking) => b.publicId === publicId);
    
    if (booking) {
      booking.bookingStatus = status;
      booking.updatedAt = new Date().toISOString();
      
      // Save to localStorage
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('mock_bookings', JSON.stringify(bookings));
      }
    }
    
    return of({
      success: !!booking,
      message: booking ? 'Booking status updated' : 'Booking not found',
      timestamp: new Date().toISOString(),
      data: booking || null as any
    }).pipe(delay(500));
  }

  getBookingsByListing(listingPublicId: string): Observable<ApiResponse<Booking[]>> {
    const bookings = this.getBookings();
    const filtered = bookings.filter((b: Booking) => b.listingPublicId === listingPublicId);
    
    return of({
      success: true,
      message: `Found ${filtered.length} bookings`,
      timestamp: new Date().toISOString(),
      data: filtered
    }).pipe(delay(400));
  }

  getUnavailableDates(listingPublicId: string): Observable<ApiResponse<string[]>> {
    const bookings = this.getBookings();
    const filtered = bookings.filter(
      (b: Booking) => b.listingPublicId === listingPublicId && 
      b.bookingStatus !== BookingStatus.CANCELLED
    );

    const unavailableDates: string[] = [];
    filtered.forEach((booking: Booking) => {
      const start = new Date(booking.checkInDate);
      const end = new Date(booking.checkOutDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        unavailableDates.push(d.toISOString().split('T')[0]);
      }
    });

    return of({
      success: true,
      message: 'Unavailable dates retrieved',
      timestamp: new Date().toISOString(),
      data: unavailableDates
    }).pipe(delay(300));
  }
}
