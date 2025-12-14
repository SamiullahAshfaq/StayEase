import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LandlordService } from '../../../core/services/landlord.service';
import { 
  Listing,
  PropertyType, 
  RoomType,
  PROPERTY_TYPE_LABELS,
  ROOM_TYPE_LABELS
} from '../../../core/models/landlord.model';

interface ListingFormData {
  propertyType: PropertyType | null;
  roomType: RoomType | null;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  propertySize: number;
  amenities: string[];
  images: File[];
  imagePreviewUrls: string[];
  existingImages: Array<{ id: number; imageUrl: string }>;
  title: string;
  description: string;
  houseRules: string;
  basePrice: number;
  cleaningFee: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
  checkInTime: string;
  checkOutTime: string;
  minNights: number;
  maxNights: number;
  cancellationPolicy: string;
}

@Component({
  selector: 'app-listing-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './listing-edit.component.html',
  styleUrls: ['./listing-edit.component.css']
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
    country: '',
    zipCode: '',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    propertySize: 0,
    amenities: [],
    images: [],
    imagePreviewUrls: [],
    existingImages: [],
    title: '',
    description: '',
    houseRules: '',
    basePrice: 0,
    cleaningFee: 0,
    weeklyDiscount: 0,
    monthlyDiscount: 0,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    minNights: 1,
    maxNights: 30,
    cancellationPolicy: 'Flexible'
  });

  // Enums
  PropertyType = PropertyType;
  RoomType = RoomType;
  propertyTypeLabels = PROPERTY_TYPE_LABELS;
  roomTypeLabels = ROOM_TYPE_LABELS;

  // Available amenities
  availableAmenities = [
    'WiFi', 'TV', 'Kitchen', 'Washing Machine', 'Air Conditioning',
    'Heating', 'Parking', 'Pool', 'Gym', 'Hot Tub',
    'Workspace', 'Pets Allowed', 'Smoking Allowed', 'Fireplace',
    'Balcony', 'Garden', 'BBQ Grill', 'Beach Access', 'Elevator'
  ];

  // Cancellation policies
  cancellationPolicies = [
    { value: 'Flexible', label: 'Flexible - Full refund 1 day prior' },
    { value: 'Moderate', label: 'Moderate - Full refund 5 days prior' },
    { value: 'Strict', label: 'Strict - Full refund 7 days prior' },
    { value: 'Super Strict', label: 'Super Strict - 50% refund up to 30 days prior' }
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
      next: (response: any) => {
        const listing: Listing = response.data;
        this.formData.set({
          propertyType: listing.propertyType,
          roomType: listing.roomType,
          address: listing.address || '',
          city: listing.city,
          country: listing.country,
          zipCode: listing.zipCode || '',
          latitude: listing.latitude,
          longitude: listing.longitude,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          maxGuests: listing.maxGuests,
          propertySize: listing.propertySize || 0,
          amenities: listing.amenities || [],
          images: [],
          imagePreviewUrls: [],
          existingImages: listing.images || [],
          title: listing.title,
          description: listing.description,
          houseRules: listing.houseRules || '',
          basePrice: listing.basePrice,
          cleaningFee: listing.cleaningFee || 0,
          weeklyDiscount: listing.weeklyDiscount || 0,
          monthlyDiscount: listing.monthlyDiscount || 0,
          checkInTime: listing.checkInTime || '15:00',
          checkOutTime: listing.checkOutTime || '11:00',
          minNights: listing.minNights,
          maxNights: listing.maxNights || 30,
          cancellationPolicy: listing.cancellationPolicy || 'Flexible'
        });
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Failed to load listing');
        this.loading.set(false);
        console.error('Error loading listing:', err);
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
        error: (err: any) => {
          console.error('Error deleting image:', err);
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
      const imageUploads = data.images.map(file => {
        const formData = new FormData();
        formData.append('image', file);
        return this.landlordService.uploadListingImages(this.listingId(), formData);
      });

      Promise.all(imageUploads).then(() => {
        this.updateListing();
      }).catch((err: any) => {
        this.saving.set(false);
        this.error.set('Failed to upload images');
        console.error('Error uploading images:', err);
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
      country: data.country,
      zipCode: data.zipCode,
      latitude: data.latitude,
      longitude: data.longitude,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      maxGuests: data.maxGuests,
      propertySize: data.propertySize,
      amenities: data.amenities,
      title: data.title,
      description: data.description,
      houseRules: data.houseRules,
      basePrice: data.basePrice,
      cleaningFee: data.cleaningFee,
      weeklyDiscount: data.weeklyDiscount,
      monthlyDiscount: data.monthlyDiscount,
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime,
      minNights: data.minNights,
      maxNights: data.maxNights,
      cancellationPolicy: data.cancellationPolicy
    };

    this.landlordService.updateListing(this.listingId(), updateRequest).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/landlord/listings', this.listingId()]);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.error.set('Failed to update listing');
        console.error('Error updating listing:', err);
      }
    });
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? Your changes will be lost.')) {
      this.router.navigate(['/landlord/listings', this.listingId()]);
    }
  }

  getProgressPercentage(): number {
    return (this.currentStep() / this.totalSteps) * 100;
  }

  updateFormField<K extends keyof ListingFormData>(field: K, value: ListingFormData[K]): void {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  getAllImages(): string[] {
    const existingUrls = this.formData().existingImages.map(img => img.imageUrl);
    const newUrls = this.formData().imagePreviewUrls;
    return [...existingUrls, ...newUrls];
  }
}
