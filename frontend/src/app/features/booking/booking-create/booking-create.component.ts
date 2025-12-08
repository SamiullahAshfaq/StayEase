import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { ListingService } from '../../listing/services/listing.service';
import { Listing } from '../../listing/models/listing.model';
import { BookingAddon } from '../models/booking.model';

@Component({
  selector: 'app-booking-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-create.component.html'
})
export class BookingCreateComponent implements OnInit {
  bookingForm!: FormGroup;
  listing: Listing | null = null;
  loading = false;
  error: string | null = null;

  // Booking details
  numberOfNights = 0;
  basePrice = 0;
  serviceFee = 0;
  totalPrice = 0;

  // Addons
  availableAddons: BookingAddon[] = [
    { name: 'Airport Pickup', description: 'Convenient pickup from airport', price: 50, quantity: 1 },
    { name: 'Early Check-in', description: 'Check in before 2 PM', price: 30, quantity: 1 },
    { name: 'Late Checkout', description: 'Check out after 11 AM', price: 35, quantity: 1 },
    { name: 'Extra Cleaning', description: 'Deep cleaning service', price: 40, quantity: 1 },
  ];
  selectedAddons: BookingAddon[] = [];

  unavailableDates: string[] = [];

  todayISO: string = new Date().toISOString().split('T')[0];

  get minCheckInDate(): string {
    return this.todayISO;
  }

  get minCheckOutDate(): string {
    return this.bookingForm?.get('checkIn')?.value || this.todayISO;
  }

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private listingService: ListingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadListingDetails();
    this.loadUnavailableDates();
  }

  initForm(): void {
    const params = this.route.snapshot.queryParams;
    
    this.bookingForm = this.fb.group({
      listingId: [params['listingId'] || '', Validators.required],
      checkIn: [params['checkIn'] || '', Validators.required],
      checkOut: [params['checkOut'] || '', Validators.required],
      guests: [params['guests'] || 1, [Validators.required, Validators.min(1)]],
      specialRequests: ['']
    });

    this.bookingForm.valueChanges.subscribe(() => {
      this.calculatePricing();
    });
  }

  loadListingDetails(): void {
    const listingId = this.bookingForm.get('listingId')?.value;
    if (listingId) {
      this.listingService.getListingById(listingId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.listing = response.data;
            this.calculatePricing();
          }
        },
        error: (error) => {
          this.error = 'Failed to load listing details';
          console.error('Error loading listing:', error);
        }
      });
    }
  }

  loadUnavailableDates(): void {
    const listingId = this.bookingForm.get('listingId')?.value;
    if (listingId) {
      this.bookingService.getUnavailableDates(listingId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.unavailableDates = response.data;
          }
        }
      });
    }
  }

  calculatePricing(): void {
    if (!this.listing) return;

    const checkIn = this.bookingForm.get('checkIn')?.value;
    const checkOut = this.bookingForm.get('checkOut')?.value;

    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      this.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      this.basePrice = this.listing.pricePerNight * this.numberOfNights;
      
      const addonsTotal = this.selectedAddons.reduce(
        (sum, addon) => sum + (addon.price * addon.quantity), 0
      );

      this.serviceFee = (this.basePrice + addonsTotal) * 0.14;
      this.totalPrice = this.basePrice + addonsTotal + this.serviceFee;
    }
  }

  toggleAddon(addon: BookingAddon): void {
    const index = this.selectedAddons.findIndex(a => a.name === addon.name);
    
    if (index > -1) {
      this.selectedAddons.splice(index, 1);
    } else {
      this.selectedAddons.push({ ...addon });
    }
    
    this.calculatePricing();
  }

  isAddonSelected(addon: BookingAddon): boolean {
    return this.selectedAddons.some(a => a.name === addon.name);
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      Object.keys(this.bookingForm.controls).forEach(key => {
        this.bookingForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = null;

    const bookingData = {
      listingPublicId: this.bookingForm.value.listingId,
      checkInDate: this.bookingForm.value.checkIn,
      checkOutDate: this.bookingForm.value.checkOut,
      numberOfGuests: this.bookingForm.value.guests,
      specialRequests: this.bookingForm.value.specialRequests,
      addons: this.selectedAddons.length > 0 ? this.selectedAddons : undefined
    };

    this.bookingService.createBooking(bookingData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.router.navigate(['/bookings', response.data.publicId]);
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to create booking. Please try again.';
        this.loading = false;
        console.error('Error creating booking:', error);
      }
    });
  }

  goBack(): void {
    if (this.listing) {
      this.router.navigate(['/listings', this.listing.publicId]);
    } else {
      this.router.navigate(['/']);
    }
  }
}