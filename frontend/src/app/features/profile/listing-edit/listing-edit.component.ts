import { Component, OnInit, signal, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LandlordService } from '../services/landlord.service';
import {
  Listing,
  PropertyType,
  RoomType,
  PROPERTY_TYPE_LABELS,
  ROOM_TYPE_LABELS
} from '../models/landlord.model';

interface ListingFormData {
  propertyType: PropertyType | null;
  roomType: RoomType | null;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  images: File[];
  imagePreviewUrls: string[];
  existingImages: { id: number; url: string }[]; // Changed from imageUrl to url
  title: string;
  description: string;
  houseRules: string;
  basePrice: number;
  cleaningFee: number;
  securityDeposit: number;
  weekendPrice: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
  checkInTime: string;
  checkOutTime: string;
  minNights: number;
  maxNights: number;
  isInstantBooking: boolean;
}

@Component({
  selector: 'app-listing-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './listing-edit.component.html',
  styleUrl: './listing-edit.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ListingEditComponent implements OnInit {
  private landlordService = inject(LandlordService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // State
  listingId = signal<string>('');
  currentStep = signal(1);
  totalSteps = 7;
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  // Form Data
  formData = signal<ListingFormData>({
    propertyType: null,
    roomType: null,
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    maxGuests: 2,
    amenities: [],
    images: [],
    imagePreviewUrls: [],
    existingImages: [],
    title: '',
    description: '',
    houseRules: '',
    basePrice: 0,
    cleaningFee: 0,
    securityDeposit: 0,
    weekendPrice: 0,
    weeklyDiscount: 0,
    monthlyDiscount: 0,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    minNights: 1,
    maxNights: 30,
    isInstantBooking: false
  });

  // Enums
  PropertyType = PropertyType;
  RoomType = RoomType;
  propertyTypeLabels = PROPERTY_TYPE_LABELS;
  roomTypeLabels = ROOM_TYPE_LABELS;

  // Helper methods for labels
  getPropertyTypeLabel(type: PropertyType): string {
    return this.propertyTypeLabels[type];
  }

  getRoomTypeLabel(type: RoomType): string {
    return this.roomTypeLabels[type];
  }

  // Available amenities
  availableAmenities = [
    'WiFi', 'TV', 'Kitchen', 'Washing Machine', 'Air Conditioning',
    'Heating', 'Parking', 'Pool', 'Gym', 'Hot Tub',
    'Workspace', 'Pets Allowed', 'Smoking Allowed', 'Fireplace',
    'Balcony', 'Garden', 'BBQ Grill', 'Beach Access', 'Elevator'
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.listingId.set(id);
      this.loadListing(id);
    }
  }

  loadListing(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.landlordService.getListing(id).subscribe({
      next: (response: { data: Listing }) => {
        const listing: Listing = response.data;
        this.formData.set({
          propertyType: listing.propertyType,
          roomType: listing.roomType,
          address: listing.address || '',
          city: listing.city,
          state: listing.state || '',
          country: listing.country,
          zipCode: listing.zipCode || '',
          latitude: listing.latitude,
          longitude: listing.longitude,
          bedrooms: listing.bedrooms,
          beds: listing.beds,
          bathrooms: listing.bathrooms,
          maxGuests: listing.maxGuests,
          amenities: listing.amenities || [],
          images: [],
          imagePreviewUrls: [],
          existingImages: listing.images || [],
          title: listing.title,
          description: listing.description,
          houseRules: listing.houseRules || '',
          basePrice: listing.basePrice,
          cleaningFee: listing.cleaningFee || 0,
          securityDeposit: listing.securityDeposit || 0,
          weekendPrice: listing.weekendPrice || 0,
          weeklyDiscount: listing.weeklyDiscount || 0,
          monthlyDiscount: listing.monthlyDiscount || 0,
          checkInTime: listing.checkInTime || '15:00',
          checkOutTime: listing.checkOutTime || '11:00',
          minNights: listing.minNights,
          maxNights: listing.maxNights || 30,
          isInstantBooking: listing.isInstantBooking
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load listing');
        this.loading.set(false);
        console.error('Error loading listing');
      }
    });
  }

  // Navigation
  nextStep(): void {
    if (!this.validateCurrentStep()) {
      return;
    }

    if (this.currentStep() < this.totalSteps) {
      this.currentStep.set(this.currentStep() + 1);
      window.scrollTo(0, 0);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
      window.scrollTo(0, 0);
    }
  }

  goToStep(step: number): void {
    if (step <= this.currentStep() || this.validateStepsUpTo(step - 1)) {
      this.currentStep.set(step);
      window.scrollTo(0, 0);
    }
  }

  // Validation
  validateCurrentStep(): boolean {
    const data = this.formData();
    const step = this.currentStep();

    switch (step) {
      case 1:
        if (!data.propertyType || !data.roomType || !data.city || !data.country) {
          this.error.set('Please fill in all required fields');
          return false;
        }
        break;
      case 2:
        if (data.bedrooms < 1 || data.bathrooms < 1 || data.maxGuests < 1) {
          this.error.set('Please provide valid property details');
          return false;
        }
        break;
      case 3:
        if (data.existingImages.length === 0 && data.images.length === 0) {
          this.error.set('Please upload at least one photo');
          return false;
        }
        break;
      case 4:
        if (!data.title.trim() || !data.description.trim()) {
          this.error.set('Please provide a title and description');
          return false;
        }
        break;
      case 5:
        if (data.basePrice <= 0) {
          this.error.set('Please set a valid base price');
          return false;
        }
        break;
      case 6:
        if (data.minNights < 1) {
          this.error.set('Minimum nights must be at least 1');
          return false;
        }
        break;
    }

    this.error.set(null);
    return true;
  }

  validateStepsUpTo(step: number): boolean {
    const currentStepCache = this.currentStep();
    for (let i = 1; i <= step; i++) {
      this.currentStep.set(i);
      if (!this.validateCurrentStep()) {
        this.currentStep.set(currentStepCache);
        return false;
      }
    }
    this.currentStep.set(currentStepCache);
    return true;
  }

  // Form Actions
  selectPropertyType(type: PropertyType): void {
    this.formData.update(data => ({ ...data, propertyType: type }));
  }

  selectRoomType(type: RoomType): void {
    this.formData.update(data => ({ ...data, roomType: type }));
  }

  toggleAmenity(amenity: string): void {
    this.formData.update(data => {
      const amenities = data.amenities.includes(amenity)
        ? data.amenities.filter(a => a !== amenity)
        : [...data.amenities, amenity];
      return { ...data, amenities };
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const newImages = [...this.formData().images, ...files];

    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    const allPreviewUrls = [...this.formData().imagePreviewUrls, ...newPreviewUrls];

    this.formData.update(data => ({
      ...data,
      images: newImages,
      imagePreviewUrls: allPreviewUrls
    }));
  }

  removeImage(index: number): void {
    this.formData.update(data => {
      const images = data.images.filter((_, i) => i !== index);
      const imagePreviewUrls = data.imagePreviewUrls.filter((_, i) => i !== index);
      return { ...data, images, imagePreviewUrls };
    });
  }

  removeExistingImage(imageId: number): void {
    if (confirm('Are you sure you want to remove this image?')) {
      this.landlordService.deleteListingImage(this.listingId(), imageId).subscribe({
        next: () => {
          this.formData.update(data => ({
            ...data,
            existingImages: data.existingImages.filter(img => img.id !== imageId)
          }));
        },
        error: () => {
          console.error('Error deleting image:');
          alert('Failed to delete image');
        }
      });
    }
  }

  // Submit
  saveChanges(): void {
    if (!this.validateStepsUpTo(this.totalSteps)) {
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const data = this.formData();

    // First, upload new images if any
    if (data.images.length > 0) {
      this.landlordService.uploadListingImages(this.listingId(), data.images).subscribe({
        next: () => {
          this.updateListing();
        },
        error: () => {
          this.saving.set(false);
          this.error.set('Failed to upload images');
          console.error('Error uploading images');
        }
      });
    } else {
      this.updateListing();
    }
  }

  private updateListing(): void {
    const data = this.formData();

    const updateRequest = {
      propertyType: data.propertyType!,
      roomType: data.roomType!,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      zipCode: data.zipCode,
      latitude: data.latitude,
      longitude: data.longitude,
      bedrooms: data.bedrooms,
      beds: data.beds,
      bathrooms: data.bathrooms,
      maxGuests: data.maxGuests,
      amenities: data.amenities,
      title: data.title,
      description: data.description,
      houseRules: data.houseRules,
      basePrice: data.basePrice,
      cleaningFee: data.cleaningFee,
      securityDeposit: data.securityDeposit,
      weekendPrice: data.weekendPrice,
      weeklyDiscount: data.weeklyDiscount,
      monthlyDiscount: data.monthlyDiscount,
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime,
      minNights: data.minNights,
      maxNights: data.maxNights,
      isInstantBooking: data.isInstantBooking
    };

    this.landlordService.updateListing(this.listingId(), updateRequest).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/listing', this.listingId()]); // Fixed: Navigate to listing detail
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Failed to update listing');
        console.error('Error updating listing');
      }
    });
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? Your changes will be lost.')) {
      this.router.navigate(['/listing', this.listingId()]); // Fixed: Navigate to listing detail
    }
  }

  getProgressPercentage(): number {
    return (this.currentStep() / this.totalSteps) * 100;
  }

  updateFormField<K extends keyof ListingFormData>(field: K, value: ListingFormData[K]): void {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  getAllImages(): string[] {
    const existingUrls = this.formData().existingImages.map(img => img.url); // Changed from imageUrl
    const newUrls = this.formData().imagePreviewUrls;
    return [...existingUrls, ...newUrls];
  }
}
