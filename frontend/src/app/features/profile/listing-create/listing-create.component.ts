import { Component, signal, inject, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { LandlordService } from '../services/landlord.service';
import {
  PropertyType,
  RoomType,
  PROPERTY_TYPE_LABELS,
  ROOM_TYPE_LABELS,
  CreateListingRequest
} from '../models/landlord.model';

interface ListingFormData {
  // Step 1: Property Basics
  propertyType: PropertyType | null;
  roomType: RoomType | null;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;

  // Step 2: Property Details
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  propertySize: number;
  amenities: string[];

  // Step 3: Photos
  images: File[];
  imagePreviewUrls: string[];

  // Step 4: Title & Description
  title: string;
  description: string;
  houseRules: string;

  // Step 5: Pricing
  basePrice: number;
  cleaningFee: number;
  weeklyDiscount: number;
  monthlyDiscount: number;

  // Step 6: House Rules & Policies
  checkInTime: string;
  checkOutTime: string;
  minNights: number;
  maxNights: number;
  cancellationPolicy: string;
}

@Component({
  selector: 'app-listing-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './listing-create.component.html',
  styleUrl: './listing-create.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ListingCreateComponent implements OnInit {
  private landlordService = inject(LandlordService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // State
  currentStep = signal(1);
  totalSteps = 7;
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Track if we're editing an existing draft
  isEditingDraft = signal(false);
  draftPublicId: string | null = null;

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

  // Cancellation policies
  cancellationPolicies = [
    { value: 'Flexible', label: 'Flexible - Full refund 1 day prior' },
    { value: 'Moderate', label: 'Moderate - Full refund 5 days prior' },
    { value: 'Strict', label: 'Strict - Full refund 7 days prior' },
    { value: 'Super Strict', label: 'Super Strict - 50% refund up to 30 days prior' }
  ];

  constructor() {
    // Services are injected above
  }

  ngOnInit(): void {
    // Check if we're editing an existing draft
    this.route.paramMap.subscribe(params => {
      const publicId = params.get('id');
      if (publicId) {
        this.draftPublicId = publicId;
        this.isEditingDraft.set(true);
        this.loadDraft(publicId);
      }
    });
  }

  /**
   * Load existing draft listing to resume editing
   */
  private loadDraft(publicId: string): void {
    this.loading.set(true);
    this.landlordService.getListing(publicId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const listing = response.data;
          
          // Populate form data from draft listing
          this.formData.update(data => ({
            ...data,
            propertyType: listing.propertyType as PropertyType,
            roomType: listing.roomType as RoomType,
            address: listing.address || '',
            city: listing.city || '',
            country: listing.country || '',
            zipCode: listing.zipCode || '',
            latitude: listing.latitude,
            longitude: listing.longitude,
            bedrooms: listing.bedrooms || 1,
            bathrooms: listing.bathrooms || 1,
            maxGuests: listing.maxGuests || 2,
            propertySize: 0, // Not in backend model
            amenities: listing.amenities || [],
            // Images will need special handling
            images: [],
            imagePreviewUrls: listing.images?.map(img => img.url) || [],
            title: listing.title || '',
            description: listing.description || '',
            houseRules: listing.houseRules || '',
            basePrice: listing.pricePerNight || 0,  // Backend uses pricePerNight
            cleaningFee: 0, // Not in backend model
            weeklyDiscount: listing.weeklyDiscount || 0,
            monthlyDiscount: listing.monthlyDiscount || 0,
            checkInTime: listing.checkInTime || '15:00',
            checkOutTime: listing.checkOutTime || '11:00',
            minNights: listing.minNights || 1,
            maxNights: listing.maxNights || 30,
            cancellationPolicy: 'Flexible'
          }));
          
          console.log('[ListingCreate] Draft loaded:', publicId);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load draft listing');
        console.error('[ListingCreate] Error loading draft:', err);
        this.loading.set(false);
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
        if (data.images.length === 0) {
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

    // Generate preview URLs
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

  // Submit
  saveDraft(): void {
    this.submitListing(true);
  }

  publishListing(): void {
    if (!this.validateStepsUpTo(this.totalSteps)) {
      return;
    }
    this.submitListing(false);
  }

  private submitListing(isDraft: boolean): void {
    this.loading.set(true);
    this.error.set(null);

    const data = this.formData();

    // First, upload images if there are any
    if (data.images.length > 0) {
      this.landlordService.uploadListingImages('temp', data.images).subscribe({
        next: (response) => {
          const imageUrls = response.data || [];
          this.createListingWithImages(imageUrls, isDraft);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set('Failed to upload images');
          console.error('Error uploading images:', err);
        }
      });
    } else {
      this.createListingWithImages([], isDraft);
    }
  }

  private createListingWithImages(imageUrls: string[], isDraft: boolean): void {
    const data = this.formData();

    // Create listing request matching the backend CreateListingDTO
    const listingRequest: CreateListingRequest = {
      title: data.title,
      description: data.description,
      
      // Location fields
      location: data.city, // Use city as location
      address: data.address,
      city: data.city,
      country: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
      
      // Property details
      propertyType: data.propertyType!,
      category: data.roomType!, // Map roomType to category
      
      // Capacity
      bedrooms: data.bedrooms,
      beds: data.bedrooms, // Use bedrooms count for beds
      bathrooms: data.bathrooms,
      maxGuests: data.maxGuests,
      
      // Pricing
      pricePerNight: data.basePrice,
      currency: 'USD',
      
      // Booking rules
      minimumStay: data.minNights,
      maximumStay: data.maxNights,
      instantBook: false,
      cancellationPolicy: 'FLEXIBLE',
      
      // Details
      amenities: data.amenities,
      houseRules: data.houseRules,
      
      // Images - Convert URLs to ListingImageDTO structure
      images: imageUrls.map((url, index) => ({
        url: url,
        caption: index === 0 ? 'Cover image' : `Image ${index + 1}`,
        isCover: index === 0,
        sortOrder: index
      })),
      
      // Status - DRAFT for save draft, PENDING_APPROVAL for publish
      status: isDraft ? 'DRAFT' : 'PENDING_APPROVAL'
    };

    console.log('[ListingCreate] Submitting request:', listingRequest);

    // If editing existing draft, use update endpoint
    if (this.isEditingDraft() && this.draftPublicId) {
      this.landlordService.updateListing(this.draftPublicId, listingRequest).subscribe({
        next: (response) => {
          this.loading.set(false);
          console.log('[ListingCreate] Draft updated:', response);
          // Always navigate to My Listings after updating
          this.router.navigate(['/profile/my-listings'], {
            queryParams: { 
              message: isDraft ? 'Draft updated successfully!' : 'Listing submitted for approval!',
              filter: isDraft ? 'DRAFT' : 'PENDING_APPROVAL'
            }
          });
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set('Failed to update listing');
          console.error('[ListingCreate] Error updating listing:', err);
        }
      });
    } else {
      // Create new listing
      this.landlordService.createListing(listingRequest).subscribe({
        next: (response) => {
          this.loading.set(false);
          console.log('[ListingCreate] Success:', response);
          // Always navigate to My Listings after creating (whether draft or published)
          this.router.navigate(['/profile/my-listings'], {
            queryParams: { 
              message: isDraft ? 'Draft saved successfully!' : 'Listing submitted for approval!',
              filter: isDraft ? 'DRAFT' : 'PENDING_APPROVAL'
            }
          });
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set('Failed to create listing');
          console.error('[ListingCreate] Error creating listing:', err);
        }
      });
    }
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? Your changes will be lost.')) {
      this.router.navigate(['/profile/my-listings']); // Fixed: was /landlord/listings
    }
  }

  getProgressPercentage(): number {
    return (this.currentStep() / this.totalSteps) * 100;
  }

  updateFormField<K extends keyof ListingFormData>(field: K, value: ListingFormData[K]): void {
    this.formData.update(data => ({ ...data, [field]: value }));
  }
}
