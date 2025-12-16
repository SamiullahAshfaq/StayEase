import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServiceOfferingService } from '../services/service-offering.service';
import { ServiceBookingService } from '../services/service-booking.service';
import {
  ServiceOffering,
  SERVICE_CATEGORY_LABELS,
  PRICING_TYPE_LABELS
} from '../models/service-offering.model';

interface BookingForm {
  servicePublicId: string;
  bookingDate: string;
  startTime: string;
  numberOfPeople: number;
  numberOfItems: number;
  customerEmail: string;
  customerPhone: string;
  specialRequests: string;
}

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.css']
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

  // Booking
  showBookingModal = signal(false);
  bookingForm = signal<BookingForm>({
    servicePublicId: '',
    bookingDate: '',
    startTime: '',
    numberOfPeople: 1,
    numberOfItems: 1,
    customerEmail: '',
    customerPhone: '',
    specialRequests: ''
  });
  bookingLoading = signal(false);
  bookingError = signal<string | null>(null);
  bookingSuccess = signal(false);
  availabilityChecking = signal(false);
  isAvailable = signal<boolean | null>(null);

  // Labels
  categoryLabels = SERVICE_CATEGORY_LABELS;
  pricingLabels = PRICING_TYPE_LABELS;

  ngOnInit() {
    const publicId = this.route.snapshot.paramMap.get('id');
    if (publicId) {
      this.loadService(publicId);
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
        this.bookingForm.update(f => ({ ...f, servicePublicId: response.data.publicId }));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading service:', err);
        this.error.set('Failed to load service details. Please try again.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Image gallery methods
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

    // TODO: Implement toggleFavorite in ServiceOfferingService or make proper API call here
    // For now, just toggle the local state as a placeholder
    const currentFavorite = this.isFavorite();
    this.isFavorite.set(!currentFavorite);
    // Optionally, show a message or log that this is a frontend-only toggle
    console.warn('toggleFavorite is not implemented in the frontend service.');
  }

  /**
   * Booking methods
   */
  openBookingModal() {
    this.showBookingModal.set(true);
    this.bookingError.set(null);
    this.bookingSuccess.set(false);
    this.isAvailable.set(null);
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
    this.isAvailable.set(null);
  }

  checkAvailability() {
    const form = this.bookingForm();
    if (!form.bookingDate || !form.startTime) {
      this.isAvailable.set(null);
      return;
    }

    this.availabilityChecking.set(true);
    this.isAvailable.set(null);

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

    if (this.isAvailable() === false) {
      this.bookingError.set('This time slot is not available');
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
   * Form update methods for template bindings
   */
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

  /**
   * Additional actions
   */
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
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  }

  reportService() {
    alert('Report functionality coming soon');
  }

  contactProvider() {
    const service = this.service();
    if (!service) return;
    alert('Contact provider functionality coming soon');
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

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${mins} minutes`;
    }
  }
}
