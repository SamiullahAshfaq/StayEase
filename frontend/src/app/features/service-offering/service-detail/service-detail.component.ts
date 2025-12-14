import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServiceOfferingService } from '../services/service-offering.service';
import { ServiceBookingService } from '../services/service-booking.service';
import {
  ServiceOffering,
  // ServiceImage,
  SERVICE_CATEGORY_LABELS,
  PRICING_TYPE_LABELS
} from '../models/service-offering.model';
import { CreateServiceBookingRequest } from '../models/service-booking.model';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './service-detail.component.html'
})
export class ServiceDetailComponent implements OnInit {
  private serviceOfferingService = inject(ServiceOfferingService);
  private serviceBookingService = inject(ServiceBookingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // State
  service = signal<ServiceOffering | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  isFavorite = signal(false);

  // Image gallery
  selectedImageIndex = signal(0);
  showGalleryModal = signal(false);

  // Booking modal
  showBookingModal = signal(false);
  bookingLoading = signal(false);
  bookingError = signal<string | null>(null);
  bookingSuccess = signal(false);

  // Booking form
  bookingForm = signal<CreateServiceBookingRequest>({
    servicePublicId: '',
    bookingDate: '',
    startTime: '',
    numberOfPeople: 1,
    numberOfItems: 1,
    specialRequests: '',
    customerPhone: '',
    customerEmail: ''
  });

  // Availability check
  availabilityChecking = signal(false);
  isAvailable = signal<boolean | null>(null);

  // Labels
  categoryLabels = SERVICE_CATEGORY_LABELS;
  pricingLabels = PRICING_TYPE_LABELS;

  ngOnInit() {
    const publicId = this.route.snapshot.paramMap.get('id');
    if (publicId) {
      this.loadService(publicId);
      this.trackView(publicId);
    } else {
      this.error.set('Service not found');
      this.loading.set(false);
    }
  }

  loadService(publicId: string) {
    this.loading.set(true);
    this.error.set(null);

    this.serviceOfferingService.getService(publicId).subscribe({
      next: (response) => {
        this.service.set(response.data);
        this.loading.set(false);

        // Initialize booking form
        this.bookingForm.update(form => ({
          ...form,
          servicePublicId: publicId
        }));
      },
      error: (err) => {
        console.error('Error loading service:', err);
        this.error.set('Failed to load service details. Please try again.');
        this.loading.set(false);
      }
    });
  }

  trackView(publicId: string) {
    this.serviceOfferingService.trackView(publicId).subscribe({
      next: () => console.log('View tracked'),
      error: (err) => console.error('Error tracking view:', err)
    });
  }

  /**
   * Image gallery
   */
  selectImage(index: number) {
    this.selectedImageIndex.set(index);
  }

  nextImage() {
    const service = this.service();
    if (service && service.images.length > 0) {
      const nextIndex = (this.selectedImageIndex() + 1) % service.images.length;
      this.selectedImageIndex.set(nextIndex);
    }
  }

  previousImage() {
    const service = this.service();
    if (service && service.images.length > 0) {
      const prevIndex = this.selectedImageIndex() === 0
        ? service.images.length - 1
        : this.selectedImageIndex() - 1;
      this.selectedImageIndex.set(prevIndex);
    }
  }

  openGallery(index: number) {
    this.selectedImageIndex.set(index);
    this.showGalleryModal.set(true);
  }

  closeGallery() {
    this.showGalleryModal.set(false);
  }

  /**
   * Favorites
   */
  toggleFavorite() {
    const service = this.service();
    if (!service) return;

    const currentFavorite = this.isFavorite();

    this.serviceOfferingService.toggleFavorite(service.publicId, !currentFavorite).subscribe({
      next: () => {
        this.isFavorite.set(!currentFavorite);
      },
      error: (err) => {
        console.error('Error toggling favorite:', err);
      }
    });
  }

  /**
   * Booking
   */
  openBookingModal() {
    this.showBookingModal.set(true);
    this.bookingError.set(null);
    this.bookingSuccess.set(false);
  }

  closeBookingModal() {
    this.showBookingModal.set(false);
    this.bookingForm.update(form => ({
      ...form,
      bookingDate: '',
      startTime: '',
      numberOfPeople: 1,
      numberOfItems: 1,
      specialRequests: '',
      customerPhone: '',
      customerEmail: ''
    }));
  }

  checkAvailability() {
    const form = this.bookingForm();
    if (!form.bookingDate || !form.startTime) {
      return;
    }

    this.availabilityChecking.set(true);

    this.serviceBookingService.checkAvailability(
      form.servicePublicId,
      form.bookingDate,
      form.startTime
    ).subscribe({
      next: (response) => {
        this.isAvailable.set(response.data);
        this.availabilityChecking.set(false);
      },
      error: (err) => {
        console.error('Error checking availability:', err);
        this.isAvailable.set(false);
        this.availabilityChecking.set(false);
      }
    });
  }

  submitBooking() {
    const form = this.bookingForm();
    const service = this.service();

    if (!service) return;

    // Validation
    if (!form.bookingDate || !form.startTime) {
      this.bookingError.set('Please select date and time');
      return;
    }

    if (!form.customerEmail || !form.customerPhone) {
      this.bookingError.set('Please fill in all customer details');
      return;
    }

    this.bookingLoading.set(true);
    this.bookingError.set(null);

    this.serviceBookingService.createBooking(form).subscribe({
      next: (response) => {
        this.bookingSuccess.set(true);
        this.bookingLoading.set(false);

        setTimeout(() => {
          this.closeBookingModal();
          this.router.navigate(['/bookings', response.data.publicId]);
        }, 2000);
      },
      error: (err) => {
        console.error('Error creating booking:', err);
        this.bookingError.set(err.error?.message || 'Failed to create booking. Please try again.');
        this.bookingLoading.set(false);
      }
    });
  }

  /**
   * Helper methods
   */
  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStarArray(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }

  calculateTotal(): number {
    const service = this.service();
    const form = this.bookingForm();

    if (!service) return 0;

    let total = service.finalPrice;

    // Multiply by people or items based on pricing type
    if (service.pricingType === 'PER_PERSON') {
      total *= form.numberOfPeople || 1;
    } else if (service.pricingType === 'PER_ITEM') {
      total *= form.numberOfItems || 1;
    }

    return total;
  }

  getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  shareService() {
    const service = this.service();
    if (!service) return;

    if (navigator.share) {
      navigator.share({
        title: service.title,
        text: service.description,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }

  reportService() {
    // TODO: Implement report functionality
    alert('Report functionality coming soon');
  }

  contactProvider() {
    const service = this.service();
    if (!service) return;

    // TODO: Implement contact provider functionality
    alert('Contact provider functionality coming soon');
  }

  // Form update methods for template bindings
  updateBookingDate(date: string) {
    this.bookingForm.update(f => ({ ...f, bookingDate: date }));
    this.checkAvailability();
  }

  updateStartTime(time: string) {
    this.bookingForm.update(f => ({ ...f, startTime: time }));
    this.checkAvailability();
  }

  updateNumberOfPeople(count: number) {
    this.bookingForm.update(f => ({ ...f, numberOfPeople: count }));
  }

  updateNumberOfItems(count: number) {
    this.bookingForm.update(f => ({ ...f, numberOfItems: count }));
  }

  updateCustomerEmail(email: string) {
    this.bookingForm.update(f => ({ ...f, customerEmail: email }));
  }

  updateCustomerPhone(phone: string) {
    this.bookingForm.update(f => ({ ...f, customerPhone: phone }));
  }

  updateSpecialRequests(requests: string) {
    this.bookingForm.update(f => ({ ...f, specialRequests: requests }));
  }
}
