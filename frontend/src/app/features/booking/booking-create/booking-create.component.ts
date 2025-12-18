import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { ListingService } from '../../listing/services/listing.service';
import { Listing } from '../../listing/models/listing.model';
import { BookingAddon } from '../models/booking.model';
import { ServiceOfferingService } from '../../service-offering/services/service-offering.service';
import { ServiceCategory } from '../../service-offering/models/service-offering.model';

@Component({
  selector: 'app-booking-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './booking-create.component.html'
})
export class BookingCreateComponent implements OnInit {
  bookingForm!: FormGroup;
  listing: Listing | null = null;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

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

  /**
   * Using constructor injection instead of inject() for stability.
   * Constructor injection is more reliable for components with:
   * - FormBuilder and reactive forms
   * - Route parameter handling
   * - Multiple service dependencies
   * This prevents "Cannot read properties of undefined" errors during initialization.
   */
  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private listingService: ListingService,
    private serviceOfferingService: ServiceOfferingService,
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

    // Calculate pricing on init if dates are already set
    if (params['checkIn'] && params['checkOut']) {
      setTimeout(() => this.calculatePricing(), 100);
    }
  }

  loadListingDetails(): void {
    const listingId = this.bookingForm.get('listingId')?.value;
    if (listingId) {
      this.listingService.getListingById(listingId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.listing = response.data;
            this.calculatePricing();
            this.loadAddonServices();
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

  loadAddonServices(): void {
    if (!this.listing?.city) return;

    const addonCategories: ServiceCategory[] = [
      ServiceCategory.AIRPORT_TRANSFER,
      ServiceCategory.HOUSE_CLEANING,
      ServiceCategory.CAR_RENTAL,
      ServiceCategory.GROCERY_DELIVERY
    ];

    this.serviceOfferingService.getAddonServices(this.listing.city, addonCategories).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.availableAddons = response.data.map(service => ({
            name: service.title,
            description: service.description || service.highlights || 'Additional service',
            price: service.basePrice,
            quantity: 1
          }));
        }
      },
      error: (error) => {
        console.error('Error loading addon services:', error);
        // Keep the default hardcoded addons as fallback
      }
    });
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

      this.basePrice = this.listing.basePrice * this.numberOfNights;

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
          const bookingId = response.data.publicId;

          // Immediately confirm the payment
          this.bookingService.confirmPayment(bookingId).subscribe({
            next: () => {
              this.successMessage = '🎉 Booking confirmed successfully! Redirecting to your bookings...';
              this.error = null;
              this.loading = false;

              // Wait 2 seconds to show success message, then redirect
              setTimeout(() => {
                this.router.navigate(['/booking/list']);
              }, 2000);
            },
            error: (confirmError) => {
              this.error = 'Booking created but payment confirmation failed. Please contact support.';
              this.loading = false;
              console.error('Error confirming payment:', confirmError);
            }
          });
        } else {
          // Handle unexpected response format
          this.error = 'Unexpected response from server. Please try again.';
          this.loading = false;
          console.error('Invalid response:', response);
        }
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to create booking. Please try again.';
        this.successMessage = null;
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

  getImageUrl(imagePath: string): string {
    return ImageUrlHelper.getFullImageUrl(imagePath);
  }
}
