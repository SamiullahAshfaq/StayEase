import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ListingService } from '../services/listing.service';
import { ListingImage } from '../models/listing-image.model';
import { 
  CreateListing, 
  PROPERTY_TYPES, 
  CATEGORIES, 
  AMENITIES,
  CANCELLATION_POLICIES 
} from '../models/listing.model';

@Component({
  selector: 'app-listing-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './listing-create.component.html'
})
export class ListingCreateComponent implements OnInit {
  listingForm!: FormGroup;
  currentStep = 1;
  totalSteps = 5;
  loading = false;
  error: string | null = null;
  
  propertyTypes = PROPERTY_TYPES;
  categories = CATEGORIES;
  amenities = AMENITIES;
  cancellationPolicies = CANCELLATION_POLICIES;
  
  imageUrls: string[] = [];

  constructor(
    private fb: FormBuilder,
    private listingService: ListingService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.listingForm = this.fb.group({
      // Step 1: Property Type & Category
      propertyType: ['', Validators.required],
      category: ['', Validators.required],
      
      // Step 2: Location
      location: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      address: [''],
      latitude: [null],
      longitude: [null],
      
      // Step 3: Details
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(5000)]],
      maxGuests: [1, [Validators.required, Validators.min(1)]],
      bedrooms: [1, [Validators.required, Validators.min(0)]],
      beds: [1, [Validators.required, Validators.min(1)]],
      bathrooms: [1, [Validators.required, Validators.min(0.5)]],
      
      // Step 4: Amenities & Rules
      amenities: [[]],
      houseRules: [''],
      cancellationPolicy: ['FLEXIBLE', Validators.required],
      minimumStay: [1, [Validators.required, Validators.min(1)]],
      maximumStay: [null],
      instantBook: [false],
      
      // Step 5: Pricing & Images
      pricePerNight: [null, [Validators.required, Validators.min(1)]],
      currency: ['USD'],
      images: [[]]
    });
  }

  nextStep(): void {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  validateCurrentStep(): boolean {
    const step = this.currentStep;
    let fieldsToValidate: string[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ['propertyType', 'category'];
        break;
      case 2:
        fieldsToValidate = ['location', 'city', 'country'];
        break;
      case 3:
        fieldsToValidate = ['title', 'description', 'maxGuests', 'bedrooms', 'beds', 'bathrooms'];
        break;
      case 4:
        fieldsToValidate = ['cancellationPolicy', 'minimumStay'];
        break;
      case 5:
        fieldsToValidate = ['pricePerNight'];
        break;
    }

    let valid = true;
    fieldsToValidate.forEach(field => {
      const control = this.listingForm.get(field);
      if (control) {
        control.markAsTouched();
        if (control.invalid) {
          valid = false;
        }
      }
    });

    if (step === 5 && this.imageUrls.length === 0) {
      this.error = 'Please add at least one image';
      valid = false;
    } else {
      this.error = null;
    }

    return valid;
  }

  toggleAmenity(amenity: string): void {
    const amenities = this.listingForm.get('amenities')?.value || [];
    const index = amenities.indexOf(amenity);
    
    if (index > -1) {
      amenities.splice(index, 1);
    } else {
      amenities.push(amenity);
    }
    
    this.listingForm.patchValue({ amenities });
  }

  isAmenitySelected(amenity: string): boolean {
    const amenities = this.listingForm.get('amenities')?.value || [];
    return amenities.includes(amenity);
  }

  addImageUrl(urlInput: HTMLInputElement): void {
    const url = urlInput?.value?.trim();
    
    if (url) {
      this.imageUrls.push(url);
      urlInput.value = '';
    }
  }

  removeImage(index: number): void {
    this.imageUrls.splice(index, 1);
  }

  moveImageUp(index: number): void {
    if (index > 0) {
      const temp = this.imageUrls[index];
      this.imageUrls[index] = this.imageUrls[index - 1];
      this.imageUrls[index - 1] = temp;
    }
  }

  moveImageDown(index: number): void {
    if (index < this.imageUrls.length - 1) {
      const temp = this.imageUrls[index];
      this.imageUrls[index] = this.imageUrls[index + 1];
      this.imageUrls[index + 1] = temp;
    }
  }

  onSubmit(): void {
    if (!this.validateCurrentStep() || this.listingForm.invalid) {
      this.error = 'Please fill in all required fields correctly';
      return;
    }

    this.loading = true;
    this.error = null;

    const images: ListingImage[] = this.imageUrls.map((url, index) => ({
      url,
      isCover: index === 0,
      sortOrder: index,
      caption: ''
    }));

    const listingData: CreateListing = {
      ...this.listingForm.value,
      images
    };

    this.listingService.createListing(listingData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.router.navigate(['/listings', response.data.publicId]);
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to create listing. Please try again.';
        this.loading = false;
        console.error('Error creating listing:', error);
      }
    });
  }

  increment(field: string): void {
    const control = this.listingForm.get(field);
    if (control) {
      const currentValue = control.value || 0;
      control.setValue(currentValue + (field === 'bathrooms' ? 0.5 : 1));
    }
  }

  decrement(field: string): void {
    const control = this.listingForm.get(field);
    if (control) {
      const currentValue = control.value || 0;
      const minValue = field === 'bathrooms' ? 0.5 : (field === 'bedrooms' ? 0 : 1);
      const newValue = currentValue - (field === 'bathrooms' ? 0.5 : 1);
      if (newValue >= minValue) {
        control.setValue(newValue);
      }
    }
  }

  getProgress(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }
}