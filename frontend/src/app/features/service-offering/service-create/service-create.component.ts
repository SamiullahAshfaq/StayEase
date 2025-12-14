import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ServiceOfferingService } from '../services/service-offering.service';
import {
  ServiceCategory,
  PricingType,
  CreateServiceOfferingRequest,
  SERVICE_CATEGORY_LABELS,
  PRICING_TYPE_LABELS
} from '../models/service-offering.model';

@Component({
  selector: 'app-service-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './service-create.component.html'
})
export class ServiceCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private serviceService = inject(ServiceOfferingService);
  private router = inject(Router);

  // Form
  serviceForm!: FormGroup;
  currentStep = signal(1);
  totalSteps = 4;

  // Loading & Error
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  // Enums for template
  categories = Object.values(ServiceCategory);
  pricingTypes = Object.values(PricingType);
  categoryLabels = SERVICE_CATEGORY_LABELS;
  pricingLabels = PRICING_TYPE_LABELS;

  // Days of week
  daysOfWeek = [
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
    { value: 'SUNDAY', label: 'Sunday' }
  ];

  // Common languages
  commonLanguages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Arabic'];

  // Image previews
  imagePreviews = signal<string[]>([]);

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.serviceForm = this.fb.group({
      // Basic Info (Step 1)
      category: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(2000)]],
      highlights: [''],
      whatIsIncluded: [''],
      whatToExpect: [''],

      // Pricing (Step 2)
      pricingType: ['', Validators.required],
      basePrice: [null, [Validators.required, Validators.min(1)]],
      extraPersonPrice: [null, Validators.min(0)],
      weekendSurcharge: [null, Validators.min(0)],
      peakSeasonSurcharge: [null, Validators.min(0)],
      minCapacity: [1, Validators.min(1)],
      maxCapacity: [null, Validators.min(1)],
      durationMinutes: [null, Validators.min(15)],
      minBookingHours: [null, Validators.min(1)],

      // Availability (Step 3)
      isInstantBooking: [false],
      availableFrom: ['09:00'],
      availableTo: ['18:00'],
      availableDays: this.fb.array([]),
      advanceBookingHours: [24, Validators.min(1)],

      // Location (Step 3)
      city: ['', Validators.required],
      country: ['', Validators.required],
      address: [''],
      zipCode: [''],
      latitude: [null],
      longitude: [null],
      serviceRadius: [10],
      providesMobileService: [false],

      // Requirements & Policies (Step 4)
      requirements: [''],
      cancellationPolicy: [''],
      safetyMeasures: [''],

      // Languages & Amenities (Step 4)
      languages: this.fb.array([]),
      amenities: this.fb.array([]),

      // Media (Step 4)
      imageUrls: this.fb.array([], Validators.required),
      videoUrl: [''],

      // Verification (Step 4)
      hasInsurance: [false],
      hasLicense: [false],
      licenseNumber: [''],
      licenseExpiryDate: ['']
    });

    // Add validators for conditional fields
    this.serviceForm.get('hasLicense')?.valueChanges.subscribe(hasLicense => {
      const licenseNumberControl = this.serviceForm.get('licenseNumber');
      const licenseExpiryControl = this.serviceForm.get('licenseExpiryDate');

      if (hasLicense) {
        licenseNumberControl?.setValidators([Validators.required]);
        licenseExpiryControl?.setValidators([Validators.required]);
      } else {
        licenseNumberControl?.clearValidators();
        licenseExpiryControl?.clearValidators();
      }

      licenseNumberControl?.updateValueAndValidity();
      licenseExpiryControl?.updateValueAndValidity();
    });
  }

  get availableDaysArray(): FormArray {
    return this.serviceForm.get('availableDays') as FormArray;
  }

  get languagesArray(): FormArray {
    return this.serviceForm.get('languages') as FormArray;
  }

  get amenitiesArray(): FormArray {
    return this.serviceForm.get('amenities') as FormArray;
  }

  get imageUrlsArray(): FormArray {
    return this.serviceForm.get('imageUrls') as FormArray;
  }

  toggleDay(day: string) {
    const index = this.availableDaysArray.controls.findIndex(c => c.value === day);
    if (index >= 0) {
      this.availableDaysArray.removeAt(index);
    } else {
      this.availableDaysArray.push(this.fb.control(day));
    }
  }

  isDaySelected(day: string): boolean {
    return this.availableDaysArray.controls.some(c => c.value === day);
  }

  addLanguage(language: string) {
    if (!this.languagesArray.controls.some(c => c.value === language)) {
      this.languagesArray.push(this.fb.control(language));
    }
  }

  removeLanguage(index: number) {
    this.languagesArray.removeAt(index);
  }

  addAmenity() {
    const amenity = prompt('Enter amenity name:');
    if (amenity && amenity.trim()) {
      this.amenitiesArray.push(this.fb.control(amenity.trim()));
    }
  }

  removeAmenity(index: number) {
    this.amenitiesArray.removeAt(index);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        // In production, upload to storage and get URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          this.imageUrlsArray.push(this.fb.control(url));
          this.imagePreviews.update(previews => [...previews, url]);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number) {
    this.imageUrlsArray.removeAt(index);
    this.imagePreviews.update(previews => previews.filter((_, i) => i !== index));
  }

  nextStep() {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(step => step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToStep(step: number) {
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return !!(this.serviceForm.get('category')?.valid &&
                 this.serviceForm.get('title')?.valid &&
                 this.serviceForm.get('description')?.valid);
      case 2:
        return !!(this.serviceForm.get('pricingType')?.valid &&
                 this.serviceForm.get('basePrice')?.valid);
      case 3:
        return !!(this.serviceForm.get('city')?.valid &&
                 this.serviceForm.get('country')?.valid &&
                 this.availableDaysArray.length > 0);
      case 4:
        return this.imageUrlsArray.length > 0;
      default:
        return false;
    }
  }

  submitForm() {
    if (this.serviceForm.invalid) {
      this.error.set('Please fill all required fields correctly');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.serviceForm.value;
    const request: CreateServiceOfferingRequest = {
      category: formValue.category,
      title: formValue.title,
      description: formValue.description,
      highlights: formValue.highlights,
      whatIsIncluded: formValue.whatIsIncluded,
      whatToExpect: formValue.whatToExpect,

      pricingType: formValue.pricingType,
      basePrice: formValue.basePrice,
      extraPersonPrice: formValue.extraPersonPrice,
      weekendSurcharge: formValue.weekendSurcharge,
      peakSeasonSurcharge: formValue.peakSeasonSurcharge,

      minCapacity: formValue.minCapacity,
      maxCapacity: formValue.maxCapacity,
      durationMinutes: formValue.durationMinutes,
      minBookingHours: formValue.minBookingHours,

      isInstantBooking: formValue.isInstantBooking,
      availableFrom: formValue.availableFrom,
      availableTo: formValue.availableTo,
      availableDays: formValue.availableDays,

      city: formValue.city,
      country: formValue.country,
      address: formValue.address,
      zipCode: formValue.zipCode,
      latitude: formValue.latitude,
      longitude: formValue.longitude,
      serviceRadius: formValue.serviceRadius,
      providesMobileService: formValue.providesMobileService,

      requirements: formValue.requirements,
      cancellationPolicy: formValue.cancellationPolicy,
      advanceBookingHours: formValue.advanceBookingHours,
      safetyMeasures: formValue.safetyMeasures,

      languages: formValue.languages,
      amenities: formValue.amenities,
      imageUrls: formValue.imageUrls,
      videoUrl: formValue.videoUrl,

      hasInsurance: formValue.hasInsurance,
      hasLicense: formValue.hasLicense,
      licenseNumber: formValue.licenseNumber,
      licenseExpiryDate: formValue.licenseExpiryDate
    };

    this.serviceService.createService(request).subscribe({
      next: (response) => {
        this.success.set(true);
        this.loading.set(false);
        setTimeout(() => {
          this.router.navigate(['/services', response.data.publicId]);
        }, 2000);
      },
      error: (err) => {
        console.error('Error creating service:', err);
        this.error.set(err.error?.message || 'Failed to create service. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
