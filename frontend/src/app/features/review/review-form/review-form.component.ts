import { Component, OnInit, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReviewService } from '../services/review.service';
import { CreateReviewRequest, ReviewType } from '../models/review.model';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.css'
})
export class ReviewFormComponent implements OnInit {
  private reviewService = inject(ReviewService);
  private router = inject(Router);

  // Inputs
  bookingPublicId = input.required<string>();
  reviewType = input.required<ReviewType>();
  revieweePublicId = input.required<string>();
  propertyPublicId = input<string>();
  servicePublicId = input<string>();
  revieweeName = input<string>('the host');
  propertyTitle = input<string>('this property');

  // Form state
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  // Rating categories
  ratings = signal({
    overall: 0,
    cleanliness: 0,
    accuracy: 0,
    checkIn: 0,
    communication: 0,
    location: 0,
    value: 0
  });

  hoveredRatings = signal({
    overall: 0,
    cleanliness: 0,
    accuracy: 0,
    checkIn: 0,
    communication: 0,
    location: 0,
    value: 0
  });

  // Review content
  title = signal('');
  comment = signal('');
  privateComment = signal('');
  photos = signal<string[]>([]);

  // UI state
  currentStep = signal(1); // 1: Ratings, 2: Written Review, 3: Photos (optional), 4: Preview
  showPrivateComment = signal(false);

  ngOnInit() {
    // Initialize based on review type
    if (this.reviewType() === ReviewType.GUEST_REVIEW) {
      // For guest reviews, add respect and follow rules ratings
    }
  }

  /**
   * Rating methods
   */
  setRating(category: string, value: number) {
    this.ratings.update(ratings => ({ ...ratings, [category]: value }));
  }

  hoverRating(category: string, value: number) {
    this.hoveredRatings.update(ratings => ({ ...ratings, [category]: value }));
  }

  resetHover(category: string) {
    this.hoveredRatings.update(ratings => ({ ...ratings, [category]: 0 }));
  }

  getDisplayRating(category: string): number {
    const ratings = this.ratings() as Record<string, number>;
    const hoveredRatings = this.hoveredRatings() as Record<string, number>;
    return hoveredRatings[category] || ratings[category];
  }

  getRatingValue(category: string): number {
    const ratings = this.ratings() as Record<string, number>;
    return ratings[category] || 0;
  }

  /**
   * Step navigation
   */
  canProceedFromStep1(): boolean {
    const r = this.ratings();
    return r.overall > 0 && r.cleanliness > 0 && r.accuracy > 0 &&
           r.checkIn > 0 && r.communication > 0 && r.location > 0 && r.value > 0;
  }

  canProceedFromStep2(): boolean {
    return this.comment().trim().length >= 30;
  }

  nextStep() {
    if (this.currentStep() === 1 && !this.canProceedFromStep1()) {
      this.error.set('Please rate all categories');
      return;
    }
    if (this.currentStep() === 2 && !this.canProceedFromStep2()) {
      this.error.set('Please write at least 30 characters');
      return;
    }
    this.error.set(null);
    this.currentStep.update(step => Math.min(step + 1, 4));
  }

  previousStep() {
    this.currentStep.update(step => Math.max(step - 1, 1));
  }

  /**
   * Photo upload
   */
  onPhotoSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      // In a real app, upload to storage and get URLs
      // For now, create temporary URLs
      for (let i = 0; i < Math.min(files.length, 10); i++) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result && typeof e.target.result === 'string') {
            this.photos.update(photos => [...photos, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  removePhoto(index: number) {
    this.photos.update(photos => photos.filter((_, i) => i !== index));
  }

  /**
   * Submit review
   */
  submitReview() {
    if (!this.canProceedFromStep1() || !this.canProceedFromStep2()) {
      this.error.set('Please complete all required fields');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const request: CreateReviewRequest = {
      reviewType: this.reviewType(),
      bookingPublicId: this.bookingPublicId(),
      revieweePublicId: this.revieweePublicId(),
      propertyPublicId: this.propertyPublicId(),
      servicePublicId: this.servicePublicId(),
      overallRating: this.ratings().overall,
      cleanlinessRating: this.ratings().cleanliness,
      accuracyRating: this.ratings().accuracy,
      checkInRating: this.ratings().checkIn,
      communicationRating: this.ratings().communication,
      locationRating: this.ratings().location,
      valueRating: this.ratings().value,
      title: this.title() || undefined,
      comment: this.comment(),
      privateComment: this.privateComment() || undefined,
      photoUrls: this.photos().length > 0 ? this.photos() : undefined
    };

    this.reviewService.createReview(request).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        setTimeout(() => {
          this.router.navigate(['/reviews']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        this.error.set(err.error?.message || 'Failed to submit review. Please try again.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Helper methods
   */
  getOverallRatingText(): string {
    const rating = this.ratings().overall;
    if (rating === 5) return 'Amazing!';
    if (rating === 4) return 'Great!';
    if (rating === 3) return 'Good';
    if (rating === 2) return 'Okay';
    if (rating === 1) return 'Poor';
    return 'Rate your experience';
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      overall: 'Overall rating',
      cleanliness: 'Cleanliness',
      accuracy: 'Accuracy',
      checkIn: 'Check-in',
      communication: 'Communication',
      location: 'Location',
      value: 'Value'
    };
    return labels[category] || category;
  }

  getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      overall: 'How would you rate your overall experience?',
      cleanliness: 'How clean was the property?',
      accuracy: 'Did the listing match your expectations?',
      checkIn: 'How smooth was the check-in process?',
      communication: 'How well did the host communicate?',
      location: 'How was the location?',
      value: 'Was it worth the price?'
    };
    return descriptions[category] || '';
  }
}
